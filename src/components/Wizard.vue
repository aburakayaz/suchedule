<template>
    <div id="wizard">
        <div class="row mt-5">
            <div class="col-md-6 offset-md-3">
                <div class="wizard-form">
                    <div class="row">
                        <div class="col-md-6">
                            <div class="form-title mb-5">
                                Schedule Wizard
                            </div>
                            <div class="row">
                                <div class="col-md-12">
                                    <div class="row">
                                        <div class="col-md-6">
                                        <label for="courseCount">Number of courses</label>
                                    </div>
                                    <div class="col-md-6">
                                        <select class="wizard-input selector" name="courseCount" id="wizard_courseCount" @change="updateCourseInputs" v-model="courseCount">
                                            <option v-for="num in [1,2,3,4,5,6,7,8]" :key="num" :value="num">{{num}}</option>
                                        </select>
                                    </div>
                                    </div>
                                    
                                </div>
                                <div class="col-md-12">
                                    <hr>
                                </div>
                                <div class="col-md-12">
                                    <small>Course names need to be entered in the following format: <em>CS 201</em></small>
                                </div>
                            </div>
                            <div class="row mt-3" id="courseInputs">

                                <div v-for="index in countArray" :key="index" class="col-md-12 mt-3">
                                    <div class="row">
                                        <div class="col-md-6">
                                            <label :for="'courseInput_'+index">Course #{{index}}</label>
                                        </div>
                                        <div class="col-md-6">
                                            <input type="text" class="wizard-input" :name="'courseInput_'+index" :v-model="'courseInput_'+index" @change="validateCourseCode" :id="'courseInput_'+index">
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                        <div class="col-md-6">
                            <h4 class="mt-3">Options</h4>
                            <hr>
                            <div class="row mb-4 mt-4">
                                <div class="col-md-6">
                                    Free one of my days:
                                </div>
                                <div class="col-md-6">
                                    <select class="wizard-input selector" name="freeDay" id="option_freeday">
                                        <option  v-for="i in [-1, 0, 1, 2, 3, 4]" :key="i" :value="i">
                                            <span v-if="i == -1">None</span>
                                            <span v-if="i == 0">Monday</span>
                                            <span v-if="i == 1">Tuesday</span>
                                            <span v-if="i == 2">Wednesday</span>
                                            <span v-if="i == 3">Thursday</span>
                                            <span v-if="i == 4">Friday</span>
                                        </option>
                                    </select>
                                </div>
                            </div>
                            <hr>
                            <div class="row">
                                <div class="col-md-6 offset-md-6">
                                    <button @click="runWizard" id="run_wizard_button" class="start-wizard btn-block"><span> <i class="fas fa-hat-wizard"></i></span></button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                
            </div>
        </div>
        <transition enter-active-class="animate__animated animate__fadeInDown animate__faster">
            <div class="row mt-5">
                <div class="col-md-12 text-center">
                    <div class="mini-schedule" v-if="courses.length > 0">
                        <div class="row">
                            <div class="col-md-1"></div>

                            <div  v-for="d in [0,1,2,3,4]" :key="d" class="col-md-2">
                                <div class="day">
                                    <h5>
                                        <span v-if="d==0">MONDAY</span>
                                        <span v-else-if="d==1">TUESDAY</span>
                                        <span v-else-if="d==2">WEDNESDAY</span>
                                        <span v-else-if="d==3">THURSDAY</span>
                                        <span v-else-if="d==4">FRIDAY</span>
                                    </h5>
                                    <hr>
                                    <div v-for="course in courses[d]" :key="course.code+'_day_'+d" class="course text-center">
                                        <strong>{{course.code}}</strong>
                                        <div v-for="section in course.sections" :key="section.crn" class="sections">
                                            <p v-for="schedule in section.schedule" :key="course.code+'_day_'+d+'_'+section.crn+'_'+schedule.start">
                                                <span v-if="schedule.day == d">{{ schedule.start+8 }}:40 - {{ schedule.start+schedule.duration+8 }}:40</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            
                        </div>
                        
                        <!-- 
                            <div class="col-md-2">
                                <div class="day">
                                    <h5>MONDAY</h5>
                                    <hr>
                                    <div v-for="course in this.$store.getters.getWSchedule[0]" :key="course.code+'_day_0'" class="course text-center">
                                        <strong>{{course.code}}</strong>
                                        <div v-for="section in course.sections" :key="section.crn" class="sections">
                                            <p v-for="schedule in section.schedule" :key="course.code+'_day_0_'+section.crn+'_'+schedule.start">
                                                <span v-if="schedule.day == 0">{{ schedule.start+8 }}:40 - {{ schedule.start+schedule.duration+8 }}:40</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="col-md-2">
                            <div class="day">
                                <h5>TUESDAY</h5>
                                <hr>
                                <div v-for="course in this.$store.getters.getWSchedule[1]" :key="course.code+'_day_1'" class="course text-center">
                                    <strong>{{course.code}}</strong>
                                    <div v-for="section in course.sections" :key="section.crn" class="sections">
                                        <p v-for="schedule in section.schedule" :key="course.code+'_day_1_'+section.crn+'_'+schedule.start">
                                            <span v-if="schedule.day == 1">{{ schedule.start+8 }}:40 - {{ schedule.start+schedule.duration+8 }}:40</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="col-md-2">
                            <div class="day">
                                <h5>WEDNESDAY</h5>
                                <hr>
                                <div v-for="course in this.$store.getters.getWSchedule[2]" :key="course.code+'_day_2'" class="course text-center">
                                    <strong>{{course.code}}</strong>
                                    <div v-for="section in course.sections" :key="section.crn" class="sections">
                                        <p v-for="schedule in section.schedule" :key="course.code+'_day_2_'+section.crn+'_'+schedule.start">
                                            <span v-if="schedule.day == 2">{{ schedule.start+8 }}:40 - {{ schedule.start+schedule.duration+8 }}:40</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="col-md-2">
                            <div class="day">
                                <h5>THURSDAY</h5>
                                <hr>
                                <div v-for="course in this.$store.getters.getWSchedule[3]" :key="course.code+'_day_3'" class="course text-center">
                                    <strong>{{course.code}}</strong>
                                    <div v-for="section in course.sections" :key="section.crn" class="sections">
                                        <p v-for="schedule in section.schedule" :key="course.code+'_day_3_'+section.crn+'_'+schedule.start">
                                            <span v-if="schedule.day == 3">{{ schedule.start+8 }}:40 - {{ schedule.start+schedule.duration+8 }}:40</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="col-md-2">
                            <div class="day">
                                <h5>FRIDAY</h5>
                                <hr>
                                <div v-for="course in this.$store.getters.getWSchedule[4]" :key="course.code+'_day_4'" class="course text-center">
                                    <strong>{{course.code}}</strong>
                                    <div v-for="section in course.sections" :key="section.crn" class="sections">
                                        <p v-for="schedule in section.schedule" :key="course.code+'_day_4_'+section.crn+'_'+schedule.start">
                                            <span v-if="schedule.day == 4">{{ schedule.start+8 }}:40 - {{ schedule.start+schedule.duration+8 }}:40</span>
                                        </p>
                                    </div>
                                </div>

                            </div>
                        </div>
                        -->
                        

                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>
<script>
import store from '../_store/store';
import $ from 'jquery';
import Sura from 'su-sura';
export default {
    name: 'Wizard',
    data(){
        return {
            courseCount: 0,
            countArray: [],
            courses: store.getters.getWSchedule
        }
    },
    methods: {
        updateCourseInputs(event){
           var times = $(event.target).val()
           this.courseCount = parseInt(times);
           this.countArray = []
           for(let i = 1; i <= times; i++){
               this.countArray.push(i); 
           }
        },
        validateCourseCode(event){
            var code = $(event.target).val();
            var check = false;
            for(let i = 0; i < this.$store.getters.getAllCourses.length; i++){
                if(store.getters.getAllCourses[i].code == code){
                    check = true;
                    break;
                }
            }
            if(check){
                $(event.target).addClass("success-input").removeClass("danger-input");
            }
            else{
                $(event.target).removeClass("success-input").addClass("danger-input");
            }
        },
        newNotification(payload){
            this.$store.commit('insertNotification', payload);
            setTimeout(() => {
                this.$store.commit('removeNotification', payload.id);
            }, 4000);
        },
        ifAllCoursesValid(){
            var check = true;
            for(let i = 1; i < this.courseCount; i++){
                if(!$(`#courseInput_${i}`).hasClass('success-input')){
                    check = false;
                    break;
                }
            }
            if(this.courseCount == 0) check = false;
            return check;
        },
        getRandomNotificationId(){
            return Math.floor(Math.random() * 20) + 1;
        },
        getCourses(){
            var courses = [];
            for(let i = 1; i <= this.courseCount; i++){
                courses.push($(`#courseInput_${i}`).val())
            }
            return courses;
        },
        getOptions(){
            var options = {
                freeDay: $("#option_freeDay").val(),
            }
            return options;
        },
        runWizard(){
            this.$store.commit('flushWizardSchedule');
            
            if(this.ifAllCoursesValid()){
                $("#run_wizard_button").addClass("active").attr("disabled", true);
                $("#run_wizard_button i").addClass("fa-spin");
                var courses = this.getCourses();
                var options = this.getOptions();
                var Wizard = new Sura.Wizard(this.$store.state.baseCourses, courses, options);
                if(Wizard.state == "SUCCESS"){
                    let notify = {
                        id: this.getRandomNotificationId(),
                        type: 'success',
                        message: 'Wizard of Oz found one for you!'
                    }
                    this.newNotification(notify);
                    store.commit('insertWizardSchedule', Wizard.schedule);
                    console.log(this.$store.state.schedule.wizardSchedule.schedule);
                }
                else if(Wizard.state == 'FAILED'){
                    let notify = {
                        id: this.getRandomNotificationId(),
                        type: 'danger',
                        message: 'Oops, it\'s impossible to generate such a schedule :('
                    }
                    this.newNotification(notify);
                }
                else{
                    let notify = {
                        id: this.getRandomNotificationId(),
                        type: 'danger',
                        message: 'Something went wrong?'
                    }
                    this.newNotification(notify);
                }
            }
            else{
                let notify = {
                    id: this.getRandomNotificationId(),
                    type: 'danger',
                    message: 'There\'s something wrong with your inputs'
                }
                this.newNotification(notify);
            }
            $("#run_wizard_button").removeClass("active").attr("disabled", false);
            $("#run_wizard_button i").removeClass("fa-spin");

        }
    }
}
</script>
<style scoped src="@/assets/css/wizard.css">
</style>