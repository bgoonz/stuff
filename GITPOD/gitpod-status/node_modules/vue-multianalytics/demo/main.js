import Vue from 'vue/dist/vue.js'
import VueMultianalytics from '../dist/vue-multianalytics.min'
import analyticsMixin from './analytics-mixin'


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
    mixpanel: mixpanelConfig,
    mparticle: mParticleConfig
  }
}, analyticsMixin)
let template = `
  <div>
    <div>{{message}}</div>
    <button @click="trackView()">Track View</button>
    <button @click="trackEvent()">Track Event</button>
    <button @click="trackException()">Track Exception</button>
    <button @click="testMixin()">Test Mixin</button>
    <button @click="setUserProperties()">User properties</button>
    <button @click="setSuperProperties()">Super properties</button>
  </div>
`
const app = new Vue({
  el: '#app',
  template: template,
  data: {
    message: 'Hello MultiAnalytics'
  },
  mounted () {
    console.log(this.$ma)
  },
  methods: {
    trackEvent () {
      this.$ma.trackEvent({action: 'test category', category: 'clicks', properties: {interesting: true}, eventType: 2})
    },
    trackView () {
      this.$ma.trackView({viewName: 'test view'})
    },
    trackException () {
      this.$ma.trackException({description: 'test exception', isFatal: true})
    },
    testMixin () {
      this.$mam.test()
    },
    setUserProperties () {
      this.$ma.setUserProperties({userId: 'userTest', identityType: 3, platform: 'web'})
    },
    setSuperProperties () {
      this.$ma.setSuperProperties({platform: 'web'})
    },
    ecommerceTrackEvent () {
      let product = {
        name: 'product name',
        description: 'Product description',
        price: 100.56,
        quantity: 5
      }
      this.$ma.ecommerceTrackEvent({product, properties: {currency: 'USD'}})
    }
  }
})
