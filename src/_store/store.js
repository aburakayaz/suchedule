import Vue from 'vue';
import Vuex from 'vuex';
Vue.use(Vuex);

import data from './data'

const store = new Vuex.Store({
    state: {
        schedule: data,
        highlighted: [],
        sidebar: true,
        about: false
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
        }
    },
    mutations: {
        // to be completed
        highlightTable(state, sections){
            state.highlighted = sections;
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
                if(state.schedule.activeSchedule[i].code === CRN){
                    state.schedule.activeSchedule.splice(i, 1);
                    i--;
                }
            }
        },
        toggleAbout(state){
            state.about = !state.about
        }
    }
})

export default store;
export {default as actions} from './actions';