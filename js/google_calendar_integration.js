"use strict";

const GOOGLE_API = (() => {
    //  Google API Configurations
    const CONFIG = {
        // Client ID and API key from the Developer Console
        CLIENT_ID: '197424454819-lbdl0oae7t19604mql2aibgdc01u46eb.apps.googleusercontent.com',
        API_KEY: 'AIzaSyBh2n_He6PjNUOuL10SGai90CF1pCMpSzA',

        // Array of API discovery doc URLs for APIs used by the quickstart
        DISCOVERY_DOCS: ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],

        // Authorization scopes required by the API; multiple scopes can be included, separated by spaces.
        SCOPES: 'https://www.googleapis.com/auth/calendar',
    };

    //  Called to load the auth2 library and API client library.
    const load = (...initializers) => gapi.load('client:auth2', () => initialize(initializers));

    const initialize = async (initializers) => {
        //  Initializes the API client library and sets up sign-in state listeners.
        try {
            await gapi.client.init({
                apiKey: CONFIG.API_KEY,
                clientId: CONFIG.CLIENT_ID,
                discoveryDocs: CONFIG.DISCOVERY_DOCS,
                scope: CONFIG.SCOPES
            });
        } catch (e) {
            console.error(e);
            alert('Google API failed to initialize.\n(this only affects the add to calender function, you can ignore it)');
            return;
        }

        for (const initializer of initializers) {
            await initializer();
        }
    };

    return {
        loadThenInitialize: load,
    }
})();

const CALENDAR_API = (() => {
    const createCalendar = async calendarSummary => {
        return new Promise(function (resolve, reject) {
            const request = gapi.client.calendar.calendars.insert({
                'summary': calendarSummary,
                //  https://eduardopereira.pt/2012/06/google-calendar-api-v3-set-color-color-chart/
                'colorId': 8,
            });

            request.execute(function (response) {
                console.log(response);

                if (response.hasOwnProperty('error')) {
                    reject('Failed to create the calendar. Here is why:' + response.error.message);
                    return;
                }

                resolve(response);
            });
        });
    };

    const addLecturesToCalendar = async (calendarId, lectures, weeksToRecur) => {
        return new Promise(function (resolve, reject) {
            const batch = gapi.client.newBatch();

            lectures.forEach(lecture => {
                batch.add(getInsertRequest(calendarId, lecture, weeksToRecur))
            });

            batch.execute(function (response) {
                console.log(response);

                if (response.hasOwnProperty('error')) {
                    reject('Failed to add courses. Here is why:\n' + response.error.message);
                    return;
                }

                resolve();
            });
        });
    };

    const getInsertRequest = (calendarId, lecture, weeksToRecur) => {
        let event = {
            'start': {
                'dateTime': lecture.startTime.toISOString(),
                'timeZone': 'Europe/Istanbul'
            },
            'end': {
                'dateTime': lecture.endTime.toISOString(),
                'timeZone': 'Europe/Istanbul'
            },
            'location': lecture.place,
            'reminders': {
                'useDefault': false
            },
            'summary': lecture.summary,
            'description': lecture.course_name,
            'recurrence': [`RRULE:FREQ=WEEKLY;COUNT=${weeksToRecur}`],
        };

        console.log(event);

        return gapi.client.calendar.events.insert({
            'calendarId': calendarId,
            'resource': event
        });
    };

    const deleteCalendar = calendarId => {
        return new Promise(function (resolve, reject) {
            const request = gapi.client.calendar.calendars.delete({
                'calendarId': calendarId
            });

            request.execute(function (response) {
                console.log(response);

                if (response.hasOwnProperty('error')) {
                    reject(`Failed to delete the calendar. Here is why:\n${response.error.message}`);
                    return;
                }

                resolve();
            });
        });
    };

    const getUsersCalendarsMatchingSummary = async calendarSummary => {
        const calendars = await getUsersCalendars();

        const generatedCalendars = calendars.filter(
            calendar => calendar.summary === calendarSummary
        );
        console.log("Already existing calendars:", generatedCalendars);

        if (generatedCalendars.length >= 1) {
            return generatedCalendars[0];
        } else {
            return null;
        }
    };

    const getUsersCalendars = async () => {
        return new Promise((resolve, reject) => {
            const request = gapi.client.calendar.calendarList.list();

            request.execute(function (response) {
                if (response.hasOwnProperty("items")) {
                    resolve(response.items);
                } else {
                    reject(response);
                }
            });
        })
    };

    return {
        createCalendar,
        addLecturesToCalendar,
        deleteCalendar,
        getUsersCalendarsMatchingSummary,
    }
})();

const GOOGLE_CALENDAR_MODAL = (($element) => {
    const auth = (($element) => {
        const authorizeButton = $element.find('#authorize-button');
        const signoutButton = $element.find('#signout-button');
        const authorizedArea = $element.find('#authorized-area');
        const unauthorizedArea = $element.find('#unauthorized-area');

        //  Called when the signed in status changes, to update the UI
        //  appropriately. After a sign-in, the API is called.
        const updateSigninStatus = async isSignedIn => {
            if (isSignedIn) {
                addNotification("Signed-in successfully.");
                unauthorizedArea.hide();
                authorizedArea.show();
                return;
            }

            addNotification("Signed-out successfully.");
            unauthorizedArea.show();
            authorizedArea.hide();
        };

        const initSigninStatus = async isSignedIn => {
            if (isSignedIn) {
                addNotification("Signed-in successfully.");
                unauthorizedArea.hide();
                authorizedArea.show();
                return;
            }

            addNotification("Please sign-in with your Google account.");
            unauthorizedArea.show();
            authorizedArea.hide();
        };

        const api_initializer = async () => {
            // Listen for sign-in state changes.
            gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

            // Handle the initial sign-in state.
            await initSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
            authorizeButton.click(gapi.auth2.getAuthInstance().signIn);
            signoutButton.click(gapi.auth2.getAuthInstance().signOut);
        };

        return {
            api_initializer,
        }
    })($element);

    const calendar = (($element) => {
        const currentWeek = $element.find('#current-week');
        const addButton = $element.find('#add-button');

        const deleteButton = $element.find('#delete-button');

        const CURRENT_TERM = (function () {
            const NUMERIC = config.term;
            const YEAR = NUMERIC.substring(0, 4);
            const TYPE = NUMERIC.substring(4) === '01' ? 'Fall' : 'Spring';
            const VERBAL = `${YEAR} ${TYPE}`;
            const CALENDAR_SUMMARY = `${VERBAL} Courses`;

            return Object.freeze({YEAR, TYPE, NUMERIC, VERBAL, CALENDAR_SUMMARY});
        })();

        const CURRENT_GOOGLE_CALENDAR = (function () {
            const addArea = $element.find('#calendar-add-area');
            const currentCalendarName = $element.find('#current-calendar-name');
            const deleteArea = $element.find('#calendar-delete-area');

            let value;

            //  Sets the CALENDAR and changes other related states
            function set(calendar) {
                value = calendar;

                if (value === null) {
                    addArea.show();
                    deleteArea.hide();
                } else {
                    currentCalendarName.text(value.summary);
                    addArea.hide();
                    deleteArea.show();
                }
            }

            set(null);

            return {
                set,
                getId: () => value.id,
                getSummary: () => value.summary,
            }
        })();

        const TIME_HELPERS = (function () {
            const mostRecentMonday = new Date();
            while (mostRecentMonday.getDay() !== 1) {
                mostRecentMonday.setDate(mostRecentMonday.getDate() - 1);
            }
            mostRecentMonday.setHours(0);
            mostRecentMonday.setMinutes(0);
            mostRecentMonday.setSeconds(0);

            const getStartTime = (day, hour) => {
                const date = new Date(mostRecentMonday.getTime());
                date.setDate(date.getDate() + day);
                date.setHours(8 + hour);
                date.setMinutes(40);
                date.setSeconds(0);
                date.setMilliseconds(0);
                return date;
            };

            function getEndTime(startTime, duration) {
                const date = new Date(startTime.getTime());
                date.setHours(startTime.getHours() + duration);
                date.setMinutes(30);
                return date;
            }

            return {
                mostRecentMonday,
                getStartTime,
                getEndTime,
            }
        })();

        function getLecturesInSchedule() {
            const course_data = JSON.parse(
                localStorage.getItem(`course-data-${config.term}-${config.dataVersion}`)
            );
            const selected_CRNs = (localStorage.getItem('saved-schedule') || "").split(',');
            const lectures = [];

            course_data.courses.forEach(
                course => course.classes.forEach(
                    cls => cls.sections.forEach(
                        section => {
                            if (selected_CRNs.includes(section.crn)) {
                                section.schedule.forEach(
                                    lecture => {
                                        const startTime = TIME_HELPERS.getStartTime(lecture.day, lecture.start);
                                        const endTime = TIME_HELPERS.getEndTime(startTime, lecture.duration);
                                        lectures.push({
                                            summary: `${course.code}${cls.type}`,
                                            course_name: course.name,
                                            day: lecture.day,
                                            startTime, endTime,
                                            place: course_data.places[lecture.place],
                                        })
                                    }
                                )
                            }
                        }
                    )
                )
            );

            return lectures;
        }

        addButton.click(async () => {
            addButton.prop('disabled', true);

            try {
                const lectures = getLecturesInSchedule();
                if (lectures.length === 0) {
                    throw new Error("Please add a course.");
                }

                addNotification('Creating calendar...');
                const newCalendar = await CALENDAR_API.createCalendar(CURRENT_TERM.CALENDAR_SUMMARY);
                addNotification('Calendar created.');

                addNotification("Adding courses...");
                await CALENDAR_API.addLecturesToCalendar(
                    newCalendar.id,
                    lectures,
                    14 - parseInt(currentWeek.val()),
                );
                addNotification('Courses added.');

                CURRENT_GOOGLE_CALENDAR.set(newCalendar);
            } catch (e) {
                console.error(e);
                addNotification(e);
                CURRENT_GOOGLE_CALENDAR.set(null);
            }

            addButton.prop('disabled', false);
        });

        deleteButton.click(async () => {
            deleteButton.prop('disabled', true);

            try {
                await CALENDAR_API.deleteCalendar(CURRENT_GOOGLE_CALENDAR.getId());
                addNotification(`"${CURRENT_GOOGLE_CALENDAR.getSummary()}" is deleted.`);
                CURRENT_GOOGLE_CALENDAR.set(null);
            } catch (e) {
                console.error(e);
                addNotification(e);
            }

            deleteButton.prop('disabled', false);
        });

        const api_initializer = async () => {
            if (gapi.auth2.getAuthInstance().isSignedIn.get()) {
                CURRENT_GOOGLE_CALENDAR.set(
                    await CALENDAR_API.getUsersCalendarsMatchingSummary(CURRENT_TERM.CALENDAR_SUMMARY)
                );
            }

            // Listen for sign-in state changes.
            gapi.auth2.getAuthInstance().isSignedIn.listen(async isSignedIn => {
                if (isSignedIn) {
                    CURRENT_GOOGLE_CALENDAR.set(
                        await CALENDAR_API.getUsersCalendarsMatchingSummary(CURRENT_TERM.CALENDAR_SUMMARY)
                    );
                }
            });
        };

        return {
            api_initializer,
        }
    })($element.find('#current-google-calendar'));

    const notificationArea = $element.find('#notification-area');
    const addNotification = message => {
        const notification = $(document.createElement('p'));
        const timeStamp = new Date().toTimeString().split(' ')[0];
        notification.text(`[${timeStamp}] ${message}`);
        notificationArea.prepend(notification);
    };

    const api_initializer = async () => {
        await auth.api_initializer();
        await calendar.api_initializer();
    };

    const show = () => $element.modal({
        showClose: false,
    });

    return {
        api_initializer,
        show,
    }
})($('#google-calendar-modal'));

$('#google-calendar-button').click(GOOGLE_CALENDAR_MODAL.show);

GOOGLE_API.loadThenInitialize(
    GOOGLE_CALENDAR_MODAL.api_initializer,
);
