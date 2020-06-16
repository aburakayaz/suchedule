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
                                            <option v-for="num in [1,2,3,4,5,6,7,8,9,10]" :key="num" :value="num">{{num}}</option>
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
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import $ from 'jquery';
//import Sura from 'su-sura';
export default {
    name: 'Wizard',
    data(){
        return {
            courseCount: 0,
            countArray: []
        }
    },
    methods: {
        updateCourseInputs(event){
           var times = $(event.target).val()
           this.courseCount = times;
           this.countArray = []
           for(let i = 1; i <= times; i++){
               this.countArray.push(i); 
           }
        },
        validateCourseCode(event){
            var code = $(event.target).val();
            var check = false;
            console.log(code);
            for(let i = 0; i < this.$store.getters.getAllCourses.length; i++){
                if(this.$store.getters.getAllCourses[i].code == code){
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
        }
    }
}
</script>
<style scoped src="@/assets/css/wizard.css">
</style>