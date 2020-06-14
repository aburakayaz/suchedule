<template>
  <div id="app">
   <Navbar />
   <transition name="router-animation" enter-active-class="animate__animated animate__fadeIn animate__faster animate__delay-1s" leave-active-class="animate__animated animate__fadeOut animate__faster">
       <router-view></router-view>
   </transition>
    
  </div>
</template>

<script>
import Navbar from './components/Navbar'
import store, {actions} from './_store/store';
export default {
  name: 'App',
  components: {
    Navbar
  },
  store,
  methods: {
    addCourse(course){
      store.commit(actions.updateSchedule, course);
    }
  }
}
</script>

<style>
@import "https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.0.0/animate.min.css";
#app{
  overflow: hidden;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
</style>
