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
                <tr v-for="(row) in [0,1,2,3,4,5,6,7,8,9,10]" :key="row">
                    <td class="hour-cell">{{ row+8 }}.40</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                </tr>
            </tbody>
        </table>

    </div>
</template>
<script>
export default {
    name: 'Timetable'
}
</script>
<style scoped src="@/assets/css/timetable.css">
</style>
