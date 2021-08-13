import Vue from 'vue/dist/vue.js'
import VueRouter from 'vue-router'
import VueMultianalytics from '../../dist/vue-multianalytics.min'
import analyticsMixin from './analytics-mixin'

import App from './App.vue'
import Component1 from './Component1.vue'
import Component2 from './Component2.vue'

// Router configurations
// -------
const router = new VueRouter({
  mode: 'history',
  routes: [
    {
      path: '/',
      component: Component1
    },
    {
      path: '/comp2',
      component: Component2
    }
  ]
})


let gaConfig = {
  appName: 'Test', // Mandatory
  appVersion: '0.1', // Mandatory
  trackingId: 'UA-96678006-1', // Mandatory
  globalDimensions: [],
  globalMetrics: [],
  debug: true
}

let mixpanelConfig = {
  token: '933572e86a323c77cf71d8c2d376fc5e',
  config: {},
  debug: true
}

Vue.use(VueMultianalytics, {
  modules: {
    ga: gaConfig,
    mixpanel: mixpanelConfig
  },
  routing: {
    vueRouter: router
  }
}, analyticsMixin)

const app = new Vue({
  router,
  el: '#app',
  template: '<App/>',
  components: { App }
}).$mount()
