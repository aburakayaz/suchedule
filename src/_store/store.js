import Vue from 'vue';
import Vuex from 'vuex';
Vue.use(Vuex);

import data from './data'

const store = new Vuex.Store({
    state: {
        schedule: data,
        highlighted: [],
        sidebar: true,
        about: false,
        notifications: [],
        baseCourses: data.allCourses,
        baseInstructors: data.allInstructors
    },
    getters: {
        getAllInstructors: state => {
            return state.schedule.allInstructors;
        },
        sidebarState: state => {
            return state.sidebar;
        },
        getAllCourses: state => {
            return state.schedule.allCourses;
        },
        getCurrentCourses: state => {
            return state.schedule.activeSchedule;
        },
        getWizardCourses: state => {
            return state.schedule.wizardSchedule.courses;
        },
        getWizardSchedule: state => {
            return state.schedule.wizardSchedule.schedule;
        },
        getAllPlaces: state => {
            return state.schedule.allPlaces;
        },
        getNotifications(state){
            return state.notifications;
        },
        getWSchedule(state){
            return state.schedule.wizardSchedule.schedule;
        },
        isCourseSelected: state => CRN => {
            for(let course in state.schedule.activeSchedule){
                if(state.schedule.activeSchedule[course].crn === CRN) return true;
            }
        },
        getSectionByCRN: state => CRN => {
            for(let i = 0; i < state.baseCourses.length; i++){
                for(let j = 0; j < state.baseCourses[i].classes.length; j++){
                    for(let k = 0; k < state.baseCourses[i].classes[j].sections.length; k++){
                        if(state.baseCourses[i].classes[j].sections[k].crn === CRN) {
                            return {
                                course: state.baseCourses[i],
                                group: state.baseCourses[i].classes[j].sections[k].group,
                                section: state.baseCourses[i].classes[j].sections[k]
                            };

                        }
                    }
                }
            }
        },
        isRecitationRequired: state => CRN => {
            let course;
            for(let i = 0; i < state.baseCourses.length; i++){
                for(let j = 0; j < state.baseCourses[i].classes.length; j++){
                    for(let k = 0; k < state.baseCourses[i].classes[j].sections.length; k++){
                        if(state.baseCourses[i].classes[j].sections[k].crn === CRN) {
                            course = {
                                course: state.baseCourses[i],
                                group: state.baseCourses[i].classes[j].sections[k].group,
                                section: state.baseCourses[i].classes[j].sections[k]
                            };

                        }
                    }
                }
            }
            if(course.course.classes.length > 1){
                for(let i = 0; i < state.schedule.activeSchedule.length; i++){
                    if(state.schedule.activeSchedule[i].code === course.course.code && state.schedule.activeSchedule[i].type === "R"){
                        return false;
                    }
                }
                return true;
            }
            else{
                return false;
            }
        },
        isLectureRequired: state => CRN => {
            let course;
            for(let i = 0; i < state.baseCourses.length; i++){
                for(let j = 0; j < state.baseCourses[i].classes.length; j++){
                    for(let k = 0; k < state.baseCourses[i].classes[j].sections.length; k++){
                        if(state.baseCourses[i].classes[j].sections[k].crn === CRN) {
                            course = {
                                course: state.baseCourses[i],
                                group: state.baseCourses[i].classes[j].sections[k].group,
                                section: state.baseCourses[i].classes[j].sections[k]
                            };

                        }
                    }
                }
            }
            if(course.course.classes.length > 1){
                for(let i = 0; i < state.schedule.activeSchedule.length; i++){
                    if(state.schedule.activeSchedule[i].code === course.course.code && state.schedule.activeSchedule[i].type === "L"){
                        return false;
                    }
                }
                return true;
            }
            else{
                return false;
            }
        },
        isHighlighted: state => (row, col) => {

            for(let i = 0; i < state.highlighted.length; i++){
                if(state.highlighted[i].day === col-1 && state.highlighted[i].start <= row && state.highlighted[i].start + state.highlighted[i].duration > row){
                    console.log(row, col);
                    return true;
                }
            }
            return false;
        }
    },
    mutations: {
        // to be completed
        highlightTable(state, sections){
            state.highlighted = sections;
        },
        deHighlightTable(state){
            state.highlighted = [];
        },
        insertNotification(state, notification){
            state.notifications.push(notification)
        },
        removeNotification(state, id){
            for(let i = 0; i < state.notifications.length; i++){
                if(state.notifications[i].id === id){
                    state.notifications.splice(i,1);
                }
            }
        },
        importWizardToActive(state, courses){
            console.log(courses);
            state.schedule.activeSchedule = courses;
        },
        toggleSidebar(state){
            state.sidebar = !state.sidebar;
        },
        updateActiveSchedule(state, course){
            state.schedule.activeSchedule.push(course);
        },
        clearActiveSchedule(state){
            state.schedule.activeSchedule = [];
        },
        removeFromActiveSchedule(state, CRN){
            for(let i = 0; i < state.schedule.activeSchedule.length; i++){
                if(state.schedule.activeSchedule[i].crn === CRN){
                    state.schedule.activeSchedule.splice(i, 1);
                    break;
                }
            }
        },
        toggleAbout(state){
            state.about = !state.about
        },
        doSearch(state, {phrase, type, filteredDays}){
            state.schedule.allCourses = state.baseCourses;
            state.schedule.allInstructors = state.baseInstructors;
            if(filteredDays.length !== 0){
                state.schedule.allCourses = state.schedule.allCourses.forEach(course => {
                    course.classes.forEach(_class => {
                        _class.sections.filter(section => {
                            let flag = true;
                            section.schedule.forEach(time => {
                                flag = flag && (filteredDays.indexOf(time.day) !== -1);
                            });
                            return flag;
                        });
                    });
                });
            }
            if(phrase.length !== 0){
                if(type === 0){
                    //TODO works too slow
                    state.schedule.allCourses = state.schedule.allCourses.filter((c) => {
                        let classname = (c.code+" "+c.name).toLowerCase();
                        phrase = phrase.toLowerCase();
                        return classname.includes(phrase);
                    })
                }
                else{
                    state.schedule.allInstructors = state.baseInstructors.filter(ins => {
                        return ins.includes(phrase);
                    });
                    state.schedule.allCourses = state.schedule.allCourses.filter(c => {

                        for(let i = 0; i < c.classes.length; i++){
                            for(let j = 0; j < c.classes[i].sections.length; j++){
                                console.log(state.schedule.allInstructors.includes(c.classes[i].sections[j].instructors));
                                return state.schedule.allInstructors.includes(c.classes[i].sections[j].instructors);
                            }
                        }
                    })
                }
            }
        },
        insertWizardSchedule(state, schedule){
            state.schedule.wizardSchedule.schedule = schedule;
        },
        flushActiveSchedule(state){
            state.schedule.activeSchedule = [];
        },
        flushWizardSchedule(state){
            state.schedule.wizardSchedule.schedule = [];
        }
    },
    actions: {
    }
})

export default store;
export {default as actions} from './actions';
