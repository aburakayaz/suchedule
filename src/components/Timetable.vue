<template>
    <div id="timetable" style="height: 95%">

        <table class="timetable">
            <thead>
            <tr>
                <th class="hour-cell"></th>
                <th>Monday</th>
                <th>Tuesday</th>
                <th>Wednesday</th>
                <th>Thursday</th>
                <th>Friday</th>
            </tr>
            </thead>
            <tbody id="rows">
            <tr v-for="row in [0,1,2,3,4,5,6,7,8,9,10]" :key="row">
                <td class="hour-cell">{{ row+8 }}.40</td>
                <td v-for="td in [1,2,3,4,5]" :key="td">
                    <template v-if="courses.length > 0">
                            <span v-for="course in courses" :key="course.code+course.group">
                                <div v-for="section in course.sections" :key="section.crn" class="section-wrapper ">
                                    <div v-if="row >= section.start && row < section.start + section.duration && td-1 == section.day"
                                         :class="'course-button color-'+ course.color +' text-center'">
                                        <div class="row">
                                            <div class="col-md-12">
                                                {{ course.code }} - {{course.group}}
                                                <i @click="removeCourse(course.crn)" style="font-size: .8em;"
                                                   class="fal fa-times"></i>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </span>
                    </template>
                </td>
            </tr>
            </tbody>
        </table>

    </div>
</template>
<script>
    export default {
        name: 'Timetable',
        data() {
            return {}
        },
        computed: {
            courses() {
                return this.$store.state.schedule.activeSchedule;
            }
        },
        methods: {
            removeCourse(crn) {
                this.$store.commit('removeFromActiveSchedule', crn)
            }
        }
    }
</script>
<style scoped src="@/assets/css/timetable.css">
</style>
