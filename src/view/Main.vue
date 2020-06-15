<template>
  <div id="main">
   <div class="row">
     <div class="col-md-3" :style="this.sidebarState ? '' : 'position: absolute;'">
       <Sidebar />
     </div>
     <div :class="'col-md-'+(this.sidebarState ? '9' : '12')">
         <Timetable />
     </div>
   </div>
    
  </div>
</template>

<script>
import Sidebar from '../components/Sidebar'
import Timetable from '../components/Timetable'
export default {
  name: 'App',
  components: {
    Sidebar,
    Timetable
  },
  computed: {
    sidebarState(){
      return this.$store.getters.sidebarState;
    }
  }
}
</script>

<style>
#app{
  overflow: hidden;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
</style>
