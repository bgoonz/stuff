<?php

final class AdManagerHooks {

	/**
	 * Schema update to set up the needed database tables.
	 * @param DatabaseUpdater $updater
	 */
	public static function onSchemaUpdate( DatabaseUpdater $updater ) {
		$updater->addExtensionTable(
			AdManager::getTableName(), __DIR__ . '/../sql/AdManager.sql', true
		);
		$updater->addExtensionTable(
			AdManagerZones::getTableName(), __DIR__ . '/../sql/AdManager.sql', true
		);
	}

	/**
	 * Pop some ads at the bottom of the sidebar
	 *
	 * @param Skin $skin
	 * @param array &$sidebar
	 */
	public static function onSkinBuildSidebar( $skin, &$sidebar ) {
		global $wgAdManagerPlacement;

		if ( $wgAdManagerPlacement != 'sidebar' ) {
			return;
		}

		$adsOut = AdManager::getAdOutputFor( $skin->getTitle() );

		if ( !$adsOut ) {
			// No ads. Nothing to do.
			return;
		}

		foreach ( $adsOut as $adNumber => $adOut ) {
			$sidebar["AdManager$adNumber"] = $adOut;
		}
	}

	/**
	 * Pop some ads into the start of the content area
	 *
	 * @param OutputPage $out
	 * @param Skin $skin
	 */
	public static function onBeforePageDisplay( OutputPage $out, Skin $skin ) {
		global $wgAdManagerPlacement;

		$out->addModules( 'ext.adManager' );

		if ( $wgAdManagerPlacement != 'content' ) {
			return;
		}

		$adsOut = AdManager::getAdOutputFor( $skin->getTitle() );

		if ( !$adsOut ) {
			// No ads. Nothing to do.
			return;
		}

		foreach ( $adsOut as $adNumber => $adOut ) {
			$out->prependHTML( Html::rawElement( 'div',
					[ 'id' => "AdManager-content-$adNumber", 'class' => 'AdManager-content' ], $adOut ) );
		}
	}
}
