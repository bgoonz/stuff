import AnalyticsPlugin from './AnalyticsPlugin'
import GAModule from './modules/GAModule'
import MixpanelModule from './modules/MixpanelModule'
import SegmentModule from './modules/SegmentModule'
import FacebookModule from './modules/FacebookModule'
import MparticleModule from './modules/MparticleModule'
import * as Utils from './utils'
import * as types from './analyticsTypes'

const customModules = {}

/**
 * Installation procedure
 *
 * @param Vue
 * @param initConf
 */


const install = function (Vue, initConf = {}, mixin) {
  // init Google Analytics
  // We create all the modules that app will use
  Vue.modulesEnabled = []
  for (let key in initConf.modules) {
    let module
    switch (key) {
      case types.MODULE_GA:
        module = new GAModule()
        module.init(initConf.modules[key])
        break;
      case types.MODULE_MIXPANEL:
        module = new MixpanelModule()
        module.init(initConf.modules[key])
        break;
      case types.MODULE_SEGMENT:
        module = new SegmentModule()
        module.init(initConf.modules[key])
        break;
      case types.MODULE_FACEBOOK:
        module = new FacebookModule()
        module.init(initConf.modules[key])
        break;
      case types.MODULE_MPARTICLE:
        module = new MparticleModule()
        module.init(initConf.modules[key])
      default:
        break;
    }
    if (module) {
      Vue.modulesEnabled.push(module)
    }
  }

  if (Object.keys(customModules).length > 0) {
    Object.values(customModules).forEach((module, index) => {
      let moduleInstance = new module()
      moduleInstance.init(initConf.modules[Object.keys(customModules)[index]])
      Vue.modulesEnabled.push(moduleInstance)
    })
  }
  // Handle vue-router if defined
  if (initConf.routing && initConf.routing.vueRouter) {
    initVueRouterGuard(Vue, initConf.routing)
  }

  // Add to vue prototype and also from globals
  const analyticsPlugin = new AnalyticsPlugin(Vue.modulesEnabled)

  if (!initConf.returnModule) {
      Vue.prototype.$multianalytics = Vue.prototype.$ma = Vue.ma = analyticsPlugin
    
    
      // User can add its own implementation of an interface
      if (mixin) {
        Vue.prototype.$multianalyticsm =  Vue.prototype.$mam = Vue.mam =  mixin(analyticsPlugin)
      }
  } else {
    return mixin ? mixin(analyticsPlugin) : analyticsPlugin
  }

}

const addCustomModule = function (name, module) {
  customModules[name] = module
}

/**
 * Init the router guard.
 *
 * @param {any} Vue - The Vue instance
 * @param {any} routing - an object with some properties to be used by the vueRouterGuard. Possible params are 'vueRouter', 'ignoredView', 'preferredProperty', 'ignoredModules'
 * @returns {string[]} The ignored routes names formalized.
 */
const initVueRouterGuard = function (Vue, routing) {
  // Flatten routes name
  if (routing.ignoredViews) {
    routing.ignoredViews = routing.ignoredViews.map(view => view.toLowerCase())
  }

  if (!routing.preferredProperty) {
    routing.preferredProperty = 'path'
  }


  routing.vueRouter.afterEach(to => {
    // Ignore some routes
    if (routing.ignoredViews && routing.ignoredViews.indexOf(to[routing.preferredProperty].toLowerCase()) !== -1) {
      return
    }
    // Dispatch vue event using meta analytics value if defined otherwise fallback to route name
    Vue.ma.trackView({viewName: to.meta.analytics || to[routing.preferredProperty]}, routing.ignoredModules)
  })

  return routing.ignoredViews;
}

// Export module
export default { install, addCustomModule }
