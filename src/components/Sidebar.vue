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

                <div v-for="course in this.$store.state.schedule.allCourses"  :key="course.code" :id="`course_${shortenCode(course.code)}`"  class="course hide-sections">
                    <div class="header" :data-code="shortenCode(course.code)"  @click="toggleSections(shortenCode(course.code), $event)">
                        <div class="title">
                        <strong>{{ course.code }}</strong> - {{ course.name }}
                    </div>
                    <div class="caret">
                        <i class="fal fa-angle-right"></i>
                    </div>
                    </div>
                    <div class="sections">
                        <div class="section-header">Lectures</div>
                        <div v-for="section in course.classes[0].sections"   @mouseenter="highlighter" :data-group="section.group" :data-code="course.code" :data-crn="section.crn" :id="`section_${section.crn}`" :key="section.crn" class="section-container">
                            <div class="row">
                                <div class="col-md-9 section-info">
                                    <span class="instructor-title">Instructors</span>
                                    <strong>{{ instructorName(section.instructors) }}</strong>
                                    <div class="section-days">
                                        <div v-for="(schedule, index) in section.schedule" :key="index" :data-day="schedule.day" :data-start="schedule.start" :data-duration="schedule.duration"  class="section-day">
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
                                    <span v-if="isCourseSelected(section.crn)" class="section-select">
                                        <i class="far fa-minus"></i>
                                    </span>
                                    <span v-else @click="addToSchedule" class="section-select">
                                        <i class="far fa-plus"></i>
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div v-if="course.classes[1]">
                            <div  class="section-header">Recitations</div>
                        <div  v-for="section in course.classes[1].sections"   @mouseenter="highlighter" :data-group="section.group" :data-code="course.code+'R'" :data-crn="section.crn" :id="`section_${section.crn}`" :key="section.crn" class="section-container">
                            <div class="row">
                                <div class="col-md-9 section-info">
                                    <span class="instructor-title">Instructors</span>
                                    <strong>{{ instructorName(section.instructors) }}</strong>
                                    <div class="section-days">
                                        <div v-for="(schedule, index) in section.schedule" :key="index" :data-day="schedule.day" :data-start="schedule.start" :data-duration="schedule.duration"  class="section-day">
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
                                    <span v-if="isCourseSelected(section.crn)" class="section-select">
                                        <i class="far fa-minus"></i>
                                    </span>
                                    <span v-else @click="addToSchedule" class="section-select">
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
            },
            activeSchedule: this.$store.state.schedule.activeSchedule,
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
        isCourseSelected(crn){
            for(let course in this.activeSchedule){
                if(course.crn == crn) return true;
            }
            return false;
        },
        instructorName(id){
            return this.$store.getters.getAllInstructors[id]
        },
        getPlace(id){
            return this.$store.getters.getAllPlaces[id];
        },
        shortenCode(code){
            return code.split(" ")[0]+code.split(" ")[1]
        },
        addToSchedule(e){
            var course = {
                code: $($(e.target).parent().parent().parent().parent()).data("code"),
                crn: $($(e.target).parent().parent().parent().parent()).data("crn"),
                group: $($(e.target).parent().parent().parent().parent()).data("group"),
                color: this.getRandomColor(),
                sections: []
            }
            $($(e.target).parent().parent().siblings().children()[2]).children().each(day => {
                var c = {
                    day: $($($(e.target).parent().parent().siblings().children()[2]).children()[day]).data("day"),
                    start: $($($(e.target).parent().parent().siblings().children()[2]).children()[day]).data("start"),
                    duration: $($($(e.target).parent().parent().siblings().children()[2]).children()[day]).data("duration")
                }
                course.sections.push(c);
                
            })
            store.commit('updateActiveSchedule', course);
        },
        getRandomColor(){
            return Math.floor(Math.random() * 9) + 1
        },
        highlighter(event){
            //var arr = []
            console.log($("#"+event.target.id+" .section-days > .section-day"))
            /* .map(section => {
                var sec = {
                    day: $(section).data("day"),
                    start: $(section).data("start"),
                    duration: $(section).data("duration")
                }
                arr.push(sec);
            }) */
            //store.commit('highlightTable', arr);
        }
    },
}
</script>
<style scoped src="@/assets/css/sidebar.css">
    
</style>