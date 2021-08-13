/* global alert */
( function () {
	'use strict';
	// Create or extend the object
	window.CodeReview = $.extend( window.CodeReview, {

		loadDiff: function ( repo, rev ) {
			var apiPath = mw.config.get( 'wgScriptPath' ) + '/api.php';
			$( CodeReview.diffTarget() ).injectSpinner( 'codereview-diff' );
			try {
				$.ajax( {
					url: apiPath,
					data: {
						format: 'json',
						action: 'codediff',
						repo: repo,
						rev: rev
					},
					dataType: 'json',
					success: function ( data ) {
						CodeReview.decodeAndShowDiff( data );
						$.removeSpinner( 'codereview-diff' );
					}
				} );
			} catch ( e ) {
				$.removeSpinner( 'codereview-diff' );
				if ( window.location.hostname === 'localhost' ) {
					alert( 'Your browser blocks XMLHttpRequest to "localhost", try using a real hostname for development/testing.' );
				}
				CodeReview.setDiff( 'Failed to load diff.' );
				throw e;
			}
		},
		decodeAndShowDiff: function ( data ) {
			if ( data && data.code && data.code.rev && data.code.rev.diff ) {
				CodeReview.setDiff( data.code.rev.diff );
			} else {
			// Will occur when MediaWiki actually serves an error back
				CodeReview.setDiff( 'Failed to load diff. :(' );
			}
		},
		diffTarget: function () {
			return document.getElementById( 'mw-codereview-diff' );
		},
		setDiff: function ( diffHtml ) {
			CodeReview.diffTarget().innerHTML = diffHtml;
		}

	} );
}() );
