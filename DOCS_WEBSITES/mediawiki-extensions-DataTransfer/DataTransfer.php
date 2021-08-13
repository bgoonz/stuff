<?php
/**
 * Initialization file for Data Transfer.
 *
 * @ingroup DataTransfer
 * @author Yaron Koren
 */

// This check is necessary to pass Jenkins validation, for some reason.
if ( function_exists( 'wfLoadExtension' ) ) {
	wfLoadExtension( 'DataTransfer' );
}

// Keep i18n globals so mergeMessageFileList.php doesn't break
$wgMessagesDirs['DataTransfer'] = __DIR__ . '/i18n';
$wgExtensionMessagesFiles['DataTransferAlias'] = __DIR__ . '/DataTransfer.i18n.alias.php';
/* wfWarn(
	'Deprecated PHP entry point used for Data Transfer extension. Please use wfLoadExtension instead, ' .
	'see https://www.mediawiki.org/wiki/Extension_registration for more details.'
); */
