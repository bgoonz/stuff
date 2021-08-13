(function() {
	window.Page = function( title, rawJSON, lang, isCompletePage ) {
		var lead = {};
		var sections = [];
		var lastCollapsibleSection = {subSections: []};

		if( typeof rawJSON.mobileview !== 'undefined' ) {
			if( typeof rawJSON.mobileview.redirected !== "undefined" ) {
				// If we're redirected, use the final page name
				title = rawJSON.mobileview.redirected;
			}

			if( typeof rawJSON.mobileview.error !== "undefined" ) {
				// Only two types of errors possible when the mobileview api returns
				// One is a 404 (missingtitle), other is an invalid title (usually empty title)
				// We're redirecting empty title to main page in app.navigateTo
				if( rawJSON.mobileview.error.code === "missingtitle" ) {
					return null;
				}
			}

			$.each( rawJSON.mobileview.sections, function( index, section ) {
				if( section.id === 0 ) {
					// Lead Section
					// We should also make sure that if there is a lead followed by
					// h3, h4, etc they all fold into the lead
					// Not sure why a page would do this though
					section.subSections = [];
					lead = section;
					lastCollapsibleSection = section;
					return;
				}
				if( typeof section.references !== "undefined" ) {
					section.references = true;
				}
				// Only consider leve 2 sections as 'sections'
				// Group *all* subsections under them, no matter which level they are at
				if( section.level == 2 ) {
					section.subSections = [];
					lastCollapsibleSection = section;
					sections.push( section );
				} else {
					lastCollapsibleSection.subSections.push( section );
				}
			});
		}

		this.title = title;
		this.lead = lead;
		this.sections = sections;
		this.lang = lang;
		this.isCompletePage = isCompletePage;
	};

	Page.deserializeFrom = function( data ) {
		var page = new Page( data.title, {}, data.lang, true);
		page.lead = data.lead;
		page.sections = data.sections;
		return page;
	}

	Page.requestFromTitle = function(title, lang, isCompletePage) {
		var sections;
		if( !isCompletePage ) {
			sections = "0|references";
		} else {
			sections = "all";
		}
		// Make sure changes to this are also propogated to getAPIUrl
		return app.makeAPIRequest({
			action: 'mobileview',
			page: title,
			redirects: 'yes',
			prop: 'sections|text',
			sections: sections,
			sectionprop: 'level|line',
			noheadings: 'yes'
		}, lang, {
			dataFilter: function(data) {
				return new Page( title, JSON.parse( data ), lang, isCompletePage );
			}
		});	
	};

	Page.prototype.requestCompletePage = function() {
		if( this.completePageReq ) {
			// Only one request should be sent
			return this.completePageReq;
		}

		var sectionsList = [];
		var that = this;

		$.each( this.sections, function( index, section ) {
			sectionsList.push( section.id );
			var subSectionIDs = section.subSections.map( function( subSection ) {
				return subSection.id;
			});
			sectionsList.push.apply( sectionsList, subSectionIDs );
		});

		this.completePageReq = app.makeAPIRequest({
			action: 'mobileview',
			page: this.title,
			redirects: 'yes',
			prop: 'sections|text',
			sections: sectionsList.join( '|' ),
			sectionprop: 'level|line',
			noheadings: 'yes'
		}, this.lang, {
			dataFilter: function(text) {
				var data = JSON.parse( text );
				var newPage = new Page( that.title, data, that.lang, true );
				$.each( newPage.sections, function( index, section ) {
					if( section.id !== 0 || typeof section.references !== 'undefined' ) {
						// FIXME: *Rare* race condition when a new section is added
						// bwetween the first request and second request. Will cause the new
						// section to not show up (if added at the bottom) or replace other 
						// sections' content (if in the middle). Not a big enough concern for
						// now, but needs a fix eventually.
						that.sections[ index ] = section;
					}
				});
				that.isCompletePage = true;
				return that;
			}
		}).always( function() {
			that.completePageReq = null;;
		});
		return this.completePageReq;
	}

	Page.prototype.requestLangLinks = function() {
		if(this.langLinks) {
			var d = $.Deferred();
			d.resolve(this.langLinks);
			return d;
		}
		var that = this;
		return app.makeAPIRequest({
			action: 'parse',
			page: this.title,
			prop: 'langlinks'
		}, this.lang, {
			dataFilter: function(text) {
				var data = JSON.parse(text);
				var langLinks = [];
				$.each(data.parse.langlinks, function(i, langLink) {
					langLinks.push({lang: langLink.lang, title: langLink['*']});
				});
				that.langLinks = langLinks;
				return langLinks;
			}
		});
	};


	Page.prototype.getSection = function( id ) {
		var foundSection = null;
		$.each( this.sections, function( i, section ) {
			if( section.id == id ) {
				foundSection = section;
				return;
			}
		});
		return foundSection;
	}

	Page.prototype.requestSectionHtml = function( id ) {
		var d = $.Deferred();
		var sectionTemplate = templates.getTemplate( 'section-template' );
		console.log( 'fullpage is ' + this.isCompletePage );
		if( this.isCompletePage ) {
			d.resolve( sectionTemplate.render( this.getSection( id ) ) );
		} else {
			this.requestCompletePage().done( function( page ) {
				d.resolve( sectionTemplate.render( page.getSection( id ) ) );
			});
		}
		return d;
	};

	Page.prototype.toHtml = function() {
		var contentTemplate = templates.getTemplate('content-template');
		return contentTemplate.render(this);
	};

	Page.prototype.serialize = function() {
		// Be more specific later on, but for now this does :)
		return JSON.stringify(this);
	};

	Page.prototype.getHistoryUrl = function() {
		return this.getCanonicalUrl() + "?action=history";
	}

	Page.prototype.getCanonicalUrl = function() {
		return app.baseUrlForLanguage(this.lang) + "/wiki/" + encodeURIComponent(this.title.replace(/ /g, '_'));
	}

	// Returns an API URL that makes a request that retreives this page
	// Should mimic params from Page.requestFromTitle
	Page.prototype.getAPIUrl = function() {
		return app.baseUrlForLanguage(this.lang) + '/w/api.php?format=json&action=mobileview&page=' + encodeURIComponent(this.title) + '&redirects=1&prop=sections|text&sections=all&sectionprop=level|line&noheadings=true';
	};

	Page.prototype.getCanonicalUrl = function() {
		return app.makeCanonicalUrl(this.lang, this.title);
	};

})();
