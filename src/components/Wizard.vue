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
                    <div class="mini-schedule" v-show="courses.schedule.length > 0">
                        <div class="row">
                            <div class="col-1 offset-11">
                                <button @click="importSchedule" class="btn btn-primary btn-block"><i class="far fa-file-import"></i> Import</button>
                            </div>
                        </div>
                        <div class="row mt-5" style="overflow-y: scroll;max-height: 33vh;">

                            <div  v-for="d in [0,1,2,3,4]" :key="d" class="col-md" >
                                <div class="day">
                                    <h5>
                                        <span v-if="d===0">MONDAY</span>
                                        <span v-else-if="d===1">TUESDAY</span>
                                        <span v-else-if="d===2">WEDNESDAY</span>
                                        <span v-else-if="d===3">THURSDAY</span>
                                        <span v-else-if="d===4">FRIDAY</span>
                                    </h5>
                                    <hr>
                                    <div v-for="course in courses.schedule[d]" :key="course.code+'_day_'+d" class="course text-center">
                                        <strong>{{ course.code }}</strong>
                                        <div v-for="section in course.sections" :key="section.crn" class="sections">
                                            <span v-for="schedule in section.schedule" :key="course.code+'_day_'+d+'_'+section.crn+'_'+schedule.start">
                                                <span v-if="schedule.day === d">{{ schedule.start+8 }}:40 - {{ schedule.start+schedule.duration+8 }}:40</span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            
                        </div>
                        

                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>
<script>
    import $ from 'jquery';
    import Sura from 'su-sura';

    export default {
    name: 'Wizard',
    data(){
        return {
            courseCount: 0,
            countArray: [],
            courses: this.$store.state.schedule.wizardSchedule
        }
    },
    methods: {
        updateCourseInputs(event){
           let times = $(event.target).val()
           this.courseCount = parseInt(times);
           this.countArray = []
           for(let i = 1; i <= times; i++){
               this.countArray.push(i); 
           }
        },
        validateCourseCode(event){
            let code = $(event.target).val();
            let check = false;
            for(let i = 0; i < this.$store.getters.getAllCourses.length; i++){
                if(this.$store.getters.getAllCourses[i].code === code){
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
            let check = true;
            for(let i = 1; i < this.courseCount; i++){
                if(!$(`#courseInput_${i}`).hasClass('success-input')){
                    check = false;
                    break;
                }
            }
            if(this.courseCount === 0) check = false;
            return check;
        },
        getRandomNotificationId(){
            return Math.floor(Math.random() * 20) + 1;
        },
        getCourses(){
            let courses = [];
            for(let i = 1; i <= this.courseCount; i++){
                courses.push($(`#courseInput_${i}`).val())
            }
            return courses;
        },
        getOptions(){
            return {
                freeDay: $("#option_freeDay").val(),
            };
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
        runWizard(){
            this.$store.commit('flushWizardSchedule');
            
            if(this.ifAllCoursesValid()){
                $("#run_wizard_button").addClass("active").attr("disabled", true);
                $("#run_wizard_button i").addClass("fa-spin");
                let courses = this.getCourses();
                let options = this.getOptions();
                let Wizard = new Sura.Wizard(this.$store.state.baseCourses, courses, options);
                if(Wizard.state === "SUCCESS"){
                    let notify = {
                        id: this.getRandomNotificationId(),
                        type: 'success',
                        message: 'Wizard of Oz found one for you!'
                    }
                    this.newNotification(notify);
                    this.$store.commit('insertWizardSchedule', Wizard.schedule);
                }
                else if(Wizard.state === 'FAILED'){
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

        },
        importSchedule(){
            let crns = [];
            let w = this.$store.getters.getWSchedule;
            for(let day in w){
                for(let course in w[day]){
                    for(let section in w[day][course].sections){
                        crns.push(w[day][course].sections[section].crn);
                    }
                }
            }
            crns = [...new Set(crns)];
            let courses = [];
            let type;
            for(let CRN in crns){
                let activeCourse = this.$store.getters.getSectionByCRN(crns[CRN]);
                for(let i = 0; i < activeCourse.course.classes.length; i++){
                    for(let j = 0; j < activeCourse.course.classes[i].sections.length; j++){
                        if(activeCourse.course.classes[i].sections[j].group === activeCourse.group){
                            if(i === 0) type = "L";
                            else type = "R";
                        }
                    }
                }
                let course = {
                    code: activeCourse.course.code,
                    crn: activeCourse.section.crn,
                    group: activeCourse.group,
                    type: type,
                    color: this.getColorCode(),
                    sections: activeCourse.section.schedule
                }
                courses.push(course);
            }
            this.$store.commit('importWizardToActive', courses);
            let notification = {
                id: this.getRandomNotificationId(),
                type: "success",
                message: "Successfully imported schedule!"
            }
            this.newNotification(notification);
            setTimeout(() => {
                this.$router.push('/');
            }, 1000);
        }
    }
}
</script>
<style scoped src="@/assets/css/wizard.css">
</style>