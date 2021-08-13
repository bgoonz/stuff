/**
 * Highlight words placed in tag 'aindex' (span class='articleIndexedWord')
 * Clicking the word highlights his occurrences and moves page to the first one
 * Navigation buttons on mouseenter
 */
/* eslint-disable no-jquery/no-global-selector */

( function () {

	var w, searchedWords, style, navButtons, prevIndex, nextIndex, delay = 500;
	// delay for animations

	$( 'a.articleIndexLink' ).css( 'cursor', 'pointer' );
	$( 'a.articleIndexLink' ).on( 'click', function () {

		// clicked word
		w = $( this ).text();

		// back to default state
		$( 'span.articleIndexedWord' ).attr( 'style', '' );
		$( 'span.articleIndexedWord' ).unbind( 'mouseenter' );
		removeNavigation();

		// search and highlight all occurrences of clicked word
		searchedWords = $( 'span.articleIndexedWord' ).filter( function () {
			return $( this ).text().toLowerCase() === w.toLowerCase();
		} );

		style = 'background-color: #5f7bb7; color: #ffffff; padding: 0px 2px 0px 2px;';
		style += '-moz-border-radius: 2px; -webkit-border-radius: 2px;';
		style += '-khtml-border-radius: 2px; border-radius: 2px;';
		searchedWords.attr( 'style', style );

		// find first occurrence of the word and jump into
		$( 'html, body' ).animate( {
			scrollTop: searchedWords.first().offset().top
		}, delay );

		// add navigation buttons on indexed word mouseenter
		navButtons = '';
		if ( searchedWords.length > 1 ) {
			navButtons = "<span class='articleIndexNavPrev'>" + mw.msg( 'articleindex-prev' ) + '</span>';
			navButtons += "<span class='articleIndexNavNext'>" + mw.msg( 'articleindex-next' ) + '</span>';
		}
		navButtons += "<span class='articleIndexNavIndex'>" + mw.msg( 'articleindex-index' ) + '</span>';
		searchedWords.mouseenter( function () {

			// mouseentered word
			w = $( this ).text();

			// update navigation buttons
			removeNavigation();
			$( this ).after( navButtons );

			// add onclick on PREV button
			if ( searchedWords.length > 1 ) {
				$( 'span.articleIndexNavPrev' ).css( 'cursor', 'pointer' );
				$( 'span.articleIndexNavPrev' ).on( 'click', function () {
					// find previous occurrence of the word and jump into
					prevIndex = 0;
					searchedWords.map( function ( index ) {
						if ( $( this ).next( 'span.articleIndexNavPrev' ).length === 1 ) {
							prevIndex = index - 1;
							return $( this );
						} else {
							return null;
						}
					} );

					if ( prevIndex < 0 ) {
						// jump to end
						$( 'html, body' ).animate( {
							scrollTop: searchedWords.last().offset().top
						}, delay );
					} else {
						// jump to previous
						$( 'html, body' ).animate( {
							scrollTop: searchedWords.eq( prevIndex ).offset().top
						}, delay );
					}
					removeNavigation();
				} );
			}

			// add onclick on NEXT button
			if ( searchedWords.length > 1 ) {
				$( 'span.articleIndexNavNext' ).css( 'cursor', 'pointer' );
				$( 'span.articleIndexNavNext' ).on( 'click', function () {
					// find next occurrence of the word and jump into
					nextIndex = 0;
					searchedWords.map( function ( index ) {
						if ( $( this ).next( 'span.articleIndexNavPrev' ).length === 1 ) {
							nextIndex = index + 1;
							return $( this );
						} else {
							return null;
						}
					} );

					if ( nextIndex === searchedWords.length ) {
						// jump to start
						$( 'html, body' ).animate( {
							scrollTop: searchedWords.first().offset().top
						}, delay );
					} else {
						// jump to next
						$( 'html, body' ).animate( {
							scrollTop: searchedWords.eq( nextIndex ).offset().top
						}, delay );
					}
					removeNavigation();
				} );
			}

			// add onclick on INDEX buttons
			$( 'span.articleIndexNavIndex' ).css( 'cursor', 'pointer' );
			$( 'span.articleIndexNavIndex' ).on( 'click', function () {
			// jump to the index
				removeNavigation();
				$( 'html, body' ).animate( {
					scrollTop: $( 'a.articleIndexLink' ).first().offset().top
				}, delay );
			} );
		} );

	} );

	// remove navigation buttons
	function removeNavigation() {
		$( 'span.articleIndexNavPrev' ).unbind( 'click' );
		$( 'span.articleIndexNavNext' ).unbind( 'click' );
		$( 'span.articleIndexNavIndex' ).unbind( 'click' );
		$( 'span.articleIndexNavPrev' ).remove();
		$( 'span.articleIndexNavNext' ).remove();
		$( 'span.articleIndexNavIndex' ).remove();
	}

}() );
