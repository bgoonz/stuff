<?php

namespace MediaWiki\Extension\AbuseFilter\Hooks\Handlers;

use DatabaseUpdater;
use MediaWiki\Extension\AbuseFilter\Maintenance\FixOldLogEntries;
use MediaWiki\Extension\AbuseFilter\Maintenance\MigrateAflFilter;
use MediaWiki\Extension\AbuseFilter\Maintenance\NormalizeThrottleParameters;
use MediaWiki\Extension\AbuseFilter\Maintenance\UpdateVarDumps;
use MediaWiki\Installer\Hook\LoadExtensionSchemaUpdatesHook;
use MediaWiki\MediaWikiServices;
use MediaWiki\User\UserGroupManager;
use MessageLocalizer;
use MWException;
use RequestContext;
use User;

class SchemaChangesHandler implements LoadExtensionSchemaUpdatesHook {
	/** @var MessageLocalizer */
	private $messageLocalizer;
	/** @var UserGroupManager */
	private $userGroupManager;

	/**
	 * @param MessageLocalizer $messageLocalizer
	 * @param UserGroupManager $userGroupManager
	 */
	public function __construct( MessageLocalizer $messageLocalizer, UserGroupManager $userGroupManager ) {
		$this->messageLocalizer = $messageLocalizer;
		$this->userGroupManager = $userGroupManager;
	}

	/**
	 * @note The hook doesn't allow injecting services!
	 * @codeCoverageIgnore
	 * @return self
	 */
	public static function newFromGlobalState(): self {
		return new self(
			// @todo Use a proper MessageLocalizer once available (T247127)
			RequestContext::getMain(),
			MediaWikiServices::getInstance()->getUserGroupManager()
		);
	}

	/**
	 * @codeCoverageIgnore This is tested by installing or updating MediaWiki
	 * @param DatabaseUpdater $updater
	 * @throws MWException
	 */
	public function onLoadExtensionSchemaUpdates( $updater ) {
		global $wgAbuseFilterAflFilterMigrationStage;

		$dbType = $updater->getDB()->getType();
		$dir = __DIR__ . "/../../../db_patches";

		$updater->addExtensionTable(
			'abuse_filter',
			"$dir/$dbType/abusefilter.sql"
		);

		if ( $dbType === 'mysql' || $dbType === 'sqlite' ) {
			$updater->dropExtensionField(
				'abuse_filter_log',
				'afl_log_id',
				"$dir/$dbType/patch-drop_afl_log_id.sql"
			);

			$updater->addExtensionField(
				'abuse_filter_log',
				'afl_filter_id',
				"$dir/$dbType/patch-split-afl_filter.sql"
			);

			if ( $dbType === 'mysql' ) {
				$updater->renameExtensionIndex(
					'abuse_filter_log',
					'wiki_timestamp',
					'afl_wiki_timestamp',
					"$dir/mysql/patch-rename-indexes.sql",
					true
				);
			}
		} elseif ( $dbType === 'postgres' ) {
			$updater->addExtensionUpdate( [
				'dropPgField', 'abuse_filter_log', 'afl_log_id' ] );
			$updater->addExtensionUpdate( [
				'setDefault', 'abuse_filter_log', 'afl_filter', ''
			] );
			$updater->addExtensionUpdate( [
				'addPgField', 'abuse_filter_log', 'afl_global', 'SMALLINT NOT NULL DEFAULT 0'
			] );
			$updater->addExtensionUpdate( [
				'addPgField', 'abuse_filter_log', 'afl_filter_id', 'INTEGER NOT NULL DEFAULT 0'
			] );
			$updater->addExtensionUpdate( [
				'addPgIndex', 'abuse_filter_log', 'abuse_filter_log_filter_timestamp_full',
				'(afl_global, afl_filter_id, afl_timestamp)'
			] );
		}

		$updater->addExtensionUpdate( [ [ $this, 'createAbuseFilterUser' ] ] );
		$updater->addPostDatabaseUpdateMaintenance( NormalizeThrottleParameters::class );
		$updater->addPostDatabaseUpdateMaintenance( FixOldLogEntries::class );
		$updater->addPostDatabaseUpdateMaintenance( UpdateVarDumps::class );
		// The global is not set on install.php
		if (
			isset( $wgAbuseFilterAflFilterMigrationStage ) &&
			( $wgAbuseFilterAflFilterMigrationStage & SCHEMA_COMPAT_WRITE_NEW )
		) {
			$updater->addPostDatabaseUpdateMaintenance( MigrateAflFilter::class );
		}
	}

	/**
	 * Updater callback to create the AbuseFilter user after the user tables have been updated.
	 * @param DatabaseUpdater $updater
	 * @return bool
	 */
	public function createAbuseFilterUser( DatabaseUpdater $updater ): bool {
		$username = $this->messageLocalizer->msg( 'abusefilter-blocker' )->inContentLanguage()->text();
		$user = User::newFromName( $username );

		if ( $user && !$updater->updateRowExists( 'create abusefilter-blocker-user' ) ) {
			$user = User::newSystemUser( $username, [ 'steal' => true ] );
			$updater->insertUpdateRow( 'create abusefilter-blocker-user' );
			// Promote user so it doesn't look too crazy.
			$this->userGroupManager->addUserToGroup( $user, 'sysop' );
			return true;
		}
		return false;
	}
}
