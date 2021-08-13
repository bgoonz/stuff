window.app = function() {

	var wikis = [];

	function getWikiMetadata() {
		var d = $.Deferred();
		if(wikis.length === 0) {
			$.get(ROOT_URL + 'wikis.json').done(function(data) {
				wikis = JSON.parse(data);
				d.resolve(wikis);
			});
		} else {
			d.resolve(wikis);
		}
		return d;
	}

	function loadMainPage(lang) {
		var d = $.Deferred();
		if(typeof lang === "undefined") {
			lang = preferencesDB.get("language");
		}

		app.getWikiMetadata().done(function(wikis) {
			var mainPage = wikis[lang].mainPage;
			app.navigateTo( mainPage, lang, { isCompletePage: true } ).done( function( data ) {
				d.resolve(data);
			}).fail(function(err) {
				d.reject(err);
			});
		});
		return d;
	}

	function loadCachedPage( url, title, lang ) {
		// Overriden by platform specific implementations;
	}

	function setCurrentPage(page) {
		app.curPage = page;
		chrome.renderHtml(page);

		setPageActionsState(true);
		setMenuItemState('read-in', true);
		chrome.setupScrolling("#content");
		chrome.scrollTo("#content", 0);
		appHistory.addCurrentPage();
		chrome.toggleMoveActions();
		$("#page-footer").show();
		chrome.showContent();
		chrome.hideSpinner();
	}

	function setErrorPage(type) {
		if(type == 404) {
			loadLocalPage('404.html');
		} else {
			loadLocalPage('error.html');
		}
		setMenuItemState('read-in', false);
		setPageActionsState(false);
		chrome.hideSpinner();
		$("#page-footer").hide();
		app.curPage = null;
	}

	function loadPage( title, language, isCompletePage ) {
		var d = $.Deferred();

		function doRequest() {
			var req = Page.requestFromTitle( title, language, isCompletePage ).done( function( page ) {
				if(page === null) {
					setErrorPage(404);
				}
				setCurrentPage(page);
				if( !page.isCompletePage ) {
					page.requestCompletePage().done( function() {
						console.log("Full page retreived!");
					});
				}
				d.resolve(page);
			}).fail(function(xhr, textStatus, errorThrown) {
				if(textStatus === "abort") {
					// User cancelled action. Do nothing!
					console.log("User cancelled action!");
					return;
				}
				setErrorPage(xhr.status);	
				d.reject(xhr);
			});
			chrome.setSpinningReq(req);
		}

		doRequest();
		return d;
	}

	function loadLocalPage(page) {
		var d = $.Deferred();
		$('base').attr('href', ROOT_URL);
		$('#main').load(page, function() {
			$('#main').localize();
			d.resolve();
		});
		return d;
	}

	function urlForTitle(title, lang) {
		if(typeof lang === 'undefined') {
			lang = preferencesDB.get("language");
		}
		return app.baseUrlForLanguage(lang) + "/wiki/" + encodeURIComponent(title.replace(/ /g, '_'));
	}

	function baseUrlForLanguage(lang) {
		return window.PROTOCOL + '://' + lang + '.' + PROJECTNAME + '.org';
	}

	function makeCanonicalUrl(lang, title) {
		return baseUrlForLanguage(lang) + '/wiki/' + encodeURIComponent(title.replace(/ /g, '_'));
	}

	function setContentLanguage(language) {
		preferencesDB.set('language', language);
		app.baseURL = app.baseUrlForLanguage(language);
	}

	function setFontSize(size) {
		preferencesDB.set('fontSize', size);
		$('#main').css('font-size', size);
	}

	function navigateTo(title, lang, options) {
		var d = $.Deferred();
		var options = $.extend( {cache: false, updateHistory: true, isCompletePage: false}, options || {} );
		var url = app.urlForTitle(title, lang);

		if(title === "") {
			return app.loadMainPage(lang);
		}

		$('#searchParam').val('');
		chrome.showContent();
		if(options.hideCurrent) {
			$("#content").hide();
		}
		chrome.showSpinner();

		if (options.updateHistory) {
			currentHistoryIndex += 1;
			pageHistory[currentHistoryIndex] = url;
		}
		if(title === "") {
			title = "Main_Page"; // FIXME
		}
		d = app.loadPage( title, lang, options.isCompletePage );
		d.done(function(page) {
			if(options.hideCurrent) {
				$("#content").show();
				// see http://forrst.com/posts/iOS_scrolling_issue_solved-rgX
				// Fix for bug causing page to not scroll in iOS 5.x when visited from nearby
				chrome.scrollTo("#content", 0);
			}			
		});
		return d;
	}

	function navigateToPage(url, options) {
		var title = app.titleForUrl(url);
		var lang = app.languageForUrl(url);
		return app.navigateTo(title, lang, options);
	}

	function getCurrentUrl() {
		if(app.curPage) {
			return app.curPage.getCanonicalUrl();
		} else {
			return null;
		}
	}

	function languageForUrl(url) {
		// Use the least significant part of the hostname as language
		// So en.wikipedia.org would be 'en', and so would en.wiktionary.org
		return url.match(/^https?:\/\/([^.]+)./)[1];	
	}

	function titleForUrl(url) {
		var page = url.replace(/^https?:\/\/[^\/]+(\/wiki\/)?/, ''),
			unescaped = decodeURIComponent(page),
			title = unescaped.replace(/_/g, ' ');
		return title;
	}
	function getCurrentTitle() {
		if(app.curPage) {
			return app.curPage.title;
		} else {
			return null;
		}
	}

	function makeAPIRequest(params, lang, extraOptions) {
		params = params || {};
		params.format = 'json'; // Force JSON
		lang = lang || preferencesDB.get('language');
		var url = app.baseUrlForLanguage(lang) + '/w/api.php';
		var defaultOptions = {
			url: url,
			data: params,
			// Making this 'text' and parsing the JSON ourselves makes things much easier
			// Than making it as 'JSON' for pre-processing via dataFilter
			// See https://forum.jquery.com/topic/datafilter-function-and-json-string-result-problems
			dataType: 'text',
			dataFilter: function(text) {
				return JSON.parse(text);
			}
		};
		var options = $.extend(defaultOptions, extraOptions);
		return $.ajax(options);
	}

	function track(eventId) {
		makeAPIRequest({
			eventid: eventId,
			namespacenumber: 0,
			token: '+/', // Anonymous token
			additional: 'android' // System info
		}, preferencesDB.get('language'));
	}
	var exports = {
		setFontSize: setFontSize,
		setContentLanguage: setContentLanguage,
		navigateToPage: navigateToPage,
		getCurrentUrl: getCurrentUrl,
		getCurrentTitle: getCurrentTitle,
		urlForTitle: urlForTitle,
		titleForUrl:titleForUrl,
		languageForUrl: languageForUrl,
		baseUrlForLanguage: baseUrlForLanguage,
		loadPage: loadPage,
		loadCachedPage: loadCachedPage, 
		makeCanonicalUrl: makeCanonicalUrl,
		makeAPIRequest: makeAPIRequest,
		setCurrentPage: setCurrentPage,
		track: track,
		curPage: null,
		navigateTo: navigateTo,
		getWikiMetadata: getWikiMetadata,
		loadMainPage: loadMainPage
	};

	return exports;
}();
