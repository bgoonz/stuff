/*!
 * Add page name suggestions to the createPage form.
 * Borrowed from mediawiki.searchSuggest.js - main modifications include removal of unneeded code and
 * renaming of the selectors.
 */
( function ( mw, $ ) {
	$( function () {
		var api, map, resultRenderCache, searchboxesSelectors,
			// Region where the suggestions box will appear directly below
			// (using the same width). Can be a container element or the input
			// itself, depending on what suits best in the environment.
			// For Vector the suggestion box should align with the createpageform
			// container's borders, in other skins it should align with the input
			// element (not the search form, as that would leave the buttons
			// vertically between the input and the suggestions).
			$searchRegion = $( '.createpageform' );

		// Compatibility map
		map = {
			// SimpleSearch is broken in Opera < 9.6
			opera: [ [ '>=', 9.6 ] ],
			// Older Konquerors are unable to position the suggestions correctly (bug 50805)
			konqueror: [ [ '>=', '4.11' ] ],
			docomo: false,
			blackberry: false,
			// Support for iOS 6 or higher. It has not been tested on iOS 5 or lower
			ipod: [ [ '>=', 6 ] ],
			iphone: [ [ '>=', 6 ] ]
		};

		if ( !$.client.test( map ) ) {
			return;
		}

		// Compute form data for search suggestions functionality.
		function computeResultRenderCache( context ) {
			var $form, baseHref, linkParams;

			// Compute common parameters for links' hrefs
			$form = context.config.$region.closest( 'form' );

			baseHref = $form.attr( 'action' );
			baseHref += baseHref.indexOf( '?' ) > -1 ? '&' : '?';

			linkParams = $form.serializeObject();

			return {
				textParam: context.data.$textbox.attr( 'name' ),
				linkParams: linkParams,
				baseHref: baseHref
			};
		}

		// The function used to render the suggestions.
		function renderFunction( text, context ) {
			resultRenderCache = computeResultRenderCache( context );

			// linkParams object is modified and reused
			resultRenderCache.linkParams[ resultRenderCache.textParam ] = text;

			// this is the container <div>, jQueryfied
			this.text( text )
				.wrap(
					$( '<a>' )
						.attr( 'href', resultRenderCache.baseHref + $.param( resultRenderCache.linkParams ) )
						.attr( 'title', text )
						.addClass( 'mw-searchSuggest-link' )
				);
		}

		searchboxesSelectors = [
			'.pagenameinput'
		];
		$( searchboxesSelectors.join( ', ' ) )
			.suggestions( {
				fetch: function ( query, response, maxRows ) {
					var node = this[ 0 ];

					api = api || new mw.Api();

					// Set the namespace on which to search,
					// potentially based on a hidden HTML
					// attribute.
					var searchNS = $( this ).parent().find( 'input[name=pagens]' ).attr( 'nsid' );
					if ( searchNS === undefined ) {
						searchNS = 0;
					}

					$.data( node, 'request', api.get( {
						action: 'opensearch',
						search: query,
						namespace: searchNS,
						limit: maxRows,
						suggest: ''
					} ).done( function ( data ) {
						response( data[ 1 ] );
					} ) );
				},
				cancel: function () {
					var node = this[ 0 ],
						request = $.data( node, 'request' );

					if ( request ) {
						request.abort();
						$.removeData( node, 'request' );
					}
				},
				result: {
					render: renderFunction,
					select: function () {
						// allow the form to be submitted
						return true;
					}
				},
				cache: true,
				highlightInput: true
			} )
			.bind( 'paste cut drop', function () {
				// make sure paste and cut events from the mouse and drag&drop events
				// trigger the keypress handler and cause the suggestions to update
				$( this ).trigger( 'keypress' );
			} )
			// In most skins (at least Monobook and Vector), the font-size is messed up in <body>.
			// (they use 2 elements to get a sane font-height). So, instead of making exceptions for
			// each skin or adding more stylesheets, just copy it from the active element so auto-fit.
			.each( function () {
				var $this = $( this );
				$this
					.data( 'suggestions-context' )
					.data.$container
					.css( 'fontSize', $this.css( 'fontSize' ) );
			} );

		// Ensure that the thing is actually present!
		if ( $searchRegion.length === 0 ) {
			// Don't try to set anything up if no CreatePage inputs exist on this page
			return;
		}
	} );

}( mediaWiki, jQuery ) );
