<?php
/**
 * MediaWiki extension that enables group access restriction on a page-by-page
 * basis
 *
 * Version pre-0.1 (2005-05-03) by Josh Greenberg
 * Version 0.1 to 0.9 (2010-06-27) by Martin Gondermann
 * Version 1.0 to 2.5 by Aleš Kapica
 * Version 2.6 by Siebrand Mazeland and Thomas Mulhall
 *
 * @package MediaWiki
 * @subpackage Extensions
 * @author Aleš Kapica
 * @copyright 2008-2014 Aleš Kapica
 * @license GPL-2.0-or-later
 */
if ( function_exists( 'wfLoadExtension' ) ) {
	wfLoadExtension( 'AccessControl' );
	$wgMessageDirs['AccessControl'] = __DIR__ . '/i18n';
	wfWarn(
		'Deprecated PHP entry point used for AccessControl extension. ' .
		'Please use wfLoadExtension instead, ' .
		'see https://www.mediawiki.org/wiki/Extension_registration for more details.'
	);
} else {
	die( 'This version of the AccessControl extension requires MediaWiki 1.29+' );
}
