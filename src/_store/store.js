import Vue from 'vue';
import Vuex from 'vuex';
Vue.use(Vuex);

import data from './data'

const store = new Vuex.Store({
    state: {
        schedule: data,
        sidebar: true
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
        }
    }
})

export default store;
export {default as actions} from './actions';