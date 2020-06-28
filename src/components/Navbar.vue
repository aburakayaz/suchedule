<template>
    <div id="navbar">
        <div class="row">
            <div class="col-md-3 logo">
                <span @click="pushHome">SUchedule</span>
            </div>
            <div class="col-md-9 text-right nav-links">
                <span @click="toggleAbout"><i class="fas fa-question"></i> About</span>
                <router-link to="/wizard"><i class="fas fa-hat-wizard"></i> Wizard</router-link>

                <span @click="flushTables"><i class="fas fa-trash"></i> Clear</span>
                <router-link to="#"><i class="fas fa-clipboard"></i> Copy CRN</router-link>
                <router-link to="#"><i class="fas fa-calendar-star"></i> Add to Calendar</router-link>
            </div>
        </div>

            <transition enter-active-class="animate__animated animate__fadeIn animate__faster">
                <div class="row" style="z-index: 10;" v-show="this.$store.state.about">
                    <div class="col-md-6">
                        <div class="about-box">
                            <h3><strong>SUchedule</strong></h3>
                            <p>
                                I am Burak, a CS student at Sabancı University. I've built this project with the hopes
                                of making the course registration period easier for SU students.
                            </p>
                            <p>
                                Feel free to contact me about your suggestions:
                            </p>
                            <p>
                                bayaz@sabanciuniv.edu
                            </p>
                            <p>Support me on Github:</p>
                            <iframe style="display:inline-block;" src="https://ghbtns.com/github-btn.html?user=aburakayaz&amp;type=follow&amp;count=true" frameborder="0" scrolling="0" width="170px" height="20px"></iframe>
                            <iframe src="https://ghbtns.com/github-btn.html?user=aburakayaz&amp;repo=suchedule&amp;type=star&amp;count=true" frameborder="0" scrolling="0" width="170px" height="20px"></iframe>
                        </div>
                    </div>
                </div>
            </transition>

        <div class="notification-center">
            <div  :id="'notification_'+not.id" v-for="not in this.$store.getters.getNotifications" :key="not.message"
                  :class="`notification ${not.type} animate__animated animate__fadeInDown`">
                <span v-html="not.message"></span>
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
        },
        toggleAbout(){
            this.$store.commit('toggleAbout');
        },
        flushTables(){
            this.$store.commit('flushActiveSchedule');
            this.$store.commit('flushWizardSchedule');
            const notification = {
                id: this.getRandomNotificationId(),
                type: 'success',
                message: 'Cleared all schedules!'
            };
            this.newNotification(notification);
        },
        newNotification(payload){
            this.$store.commit('insertNotification', payload);
            setTimeout(() => {
                this.$store.commit('removeNotification', payload.id);
            }, 4000);
        },
        getRandomNotificationId(){
            return Math.floor(Math.random() * 20) + 1;
        },
    }
}
</script>
<style scoped src="@/assets/css/main.css">
    @import "https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.0.0/animate.min.css";
</style>
