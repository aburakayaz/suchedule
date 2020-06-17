<template>
  <div id="main" style="height: 100%;">
   <div class="row" style="height: 100%">
     <div class="col-md-3" :style="this.sidebarState ? 'position:relative' : 'position: absolute;'">
       <Sidebar />
     </div>
     <div :class="'main-container col-md-'+(this.sidebarState ? '9' : '12')">
         <div class="main-container">
             <Timetable />
         </div>
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
.main-container{
    height: 100%;
    overflow: auto;
    box-sizing: border-box;
}
</style>
