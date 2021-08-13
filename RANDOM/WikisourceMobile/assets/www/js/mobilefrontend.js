mw.mobileFrontend = (function() {
	return {
		init: function() {
		},
		registerModule: function() {
		},
		message: function(name) {
			return mw.message(name).plain();
		},
		history: {
			replaceHash: function( hash ) {
				// noop; Function used in toggle.js
			}
		},
		utils: jQuery
	}
})();
