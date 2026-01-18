const config = {
    term: '202502',
    dataVersion: 73
};

config.infoLink = `https://suis.sabanciuniv.edu/prod/bwckschd.p_disp_detail_sched?term_in=${config.term}&crn_in=`;
Object.freeze(config);

const templateGenerator = (() => {
    const getDayFromCode = (() => {
        // const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'TBA'];
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'TBA'];

        return dayCode => {
            return days[dayCode];
        };
    })();

    const getScheduleHours = (start, duration) => {
        if (start === -1) return 'TBA';

        start += 8;

        const end = start + duration;

        return `${start < 10 ? '0' : ''}${start}:40-${end < 10 ? '0' : ''}${end}:30`;
    };

    const makeCourseEntry = (course, instructors, places) => `
        <div class="course-entry hide-info" data-code="${course.code}">
            <div class="course-header">
                <div class="course-name">${course.code} - ${course.name}</div>
                <div class="course-expand icon-right-open-big"></div>
            </div>
            <div class="course-info">
            ${course.classes.map(_class => `
                <div class="course-sections">
                    <div class="section-type">Sections${_class.type ? ` (${_class.type})` : ``}</div>
                ${_class.sections.map(section => `
                    <div class="course-section" 
                        data-section-name="${course.code.replace(' ', '')}${_class.type} - ${section.group}"
                        data-crn="${section.crn}">
                    <div class="section-info">
                        <div class="section-header">
                            <div class="section-group" data-group="${section.group}">${section.group}</div>
                            <a href="${config.infoLink}${section.crn}" class="section-link" target="_blank">info</a>
                        </div>
                        <div class="instructor">${instructors[section.instructors]}</div>
                        <div class="section-days">
                        ${section.schedule.map(schedule => `
                            <div class="section-day" 
                                data-day="${schedule.day}"
                                data-start="${schedule.start}" 
                                data-duration="${schedule.duration}"
                                data-place="${places[schedule.place]}">
                                ${getDayFromCode(schedule.day)} ${getScheduleHours(schedule.start, schedule.duration)} ${places[schedule.place]}
                            </div>
                        `).join('')}
                        </div>
                    </div>
                    <div class="section-button"></div>
                    </div>
                `).join('')}
                </div>
            `).join('')}
            </div>
        </div>
    `;

    const makeCellCourse = (sectionName, crn, bgColor = 'azure') => `
        <div class="cell-course" data-crn="${crn}" data-section-name="${sectionName}"
            style="background-color: ${bgColor};">
            <div>${sectionName}</div>
            <div class="remove-course"></div>
        </div>
    `;

    return {
        makeCourseEntry,
        makeCellCourse
    };
})();

const colorPalette = (() => {
    let colors = [
        '#2096BA',
        '#C5919D',
        '#DF6E21',
        '#874E4C',
        '#32485C',
        '#765285',
        '#351C4D',
        '#FF7E5F',
        '#726A95',
        '#849974',
        '#36384C',
        '#F26968',
        '#F2AD9F',
        '#6CBF84',
        '#323339',
        '#AB3E16',
        '#EFAA52',
        '#48120E',
        '#B37C57',
        '#9AACB8'
    ];
    const initial = colors.slice(0);

    return {
        getColor: () => colors.splice(Math.floor(Math.random() * colors.length), 1).shift() || 'azure',
        putColor: color => color === 'azure' ? null : colors.push(color),
        reset: () => colors = initial.slice(0)
    };
})();

const saveSchedule = () => {
    localStorage.setItem('saved-schedule', cellCourses.getAllCrnDataToSave().join(','));
};

const courseEntry = (() => {
    const courseEntry = function (codeOr$element) {
        if (!(codeOr$element instanceof $)) {
            return courseEntry.findByCode(codeOr$element);
        }

        return new courseEntry.prototype.Init(codeOr$element);
    };

    courseEntry.prototype.Init = function ($element) {
        this.getElement = function () {
            return $element.first();
        };

        return this;
    };

    courseEntry.prototype.Init.prototype = courseEntry.prototype;

    courseEntry.prototype.isOpen = function () {
        return !this.getElement().hasClass('hide-info');
    };

    courseEntry.prototype.open = function () {
        this.getElement().removeClass('hide-info');

        this.getElement().siblings(':not(hide-info)').addClass('hide-info');

        this.updateSelectionsOnSchedule();

        return this;
    };

    courseEntry.prototype.close = function () {
        this.getElement().addClass('hide-info');

        this.hideSelectionsOnSchedule();

        return this;
    };

    courseEntry.prototype.toggleOpen = function () {
        this.isOpen() ? this.close() : this.open();

        return this;
    };

    courseEntry.prototype.getCodeWithSpace = function () {
        return this.getElement().data('code');
    };

    courseEntry.prototype.getCodeWithoutSpace = function () {
        return this.getElement().data('code').replace(/ /g, '');
    };

    courseEntry.prototype.getName = function () {
        return this.getElement().find('.course-name').text();
    };

    courseEntry.prototype.showSelectionsOnSchedule = function () {
        this.getSections('.course-section.selected').forEach(section => {
            section.getClassCells().getElements().addClass('selection');
        });

        return this;
    };

    courseEntry.prototype.hideSelectionsOnSchedule = function () {
        $('.class-cell').removeClass('selection');

        return this;
    };

    courseEntry.prototype.updateSelectionsOnSchedule = function () {
        this.hideSelectionsOnSchedule();

        if (this.isOpen() && !this.isSelectionComplete()) {
            this.showSelectionsOnSchedule();
        }

        return this;
    };

    courseEntry.prototype.addFilter = function (filterName) {
        this.getElement().addClass(`filter-hide-${filterName}`);

        return this;
    };

    courseEntry.prototype.removeFilter = function (filterName) {
        this.getElement().removeClass(`filter-hide-${filterName}`);

        return this;
    };

    courseEntry.prototype.nameContains = function (query) {
        let name = this.getName();
        name = name.replaceAll(/\s+/g, '').toUpperCase();
        return name.indexOf(query) > -1;
    };

    courseEntry.prototype.isSelectionComplete = function () {
        return this.getElement().find('.selected').length === this.getElement().find('.course-sections').length;
    };

    courseEntry.prototype.isMainCourseSelected = function () {
        return this.getElement().find('.course-sections:first .selected').length > 0;
    };

    courseEntry.prototype.getSections = function (selector = '.course-section') {
        return $.map(this.getElement().find(selector), section => sectionEntry($(section)));
    };

    courseEntry.prototype.getCellCourseColor = function () {
        return cellCourses.findByCourseCode(this.getCodeWithoutSpace()).getColor();
    };

    courseEntry.prototype.isOnSchedule = function () {
        return cellCourses.findByCourseCode(this.getCodeWithoutSpace()).getElements().length > 0;
    };

    courseEntry.prototype.addToSchedule = function () {
        this.hideSelectionsOnSchedule();

        const color = colorPalette.getColor();

        this.getSections('.course-section.selected').forEach(section => {
            section.getClassCells().addCellCourse(cellCourses.make(section.getName(), section.getCrn(), color));
        });

        saveSchedule();

        return this;
    };

    courseEntry.prototype.removeFromSchedule = function () {
        if (this.isOnSchedule()) {
            colorPalette.putColor(this.getCellCourseColor());

            this.getSections().forEach(section => {
                classCells.findContainsCrn(section.getCrn()).removeCellCourse(section.getCrn());
            });
        }

        this.updateSelectionsOnSchedule();

        saveSchedule();

        return this;
    };

    courseEntry.prototype.actOnSectionSelected = function () {
        this.updateSelectionsOnSchedule();

        if (this.isSelectionComplete()) {
            this.addToSchedule();
        }

        return this;
    };

    courseEntry.prototype.actOnSectionDeselected = function () {
        this.removeFromSchedule();

        if (this.isMainCourseSelected() && !this.isOpen()) {
            courseEntry.endDisplayMode();
            courseEntry.startDisplayMode(this.getCodeWithSpace());
        }

        return this;
    };

    courseEntry.prototype.hasEmptySection = function () {
        for (const courseSections of this.getElement().find('.course-sections')) {
            if ($(courseSections).find('.course-section:not([class*=filter-hide-])').length === 0) {
                return true;
            }
        }

        return false;
    };

    courseEntry.closeAll = () => {
        $('.course-entry').addClass('hide-info');
    };

    courseEntry.findByCode = code => courseEntry($(`.course-entry[data-code="${code}"]`));

    courseEntry.clearFilter = filterName => {
        $('.course-entry').removeClass(`filter-hide-${filterName}`);
    };

    courseEntry.filter = (filter, filterName) => {
        $('.course-entry').each((i, course) => {
            course = courseEntry($(course));

            filter(course) ? course.removeFilter(filterName) : course.addFilter(filterName);
        });
    };

    courseEntry.filterIfAnyEmptySection = () => {
        courseEntry.filter(
            course => !course.hasEmptySection(),
            'empty-section'
        );
    };

    courseEntry.startDisplayMode = code => {
        courseEntry(code).open().getElement().addClass('display-alone');

        $('#menu').addClass('display-mode');

        $('body').removeClass('hide-menu');
    };

    courseEntry.endDisplayMode = () => {
        courseEntry($('.display-alone')).close().getElement().removeClass('display-alone');

        $('#menu').removeClass('display-mode');
    };

    courseEntry.isOnDisplayMode = () => $('#menu').hasClass('display-mode');

    courseEntry.make = (course, instructors) => courseEntry(templateGenerator.makeCourseEntry(course, instructors));

    courseEntry.populate = (courses, instructors, places) => {
        const $list = $('#course-list').removeClass('loading');

        courses.forEach(course => {
            $list.append(templateGenerator.makeCourseEntry(course, instructors, places));
        });
    };

    return courseEntry;
})();

const sectionEntry = (() => {
    const sectionEntry = function (crnOr$element) {
        if (!(crnOr$element instanceof $)) {
            return sectionEntry.findByCrn(crnOr$element);
        }

        return new sectionEntry.prototype.Init(crnOr$element);
    };

    sectionEntry.prototype.Init = function ($element) {
        this.getElement = function () {
            return $element;
        };

        return this;
    };

    sectionEntry.prototype.Init.prototype = sectionEntry.prototype;

    sectionEntry.prototype.getCrn = function () {
        return this.getElement().data('crn');
    };

    sectionEntry.prototype.getName = function () {
        return this.getElement().data('section-name');
    };

    sectionEntry.prototype.getInstructorName = function () {
        return this.getElement().find('.instructor').text();
    };

    sectionEntry.prototype.instructorNameContains = function (query) {
        return this.getInstructorName().toUpperCase().indexOf(query) > -1;
    };

    sectionEntry.prototype.getGeneralName = function () {
        return this.getName().split(' ', 2).shift();
    };

    sectionEntry.prototype.isSelected = function () {
        return this.getElement().hasClass('selected');
    };

    sectionEntry.prototype.deselectAlternatives = function () {
        this.getElement().siblings('.selected').each((i, section) => sectionEntry($(section)).deselect());

        return this;
    };

    sectionEntry.prototype.addFilter = function (filterName) {
        this.getElement().addClass(`filter-hide-${filterName}`);

        return this;
    };

    sectionEntry.prototype.removeFilter = function (filterName) {
        this.getElement().removeClass(`filter-hide-${filterName}`);

        return this;
    };

    sectionEntry.prototype.getCourseEntry = function () {
        return courseEntry(this.getElement().parents('.course-entry'));
    };

    sectionEntry.prototype.getScheduleData = function () {
        return this.getElement().find('.section-day').map((i, el) => ({
            day: $(el).data('day'),
            start: $(el).data('start'),
            duration: $(el).data('duration')
        })).toArray();
    };

    sectionEntry.prototype.getClassCells = function () {
        return classCells($(
            $.map(this.getScheduleData(), schedule =>
                $('#schedule tr').slice(schedule.start + 1, schedule.start + schedule.duration + 1)
                    .find(`td:eq(${schedule.day + 1})`).toArray()
            )
        ));
    };

    sectionEntry.prototype.select = function () {
        this.getElement().addClass('selected');

        this.deselectAlternatives();

        this.getCourseEntry().actOnSectionSelected();

        return this;
    };

    sectionEntry.prototype.deselect = function (shouldNotifyCourseEntry = true) {
        this.getElement().removeClass('selected');

        if (shouldNotifyCourseEntry) {
            this.getCourseEntry().actOnSectionDeselected();
        }

        return this;
    };

    sectionEntry.prototype.toggleSelect = function () {
        this.isSelected() ? this.deselect() : this.select();

        return this;
    };

    sectionEntry.findByCrn = crn => sectionEntry($(`.course-section[data-crn="${crn}"]:first`));

    sectionEntry.clearFilter = (filterName, checkForEmptySections = true) => {
        $('.course-section').removeClass(`filter-hide-${filterName}`);

        if (checkForEmptySections) courseEntry.filterIfAnyEmptySection();
    };

    sectionEntry.filter = (filter, filterName, checkForEmptySections = true) => {
        $('.course-section').each((i, section) => {
            section = sectionEntry($(section));

            filter(section) ? section.removeFilter(filterName) : section.addFilter(filterName);
        });

        if (checkForEmptySections) courseEntry.filterIfAnyEmptySection();
    };

    sectionEntry.filterByDays = () => {
        let allowedDays = [];

        $('#day-filter-selections input').each((i, checkbox) => {
            if ($(checkbox).is(':checked')) {
                allowedDays.push(i);
            }
        });

        //  TODO: Fix. This is a hack to always include courses with TBA days
        allowedDays.push(5);

        sectionEntry.filter(
            section => {
                for (const sectionDay of section.getElement().find('.section-day')) {
                    if (allowedDays.indexOf(Number($(sectionDay).data('day'))) === -1) {
                        return false;
                    }
                }

                return true;
            },
            'day'
        );
    };

    return sectionEntry;
})();

const cellCourses = (() => {
    const cellCourses = function (crnOr$element) {
        if (!(crnOr$element instanceof $)) {
            return cellCourses.findByCrn(crnOr$element);
        }

        return new cellCourses.prototype.Init(crnOr$element);
    };

    cellCourses.prototype.Init = function ($elements) {
        this.getElements = function () {
            return $elements;
        };

        return this;
    };

    cellCourses.prototype.Init.prototype = cellCourses.prototype;

    cellCourses.prototype.getSectionName = function () {
        return this.getElements().first().data('section-name');
    };

    cellCourses.prototype.getCourseCodeWithSpace = function () {
        return this.getSectionName().replace(/([A-Z]+)(\d+).*/, '$1 $2');
    };

    cellCourses.prototype.getCourseCodeWithoutSpace = function () {
        return this.getSectionName().replace(/([A-Z]+)(\d+).*/, '$1$2');
    };

    cellCourses.prototype.getParentClassCells = function () {
        return classCells(this.getElements().parent());
    };

    cellCourses.prototype.isOfMainCourse = function () {
        return /^[A-Z]+\d+ .*$/.test(this.getSectionName());
    };

    cellCourses.prototype.animateCloseButtons = function (propagate = true) {
        if (propagate && this.isOfMainCourse()) {
            cellCourses.findByCourseCode(this.getCourseCodeWithoutSpace()).animateCloseButtons(false);
        }

        this.getElements().addClass('animate');

        return this;
    };

    cellCourses.prototype.getColor = function () {
        return this.getElements().first().css('background-color');
    };

    cellCourses.getAllCrnDataToCopy = () => {
        const crnObj = {};
        let results = [];

        $('.cell-course').each((i, element) => {
            const crn = $(element).data('crn');

            if (!crnObj.hasOwnProperty(crn)) {
                results.push(`${$(element).data('section-name')}: ${crn}`);
            }

            crnObj[$(element).data('crn')] = 1;
        });

        return results.sort().join('\n');
    };

    cellCourses.getAllCrnDataToSave = () => {
        const crnObj = {};

        $('.cell-course').each((i, element) => {
            crnObj[$(element).data('crn')] = 1;
        });

        return Object.keys(crnObj);
    };

    cellCourses.findByCrn = crn => cellCourses($(`.cell-course[data-crn="${crn}"]`));

    cellCourses.findByGeneralSectionName = name => cellCourses($(`.cell-course[data-section-name^="${name}"]`));

    cellCourses.findByCourseCode = code => cellCourses($(`.cell-course[data-section-name^="${code}"]`));

    cellCourses.make = (sectionName, crn, bgColor) => {
        return cellCourses($(templateGenerator.makeCellCourse(sectionName, crn, bgColor)));
    };

    return cellCourses;
})();

const classCells = (() => {
    const classCells = function (crnOr$elements) {
        if (!(crnOr$elements instanceof $)) {
            return classCells.findContainsCrn(crnOr$elements)
        }

        return new classCells.prototype.Init(crnOr$elements);
    };

    classCells.prototype.Init = function ($elements) {
        this.getElements = function () {
            return $elements;
        };

        return this;
    };

    classCells.prototype.Init.prototype = classCells.prototype;

    classCells.prototype.getElementsByChildrenCount = function (count) {
        return $(
            $.map(this.getElements(), element => {
                if ($(element).children().length === count) {
                    return element;
                }
            })
        );
    };

    classCells.prototype.addCellCourse = function (cellCourse) {
        this.getElements().addClass('filled').append(cellCourse.getElements().first().clone());

        this.getElementsByChildrenCount(1).addClass('make-available');

        return this;
    };

    classCells.prototype.removeCellCourse = function (crn) {
        cellCourses.findByCrn(crn).getElements().remove();

        this.getElementsByChildrenCount(0).removeClass('filled');

        return this;
    };

    classCells.clearInterests = () => {
        $('.interested').removeClass('interested').removeClass('make-available');
    };

    classCells.findContainsCrn = crn => classCells($('.class-cell').has(`[data-crn="${crn}"]`));

    return classCells;
})();

(showFirstVisitNotifications = () => {
    if (localStorage.getItem('visited-before') === null) {
        localStorage.setItem('visited-before', 'yes');

        $('#notify-about').show();
        $('#notify-cookies').show();
    }
})();

(updateCourseData = () => {
    const storageKey = `course-data-${config.term}-${config.dataVersion}`;
    const data = localStorage.getItem(storageKey);

    const showNotification = () => {
        $('#notify-data-updated').fadeIn(500);
    };

    

    const clearOldData = () => {
        let removedData = false;

        for (let i = 0; ; i++) {
            const key = localStorage.key(i);

            if (key === null) {
                break;
            }

            if (key.indexOf('course-data') > -1 || key.indexOf('saved-schedule') > -1) {
                localStorage.removeItem(key);

                removedData = true;
            }
        }

        if (removedData) {
            showNotification();
        }
    };

    if (data !== null) {
        const {courses, instructors, places} = JSON.parse(data);

        courseEntry.populate(courses, instructors, places);

        return;
    }

    $.getJSON(`data-v${config.dataVersion}.min.json`, data => {
        const {courses, instructors, places} = data;

        clearOldData();

        courseEntry.populate(courses, instructors, places);

        localStorage.setItem(storageKey, JSON.stringify(data));
    });
})();

const normalizeSearchParam = (query) => {
        query = query.trim().toUpperCase();
        query = query.replaceAll(/\s+/g, '');
        
        return query;
};

(setEvents = () => {
    $(document).on('click', '.course-header', event => {
        courseEntry($(event.currentTarget).parent()).toggleOpen();

        if (courseEntry.isOnDisplayMode()) {
            courseEntry.endDisplayMode();
        }
    });

    $(document).on('click', '.section-link', event => {
        event.stopPropagation();
    });

    $(document).on('click', '.course-section', event => {
        sectionEntry($(event.currentTarget)).toggleSelect();
    });

    $(document).on('click', '.remove-course', event => {
        sectionEntry($(event.currentTarget).parent().data('crn')).toggleSelect();

        event.stopPropagation();
    });

    $(document).on('mouseenter', '.remove-course,.course-section.selected', event => {
        cellCourses($(event.currentTarget).closest('[data-crn]').data('crn')).animateCloseButtons();
    });

    $(document).on('mouseleave', '.remove-course,.course-section.selected', event => {
        $('.cell-course.animate').removeClass('animate');

        event.stopPropagation();
    });

    $(document).on('click', '.cell-course', event => {
        courseEntry.startDisplayMode(cellCourses($(event.currentTarget)).getCourseCodeWithSpace());
    });

    $(document).on('mouseenter', '.course-section', event => {
        const section = sectionEntry($(event.currentTarget));

        section.getClassCells().getElements().addClass('interested');

        cellCourses.findByGeneralSectionName(section.getGeneralName()).getParentClassCells().getElements()
            .filter('.interested').addClass('make-available');
    });

    $(document).on('mouseleave', '.course-section', () => {
        classCells.clearInterests();
    });

    const searchParameterChange = event => {
        courseEntry.closeAll();

        const filterName = 'search';

        const searchQuery = (normalizeSearchParam($('#search-box').val() || '') || '');

        switch ($('#search-category').val()) {
            case 'name':
                courseEntry.filter(
                    course => course.nameContains(searchQuery),
                    filterName
                );
                sectionEntry.clearFilter(filterName);
                break;
            case 'instructor':
                courseEntry.clearFilter(filterName);
                sectionEntry.filter(
                    section => section.instructorNameContains(searchQuery),
                    filterName
                );
                break;
        }
    };

    $('#search-category').on('change', searchParameterChange);

    $('#search-box').on('input', searchParameterChange);

    $('#menu-toggle').on('click', () => $('body').toggleClass('hide-menu'));

    $(document).on('keyup', (() => {
        const ESC_KEY = 27;

        return event => {
            if (event.keyCode === ESC_KEY) {
                if (courseEntry.isOnDisplayMode()) {
                    courseEntry.endDisplayMode();
                } else {
                    $('#search-box').val('').trigger('input');
                }
            }
        };
    })());

    $(document).on('click', '#clear-button', () => $('#notify-clear').fadeIn(500));

    $(document).on('click', '#about-button', () => $('#notify-about').fadeIn(500));
    $(document).on('click', '#about-button', () => $('#notify-cookies').fadeIn(500));
})();

(setWeekdayFilterEvents = () => {
    $(document).on('input', '#day-filter-selections input', event => {
        sectionEntry.filterByDays();
    });

    if ($('#day-filter-selections input:not(:checked)').length > 0) {
        sectionEntry.filterByDays();

        $('#day-filter-selections').show();
    }
})();

(loadScheduleFromLocalStorage = () => {
    const savedSchedule = localStorage.getItem('saved-schedule');

    if (savedSchedule === null) {
        return;
    }

    savedSchedule.split(',').forEach(crn => {
        $(`.course-section[data-crn="${crn}"]`).click();
    });
})();

(setNotificationEvents = () => {
    $(document).on('click', '.notification .button', event => {
        $(event.target).closest('.notification').fadeOut(500);
    });

    $(document).on('click', '#notify-clear .notification-button', () => {
        $('.course-section.selected').removeClass('selected');
        $('.class-cell').attr('class', 'class-cell').children().remove();

        colorPalette.reset();

        saveSchedule();
    });
})();

(initializeClipboardJS = () => {
    const clipboard = new ClipboardJS('#copy-button', {
        text: () => cellCourses.getAllCrnDataToCopy()
    });

    clipboard.on('success', () => {
        const notification = $('#notify-copied');

        notification.fadeIn(500);

        setTimeout(() => {
            notification.fadeOut(500);
        }, 2000);
    });

    clipboard.on('error', event => {
        const notification = $('#notify-copy-fail');

        notification.find('.notification-content p').text(event.text);

        notification.fadeIn(500);
    });
})();
