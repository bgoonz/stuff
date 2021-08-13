<?php
/**
 * AuthorProtect extension by Ryan Schmidt
 * See https://www.mediawiki.org/wiki/Extension:AuthorProtect for more details
 */

if ( function_exists( 'wfLoadExtension' ) ) {
	wfLoadExtension( 'AuthorProtect' );
	$wgMessageDirs['AuthorProtect'] = __DIR__ . '/i18n';
	wfWarn(
		'Deprecated PHP entry point used for AuthorProtect extension. ' .
		'Please use wfLoadExtension instead, ' .
		'see https://www.mediawiki.org/wiki/Extension_registration for more details.'
	);
} else {
	die( 'This version of the AuthorProtect extension requires MediaWiki 1.31+' );
}
