<template>
    <div id="navbar">
        <div class="row">
            <div class="col-md-3 logo">
                <span @click="pushHome">SUchedule</span>
            </div>
            <div class="col-md-9 text-right nav-links">
                <span @click="toggleAbout"><i class="fas fa-question"></i> About</span>
                <router-link to="/wizard"><i class="fas fa-hat-wizard"></i> Wizard</router-link>
                
                <router-link to="#"><i class="fas fa-trash"></i> Clear</router-link> 
                <router-link to="#"><i class="fas fa-clipboard"></i> Copy CRN</router-link> 
                <router-link to="#"><i class="fas fa-calendar-star"></i> Add to Calendar</router-link>
            </div>
        </div>
        
            <transition enter-active-class="animate__animated animate__fadeIn animate__faster">
                <div class="row" style="z-index: 10;" v-show="this.$store.state.about">
                    <div class="col-md-6">
                        <div class="about-box">
                            <h3><strong>SUchedule</strong></h3>
                            <p>Selamın aleyküm</p>
                        </div>
                    </div>
                </div>
            </transition>
            
        
    </div>
</template>
<script>
import store from '../_store/store';
export default {
    name: 'Navbar',
    methods: {
        pushHome(){
            this.$router.push("/");
        },
        toggleAbout(){
            store.commit('toggleAbout');
        }
    }
}
</script>
<style scoped src="@/assets/css/main.css">
    @import "https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.0.0/animate.min.css";
</style>