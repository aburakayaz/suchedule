import Vue from 'vue'
import App from './App.vue'
import VueRouter from 'vue-router'
import routes from '../src/router'
import Vuex from 'vuex'
import vuejquery from 'vue-jquery'

Vue.use(vuejquery);
Vue.use(VueRouter);
Vue.use(Vuex);

const router = new VueRouter({
  routes,
  mode: 'history'
})

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
