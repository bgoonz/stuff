<?php
/**
 * Initialization file for the Awesomeness extension.
 *
 * Documentation: https://www.mediawiki.org/wiki/Extension:Awesomeness
 * Support https://www.mediawiki.org/wiki/Extension_talk:Awesomeness
 * Source code: https://phabricator.wikimedia.org/diffusion/EAWE/
 *
 * @file Awesomeness.php
 * @ingroup Awesomeness
 * @package MediaWiki
 *
 * @license GPL-2.0-or-later
 *
 * @author Jeroen De Dauw < jeroendedauw@gmail.com >
 */

/**
 * This documentation group collects source code files belonging to Awesomeness.
 *
 * @defgroup Awesomeness Awesomeness
 */

// Ensure that the script cannot be executed outside of MediaWiki.
if ( !defined( 'MEDIAWIKI' ) ) {
	die( 'This is an extension to MediaWiki and cannot be run standalone.' );
}

// Define extension's version.
define( 'Awesomeness_VERSION', 'awesomeness = infinity+3' );

// Display extension properties on MediaWiki.
$wgExtensionCredits['other'][] = [
	'path' => __FILE__,
	'name' => 'Awesomeness',
	'version' => Awesomeness_VERSION,
	'author' => [
		'[https://www.mediawiki.org/wiki/User:Jeroen_De_Dauw Jeroen De Dauw]',
		'...'
	],
	'url' => 'https://www.mediawiki.org/wiki/Extension:Awesomeness',
	'descriptionmsg' => 'awesomeness-desc',
	'license-label' => 'GPL-2.0-or-later'
];

// Register extension messages and other localisation.
$wgMessagesDirs['Awesomeness'] = __DIR__ . '/i18n';

// And action.
$wgHooks['PageContentSave'][] = static function ( WikiPage &$wikiPage, &$user, &$content, &$summary,
	$isMinor, $isWatch, $section, &$flags, &$status ) {
	$awesomeness = [ 'awesomeness', 'awesome' ];

	$awesomeness = array_map(
		static function ( $awesomeness ) {
			return wfMessage( $awesomeness )->text();
		},
		$awesomeness
	);

	$awesomeness = implode( "|", array_map( "preg_quote", $awesomeness, array_fill( 0, count( $awesomeness ), "/" ) ) );
	$text = preg_replace( "/(^|\s|-)((?:{$awesomeness})[\?!\.\,]?)(\s|$)/i", " '''$2''' ", ContentHandler::getContentText( $content ) );
	$content = ContentHandler::makeContent( $text, $wikiPage->getTitle() );

	return true;
};

/**
 * Based on Svips patch at http://bug-attachment.wikimedia.org/attachment.cgi?id=7351
 */
if ( array_key_exists( 'QUERY_STRING', $_SERVER ) ) {
	$O_o = false;

	if ( strtolower( $_SERVER['QUERY_STRING'] ) == 'isthiswikiawesome' ) {
		$O_o = 'Hell yeah!';
	} elseif ( preg_match( '/^[0o°xt][-_\.][0o°xt]$/i', $_SERVER['QUERY_STRING'] ) ) {
		$O_o = strrev( $_SERVER['QUERY_STRING'] );
	}

	if ( $O_o ) {
		header( 'Content-Type: text/plain' );
		die( $O_o );
	}
}
