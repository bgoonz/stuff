/*
 Track link clicks on landing page created for ACTRIAL
 */

( function ( $, mw ) {

	function trackData( interactionType, link, sampling ) {
		mw.track( 'event.ArticleCreationWorkflow', {
			interactionType: interactionType,
			link: link,
			sampling: sampling || 1
		} );
	}

	$( 'html' ).on( 'click', '#bodyContent a', function () {
		var link = $( this ).attr( 'href' );
		trackData( 'click', link );
	} );

}( jQuery, mediaWiki ) );
