<?php

class CreditsSourceHooks {
	/**
	 * LoadExtensionSchemaUpdates hook
	 *
	 * @param DatabaseUpdater $updater
	 */
	public static function loadExtensionSchemaUpdates( DatabaseUpdater $updater ) {
		$dbType = $updater->getDB()->getType();
		$base = dirname( __DIR__, 1 ) . '/schema';

		if ( $dbType === 'postgres' ) {
			$updater->addExtensionUpdate( [
				'addTable',
				'revsrc',
				"$base/postgres/CreditsSource.sql",
				true
			] );

			$updater->addExtensionUpdate( [
				'addTable',
				'swsite',
				"$base/postgres/swsite.sql",
				true
			] );
			$updater->addExtensionUpdate( [
				'dropFkey',
				'revsrc', 'revsrc_user'
			] );
		} else {
			$updater->addExtensionUpdate( [
				'addTable',
				'revsrc',
				"$base/mysql/CreditsSource.sql",
				true
			] );

			$updater->addExtensionUpdate( [
				'addTable',
				'swsite',
				"$base/mysql/swsite.sql",
				true
			] );
		}
	}
}
