import { MODULE_SEGMENT } from '../analyticsTypes'
import BasicModule from './BasicModule'
import { logDebug } from '../utils'

export default class SegmentModule extends BasicModule {

  constructor () {
    super(MODULE_SEGMENT)
    this.superProperties = {}
  }

  init (initConf = {}) {
    // name of gloval variable changed from analytics to segment
    (function(){var analytics=window.analytics=window.analytics||[];if(!analytics.initialize)if(analytics.invoked)window.console&&console.error&&console.error("Segment snippet included twice.");else{analytics.invoked=!0;analytics.methods=["trackSubmit","trackClick","trackLink","trackForm","pageview","identify","reset","group","track","ready","alias","debug","page","once","off","on"];analytics.factory=function(t){return function(){var e=Array.prototype.slice.call(arguments);e.unshift(t);analytics.push(e);return analytics}};for(var t=0;t<analytics.methods.length;t++){var e=analytics.methods[t];analytics[e]=analytics.factory(e)}analytics.load=function(t){var e=document.createElement("script");e.type="text/javascript";e.setAttribute('defer','');e.src=("https:"===document.location.protocol?"https://":"http://")+"cdn.segment.com/analytics.js/v1/"+t+"/analytics.min.js";var n=document.getElementsByTagName("script")[0];n.parentNode.insertBefore(e,n)};analytics.SNIPPET_VERSION="4.0.0";
    }})();

    // Apply default configuration
    // initConf = { ...pluginConfig, ...initConf }
    const mandatoryParams = [ 'token'];
    mandatoryParams.forEach(el => {
      if (!initConf[ el ]) throw new Error(`VueMultianalytics : Please provide a "${el}" from the config.`)
    })

    this.config.debug = initConf.debug

    // init
    analytics.load(initConf.token)
    analytics.debug(Boolean(this.config.debug))
  }

  /**
   * https://segment.com/docs/sources/website/analytics.js/#page
   * Dispatch a page event
   *
   * params object should contain
   * @param {string} viewName
   */
  trackView({viewName, properties = {}}) {
    if (!analytics.page) return
    if (this.config.debug) {
      logDebug(...arguments)
    }
    try {
      let fullProperties = Object.assign(properties, this.superProperties)
      analytics.page(viewName, properties)
    } catch (e) {
      if (!(e instanceof ReferenceError)) {
        throw e;
      }
    }
  }
  /**
   * Dispatch a tracking analytics event
   * https://segment.com/docs/sources/website/analytics.js/#track
   *
   * params object should contain
   * @param {string} category - Typically the object that was interacted with (e.g. 'Video')
   * @param {string} action - The type of interaction (e.g. 'play')
   * @param {string} label - Useful for categorizing events (e.g. 'Fall Campaign')
   * @param {integer} value - A numeric value associated with the event (e.g. 42)
   */
  trackEvent ({category = "Event", action, label = null, value = null, properties = {}, callback = null }) {
    if (!analytics.track) return
    if (this.config.debug) {
      logDebug(...arguments)
    }
    try {
      let fullProperties = Object.assign(properties, this.superProperties)
      analytics.track(action, fullProperties);
    } catch (e) {
      if (!(e instanceof ReferenceError)) {
        throw e;
      }
    }
  }

  /**
   * Same as identify
   * associate your users and their actions to a recognizable userId
   * https://segment.com/docs/sources/website/analytics.js/#identify
   *
   * @param {any} properties - traits of your user. If you specify a properties.userId, then a userId will be set
   */
  setUserProperties(properties = {}) {
    if (this.config.debug) {
      logDebug(properties)
    }
    let params = {}

    if (properties.hasOwnProperty('userId')) {
      let id = properties.userId
      delete properties.userId
      params.userId = id
    }

    params.options = properties
    this.identify(params)
  }

  /**
   * Define a property that will be sent across all the events
   *
   * @param {any} properties
   */
  setSuperProperties (properties) {
    if (this.config.debug) {
      logDebug(properties)
    }
    this.superProperties = properties
  }


  /**
   * associate your users and their actions to a recognizable userId
   * https://segment.com/docs/sources/website/analytics.js/#identify
   *
   * @param {any} params - traits of your user. If you specify a params.userId, then a userId will be set
   */
  identify (params = {}) {
    if (!analytics.identify) return
    if (this.config.debug) {
      logDebug(params)
    }
    try {
      if (params.userId) {
        analytics.identify(params.userId, params.options);
      } else {
        analytics.identify(params.options);
      }
    } catch (e) {
      if (!(e instanceof ReferenceError)) {
        throw e;
      }
    }
  }

  /**
   * Same as identify
   * associate your users and their actions to a recognizable userId
   * https://segment.com/docs/sources/website/analytics.js/#identify
   *
   * @param {any} name - userId
   */
  setUsername (userId) {
    if (this.config.debug) {
      logDebug(userId)
    }
    this.identify({userId})
  }

  /**
  *  Alias is necessary for properly implementing KISSmetrics and Mixpanel.
  *  https://segment.com/docs/sources/website/analytics.js/#alias
  *  Note: Aliasing is generally handled automatically when you identify a user
  *
  *  @param {string} alias
  */

  setAlias(alias) {
    if (!analytics.alias) return
    if (this.config.debug) {
      logDebug(alias)
    }
    try {
      analytics.alias(alias);
    } catch (e) {
      if (!(e instanceof ReferenceError)) {
        throw e;
      }
    }
  }

  reset () {
    if (!analytics.reset) return
    if (this.config.debug) {
      logDebug('reset')
    }
    try {
      analytics.reset();
    } catch (e) {
      if (!(e instanceof ReferenceError)) {
        throw e;
      }
    }
  }
}
