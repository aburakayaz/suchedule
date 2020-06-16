<template>
    <div id="sidebar">
        <div class="row">
            <div class="col-md-2 offset-md-10">
                <div class="hide-sidebar"  style="margin-top: 45vh;" @click="toggleSidebar">
                    <i id="sidebarToggler" class="fas fa-angle-left"></i>
                </div>
            </div>  
        </div>
        <div class="search-bar">
            <input type="text" placeholder="Search Course" class="course-search">
            <select name="" id="" class="filter-search">
                <option value="0">Course name</option>
                <option value="1">Instructor</option>
            </select>
        </div>
        <div class="row day-filter">
            <div class="col-md-4">
                <span class="day-filter-text">
                    <i class="far fa-calendar"></i> Filter By Day
                </span>
            </div>
            <div class="col-md-8 text-right">
                <span @click="toggleDay('monday')" :class="'day-checkbox'+(days.monday ? ' active' : '')">MON</span>
                <span @click="toggleDay('tuesday')" :class="'day-checkbox'+(days.tuesday ? ' active' : '')">TUE</span>
                <span @click="toggleDay('wednesday')" :class="'day-checkbox'+(days.wednesday ? ' active' : '')">WED</span>
                <span @click="toggleDay('thursday')" :class="'day-checkbox'+(days.thursday ? ' active' : '')">THU</span>
                <span @click="toggleDay('friday')" :class="'day-checkbox'+(days.friday ? ' active' : '')">FRI</span>
            </div>
        </div>
        <div class="row courses mt-3">
            <div class="col-md-12">

                <div v-for="course in this.$store.state.schedule.allCourses" data-code="AL102" :key="course.code" :id="`course_${shortenCode(course.code)}`"  class="course hide-sections">
                    <div class="header" :data-code="shortenCode(course.code)" @click="toggleSections(shortenCode(course.code), $event)">
                        <div class="title">
                        <strong>{{ course.code }}</strong> - {{ course.name }}
                    </div>
                    <div class="caret">
                        <i class="fal fa-angle-right"></i>
                    </div>
                    </div>
                    <div class="sections">
                        <div class="section-header">Lectures</div>
                        <div v-for="section in course.classes[0].sections" :key="section.crn" class="section-container" @mouseenter="highlightTable(section)">
                            <div  class="row">
                                <div class="col-md-9 section-info">
                                    <span class="instructor-title">Instructors</span>
                                    <strong>{{ instructorName(section.instructors) }}</strong>
                                    <div class="section-days">
                                        <div v-for="(schedule, index) in section.schedule" :key="index"  class="section-day">
                                            <span v-if="schedule.day == 0">Mon </span>
                                            <span v-else-if="schedule.day == 1">Tue </span>
                                            <span v-else-if="schedule.day == 2">Wed </span>
                                            <span v-else-if="schedule.day == 3">Thu </span>
                                            <span v-else-if="schedule.day == 4">Fri </span>
                                            &nbsp;
                                            <span>{{ schedule.start+8 }}.40 - {{ schedule.start+8+schedule.duration }}.40 </span>
                                            &nbsp;
                                            {{ getPlace(schedule.place) }}
                                        </div>
                                    </div>
                                    <span class="info-box mt-2">
                                        <span class="section">
                                            {{ section.group }}
                                        </span>
                                        <span class="go-info">
                                            <router-link to="#" class="info-link">info <i class="fal fa-external-link"></i></router-link>
                                        </span>
                                    </span>
                                </div>

                                <div class="col-md-3 text-right">
                                    <span class="section-select">
                                        <i class="far fa-plus"></i>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>
</template>
<script>
import store from '../_store/store';
import $ from 'jquery';
export default {
    name: 'Sidebar',
    data() {
        return {
            isShown: true,
            days: {
                monday: true,
                tuesday: true,
                wednesday: true,
                thursday: true,
                friday: true
            }
        }
    },
    computed: {
        
    },
    mounted(){
    },
    methods: {
        toggleDay(day){
            this.days[day] = !this.days[day];
        },
        highlightTable(section){
            for(let i = 0; i < section.schedule.length; i++){
                store.commit('highlightTable', section);
            }
        },
        toggleSections(code, event){
            console.log(event);
            var element = $(`#course_${code}`)
            if(element.hasClass('hide-sections')){
                $(element).siblings(':not(hide-sections)').addClass('hide-sections');
                element.removeClass('hide-sections')
                $(`#course_${code} .caret i`).removeClass("fa-angle-right").addClass("fa-angle-down")
            }
            else{
                element.siblings(':not(hide-sections)').addClass('hide-sections');
                element.addClass('hide-sections') 
                $(`#course_${code} .caret i`).addClass("fa-angle-right").removeClass("fa-angle-down")   
            }
        },
        toggleSidebar(){
            if(this.isShown){
                this.isShown = false;
                document.getElementById('sidebar').style.marginLeft = "-49vh";
                document.getElementById('sidebarToggler').classList.remove('fa-angle-left');
                document.getElementById('sidebarToggler').classList.add('fa-angle-right');
                store.commit('toggleSidebar')
            }
            else{
                this.isShown = true;
                document.getElementById('sidebar').style.marginLeft = "0";
                document.getElementById('sidebarToggler').classList.remove('fa-angle-right');
                document.getElementById('sidebarToggler').classList.add('fa-angle-left');
                store.commit('toggleSidebar')
            } 
        },
        instructorName(id){
            return this.$store.getters.getAllInstructors[id]
        },
        getPlace(id){
            return this.$store.getters.getAllPlaces[id];
        },
        shortenCode(code){
            return code.split(" ")[0]+code.split(" ")[1]
        }
    },
}
</script>
<style scoped src="@/assets/css/sidebar.css">
    
</style>