<?php
/*
* CategoryTests extension by Ryan Schmidt
* Functions for category testing
* Check https://www.mediawiki.org/wiki/Extension:CategoryTests for more info on what everything does
*/

if ( function_exists( 'wfLoadExtension' ) ) {
	wfLoadExtension( 'CategoryTests' );
	wfWarn(
		'Deprecated PHP entry point used for CategoryTests extension. ' .
		'Please use wfLoadExtension instead, ' .
		'see https://www.mediawiki.org/wiki/Extension_registration for more details.'
	);
	return;
} else {
	die( 'This version of the CategoryTests extension requires MediaWiki 1.29+' );
}
