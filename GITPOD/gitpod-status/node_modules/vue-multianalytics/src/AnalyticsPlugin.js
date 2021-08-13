import 'regenerator-runtime/runtime';

/**
 * Plugin main class
 */
export default class AnalyticsPlugin {
                 constructor(modulesEnabled) {
                   this.modulesEnabled = modulesEnabled;
                 }

                 /**
                  * Dispatch a view analytics event
                  *
                  * params object should contain
                  * @param viewName
                  */
                 trackView(params = {}, excludedModules = []) {
                   if (!params.viewName) {
                     return;
                   }

                   this.modulesEnabled.forEach(module => {
                     if (excludedModules.indexOf(module.name) === -1) {
                       module.trackView(params);
                     }
                   });
                 }

                 /**
                  * Dispatch a tracking analytics event
                  *
                  * params object should contain
                  * @param category
                  * @param action
                  * @param label
                  * @param value
                  */
                 trackEvent(params = {}, excludedModules = []) {
                   this.modulesEnabled.forEach(module => {
                     if (excludedModules.indexOf(module.name) === -1) {
                       module.trackEvent(params);
                     }
                   });
                 }

                 /**
                  * Dispatch a tracking analytics event
                  *
                  * params object should contain
                  * @param product
                  * @param productActionType
                  * @param attributes
                  */
                 ecommerceTrackEvent(params = {}, excludedModules = []) {
                   this.modulesEnabled.forEach(module => {
                     if (excludedModules.indexOf(module.name) === -1) {
                       module.ecommerceTrackEvent(params);
                     }
                   });
                 }

                 /**
                  * Track an exception that occurred in the application.
                  *
                  * The params object should contain
                  * @param {string} description - Something describing the error (max. 150 Bytes)
                  * @param {boolean} isFatal - Specifies whether the exception was fatal
                  */
                 trackException(params = {}, excludedModules = []) {
                   this.modulesEnabled.forEach(module => {
                     if (excludedModules.indexOf(module.name) === -1) {
                       module.trackException(params);
                     }
                   });
                 }

                 /**
                  * Track an user timing to measure periods of time.
                  *
                  *  The params object should contain
                  * @param {string} timingCategory - A string for categorizing all user timing variables into logical groups (e.g. 'JS Dependencies').
                  * @param {string} timingVar -  A string to identify the variable being recorded (e.g. 'load').
                  * @param {number} timingValue - The number of milliseconds in elapsed time to report to Google Analytics (e.g. 20).
                  * @param {string|null} timingLabel -  A string that can be used to add flexibility in visualizing user timings in the reports (e.g. 'Google CDN').
                  */
                 trackTiming(params = {}, excludedModules = []) {
                   this.modulesEnabled.forEach(module => {
                     if (excludedModules.indexOf(module.name) === -1) {
                       module.trackTiming(params);
                     }
                   });
                 }

                 /**
                  * Ecommerce transactions.
                  * @param {long} id - Transaction ID. Required
                  * @param {string} affiliation -  Affiliation or store name
                  * @param {float} revenue - Grand Total
                  * @param {flat} shipping -  Shipping
                  * @param {float} tax - Tax
                  * @param {string} currency - Currency - https://developers.google.com/analytics/devguides/platform/features/currencies
                  */
                 addTransaction(params = {}, excludedModules = []) {
                   this.modulesEnabled.forEach(module => {
                     if (excludedModules.indexOf(module.name) === -1) {
                       module.addTransaction(params);
                     }
                   });
                 }

                 /**
                  * Ecommerce transactions.
                  * @param {long} id - Transaction ID. Required
                  * @param {string} name -  Product name. Required.
                  * @param {string} sku - SKU/code.
                  * @param {string} category -  Category or variation.
                  * @param {float} price - Unit price.
                  * @param {int} quantity - Quantity
                  */
                 addItem(params = {}, excludedModules = []) {
                   this.modulesEnabled.forEach(module => {
                     if (excludedModules.indexOf(module.name) === -1) {
                       module.addItem(params);
                     }
                   });
                 }

                 /**
                  * Ecommerce track a transaction.
                  */
                 trackTransaction(excludedModules = []) {
                   this.modulesEnabled.forEach(module => {
                     if (excludedModules.indexOf(module.name) === -1) {
                       module.trackTransaction();
                     }
                   });
                 }

                 /**
                  * Ecommerce clear a transaction.
                  */
                 clearTransactions(excludedModules = []) {
                   this.modulesEnabled.forEach(module => {
                     if (excludedModules.indexOf(module.name) === -1) {
                       module.clearTransactions();
                     }
                   });
                 }

                 /**
                  * Set the username.
                  *
                  * @param {string} name - The username
                  */
                 setUsername(name, excludedModules = []) {
                   this.modulesEnabled.forEach(module => {
                     if (excludedModules.indexOf(module.name) === -1) {
                       module.setUsername(name);
                     }
                   });
                 }

                 /**
                  * Set some user properties.
                  *
                  * @param {any} properties - The user properties
                  */
                 setUserProperties (properties = {}, excludedModules = []) {
                   const modulesToExecute = this.modulesEnabled.filter(moduleToCheck => excludedModules.indexOf(moduleToCheck.name) === -1);
                   return Promise.all(modulesToExecute.map(
                     module => {
                       return module.setUserProperties(properties)
                     }
                   ));
                 }

                 /**
                  * Set some user properties once.
                  *
                  * @param {any} properties - The user properties once
                  */
                 setUserPropertiesOnce(properties = {}, excludedModules = []) {
                   const modulesToExecute = this.modulesEnabled.filter(moduleToCheck => excludedModules.indexOf(moduleToCheck.name) === -1);
                   return Promise.all(modulesToExecute.map(
                     module => {
                       return module.setUserPropertiesOnce(
                         properties
                       );
                     }
                   ));
                 }

                 /**
                  * Set some user properties once.
                  *
                  * @param {any} properties - The some properties that will be sent in all the events if supported
                  */
                 setSuperProperties(properties = {}, excludedModules = []) {
                   this.modulesEnabled.forEach(module => {
                     if (excludedModules.indexOf(module.name) === -1) {
                       module.setSuperProperties(properties);
                     }
                   });
                 }

                 /**
                  * Set some user properties.
                  *
                  * @param {any} properties - The some properties that will be sent in the next event
                  */
                 setSuperPropertiesOnce(properties = {}, excludedModules = []) {
                   this.modulesEnabled.forEach(module => {
                     if (excludedModules.indexOf(module.name) === -1) {
                       module.setSuperPropertiesOnce(properties);
                     }
                   });
                 }

                 /**
                  * Identify the user
                  *
                  * @param {string} userId - The unique ID of the user
                  * @param {object} options - Options to add
                  */
                 identify(params = {}, excludedModules = []) {
                   const modulesToExecute = this.modulesEnabled.filter(moduleToCheck => excludedModules.indexOf(moduleToCheck.name) === -1);
                   return Promise.all(modulesToExecute.map(
                     module => {
                       return module.identify(params);
                     }
                   ));
                 }

                 /**
                  * Set an alias for the current instance
                  *
                  * @param {string} alias - The alias to be set
                  */
                 setAlias(alias, excludedModules = []) {
                   this.modulesEnabled.forEach(module => {
                     if (excludedModules.indexOf(module.name) === -1) {
                       module.setAlias(alias);
                     }
                   });
                 }

                 /**
                  * Resets the id & clears cache
                  *
                  */
                 reset(excludedModules = []) {
                   const modulesToExecute = this.modulesEnabled.filter(moduleToCheck => excludedModules.indexOf(moduleToCheck.name) === -1);
                   return Promise.all(modulesToExecute.map(
                     module => {
                       return module.reset();
                     }
                   ));
                 }
               }
