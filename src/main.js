import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify';
import router from './router'
import store from './store/store.js';

Vue.config.productionTip = false
Vue.prototype.$windowObj = window;

new Vue({
  vuetify,
  router,
  store,
  render: h => h(App)
}).$mount('#app')
