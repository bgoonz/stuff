<?php

/**
 * DataModelPurgeClass is a good starting point to purge all caches;
 * extend that class and add some more caches to be clear here.
 */

use MediaWiki\MediaWikiServices;

$maintClassOverride = true;
require_once __DIR__ . '/../data/maintenance/DataModelPurgeCache.php';

/**
 * This will purge all ArticleFeedbackv5 caches.
 *
 * @ingroup Maintenance
 */
class ArticleFeedbackv5_PurgeCache extends DataModelPurgeCache {
	/**
	 * Constructor
	 */
	public function __construct() {
		parent::__construct();
		$this->deleteOption( 'model' );
		$this->addDescription( 'Purge all ArticleFeedbackv5 caches.' );

		$this->requireExtension( 'Article Feedback' );
	}

	/**
	 * @return string
	 */
	public function getClass() {
		return 'ArticleFeedbackv5Model';
	}

	/**
	 * Execute the script
	 */
	public function execute() {
		parent::execute();

		// clear max user id

		$cache = MediaWikiServices::getInstance()->getMainWANObjectCache();
		$cache->delete( $cache->makeKey( 'articlefeedbackv5', 'maxUserId' ) );
	}

	/**
	 * Per-object cache removal
	 *
	 * @param ArticleFeedbackv5Model $object The object
	 */
	public function purgeObject( DataModel $object ) {
		parent::purgeObject( $object );

		$cache = MediaWikiServices::getInstance()->getMainWANObjectCache();

		// feedback activity count per permission
		global $wgArticleFeedbackv5Permissions;
		foreach ( $wgArticleFeedbackv5Permissions as $permission ) {
			$key = $cache->makeKey(
				'articlefeedbackv5-getActivityCount',
				$permission,
				$object->aft_id
			);
			$cache->delete( $key );
		}

		// feedback last editor activity
		$key = $cache->makeKey(
			'ArticleFeedbackv5Activity-getLastEditorActivity',
			$object->aft_id
		);
		$cache->delete( $key );
	}

	/**
	 * Per-shard cache removal
	 *
	 * @param mixed $shard The shard column's value
	 */
	public function purgeShard( $shard ) {
		parent::purgeShard( $shard );

		$class = $this->getClass();

		// clear page found percentage

		$cache = MediaWikiServices::getInstance()->getMainWANObjectCache();
		$key = $cache->makeKey( $class, 'getCountFound', $shard );
		$class::getCache()->delete( $key );
	}
}

$maintClass = 'ArticleFeedbackv5_PurgeCache';
require_once RUN_MAINTENANCE_IF_MAIN;
