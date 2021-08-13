<?php

use MediaWiki\Logger\LegacyLogger;

class DeviceMapLogCaptureHooks {

	/**
	 * LoadExtensionSchemaUpdates hook
	 * @param DatabaseUpdater $updater
	 */
	public static function loadExtensionSchemaUpdates( DatabaseUpdater $updater ) {
		$updater->addExtensionUpdate( [ 'addTable', 'device_map_log_capture',
			__DIR__ . '/../patches/DeviceMapLogCapture.sql', true ] );
	}

	/**
	 * @param int $eventId
	 * @param string $token
	 * @param string $site
	 * @param string $deviceMap
	 * @param string $countryCode
	 * @param string $userAgent
	 * @return true
	 */
	public static function recordDevice(
		$eventId,
		$token,
		$site,
		$deviceMap,
		$countryCode,
		$userAgent
	) {
		global $wgDeviceMapDatabase, $wgDeviceMapLog;
		$retval = true;
		if ( $wgDeviceMapDatabase ) {
			$dbw = wfGetDB( DB_MASTER );
			$data = [
				'action_time' => $dbw->timestamp(),
				'session_id' => (string)$token,
				'site' => (string)$site,
				'event_id' => (int)$eventId,
				'dmap' => (string)$deviceMap,
				'country_code' => (string)$countryCode,
				'user_agent' => (string)$userAgent,
			];
			$dbw->insert( 'device_map_log_capture', $data, __METHOD__ );
		}

		if ( $wgDeviceMapLog ) {
			$msg = implode( "\t", [
				wfTimestampNow(),
				// Replace tabs with spaces in all strings
				str_replace( "\t", ' ', $token ),
				str_replace( "\t", ' ', $site ),
				(int)$eventId,
				str_replace( "\t", ' ', $deviceMap ),
				str_replace( "\t", ' ', $countryCode ),
				str_replace( "\t", ' ', $userAgent ),
			] );
			LegacyLogger::emit( $msg, $wgDeviceMapLog );
		}
		return $retval;
	}
}
