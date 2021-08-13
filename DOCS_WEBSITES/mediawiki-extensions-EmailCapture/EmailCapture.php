<?php
/**
 * EmailCapture extension
 *
 * @file
 * @ingroup Extensions
 * @author Trevor Parscal <trevor@wikimedia.org>
 * @license GPL-2.0-or-later
 * @link https://www.mediawiki.org/wiki/Extension:EmailCapture Documentation
 */

if ( function_exists( 'wfLoadExtension' ) ) {
	wfLoadExtension( 'EmailCapture' );
	// Keep i18n globals so mergeMessageFileList.php doesn't break
	$wgMessagesDirs['EmailCapture'] = __DIR__ . '/i18n';
	$wgExtensionMessagesFiles['EmailCaptureAlias'] = __DIR__ . '/EmailCapture.alias.php';
	wfWarn(
		'Deprecated PHP entry point used for the EmailCapture extension. ' .
		'Please use wfLoadExtension() instead, ' .
		'see https://www.mediawiki.org/wiki/Special:MyLanguage/Manual:Extension_registration for more details.'
	);
	return;
} else {
	die( 'This version of the EmailCapture extension requires MediaWiki 1.29+' );
}
