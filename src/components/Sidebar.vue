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

                <div v-for="course in this.$store.state.schedule.allCourses" :key="course.code" :id="`course_${course.code.trim()}`"  class="course hide-sections">
                    <div class="header" @click="toggleSections(course.code.trim())">
                        <div class="title">
                        <strong>{{ course.code }}</strong> - {{ course.name }}
                    </div>
                    <div class="caret">
                        <i class="fal fa-angle-down"></i>
                    </div>
                    </div>
                    <div class="sections">
                        <div class="section-header">Lectures</div>
                        <div v-for="section in course.classes[0].sections" :key="section.crn" class="section-container">
                            <div  class="row">
                                <div class="col-md-9 section-info">
                                    <span class="instructor-title">Instructors</span>
                                    <strong>{{ instructorName(section.instructors) }}</strong>
                                    <span class="info-box mt-2">
                                        <span class="section">
                                            A12
                                        </span>
                                        <span class="go-info">
                                            <router-link to="#" class="info-link">info</router-link>
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

                <div id="course_NS102" @click="toggleSections('NS102')" class="course">
                    <div class="header">
                        <div class="title">
                        <strong>NS 102</strong> - Natural Sciences
                    </div>
                    <div class="caret">
                        <i class="fal fa-angle-down"></i>
                    </div>
                    </div>
                    <div class="sections">
                        <div class="section-header">Lectures</div>
                        <div class="section-container">
                            <div class="row">
                                <div class="col-md-9 section-info">
                                    <span class="instructor-title">Instructors</span>
                                    <strong>Yuki Kaneko, Erhan Kalemci</strong>
                                    <span class="info-box mt-2">
                                        <span class="section">
                                            A12
                                        </span>
                                        <span class="go-info">
                                            <router-link to="#" class="info-link">info</router-link>
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

                <div data-toggled="false" id="course_NS101" @click="toggleSections('NS101')" class="course hide-sections">
                    <div class="header">
                        <div class="title">
                        <strong>NS 101</strong> - Natural Sciences
                    </div>
                    <div class="caret">
                        <i class="fal fa-angle-right"></i>
                    </div>
                    </div>
                    <div class="sections">
                        <div class="section-header">Lectures</div>
                        <div class="section-container">
                            <div class="row">
                                <div class="col-md-9 section-info">
                                    <span class="instructor-title">Instructors</span>
                                    <strong>Yuki Kaneko, Erhan Kalemci</strong>
                                    <span class="info-box mt-2">
                                        <span class="section">
                                            A12
                                        </span>
                                        <span class="go-info">
                                            <router-link to="#" class="info-link">info</router-link>
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
    methods: {
        toggleDay(day){
            this.days[day] = !this.days[day];
        },
        toggleSections(code){
            var element = document.getElementById(`course_${code}`)
            if(element.classList.contains('hide-sections')){
                element.classList.remove('hide-sections')
                element.siblings(':not(hide-sections)').addClass('hide-sections');
                
            }
            else{
                element.classList.add('hide-sections')
                element.siblings(':not(hide-sections)').addClass('hide-sections');
                
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
        }
    },
}
</script>
<style scoped src="@/assets/css/sidebar.css">
    
</style>