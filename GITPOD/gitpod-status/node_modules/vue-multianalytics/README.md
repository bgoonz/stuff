
# Vue-multianalytics

A [VueJS](http://vuejs.org) multianalytics tool

- [About](#about)
- [Configuration](#configuration)
- [Tracking](#tracking)
  - [ExcludedModules](#excludedModules)
- [VueRouter integration](#vuerouter-integration)
- [Custom plugin](#custom-plugin)
  - [Mixin](#mixin)
  - [Binding](#binding)
  - [Usage](#usage)
- [API](#api)
- [Modules](#modules)
  - [Google Analytics](#google-analytics)
  - [Mixpanel](#mixpanel)
  - [Facebook Pixel](#facebook-pixel)
  - [Segment](#segment)
  - [MParticle](#mparticle)
- [Custom Modules](#custom-modules)  
- [Todo](#todo)  



## About

At [Glovo](https://glovoapp.com) we need to track a lot of events. And not in only one platform, but a few. That is why we needed **vue-multianalytics**, a simple plugin that allows you to track any event in multiple platforms at the same time.

This plugin has been inspired by the awesome library **[vue-ua](https://github.com/ScreamZ/vue-analytics)**, so a big thank you to it. If you want to just have Google Analytics, you should use _vue-ua_ instead of _vue-multianalytics_.

## Configuration

A typical `npm install vue-multianalytics -s` will be enough to download it.

To start using it, you need to add the plugin in your main .js entry

```javascript
import VueMultianalytics from 'vue-multianalytics'

let gaConfig = {
  appName: 'Test', // Mandatory
  appVersion: '0.1', // Mandatory
  trackingId: 'YOUR_UA', // Mandatory
  debug: true, // Whether or not display console logs debugs (optional)
}

let mixpanelConfig = {
  token: 'YOUR_TOKEN'
}


Vue.use(VueMultianalytics, {
  modules: {
    ga: gaConfig,
    mixpanel: mixpanelConfig
  }
})
```

Using nuxt, you can use the flag `returnModule` to get the module and be able to inject it directly in the app as a plugin

```javascript
import Vue from 'vue'
import VueMultianalytics from 'vue-multianalytics/dist/vue-multianalytics'

let gaConfig = {
  appName: 'Test', // Mandatory
  appVersion: '0.1', // Mandatory
  trackingId: 'YOUR_UA', // Mandatory
  debug: true, // Whether or not display console logs debugs (optional)
}

let mixpanelConfig = {
  token: 'YOUR_TOKEN'
}

export default function({ app, store }, inject) {
  inject(
    'ma',
    VueMultianalytics.install(
      Vue,
      {
        modules: {
          ga: gaConfig,
          mixpanel: mixpanelConfig
        },
        returnModule: true
      }
    )
  )
}
```

## Tracking

Once the configuration is completed, you can access the **vue-multianalytics** instance in your components like that :

`this.$ma.trackEvent(params, excludedModules)`

### ExcludedModules

You can easily exclude modules from being fired by an event adding them to the excludedModules array. This is per-event based, so feel free to use them as you want

```javascript
// this will exclude mixpanel from being fired
let excludedModules = ['mixpanel']
this.$ma.trackEvent(params, excludedModules)

// this will exclude both, mixpanel and ga from beign fired
this.$ma.trackEvent(params, ['mixpanel', 'ga'])

// this will exclude nothing from beign fired, all the modules will be triggered
this.$ma.trackEvent(params)
```

## VueRouter integration

**vue-multianalytics** can be integrated with [vue-router](https://github.com/vuejs/vue-router) to track each new screen view on router change.

To use this feature, you just need to pass your `vue-router` instance in the params property as vueRouter.

```javascript

import VueMultianalytics from 'vue-multianalytics'
import VueRouter from 'vue-router'
const router = new VueRouter(...)

let mixpanelConfig = {
  token: 'YOUR_TOKEN'
}

Vue.use(VueMultianalytics, {
  modules: {
    mixpanel: mixpanelConfig
  },
  routing: {
    vueRouter: router, //  Pass the router instance to automatically sync with router (optional)
    preferredProperty: 'name', // By default 'path' and related with vueRouter (optional)
    ignoredViews: ['homepage'], // Views that will not be tracked
    ignoredModules: ['ga'] // Modules that will not send route change events. The event sent will be this.$ma.trackView({viewName: 'homepage'}, ['ga'])
  }
})

```
This feature will generate the view name according to a priority rule:
- If you have defined a meta field in your route named `analytics`
```javascript
const homeRoute = {
  path: '/home',
  name: 'home',
  meta: {analytics: 'ThisWillBeTheName'}
}
```
- If you define a `preferredProperty` in your **vue-multianalytics** params, that params will be the used as screen name. Possible params are: `name`, `path`, `fullPath`.
- If nothing is provided `path` will be used.

If you want to ignore some routes, just specify then in the `ignoredViews` param.

## Custom Plugin

Usually you don't want to call directly the library, but call an interface first to manipulate the data before.

```javascript
// Not a very good practice

//component1
if (a === condition1) {
  this.$ma.trackEvent({action: 'User click'})
} else {
  this.$ma.trackError({description: 'Fatal error'})
}

//component2
if (b === condition1) {
  this.$ma.trackEvent({action: 'User click'})
}

// Much better using an interface and handle the logic there. No code repeated, better understanding of the flow

// component1
this.$mam.onUserClick(a)
// componen2
this.$mam.onUserClick(b)
```

To do it so, you just need to create a mixin to act as an interface with the **vue-multianalytics**.

### Mixin

Just create a module that exports a function accepting as a parameter the analytics library:

```javascript
export default function (multianalytics) {

  return {
    onUserClick (input) {
      if (input === true) {
        multianalytics.trackEvent({action: 'User click'})
      } else {
        multianalytics.trackError({description: 'Fatal error'})
      }
    }
  }
}
```
You can define inside all the methods that you want and call all the library api from the parameter received.

### Binding

You just need to pass the mixin as the third parameter when you initialize the plugin

```javascript
import VueMultianalytics from 'vue-multianalytics'
import analyticsMixin from './analyticsMixin.js'

Vue.use(VueMultianalytics, {
  modules: {
    ga: gaConfig
  }
}, analyticsMixin)
```

### Usage

Everything is already set, you can now call your mixin methods from anywhere in your vue application using `this.$mam` (instead of `this.$ma`).

```javascript
//Component1
export default {
  data () {

  },
  methods: {
    bannerClick (input) {
      this.$mam.onUserClick(input)
    }
  }
}
```

## API

### trackView({viewName})
```javascript
/**
  * Dispatch a view using the screen name
  * params should contain
  * @param viewName
  */

this.$ma.trackView({screenName: 'Homepage'})  
```

### trackEvent({category = 'Event', action, label = null, value = null})
```javascript
/**
  * Dispatch a view using the screen name
  * params object should contain
  *
  * @param category
  * @param action
  * @param label
  * @param value
  */

this.$ma.trackEvent({category: 'Click', action: 'Homepage Click', label: 'Great', value: ''})  
```

### addTransaction({id, affiliation = '', revenue = 0, shipping = 0, tax = 0, currency = 'USD'})
```javascript
/**
* Ecommerce transactions.
* ecommerce needs to be enabled in the module options (ecommerce = true)
* More info at https://developers.google.com/analytics/devguides/collection/analyticsjs/ecommerce
* @param {long} id - Transaction ID. Required
* @param {string} affiliation -  Affiliation or store name
* @param {float} revenue - Grand Total
* @param {flat} shipping -  Shipping
* @param {float} tax - Tax
* @param {string} currency - Currency - https://developers.google.com/analytics/devguides/platform/features/currencies
*/
this.$ma.addTransaction({
  id: 1234,                     // Transaction ID. Required.
  affiliation: 'Acme Clothing',   // Affiliation or store name.
  revenue: 11.99,               // Grand Total.
  shipping: 5,                  // Shipping.
  tax: 1.29                     // Tax.
})
```

### addItem({id, name, sku, category, price = 0, quantity = 1})
```javascript
/**
* Ecommerce transactions.
* ecommerce needs to be enabled in the module options (ecommerce = true)
* More info at https://developers.google.com/analytics/devguides/collection/analyticsjs/ecommerce
* @param {long} id - Transaction ID. Required
* @param {string} name -  Product name. Required.
* @param {string} sku - SKU/code.
* @param {string} category -  Category or variation.
* @param {float} price - Unit price.
*/
this.$ma.addItem({
  id: 123,
  name: 'Fluffy Pink Bunnies',    // Product name. Required.
  sku: 'DD23444',                 // SKU/code.
  category: 'Party Toys',         // Category or variation.
  price: '11.99',                 // Unit price.
  quantity: '1'  
})
```

### trackTransaction()
```javascript
/**
* Ecommerce transactions.
* ecommerce needs to be enabled in the module options (ecommerce = true)
* Sends the transaction
*/
this.$ma.trackTransaction()
```

### clearTransactions()
```javascript
/**
* Ecommerce transactions.
* ecommerce needs to be enabled in the module options (ecommerce = true)
* Clears the transaction
*/
this.$ma.clearTransactions()
```

### identify()
```javascript
/**
  * Identify
  *
  * @param userId - The userId to identify with
  * @param options -
  */

this.$ma.identify({userId: 12345, options: {newUser: true}})  
```

### reset()
```javascript
/**
  * Reset the user & clears storage
  *
  */

this.$ma.reset()  
```

### setAlias(alias)
```javascript
/**
  * Set an alias
  *
  * @param alias
  */

this.$ma.setAlias('user1234@test.com')  
```

### setUsername(name)
```javascript
/**
  * Set a username
  *
  * @param name
  */

this.$ma.setUsername('user1234@test.com')  
```
### setUserProperties(properties)
```javascript
/**
  * Set some user properties
  *
  * @param properties
  */

this.$ma.setUserProperties({userId: '12345', name: 'John'})  
```

### setUserPropertiesOnce(properties)
```javascript
/**
  * Set some user properties, but only once
  *
  * @param properties
  */

this.$ma.setUserPropertiesOnce({userId: '12345', name: 'John'})  
```

### incrementUserProperties(properties)
```javascript
/**
  * Increment some user properties
  *
  * @param properties
  */

this.$ma.incrementUserProperties({loginCount: 1, pagesPrinted: 5})
```

### setSuperProperties(properties)
```javascript
/**
  * Set some properties to be sent in every event
  *
  * @param properties
  */

this.$ma.setSuperProperties({platform: 'Mobile'})  
```

### setSuperPropertiesOnce(properties)
```javascript
/**
  * Set some properties to be sent in every event
  *
  * @param properties
  */

this.$ma.setSuperPropertiesOnce({platform: 'Mobile'})  
```

## Modules

Currently, supported modules are the following

### Google Analytics

Name: `ga`
Config:
```javascript
appName: 'Test', // Mandatory
appVersion: '0.1', // Mandatory
trackingId: 'YOUR_UA', // Mandatory
ecommerce: true, // Enables ecommerce support (optional)
debug: true // Whether or not display console logs debugs (optional)
```
Supported Events: `trackView`, `trackEvent`, `trackException`, `addTransaction`, `addItem`, `trackTransaction`, `clearTransactions`, `setUsername`, `trackTiming`

### Mixpanel

Name: `mixpanel`
Config:
```javascript
token: 'YOUR_TOKEN'
config: {} // Initial mixpanel config
debug: true // Whether or not display console logs debugs (optional)
```
Supported Events: `trackView`, `trackEvent`, `setAlias`, `setUsername`, `setUserProperties`, `setUserPropertiesOnce`, `incrementUserProperties`, `setSuperPropertiesOnce`, `setSuperProperties`, `setSuperPropertiesOnce`

### Facebook Pixel
Name: `facebook`
Config:
```javascript
token: 'YOUR_TOKEN'
debug: true // Whether or not display console logs debugs (optional)
```
Supported Events: `trackView`, `trackEvent`

### Segment
Name: `segment`
Config:
```javascript
token: 'YOUR_TOKEN'
debug: true // Whether or not display console logs debugs (optional)
```
Supported Events: `trackView`, `trackEvent`, `setAlias`, `setUserProperties`, `setSuperProperties`

### MParticle
Name: `mparticle`
Config:
```javascript
token: 'YOUR_TOKEN'
debug: true // Whether or not display console logs debugs (optional)
```
Supported Events: `trackView`, `trackEvent`, `setAlias`, `setUserProperties`, `setSuperProperties`


## Custom Modules

You can now add your own custom modules simply by calling
`VueMultianalytics.addCustomModule(name, Module)`

Example:
```javascript
// OwnModule.js
class OwnModule extends BasicModule {
  init() {
    // ...
  }

  trackView ({viewName}) {
    if (this.config.debug) {
      logDebug(viewName)
    }
    myowntrack("Page Viewed", { "page": viewName })
  }

  // ..  
}
```

```javascript
// main.js
import Vue from 'vue'
import VueMultianalytics from 'vue-multianalytics'
import OwnModule from 'OwnModule.js'

VueMultianalytics.addCustomModule('ownModule', OwnModule)
// or VueMultianalytics.use('owenit', OwenItModule)

Vue.use(VueMultianalytics, {
  modules: {
   ownModule: { /* module config */ }
  }
})
```
Thanks [@anteriovieira](https://github.com/anteriovieira)  for the suggestion

## Todo
- ~~Demo~~ 👍
- ~~Further integration with mixpanel~~ 👍
- ~~Ecommerce support~~ 👍
- ~~Own module~~ 👍
- New events: ~~registerSuperproperties~~, ~~alias~~, timedEvents
- New modules: ~~segment~~, ~~mparticle~~ appboy, kissmetrics?
- Tests

## License

[MIT](https://github.com/Glovo/vue-multianalytics/blob/master/LICENSE)
