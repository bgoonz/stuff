/**
 * Script for Article Feedback Extension: Talk pages
 */

( function ( $, mw ) {
	/**
	 * Main entry point
	 */
	$( function () {
		var filter, api;

		// Check if the talk page link can be shown,
		// but only for pages that exist (T63164)
		if ( mw.config.get( 'wgArticleFeedbackv5TalkPageLink' ) && mw.config.get( 'wgArticleId' ) > 0 ) {
			filter = '*';
			/*
			 * If AFT is disabled for this page, we'll only want to show the link if
			 * there's leftover featured feedback.
			 */
			if ( !$.aftUtils.verify( 'talk' ) ) {
				filter = 'featured';
			}

			api = new mw.Api();
			api.get( {
				pageid: $.aftUtils.article().id,
				filter: filter,
				action: 'articlefeedbackv5-get-count'
			} )
				.done( function ( data ) {
					var count, url, $link;

					if ( 'articlefeedbackv5-get-count' in data && 'count' in data[ 'articlefeedbackv5-get-count' ] ) {
						count = data[ 'articlefeedbackv5-get-count' ].count;

						if ( count > 0 ) {
							// Build the url to the Special:ArticleFeedbackv5 page
							url = mw.config.get( 'wgArticleFeedbackv5SpecialUrl' ) + '/' +
								mw.util.wikiUrlencode( mw.config.get( 'aftv5Article' ).title );
							url += ( url.indexOf( '?' ) >= 0 ? '&' : '?' ) + $.param( { ref: 'talk', filter: 'featured' } );

							// Add the link to the feedback-page next to the title
							$link = $( '<a id="articlefeedbackv5-talk-feedback-link"></a>' )
								.text( mw.msg( 'articlefeedbackv5-talk-view-feedback' ) )
								.attr( 'href', url );

							/*
							 * Add the link next to #siteSub. Append to #siteSub node if
							 * it's visible, so we inherit its style. Otherwise, add as
							 * new node, right after #siteSub if there is a #siteSub.
							 * If there isn't, add it above #mw-content-text.
							 */
							if ( $( '#siteSub' ).length > 0 ) {
								if ( $( '#siteSub' ).is( ':visible' ) ) {
									$link.appendTo( '#siteSub' );
								} else {
									$link.insertAfter( '#siteSub' );
								}
							} else {
								$( '#mw-content-text' ).before( $link );
							}
						}
					}
				} );
		}
	} );
}( jQuery, mediaWiki ) );
