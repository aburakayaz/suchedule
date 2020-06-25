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
        baseCourses: data.allCourses
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
    },
    mutations: {
        // to be completed
        highlightTable(state, sections){
            state.highlighted = sections;
        },
        insertNotification(state, notification){
            state.notifications.push(notification)
        },
        removeNotification(state, id){
            for(let i = 0; i < state.notifications.length; i++){
                if(state.notifications[i].id == id){
                    state.notifications.splice(i,1);
                }
            }
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
        doSearch(state, payload){
            state.schedule.allCourses = state.baseCourses;

            var phrase = payload.phrase;
            var filteredDays = payload.days;

            if(filteredDays.length != 0){
                filteredDays.forEach(fDay => {
                    
                    state.schedule.allCourses = state.schedule.allCourses.filter(c => {
                        c.classes.forEach(classes => {
                            
                            classes.sections.forEach(section => {
                                section.schedule.forEach(time => {
                                    return time.day !== fDay
                                })
                            })
                        })
                    })
                })
            }

            if(phrase.length != 0){
                //TODO works too slow
                state.schedule.allCourses = state.schedule.allCourses.filter((c) => {
                    let coursename = (c.code+" "+c.name).toLowerCase();
                    phrase = phrase.toLowerCase();
                    console.log(phrase, coursename, coursename.includes(phrase))
                    if(coursename.includes(phrase)) return true;
                    else return false;
                })
            }
        },
    }
})

export default store;
export {default as actions} from './actions';