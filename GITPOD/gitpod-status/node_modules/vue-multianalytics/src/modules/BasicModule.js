export default class BasicModule {

  constructor(name, config = {}) {
    this.name = name
    this.config = config
  }

  trackView () { /* Overriden by modules */ }

  trackEvent () { /* Overriden by modules */ }

  trackException () { /* Overriden by modules */ }

  trackTiming () { /* Overriden by modules */ }

  setAlias () { /* Overriden by modules */ }

  identify () { /* Overriden by modules */ }

  setUsername () { /* Overriden by modules */ }

  setUserProperties () { /* Overriden by modules */ }

  setUserPropertiesOnce () { /* Overriden by modules */ }

  incrementUserProperties () { /* Overriden by modules */ }

  setSuperProperties () { /* Overriden by modules */ }

  setSuperPropertiesOnce () { /* Overriden by modules */ }

  ecommerceTrackEvent () { /* Overriden by modules */ }
  
  addTransaction () { /* Overriden by modules */}

  addItem () { /* Overriden by modules */}

  trackTransaction () { /* Overriden by modules */}

  clearTransactions () { /* Overriden by modules */}

  reset () { /* Overriden by modules */}

}
