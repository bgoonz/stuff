jQuery( function () {
	'use strict';
	// Animate the add-tags input to suggest existing tabs
	$( '#wpTag' ).suggestions( {
		fetch: function () {
			var $this = $( this ),
				doUpdate = function () {
					var currentText = $this.val(),
						currentTags = currentText.split( /, */ ),
						lastTag, doneTags;
					if ( currentTags.length === 0 ) {
						lastTag = doneTags = '';
					} else {
						lastTag = currentTags.pop();
						doneTags = currentTags.length > 0 ?
							currentTags.join( ', ' ) + ', ' :
							'';
					}

					var tags = $this.data( 'suggestions' ),
						suggestions = [];

					for ( var i in tags ) {
						// Don't suggest a tag that's already been added
						var good = true;
						for ( var j in currentTags ) {
							if ( currentTags[ j ] === tags[ i ] ) {
								good = false;
							}
						}
						if ( good && ( String( tags[ i ] ) ).indexOf( lastTag ) !== -1 ) {
							suggestions.push( doneTags + tags[ i ] );
						}
					}

					$this.suggestions( 'suggestions', suggestions );
				},
				request;
			if ( $( this ).data( 'suggestions' ) ) {
				doUpdate();
			} else if ( $( this ).data( 'request' ) ) {
				// A request is in progress, we'll get to it eventually
			} else {
				// Need to get the tags from the API
				request = $.getJSON(
					mw.config.get( 'wgScriptPath' ) + '/api.php',
					{
						action: 'query',
						list: 'codetags',
						ctrepo: mw.config.get( 'wgCodeReviewRepository' ),
						format: 'json'
					},
					function ( data ) {
						if ( data && 'query' in data && 'codetags' in data.query ) {
							var d = data.query.codetags,
								tags = [];
							for ( var i in d ) {
								tags.push( d[ i ].name );
							}
							$this.data( 'suggestions', tags );
							// Go again
							doUpdate();
						}
					}
				);
			}
			$( this ).data( 'request', request );
		},
		cancel: function () {
			var request = $( this ).data( 'request' );
			// If the delay setting has caused the fetch to have not even happend yet, the request object will
			// have never been set
			if ( request && $.isFunction( request.abort ) ) {
				request.abort();
				$( this ).removeData( 'request' );
			}
		},
		delay: 0,
		positionFromLeft: $( 'body' ).hasClass( 'rtl' ),
		highlightInput: true
	} )
		.on( 'paste cut drop', function () {
		// make sure paste and cut events from the mouse and drag&drop events
		// trigger the keypress handler and cause the suggestions to update
			$( this ).trigger( 'keypress' );
		} );
} );
