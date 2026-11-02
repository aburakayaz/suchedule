/*
 * Room timetable view.
 *
 * Builds a per-room weekly schedule from the course data of the selected term and renders it in the
 * "Rooms" tab. suchedule.js loads the term data and hands it over through roomSchedule.setData();
 * this file relies on its globals (`courseEntry`, `currentTermData`, `termState`), so load it after it.
 */
const roomSchedule = (() => {
    const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const SHORT_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const SLOT_COUNT = 11; // 08:40 .. 18:40, same rows as the course planner
    const COLORS = [
        '#2096BA', '#C5919D', '#DF6E21', '#874E4C', '#32485C', '#765285', '#351C4D', '#FF7E5F', '#726A95', '#849974',
        '#36384C', '#F26968', '#6CBF84', '#323339', '#AB3E16', '#EFAA52', '#48120E', '#B37C57', '#9AACB8', '#173A6A'
    ];

    const rooms = new Map(); // room name -> meetings[]
    let selectedRoom = '';
    let termName = '';
    let ready = false;

    const natural = new Intl.Collator('en', {numeric: true, sensitivity: 'base'}).compare;

    const esc = text => String(text).replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));

    const normalize = text => text.toUpperCase().replace(/\s+/g, '');

    const pad = n => `${n < 10 ? '0' : ''}${n}`;

    const slotTime = (start, duration) => `${pad(start + 8)}:40–${pad(start + 8 + duration)}:30`;

    const colorFor = code => {
        let hash = 0;

        for (const ch of code) hash = (hash * 31 + ch.charCodeAt(0)) % 9973;

        return COLORS[hash % COLORS.length];
    };

    // "FENS G049/G050" -> ["FENS G049", "FENS G050"]; "" / "TBA" -> []
    const splitRooms = place => {
        place = (place || '').trim();

        if (!place || place.toUpperCase() === 'TBA') return [];

        const match = place.match(/^(.*\s)(\S+)$/);

        if (!match) return [place];

        return match[2].split('/').filter(Boolean).map(room => match[1] + room);
    };

    // "FENS G077" -> "FENS", "Altunizade Campus 202" -> "Altunizade Campus"
    const buildingOf = room => {
        const parts = room.split(' ');

        return parts.length > 1 ? parts.slice(0, -1).join(' ') : room;
    };

    const isOnGrid = m => m.start >= 0 && m.duration > 0 && m.day >= 0 && m.day < DAYS.length;

    const buildIndex = (courses, instructors, places) => {
        rooms.clear();

        courses.forEach(course => {
            course.classes.forEach(_class => {
                _class.sections.forEach(section => {
                    section.schedule.forEach(schedule => {
                        splitRooms(places[schedule.place]).forEach(room => {
                            if (!rooms.has(room)) rooms.set(room, []);

                            rooms.get(room).push({
                                code: course.code,
                                label: `${course.code}${_class.type} – ${section.group}`,
                                name: course.name,
                                crn: section.crn,
                                instructor: instructors[section.instructors] || '',
                                day: schedule.day,
                                start: schedule.start,
                                duration: Math.min(schedule.duration, SLOT_COUNT - Math.max(schedule.start, 0))
                            });
                        });
                    });
                });
            });
        });
    };

    // Cross-listed courses and multi-type sections often share the same room, time and instructor.
    // Show those as one block listing every code instead of several identical blocks.
    const mergeIdentical = meetings => {
        const merged = new Map();

        meetings.forEach(m => {
            const key = `${m.day}|${m.start}|${m.duration}|${m.instructor}`;
            const existing = merged.get(key);

            if (!existing) {
                merged.set(key, Object.assign({}, m, {labels: [m.label], crns: [m.crn]}));
            } else if (existing.labels.indexOf(m.label) === -1) {
                existing.labels.push(m.label);
                existing.crns.push(m.crn);
            }
        });

        return [...merged.values()];
    };

    // Group overlapping meetings of one day into clusters and give each meeting a lane inside its cluster.
    const layoutDay = meetings => {
        const sorted = meetings.slice().sort((a, b) => a.start - b.start || b.duration - a.duration);
        const clusters = [];
        let cluster = null;

        sorted.forEach(m => {
            const end = m.start + m.duration;

            if (!cluster || m.start >= cluster.end) {
                cluster = {start: m.start, end, laneEnds: [], items: []};
                clusters.push(cluster);
            }

            let lane = cluster.laneEnds.findIndex(laneEnd => laneEnd <= m.start);

            if (lane === -1) {
                lane = cluster.laneEnds.length;
                cluster.laneEnds.push(end);
            } else {
                cluster.laneEnds[lane] = end;
            }

            cluster.items.push({m, lane});
            cluster.end = Math.max(cluster.end, end);
        });

        return clusters;
    };

    const weeklyHours = meetings => mergeIdentical(meetings.filter(isOnGrid))
        .reduce((total, m) => total + m.duration, 0);

    const renderRoomList = () => {
        const byBuilding = new Map();

        [...rooms.keys()].sort(natural).forEach(room => {
            const building = buildingOf(room);

            if (!byBuilding.has(building)) byBuilding.set(building, []);

            byBuilding.get(building).push(room);
        });

        const html = [...byBuilding.keys()].sort(natural).map(building => `
            <div class="room-building">
                <div class="room-building-name">${esc(building)}</div>
                ${byBuilding.get(building).map(room => `
                    <div class="room-entry" data-room="${esc(room)}" data-search="${esc(normalize(room))}">
                        <span class="room-entry-name">${esc(room)}</span>
                        <span class="room-entry-hours">${weeklyHours(rooms.get(room))}h/wk</span>
                    </div>
                `).join('')}
            </div>
        `).join('');

        $('#room-list').removeClass('loading').html(html);
    };

    const renderBlock = (m, lane) => {
        const time = slotTime(m.start, m.duration);
        const tooltip = `${m.labels.join(' / ')}\n${m.name}\n${m.instructor}\n${SHORT_DAYS[m.day]} ${time}`;

        return `
            <div class="room-block" data-code="${esc(m.code)}" title="${esc(tooltip)}"
                style="grid-row: ${m.start - m.cluster + 1} / span ${m.duration}; grid-column: ${lane + 1};
                    background-color: ${colorFor(m.code)};">
                <div class="room-block-code">${esc(m.labels.join(' / '))}</div>
                <div class="room-block-name">${esc(m.name)}</div>
                <div class="room-block-instructor">${esc(m.instructor)}</div>
                <div class="room-block-time">${time}</div>
            </div>
        `;
    };

    const renderTimetable = () => {
        const meetings = selectedRoom ? mergeIdentical(rooms.get(selectedRoom) || []) : [];
        const onGrid = meetings.filter(isOnGrid);
        const offGrid = meetings.filter(m => !isOnGrid(m)).sort((a, b) =>
            (a.start < 0) - (b.start < 0) || a.day - b.day || a.start - b.start || natural(a.labels[0], b.labels[0]));
        const today = (new Date().getDay() + 6) % 7;

        let html = '<div class="room-grid-corner">-</div>';

        DAYS.forEach((day, d) => {
            html += `<div class="room-grid-day${d % 2 ? '' : ' shade-col'}${d === today ? ' today' : ''}"
                style="grid-column: ${d + 2}">${day}</div>`;
        });

        for (let slot = 0; slot < SLOT_COUNT; slot++) {
            const shadeRow = slot % 2 ? '' : ' shade-row';

            html += `<div class="room-grid-hour${shadeRow}" style="grid-row: ${slot + 2}">${pad(slot + 8)}:40</div>`;

            for (let d = 0; d < DAYS.length; d++) {
                html += `<div class="room-grid-cell${shadeRow}${d % 2 ? '' : ' shade-col'}"
                    style="grid-row: ${slot + 2}; grid-column: ${d + 2}"></div>`;
            }
        }

        DAYS.forEach((day, d) => {
            layoutDay(onGrid.filter(m => m.day === d)).forEach(cluster => {
                html += `
                    <div class="room-cluster" style="grid-row: ${cluster.start + 2} / span ${cluster.end - cluster.start};
                        grid-column: ${d + 2}; grid-template-rows: repeat(${cluster.end - cluster.start}, 1fr);
                        grid-template-columns: repeat(${cluster.laneEnds.length}, minmax(0, 1fr));">
                        ${cluster.items.map(({m, lane}) =>
                            renderBlock(Object.assign({}, m, {cluster: cluster.start}), lane)).join('')}
                    </div>
                `;
            });
        });

        $('#room-grid').html(html);

        let title = 'Select a room';
        let meta = `${termName}: ${rooms.size} rooms, grouped by building. Pick one from the list to see its weekly timetable.`;

        if (selectedRoom) {
            title = selectedRoom;
            meta = onGrid.length
                ? `${termName}: ${onGrid.length} class meeting${onGrid.length === 1 ? '' : 's'}, ${weeklyHours(meetings)} hours per week`
                : `No classes on the weekday timetable in ${termName}.`;
        }

        $('#room-view-title').text(title);
        $('#room-view-meta').text(meta);

        $('#room-extra').toggle(offGrid.length > 0).html(offGrid.length ? `
            <div class="room-extra-title">Saturday / no set time</div>
            <ul>${offGrid.map(m => `
                <li><b>${esc(m.labels.join(' / '))}</b> ${esc(m.name)}${m.instructor ? `, ${esc(m.instructor)}` : ''}
                    <span class="room-extra-time">${m.start >= 0 && m.day < SHORT_DAYS.length
                        ? `${SHORT_DAYS[m.day]} ${slotTime(m.start, m.duration)}` : 'Time TBA'}</span></li>
            `).join('')}</ul>
        ` : '');
    };

    // A room may have no classes in the selected term; it stays selected so switching terms keeps it.
    const selectRoom = room => {
        selectedRoom = room;

        $('.room-entry').removeClass('active')
            .filter((i, el) => $(el).attr('data-room') === selectedRoom).addClass('active');

        renderTimetable();
    };

    const filterRooms = query => {
        query = normalize(query);

        $('.room-entry').each((i, el) => {
            $(el).toggleClass('filter-hide-room-search', $(el).attr('data-search').indexOf(query) === -1);
        });

        $('.room-building').each((i, el) => {
            $(el).toggleClass('filter-hide-room-search', $(el).find('.room-entry:not(.filter-hide-room-search)').length === 0);
        });
    };

    // --- Routing: #rooms, #rooms=FENS%20G077, anything else = course planner ---

    const readHash = () => {
        const match = location.hash.match(/^#rooms?(?:=(.*))?$/);

        setView(match ? 'rooms' : 'courses');

        if (match && ready) {
            const room = match[1] ? decodeURIComponent(match[1]) : '';

            selectRoom(room);

            const $active = $('.room-entry.active');

            if ($active.length) $active[0].scrollIntoView({block: 'nearest'});
        }
    };

    const setHash = hash => {
        if (location.hash === hash || (!location.hash && hash === '#')) return readHash();

        if (hash === '#') {
            history.pushState(null, '', location.pathname + location.search);

            return readHash();
        }

        location.hash = hash;
    };

    const setView = view => {
        $('body').toggleClass('room-mode', view === 'rooms');

        $('.view-tab').removeClass('active').filter(`[data-view="${view}"]`).addClass('active');
    };

    const setEvents = () => {
        $(document).on('click', '.view-tab', event => {
            const view = $(event.currentTarget).data('view');

            setHash(view === 'rooms' ? (selectedRoom ? `#rooms=${encodeURIComponent(selectedRoom)}` : '#rooms') : '#');
        });

        $(document).on('click', '.room-entry', event => {
            setHash(`#rooms=${encodeURIComponent($(event.currentTarget).attr('data-room'))}`);

            // On small screens the menu covers most of the timetable; get it out of the way.
            if (window.matchMedia('(max-width: 500px)').matches) $('body').addClass('hide-menu');
        });

        // Clicking a class jumps to that course in the planner.
        $(document).on('click', '.room-block', event => {
            const code = $(event.currentTarget).attr('data-code');

            setHash('#');

            if (courseEntry(code).getElement().length) {
                if (courseEntry.isOnDisplayMode()) courseEntry.endDisplayMode();

                courseEntry.startDisplayMode(code);
            }
        });

        $(document).on('click', '#rooms-about-button', () => $('#notify-rooms-about').fadeIn(500));

        $('#room-search').on('input', event => filterRooms($(event.currentTarget).val()));

        $(window).on('popstate hashchange', readHash);
    };

    // Called by suchedule.js with the selected term's data, or with null while a term is loading.
    const setData = (data, term) => {
        ready = Boolean(data);

        if (!data) {
            $('#room-list').addClass('loading').empty();
            $('#room-grid').empty();
            $('#room-extra').hide();
            $('#room-view-title').text('Loading…');
            $('#room-view-meta').text('');

            return;
        }

        termName = term.name;

        buildIndex(data.courses, data.instructors, data.places);
        renderRoomList();
        filterRooms($('#room-search').val() || '');

        if (/^#rooms?/.test(location.hash)) {
            readHash();
        } else {
            selectRoom(selectedRoom);
        }
    };

    const init = () => {
        setEvents();
        readHash();

        // The term data may have arrived before this file was loaded.
        if (!ready && typeof currentTermData !== 'undefined' && currentTermData) {
            setData(currentTermData, termState.current);
        }
    };

    return {init, setData};
})();

$(roomSchedule.init);
