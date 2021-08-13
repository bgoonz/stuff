/**
 * Script for Article Feedback Extension: Talk pages
 */

( function ( $, mw ) {
	/**
	 * Main entry point
	 */
	$( function () {
		var params, url, link;

		// Check if the watchlist is enabled & link can be shown
		if ( mw.config.get( 'wgArticleFeedbackv5Watchlist' ) && mw.config.get( 'wgArticleFeedbackv5WatchlistLink' ) ) {

			// Check if we're not dealing with anon user
			if ( mw.user.isAnon() ) {
				return;
			}

			// Build the url to the Special:ArticleFeedbackv5Watchlist page
			params = { ref: 'watchlist' };
			url = mw.util.getUrl( mw.config.get( 'wgArticleFeedbackv5SpecialWatchlistUrl' ), params );

			// Add the link to the feedback-page next to the title
			link = $( '<a id="articlefeedbackv5-watchlist-feedback-link"></a>' );
			link
				.text( mw.msg( 'articlefeedbackv5-watchlist-view-feedback' ) )
				.attr( 'href', url );

			$( '#contentSub' ).append( link );

		}

	} );
}( jQuery, mediaWiki ) );
