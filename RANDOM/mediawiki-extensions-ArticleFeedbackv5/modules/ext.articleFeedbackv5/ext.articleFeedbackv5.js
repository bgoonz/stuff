/*
 * Script for Article Feedback Extension
 */
( function ( $, mw ) {
	var $aftDiv, legacyskins, api;

	/* Load at the bottom of the article */
	$aftDiv = $( '<div id="mw-articlefeedbackv5"></div>' );

	// Put on bottom of article before #catlinks (if it exists)
	// Except in legacy skins, which have #catlinks above the article but inside content-div.
	legacyskins = [ 'standard', 'cologneblue', 'nostalgia' ];
	if ( $( '#catlinks' ).length && legacyskins.indexOf( mw.config.get( 'skin' ) ) < 0 ) {
		$aftDiv.insertBefore( '#catlinks' );
	} else {
		// CologneBlue, Nostalgia, ...
		mw.util.$content.append( $aftDiv );
	}

	$aftDiv.articleFeedbackv5();

	// Check if the article page link can be shown
	if ( mw.config.get( 'wgArticleFeedbackv5ArticlePageLink' ) &&
		mw.config.get( 'wgArticleFeedbackv5Permissions' )[ 'aft-editor' ] ) {

		api = new mw.Api();
		api.get( {
			pageid: $.aftUtils.article().id,
			filter: 'featured',
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
						url += ( url.indexOf( '?' ) >= 0 ? '&' : '?' ) + $.param( { ref: 'article', filter: 'featured' } );

						// Add the link to the feedback-page next to the title
						$link = $( '<a id="articlefeedbackv5-article-feedback-link"></a>' )
							.msg( 'articlefeedbackv5-article-view-feedback', count )
							.attr( 'href', url );

						/*
						 * Add the link next to #siteSub. Append to #siteSub node if
						 * it's visible, so we inherit it's style. Otherwise, add as
						 * new node, right after #siteSub
						 */
						if ( $( '#siteSub' ).is( ':visible' ) ) {
							$link.appendTo( '#siteSub' );
						} else {
							$link.insertAfter( '#siteSub' );
						}
					}
				}
			} );
	}

}( jQuery, mediaWiki ) );
