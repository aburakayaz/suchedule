<template>
    <div id="navbar">
        <div class="row">
            <div class="col-md-3 logo">
                <span @click="pushHome">SUchedule</span>
            </div>
            <div class="col-md-9 text-right nav-links">
                <router-link to="/about"><i class="fas fa-question"></i> About</router-link>
                <router-link to="/wizard"><i class="fas fa-hat-wizard"></i> Wizard</router-link>
                
                <router-link to="#"><i class="fas fa-trash"></i> Clear</router-link> 
                <router-link to="#"><i class="fas fa-clipboard"></i> Copy CRN</router-link> 
                <router-link to="#"><i class="fas fa-calendar-star"></i> Add to Calendar</router-link>
            </div>
        </div>
    </div>
</template>
<script>
export default {
    name: 'Navbar',
    methods: {
        pushHome(){
            this.$router.push("/");
        }
    }
}
</script>
<style scoped src="@/assets/css/main.css">
    
</style>