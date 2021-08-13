<?php

if ( function_exists( 'wfLoadExtension' ) ) {
	wfLoadExtension( 'Commentbox' );
	// Keep i18n globals so mergeMessageFileList.php doesn't break
	$wgMessagesDirs['Commentbox'] = __DIR__ . '/i18n';
	$wgExtensionMessagesFiles['Commentbox'] = __DIR__ . '/Commentbox.alias.php';
	wfWarn(
		'Deprecated PHP entry point used for the Commentbox extension. ' .
		'Please use wfLoadExtension instead, ' .
		'see https://www.mediawiki.org/wiki/Extension_registration for more details.'
	);
	return;
} else {
	die( 'This version of the Commentbox extension requires MediaWiki 1.29+' );
}
