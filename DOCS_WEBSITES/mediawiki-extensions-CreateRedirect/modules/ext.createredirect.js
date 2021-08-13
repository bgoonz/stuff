/* Button "Enter more titles" that transforms <input> of "Page title:" field into <textarea>
	(this allows to submit multiple titles at the same time).
*/

$( function () {
	var $input = $( '#crOrigTitle' ).find( 'input' ).first();

	// Position the cursor at the end of the input field.
	function focusInput( $input ) {
		var value = $input.val();
		$input.focus().val( '' ).val( value );
	}

	if ( $input[ 0 ].tagName === 'TEXTAREA' ) {
		return; // Already in multiline mode
	}

	focusInput( $input );

	$input.after( $( '<input>' )
		.attr( 'type', 'button' )
		.val( mw.msg( 'createredirect-enable-multiline' ) )
		.attr( 'class', 'createredirect-multiline' )
		.on( 'click', function () {
			var $ta = $( '<textarea>' )
				.attr( 'id', 'crOrigTitle2' )
				.attr( 'name', $input.attr( 'name' ) )
				.text( $input.val() + '\n' );

			$( this ).hide();

			$input.replaceWith( $ta );
			focusInput( $ta );
		} )
	);
} );
