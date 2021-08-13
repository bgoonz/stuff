<?php

use MediaWiki\MediaWikiServices;
use Wikimedia\Services\ServiceContainer;

/**
 * Main class for the AbsenteeLandlord MediaWiki extension.
 * This extension will automatically lock the database from any further changes
 * if a sysop has not been on the wiki recently (as determined by the global
 * variable $wgAbsenteeLandlordMaxDays; 90 days by default).
 *
 * @file
 * @ingroup Extensions
 * @see https://www.mediawiki.org/wiki/Extension:AbsenteeLandlord
 */
class AbsenteeLandlord {

	/**
	 * @param MediaWikiServices $mws
	 */
	public static function onMediaWikiServices( MediaWikiServices $mws ) {
		$mws->addServiceManipulator( 'ReadOnlyMode',
			static function ( ReadOnlyMode $svc, ServiceContainer $cont ) {
				return new AbsenteeLandlordReadOnlyMode( $svc );
			} );
	}

	/**
	 * @param OutputPage &$out
	 * @param Skin &$skin
	 * @return true
	 */
	public static function maybeDoTouch( OutputPage &$out, Skin &$skin ) {
		$groups = $out->getUser()->getGroups();
		if ( in_array( 'sysop', $groups ) ) {
			touch( __DIR__ . '/lasttouched.txt' );
		}
		return true;
	}

}
