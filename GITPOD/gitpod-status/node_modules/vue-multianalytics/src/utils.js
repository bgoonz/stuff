
/**
 * Console log depending on config debug mode
 * @param {...*} message
 */
export const logDebug = function (params) {
  console.log('VueAnalytics :', ...arguments)
}

/**
 * Handle tools for cordova app workarounds
 */
export const cordovaApp = {
  bootstrapWindows () {
    // Disable activeX object to make Analytics.js use XHR, or something else
    window.ActiveXObject = undefined;
    ga('set', 'checkProtocolTask', null)
  },
}
