<?php
/**
 * Hooks for EmailCapture extension
 */
class EmailCaptureHooks {
	/**
	 * LoadExtensionSchemaUpdates hook
	 *
	 * @param DatabaseUpdater $updater
	 * @return bool
	 */
	public static function loadExtensionSchemaUpdates( $updater ) {
		$db = $updater->getDB();
		if ( !$db->tableExists( 'email_capture' ) ) {
			// Initial install tables
			$updater->addExtensionUpdate( [
				'addTable',
				'email_capture',
				__DIR__ . '/../sql/CreateEmailCaptureTable.sql',
				true
			] );
		}
		return true;
	}

	/**
	 * ParserTestTables hook
	 * @param array &$tables
	 * @return true
	 */
	public static function parserTestTables( &$tables ) {
		$tables[] = 'email_capture';
		return true;
	}
}
