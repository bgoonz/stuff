<?php

use MediaWiki\MediaWikiServices;
use Wikimedia\Rdbms\FakeResultWrapper;
use Wikimedia\Rdbms\IResultWrapper;

/**
 * This class provides some functionality to easily get feedback's activity.
 * Because this data is less often requested & because we're dealing with
 * the default MW logging table (which we can't "just change"), this is a
 * completely different approach than ArticleFeedbackv5Model:
 * - no datamodel/sharded data
 * - few cache
 * - no "lists"
 * - queries, queries, queries
 * - ...
 *
 * @package    ArticleFeedback
 * @author     Matthias Mullie <mmullie@wikimedia.org>
 */
class ArticleFeedbackv5Activity {
	/**
	 * The map of flags to permissions.
	 * If an action is not mentioned here, it is not tied to specific permissions
	 * and everyone is able to perform the action.
	 *
	 * * 'permissions' is the aft permissions (see $wgArticleFeedbackv5Permissions)
	 *   required to be able to flag a certain action and view feedback flagged as such
	 * * 'sentiment' will determine the sentiment the action signifies towards the
	 *   feedback. Possible sentiments: negative, neutral and positive. In the activity
	 *   log, this will display the action as red, gray or green.
	 * * 'log_type' is the value that will be written to logging.log_type. Default
	 *   value should be 'articlefeedbackv5', but other (e.g. suppress for more
	 *   delicate actions) are acceptable.
	 *
	 * @var array
	 */
	public static $actions = [
		'helpful' => [
			'permissions' => 'aft-reader',
			'sentiment' => 'positive',
			'log_type' => 'articlefeedbackv5'
		],
		'undo-helpful' => [
			'permissions' => 'aft-reader',
			'sentiment' => 'neutral',
			'log_type' => 'articlefeedbackv5'
		],
		'unhelpful' => [
			'permissions' => 'aft-reader',
			'sentiment' => 'negative',
			'log_type' => 'articlefeedbackv5'
		],
		'undo-unhelpful' => [
			'permissions' => 'aft-reader',
			'sentiment' => 'neutral',
			'log_type' => 'articlefeedbackv5'
		],
		'flag' => [
			'permissions' => 'aft-reader',
			'sentiment' => 'negative',
			'log_type' => 'articlefeedbackv5'
		],
		'unflag' => [
			'permissions' => 'aft-reader',
			'sentiment' => 'positive',
			'log_type' => 'articlefeedbackv5'
		],
		'autoflag' => [
			'permissions' => 'aft-reader',
			'sentiment' => 'negative',
			'log_type' => 'articlefeedbackv5'
		],
		'clear-flags' => [
			'permissions' => 'aft-reader',
			'sentiment' => 'positive',
			'log_type' => 'articlefeedbackv5'
		],
		'feature' => [
			'permissions' => 'aft-editor',
			'sentiment' => 'positive',
			'log_type' => 'articlefeedbackv5'
		],
		'unfeature' => [
			'permissions' => 'aft-editor',
			'sentiment' => 'negative',
			'log_type' => 'articlefeedbackv5'
		],
		'resolve' => [
			'permissions' => 'aft-editor',
			'sentiment' => 'positive',
			'log_type' => 'articlefeedbackv5'
		],
		'unresolve' => [
			'permissions' => 'aft-editor',
			'sentiment' => 'negative',
			'log_type' => 'articlefeedbackv5'
		],
		'noaction' => [
			'permissions' => 'aft-editor',
			'sentiment' => 'neutral',
			'log_type' => 'articlefeedbackv5'
		],
		'unnoaction' => [
			'permissions' => 'aft-editor',
			'sentiment' => 'neutral',
			'log_type' => 'articlefeedbackv5'
		],
		'inappropriate' => [
			'permissions' => 'aft-editor',
			'sentiment' => 'negative',
			'log_type' => 'articlefeedbackv5'
		],
		'uninappropriate' => [
			'permissions' => 'aft-editor',
			'sentiment' => 'positive',
			'log_type' => 'articlefeedbackv5'
		],
		'archive' => [
			'permissions' => 'aft-editor',
			'sentiment' => 'negative',
			'log_type' => 'articlefeedbackv5'
		],
		'unarchive' => [
			'permissions' => 'aft-editor',
			'sentiment' => 'positive',
			'log_type' => 'articlefeedbackv5'
		],
		'hide' => [
			'permissions' => 'aft-monitor',
			'sentiment' => 'negative',
			'log_type' => 'articlefeedbackv5'
		],
		'unhide' => [
			'permissions' => 'aft-monitor',
			'sentiment' => 'positive',
			'log_type' => 'articlefeedbackv5'
		],
		'autohide' => [
			'permissions' => 'aft-monitor',
			'sentiment' => 'negative',
			'log_type' => 'articlefeedbackv5'
		],
		'request' => [
			'permissions' => 'aft-monitor',
			'sentiment' => 'negative',
			'log_type' => 'suppress'
		],
		'unrequest' => [
			'permissions' => 'aft-monitor',
			'sentiment' => 'positive',
			'log_type' => 'suppress'
		],
		'decline' => [
			'permissions' => 'aft-oversighter',
			'sentiment' => 'positive',
			'log_type' => 'suppress'
		],
		'oversight' => [
			'permissions' => 'aft-oversighter',
			'sentiment' => 'negative',
			'log_type' => 'suppress'
		],
		'unoversight' => [
			'permissions' => 'aft-oversighter',
			'sentiment' => 'positive',
			'log_type' => 'suppress'
		],
	];

	/**
	 * Adds an activity item to the global log under the articlefeedbackv5
	 *
	 * @param string $type The type of activity we'll be logging
	 * @param int $pageId The id of the page so we can look it up
	 * @param int $itemId The id of the feedback item, used to build permalinks
	 * @param string $notes Any notes that were stored with the activity
	 * @param User|int|null $doer User who did the action
	 * @param array $params Array of parameters that can be passed into the msg thing - used for "perpetrator" for log entry
	 * @return int The id of the newly inserted log entry
	 */
	public static function log( $type, $pageId, $itemId, $notes, $doer, array $params = [] ) {
		$logId = ArticleFeedbackv5Log::log( $type, $pageId, $itemId, $notes, $doer, $params );

		if ( $logId !== null ) {
			// update log count in cache
			static::incrementActivityCount( $itemId, $type );

			/*
			 * While we're at it, since activity has occurred, the editor activity
			 * data in cache may be out of date.
			 */

			$cache = MediaWikiServices::getInstance()->getMainWANObjectCache();
			$key = $cache->makeKey( get_called_class(), 'getLastEditorActivity', $itemId );
			$cache->delete( $key );
		}

		return $logId;
	}

	/**
	 * Gets the last $limit of activity rows taken from the log table,
	 * starting from point $continue, sorted by time - latest first
	 *
	 * @param ArticleFeedbackv5Model $feedback Model of the feedback item whose activity we're fetching
	 * @param User $user User object who we're fetching activity for (to check permissions)
	 * @param int $limit total limit number
	 * @param string|null $continue used for offsets
	 * @return IResultWrapper db record rows
	 */
	public static function getList( ArticleFeedbackv5Model $feedback, User $user, $limit = 25, $continue = null ) {
		// build where-clause for actions and feedback
		$actions = self::buildWhereActions( $user->getRights() );
		$title = self::buildWhereFeedback( $feedback );

		// nothing to get? return empty resultset
		if ( !$actions || !$title ) {
			return new FakeResultWrapper( [] );
		}

		$where[] = $actions;
		$where['log_title'] = $title;
		$where['log_namespace'] = NS_SPECIAL;
		$where = self::applyContinue( $continue, $where );

		$commentQuery = CommentStore::getStore()->getJoin( 'log_comment' );
		$actorQuery = ActorMigration::newMigration()->getJoin( 'log_user' );
		$activity = ArticleFeedbackv5Utils::getDB( DB_REPLICA )->select(
			[ 'logging' ] + $commentQuery['tables'] + $actorQuery['tables'],
			[
				'log_id',
				'log_action',
				'log_timestamp',
				'log_title'
			] + $commentQuery['fields'] + $actorQuery['fields'],
			$where,
			__METHOD__,
			[
				'LIMIT' => $limit + 1,
				'ORDER BY' => 'log_timestamp DESC',
			],
			$commentQuery['joins'] + $actorQuery['joins']
		);

		return $activity;
	}

	/**
	 * Returns a timestamp/id tuple for subsequent request continuing from this record
	 *
	 * @param IResultWrapper $row
	 * @return string
	 */
	public static function getContinue( $row ) {
		$ts = wfTimestamp( TS_MW, $row->log_timestamp );
		return "$ts|{$row->log_id}";
	}

	/**
	 * Get (and cache) the counts of activity (that are within the user's permissions)
	 * that has been posted already
	 *
	 * @param ArticleFeedbackv5Model $feedback
	 * @param User $user
	 * @return int
	 */
	public static function getActivityCount( ArticleFeedbackv5Model $feedback, User $user ) {
		global $wgArticleFeedbackv5Permissions;
		$total = 0;

		$cache = MediaWikiServices::getInstance()->getMainWANObjectCache();
		if ( !$user->isBlocked() ) {
			foreach ( $wgArticleFeedbackv5Permissions as $permission ) {
				if ( $user->isAllowed( $permission ) ) {
					// get count for this specific permission level from cache
					$key = $cache->makeKey(
						'articlefeedbackv5-getActivityCount',
						$permission,
						$feedback->aft_id
					);
					$count = $cache->get( $key );

					if ( $count === false ) {
						$count = self::getActivityCountFromDB( $feedback, $permission );
					}

					/*
					 * Save to or extend caching. Set a long expiration (because the
					 * query-alternative is quite expensive) but not forever (once
					 * feedback is dealt with, it won't be accessed again so there's
					 * no point in cluttering memory)
					 */
					$cache->set( $key, $count, 60 * 60 * 24 * 7 );

					$total += $count;
				}
			}
		}

		return $total;
	}

	/**
	 * Because fetching the amount of activity from db is quite expensive, this
	 * method will just increment the data that is in cache already (instead of
	 * purging the cache data to have it re-read from DB, which should be last-resort)
	 *
	 * @param int $feedbackId
	 * @param string $action
	 */
	public static function incrementActivityCount( $feedbackId, $action ) {
		$cache = MediaWikiServices::getInstance()->getMainWANObjectCache();

		// get permission level that should be updated
		$permission = self::$actions[$action]['permissions'];

		$key = $cache->makeKey(
			'articlefeedbackv5-getActivityCount',
			$permission,
			$feedbackId
		);
		$count = $cache->get( $key );

		/*
		 * if the data is not (yet) in cache, don't bother fetching it from db yet,
		 * that'll happen in due time, when it's actually requested
		 */
		if ( $count !== false ) {
			$cache->set( $key, $count + 1, 60 * 60 * 24 * 7 );
		}
	}

	/**
	 * Get amount of activity for a certain feedback post for a certain permission level.
	 * This should not be called directly, as it's a relatively expensive call; the result
	 * should be cached (@see self::getActivityCount)
	 *
	 * @param ArticleFeedbackv5Model $feedback
	 * @param string $permission
	 * @return int
	 * @throws MWException
	 */
	private static function getActivityCountFromDB( ArticleFeedbackv5Model $feedback, $permission ) {
		// build where-clause for actions and feedback
		$actions = self::buildWhereActions( [ $permission ] );
		$title = self::buildWhereFeedback( $feedback );

		// nothing to get? return empty resultset
		if ( !$actions || !$title ) {
			return 0;
		}

		$where[] = $actions;
		$where['log_title'] = $title;
		$where['log_namespace'] = NS_SPECIAL;

		return (int)ArticleFeedbackv5Utils::getDB( DB_REPLICA )->selectField(
			'logging',
			'COUNT(log_id)',
			$where,
			__METHOD__
		);
	}

	/**
	 * Gets the log details of the last action (from the editor toolbox)
	 * taken towards feedback.
	 *
	 * @param array $entries array of feedback to fetch last log entries for; will be
	 *                       in the form of array( array( 'id' => [id], 'shard' => [shard] ), ... )
	 * @return stdClass[] db record rows
	 */
	public static function getLastEditorActivity( array $entries ) {
		$cache = MediaWikiServices::getInstance()->getMainWANObjectCache();
		$dbr = ArticleFeedbackv5Utils::getDB( DB_REPLICA );

		$activity = [];
		$where = [];
		$titles = [];

		// build where-clause for all feedback entries
		foreach ( $entries as $entry ) {
			$feedback = ArticleFeedbackv5Model::get( $entry['id'], $entry['shard'] );
			if ( !$feedback ) {
				continue;
			}

			$key = $cache->makeKey(
				get_called_class(),
				'getLastEditorActivity',
				$feedback->aft_id
			);
			$cachedEntry = $cache->get( $key );
			if ( $cachedEntry !== false ) {
				$activity[$feedback->aft_id] = $cachedEntry;
			} else {
				$actions = [];

				// we know exactly which status entry we want to fetch
				if ( $feedback->isOversighted() ) {
					$actions[] = 'oversight';
				} elseif ( $feedback->isHidden() ) {
					$actions[] = 'hide';
					$actions[] = 'autohide';
				} elseif ( $feedback->isArchived() ) {
					$actions[] = 'archive';
				} elseif ( $feedback->isResolved() ) {
					$actions[] = 'resolve';
				} elseif ( $feedback->isFeatured() ) {
					$actions[] = 'feature';
				} elseif ( $feedback->isNonActionable() ) {
					$actions[] = 'noaction';
				} elseif ( $feedback->isInappropriate() ) {
					$actions[] = 'inappropriate';
				} else {
					continue;
				}

				$actions = self::buildWhereActions( [], $actions );
				if ( $actions ) {
					$title = self::buildWhereFeedback( $feedback );
					$titles[] = $title;
					$where[] = 'log_title = ' . $dbr->addQuotes( $title ) . ' AND ' . $actions;
				}
			}
		}

		// if there are entries not found in cache, fetch them from DB
		if ( $where ) {
			$options = [];

			// specific conditions to find the exact action we're looking for, per page
			$where = [ '(' . implode( ') OR (', $where ) . ')' ];
			$options['GROUP BY'] = [ 'log_namespace', 'log_title' ];

			$where['log_namespace'] = NS_SPECIAL;
			$where['log_title'] = $titles;

			/*
			 * The goal is to fetch only the last (editor) action for every feedback
			 * entry. To achieve this, we'll need to get all most recent ids through
			 * a subquery (the below $ids query), which will then be folded into the
			 * main query that will get all of those last actions' details.
			 */
			$ids = ArticleFeedbackv5Utils::getDB( DB_REPLICA )->selectSQLText(
				[ 'logging' ],
				[ 'last_id' => 'MAX(log_id)' ],
				$where,
				__METHOD__,
				$options
			);

			$commentQuery = CommentStore::getStore()->getJoin( 'log_comment' );
			$actorQuery = ActorMigration::newMigration()->getJoin( 'log_user' );
			$rows = ArticleFeedbackv5Utils::getDB( DB_REPLICA )->select(
				[
					'logging',
					'ids' => "($ids)" // the subquery that will provide the most recent log_id's
				] + $commentQuery['tables'] + $actorQuery['tables'],
				[
					'log_id',
					'log_action',
					'log_timestamp',
					'log_title',
					'log_params',
				] + $commentQuery['fields'] + $actorQuery['fields'],
				[ 'log_id = last_id' ],
				__METHOD__,
				[],
				$commentQuery['joins'] + $actorQuery['joins']
			);

			foreach ( $rows as $action ) {
				// get feedback id from params
				$params = @unserialize( $action->log_params );
				if ( !isset( $params['feedbackId'] ) ) {
					continue;
				}

				// cache, per feedback entry
				$key = $cache->makeKey( get_called_class(), 'getLastEditorActivity', $params['feedbackId'] );
				$cache->set( $key, $action, 60 * 60 );

				$activity[$params['feedbackId']] = $action;
			}
		}

		return $activity;
	}

	/**
	 * Gets timestamp and id pair for continue
	 *
	 * @param string $continue
	 * @param array $where
	 * @return array
	 */
	protected static function applyContinue( $continue, $where ) {
		if ( !$continue ) {
			return $where;
		}

		$values = explode( '|', $continue, 3 );
		if ( count( $values ) !== 2 ) {
			throw new MWException( 'Invalid continue param. You should pass the original value returned by the previous query', 'badcontinue' );
		}

		$db = ArticleFeedbackv5Utils::getDB( DB_REPLICA );
		$ts = $db->addQuotes( $db->timestamp( $values[0] ) );
		$id = intval( $values[1] );
		$where[] = '(log_id = ' . $id . ' AND log_timestamp <= ' . $ts . ') OR log_timestamp < ' . $ts;

		return $where;
	}

	/**
	 * Check if a user has sufficient permissions to perform an action
	 *
	 * @param string $action
	 * @param User $user
	 * @return bool
	 * @throws MWException
	 */
	public static function canPerformAction( $action, User $user ) {
		if ( !isset( self::$actions[$action] ) ) {
			throw new MWException( "Action '$action' does not exist." );
		}

		return $user->isAllowed( self::$actions[$action]['permissions'] ) && !$user->isBlocked();
	}

	/**
	 * Build WHERE conditions for permission-based log actions.
	 *
	 * @param array $permissions The available permissions (empty = all)
	 * @param array $actions The acceptable actions (empty = all)
	 * @return string|bool false will be returned in the event no valid WHERE-clause
	 *                     can be built because of actions are permitted
	 */
	protected static function buildWhereActions( $permissions = [], $actions = [] ) {
		global $wgLogActionsHandlers;

		$dbr = ArticleFeedbackv5Utils::getDB( DB_REPLICA );

		$where = [];
		foreach ( self::$actions as $action => $options ) {
			if (
				// check if permissions match; if none provided, all are acceptable
				$permissions && !in_array( $options['permissions'], $permissions ) ||
				// check if action matches; if none provided, all are acceptable
				$actions && !in_array( $action, $actions )
			) {
				continue;
			}

			if ( isset( $wgLogActionsHandlers["suppress/$action"] ) ) {
				$type = 'suppress';
			} elseif ( isset( $wgLogActionsHandlers["articlefeedbackv5/$action"] ) ) {
				$type = 'articlefeedbackv5';
			} else {
				continue;
			}
			$where[] = 'log_type = ' . $dbr->addQuotes( $type ) . ' AND log_action = ' . $dbr->addQuotes( $action );
		}

		// if no valid actions were found, return
		if ( !$where ) {
			return false;
		}

		return '(' . implode( ') OR (', $where ) . ')';
	}

	/**
	 * Build WHERE conditions for (a) specific feedback entr(y|ies)' log entries.
	 *
	 * @param ArticleFeedbackv5Model $feedback The feedback to fetch log entries for
	 * @return string|bool false will be returned in the event no valid WHERE-clause
	 *                     can be built because no feedback is found
	 */
	protected static function buildWhereFeedback( ArticleFeedbackv5Model $feedback ) {
		// build title(s) to fetch log entries for
		$feedbackId = $feedback->aft_id;
		$page = Title::newFromID( $feedback->aft_page );
		if ( !$page ) {
			return false;
		}
		$title = $page->getPrefixedDBkey();

		return SpecialPage::getTitleFor( 'ArticleFeedbackv5', "$title/$feedbackId" )->getDBkey();
	}
}
