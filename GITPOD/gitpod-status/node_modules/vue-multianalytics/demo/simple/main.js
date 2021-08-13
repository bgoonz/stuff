import Vue from 'vue/dist/vue.js'
import VueMultianalytics from '../../dist/vue-multianalytics.min'
import analyticsMixin from './analytics-mixin'


let gaConfig = {
  appName: 'Test', // Mandatory
  appVersion: '0.1', // Mandatory
  trackingId: 'UA-96678006-1', // Mandatory
  globalDimensions: [],
  globalMetrics: [],
  debug: true,
  ecommerce: true
}

let mixpanelConfig = {
  token: '933572e86a323c77cf71d8c2d376fc5e',
  config: {},
  debug: true
}

VueMultianalytics.addCustomModule('myOwnModule', class Hello {
  constructor() {
    console.log('intantiated')
  }
  init () {console.log('hello')}
})

Vue.use(VueMultianalytics, {
  modules: {
    ga: gaConfig,
    mixpanel: mixpanelConfig
  }
}, analyticsMixin)
let template = `
  <div>
    <div>{{message}}</div>
    <button @click="trackView()">Track View</button>
    <button @click="trackEvent()">Track Event</button>
    <button @click="trackException()">Track Exception</button>
    <button @click="testMixin()">Test Mixin</button>
    <button @click="identify()">Identify</button>
    <button @click="setUserProperties()">User properties</button>
    <button @click="setSuperProperties()">Super properties</button>
    <button @click="testEcommerce()"> Test Ecommerce </button>
    <button @click="reset()"> Reset </button>
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
    identify () {
      this.$ma.identify({userId: 12345})
    },
    reset () {
      this.$ma.reset()
    },
    setUserProperties () {
      this.$ma.setUserProperties({userId: 'userTest', identityType: 3, platform: 'web'})
    },
    setSuperProperties () {
      this.$ma.setSuperProperties({platform: 'web'})
    },

    testEcommerce () {
      this.$ma.addTransaction({
        'id': '1234',                     // Transaction ID. Required.
        'affiliation': 'Acme Clothing',   // Affiliation or store name.
        'revenue': '11.99',               // Grand Total.
        'shipping': '5',                  // Shipping.
        'tax': '1.29'
      })
      this.$ma.addItem({
        'id': '1234',                     // Transaction ID. Required.
        'name': 'Fluffy Pink Bunnies',    // Product name. Required.
        'sku': 'DD23444',                 // SKU/code.
        'category': 'Party Toys',         // Category or variation.
        'price': '11.99',                 // Unit price.
        'quantity': '1'
      })
      this.$ma.trackTransaction()

      let product = {
        name: 'product name',
        description: 'Product description',
        price: 100.56,
        quantity: 5
      }
      this.$ma.ecommerceTrackEvent({product})
    }
  }
})
