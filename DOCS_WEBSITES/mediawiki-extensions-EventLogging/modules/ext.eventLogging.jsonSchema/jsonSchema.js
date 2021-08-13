/*!
 * JavaScript enhancements of JSON Schema article pages.
 *
 * @module ext.eventLogging.jsonSchema
 * @author Ori Livneh <ori@wikimedia.org>
 */
/* eslint-disable no-jquery/no-global-selector */
$( function () {
	'use strict';

	// Make the '<>' icon toggle code samples:
	var $samples = $( '.mw-json-schema-code-samples' );

	$( '.mw-json-schema-code-glyph' ).on( 'click', function ( e ) {
		$samples.toggle();
		e.stopPropagation();
	} );

	$( document ).on( 'click', function () {
		$samples.hide();
	} );

	$samples.on( 'click', function ( e ) {
		e.stopPropagation();
	} );

} );
