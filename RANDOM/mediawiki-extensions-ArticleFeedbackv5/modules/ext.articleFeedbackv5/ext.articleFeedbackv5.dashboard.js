/*
 * This script determines if Special:ArticleFeedbackv5/<Article> should display
 * the feedback dashboard or not.
 */

( function ( $, mw ) {
	/**
	 * Main entry point
	 */
	$( function () {
		var showError = function ( message ) {
			var warning = $( '#articlefeedbackv5-header-message' ).text( message );
			$( '#articleFeedbackv5-special-wrap' )
				.hide()
				.after( warning );
		};

		// AFT is enabled
		if ( $.aftUtils.verify( 'special' ) ) {
			$.articleFeedbackv5special.setup();

		// AFT is not enabled
		} else {
			showError( mw.msg( 'articlefeedbackv5-page-disabled' ) );
		}
	} );
}( jQuery, mediaWiki ) );
