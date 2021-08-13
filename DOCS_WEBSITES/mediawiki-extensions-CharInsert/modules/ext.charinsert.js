( function () {
	var $currentFocused;
	function addClickHandlers( $content ) {
		$content.find( 'a.mw-charinsert-item' ).each( function () {
			var $item = $( this ),
				start = $item.data( 'mw-charinsert-start' ),
				end = $item.data( 'mw-charinsert-end' );
			if ( $item.data( 'mw-charinsert-done' ) ) {
				return;
			}
			$item.on( 'click', function ( e ) {
				e.preventDefault();
				if ( $currentFocused.length ) {
					$currentFocused.textSelection(
						'encapsulateSelection', {
							pre: start,
							peri: '',
							post: end
						}
					);
				}
			} )
				.data( 'mw-charinsert-done', true )
				.attr( 'href', '#' );
		} );
	}
	// Normally <charinsert> appears outside of content area.
	// However, we also want to catch things like live preview,
	// so we use both the onready hook and wikipage.content.
	$( function () {
		// eslint-disable-next-line no-jquery/no-global-selector
		$currentFocused = $( '#wpTextbox1' );
		// Apply to dynamically created textboxes as well as normal ones
		$( document ).on( 'focus', 'textarea, input:text, .CodeMirror', function () {
			if ( $( this ).is( '.CodeMirror' ) ) {
				// CodeMirror hooks into #wpTextbox1 for textSelection changes
				// eslint-disable-next-line no-jquery/no-global-selector
				$currentFocused = $( '#wpTextbox1' );
			} else {
				$currentFocused = $( this );
			}
		} );
		addClickHandlers( $( document ) );
	} );
	mw.hook( 'wikipage.content' ).add( addClickHandlers );
}() );
