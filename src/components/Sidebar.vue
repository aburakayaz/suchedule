<template>
    <div id="sidebar" ref="sidebar">
        <div class="row">
            <div class="col-md-2 offset-md-10">
                <div class="hide-sidebar"  style="margin-top: 45vh;" @click="toggleSidebar">
                    <i id="sidebarToggler" class="fas fa-angle-left"></i>
                </div>
            </div>
        </div>
        <div class="search-bar">
            <input v-model="searchInput" type="text" @keyup="filterCourses" placeholder="Search Course" class="course-search">
            <select v-model="searchCriteria" name="search_criteria" id="search_criteria" class="filter-search">
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
                                            <span v-if="schedule.day === 0">Mon </span>
                                            <span v-else-if="schedule.day === 1">Tue </span>
                                            <span v-else-if="schedule.day === 2">Wed </span>
                                            <span v-else-if="schedule.day === 3">Thu </span>
                                            <span v-else-if="schedule.day === 4">Fri </span>
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
                                    <span @click="addToSchedule(section.crn)" v-if="courseSelected(section.crn)" class="section-select">
                                        <i class="far fa-minus"></i>
                                    </span>
                                    <span v-else @click="addToSchedule(section.crn)" class="section-select">
                                        <i class="far fa-plus"></i>
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div v-if="course.classes[1]">
                            <div class="section-header"><span v-if="course.code.includes('SPS')">Discussions</span> <span v-else>Recitations</span></div>
                        <div  v-for="section in course.classes[1].sections"
                              @mouseenter="highlighter" :data-group="section.group" :data-code="course.code+'R'"
                              :data-crn="section.crn" :id="`section_${section.crn}`" :key="section.crn"
                              class="section-container">
                            <div class="row">
                                <div class="col-md-9 section-info">
                                    <span class="instructor-title">Instructors</span>
                                    <strong>{{ instructorName(section.instructors) }}</strong>
                                    <div class="section-days">
                                        <div v-for="(schedule, index) in section.schedule" :key="index"
                                             :data-day="schedule.day" :data-start="schedule.start"
                                             :data-duration="schedule.duration"  class="section-day">
                                            <span v-if="schedule.day === 0">Mon </span>
                                            <span v-else-if="schedule.day === 1">Tue </span>
                                            <span v-else-if="schedule.day === 2">Wed </span>
                                            <span v-else-if="schedule.day === 3">Thu </span>
                                            <span v-else-if="schedule.day === 4">Fri </span>
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

                                <div class="col-md-3 text-right" >
                                    <span @click="addToSchedule(section.crn, 'R')" v-if="courseSelected(section.crn)" class="section-select">
                                        <i class="far fa-minus"></i>
                                    </span>
                                    <span v-else @click="addToSchedule(section.crn, 'R')" class="section-select">
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
import $ from 'jquery';
export default {
    name: 'Sidebar',
    data() {
        return {
            searchInput:  "",
            searchCriteria: 0,
            isShown: this.$store.getters.sidebarState,
            days: {
                monday: true,
                tuesday: true,
                wednesday: true,
                thursday: true,
                friday: true
            },
        }
    },
    computed: {
        activeSchedule() {
            return this.$store.state.schedule.activeSchedule;
        },
        courseSelected(){
            return function(crn) {
                return this.$store.getters.isCourseSelected(crn);
            }
        }
    },
    methods: {
        filterDays(){
            let aDays = [];
            for(let i in this.days){
                if(!this.days[i]){
                    let day = 0;
                    if(i === "tuesday") day = 1;
                    else if(i === "wednesday") day = 2;
                    else if(i === "thursday") day = 3;
                    else if(i === "friday") day = 4;
                    aDays.push(day);
                }
            }
            return aDays;
        },
        toggleDay(day){
            this.days[day] = !this.days[day];
            let aDays = this.filterDays();
            let payload = {
                phrase: this.searchInput,
                days: aDays
            }
            this.$store.commit('doSearch', payload);
        },
        toggleSections(code, event){
            console.log(event);
            let element = $(`#course_${code}`)
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
        filterCourses(){
            let aDays = this.filterDays();
            let payload = {
                phrase: this.searchInput,
                type: this.searchCriteria,
                filteredDays: aDays
            }
            this.$store.commit('doSearch', payload);
        },
        toggleSidebar(){
            if(this.isShown){
                this.isShown = false;
                this.$refs.sidebar.style.marginLeft = "-49vh";
                this.$refs.sidebar.classList.remove('fa-angle-left');
                this.$refs.sidebar.classList.add('fa-angle-right');
                this.$store.commit('toggleSidebar')
            }
            else{
                this.isShown = true;
                this.$refs.sidebar.style.marginLeft = "0";
                this.$refs.sidebar.classList.remove('fa-angle-right');
                this.$refs.sidebar.classList.add('fa-angle-left');
                this.$store.commit('toggleSidebar')
            }
        },
        isCourseSelected(crn){
            return this.$store.getters.isCourseSelected(crn);
        },
        getRandomNotificationId(){
            return Math.floor(Math.random() * 20) + 1;
        },
        insertNotification(type, message){
            let notification = {
                id: this.getRandomNotificationId(),
                type: type,
                message: message
            }
            this.$store.commit('insertNotification', notification);
            setTimeout(() => {
                this.$store.commit('removeNotification', notification.id);
            }, 4000);
        },
        instructorName(id){
            return this.$store.state.baseInstructors[id]
        },
        getPlace(id){
            return this.$store.getters.getAllPlaces[id];
        },
        shortenCode(code){
            return code.split(" ")[0]+code.split(" ")[1]
        },
        isCourseDuplicate(code){
            for(let c in this.$store.getters.getCurrentCourses){
                if(this.$store.getters.getCurrentCourses[c].code === code){
                    this.insertNotification("danger", `You already have another section of <strong>${code}</strong>`)
                    return true;
                }
            }
            return false;
        },
        addToSchedule(crn, type = "L") {
            let activeCourse = this.$store.getters.getSectionByCRN(crn);
            if(this.$store.getters.isCourseSelected(crn)){
                this.$store.commit('removeFromActiveSchedule', crn);
                //$($(e.target).parent().parent().parent().parent()).removeClass("section-selected")
                //$(e.target).removeClass("fa-minus").addClass("fa-plus")
            }
            else{
                let course = {
                    code: activeCourse.course.code,
                    crn: activeCourse.section.crn,
                    group: activeCourse.group,
                    color: this.getColorCode(),
                    type: type,
                    sections: activeCourse.section.schedule
                }
                // duplicate course olup olmadığını kontrol etmek istersek: this.isCourseDuplicate(activeCourse.section.crn)
                this.$store.commit('updateActiveSchedule', course);


            }
        },
        getColorCode(){
            let code = Math.floor(Math.random() * 9) + 1
            for(let c in this.$store.getters.getCurrentCourses){
                if(c.color === code){
                    this.getColorCode();
                }
            }
            return code;
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
            //this.$store.commit('highlightTable', arr);
        }
    },
}
</script>
<style scoped src="@/assets/css/sidebar.css">

</style>
