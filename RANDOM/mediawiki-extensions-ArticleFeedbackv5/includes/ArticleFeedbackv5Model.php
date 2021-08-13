<?php

use MediaWiki\MediaWikiServices;
use MediaWiki\Revision\RevisionRecord;

/**
 * This class represents a feedback entry, which can be backed by
 * a sharded database setup and heavy cache usage.
 *
 * @package    ArticleFeedback
 * @author     Matthias Mullie <mmullie@wikimedia.org>
 */
class ArticleFeedbackv5Model extends DataModel {
	/**
	 * These are the exact columns a feedback entry consists of in the DB
	 *
	 * @var int|null
	 */
	public $aft_id;
	/** @var int|null */
	public $aft_page;
	/** @var int|null */
	public $aft_page_revision;
	/** @var int|null */
	public $aft_user;
	/** @var string|null */
	public $aft_user_text;
	/** @var string|null */
	public $aft_user_token;
	/** @var int|null */
	public $aft_claimed_user;
	/** @var int|null */
	public $aft_form;
	/** @var int|null */
	public $aft_cta;
	/** @var int|null */
	public $aft_link;
	/** @var bool|null */
	public $aft_rating;
	/** @var string|null */
	public $aft_comment;
	/** @var string|null */
	public $aft_timestamp;
	/** @var string|null will hold the date after which an entry may be archived */
	public $aft_archive_date;
	/** @var string|null will hold info if discussion about the feedback has been started on user or article talk page */
	public $aft_discuss;
	/** @var int denormalized status indicators for actions of which real records are in logging table */
	public $aft_oversight = 0;
	/** @var int */
	public $aft_decline = 0;
	/** @var int */
	public $aft_request = 0;
	/** @var int */
	public $aft_hide = 0;
	/** @var int */
	public $aft_autohide = 0;
	/** @var int */
	public $aft_flag = 0;
	/** @var int */
	public $aft_autoflag = 0;
	/** @var int */
	public $aft_feature = 0;
	/** @var int */
	public $aft_resolve = 0;
	/** @var int */
	public $aft_noaction = 0;
	/** @var int */
	public $aft_inappropriate = 0;
	/** @var int */
	public $aft_archive = 0;
	/** @var int */
	public $aft_helpful = 0;
	/** @var int */
	public $aft_unhelpful = 0;
	/** @var int|null even more denormalized stuff, allowing easy DB-indexing sort columns */
	public $aft_has_comment;
	/** @var int */
	public $aft_net_helpful = 0;
	/** @var int */
	public $aft_relevance_score = 0;

	/**
	 * Database table to hold the data
	 *
	 * @var string
	 */
	protected static $table = 'aft_feedback';

	/**
	 * Name of column to act as unique id
	 *
	 * @var string
	 */
	protected static $idColumn = 'aft_id';

	/**
	 * Name of column to shard data over
	 *
	 * @var string
	 */
	protected static $shardColumn = 'aft_page';

	/**
	 * Pagination limit: how many entries should be fetched at once for lists
	 *
	 * @var int
	 */
	public const LIST_LIMIT = 50;

	/**
	 * All lists the data can be displayed as
	 *
	 * @var array
	 */
	public static $lists = [
		// no-one should see this list, we'll use it to keep count of all articles ;)
		'*' => [
			'permissions' => 'aft-noone',
			'conditions' => [],
		],
		'has_comment' => [
			'permissions' => 'aft-noone',
			'conditions' => [ 'aft_has_comment = 1' ],
		],

		// reader lists
		'featured' => [
			'permissions' => 'aft-reader',
			'conditions' => [ 'aft_has_comment = 1', 'aft_oversight = 0', 'aft_archive = 0',
				'aft_hide = 0', 'aft_resolve = 0', 'aft_noaction = 0', 'aft_inappropriate = 0',
				'aft_net_helpful > 0 OR aft_feature = 1' ],
		],
		'unreviewed' => [
			'permissions' => 'aft-reader',
			'conditions' => [ 'aft_has_comment = 1', 'aft_oversight = 0', 'aft_archive = 0',
				'aft_hide = 0', 'aft_feature = 0', 'aft_resolve = 0', 'aft_noaction = 0',
				'aft_inappropriate = 0' ],
		],

		// editor lists
		'helpful' => [
			'permissions' => 'aft-editor',
			'conditions' => [ 'aft_has_comment = 1', 'aft_oversight = 0', 'aft_archive = 0', 'aft_hide = 0', 'aft_net_helpful > 0' ],
		],
		'unhelpful' => [
			'permissions' => 'aft-editor',
			'conditions' => [ 'aft_has_comment = 1', 'aft_oversight = 0', 'aft_archive = 0', 'aft_hide = 0', 'aft_net_helpful < 0' ],
		],
		'flagged' => [
			'permissions' => 'aft-editor',
			'conditions' => [ 'aft_has_comment = 1', 'aft_oversight = 0', 'aft_archive = 0', 'aft_hide = 0', 'aft_flag > 0' ],
		],
		'useful' => [
			'permissions' => 'aft-editor',
			'conditions' => [ 'aft_has_comment = 1', 'aft_oversight = 0', 'aft_archive = 0', 'aft_hide = 0', 'aft_feature = 1' ],
		],
		'resolved' => [
			'permissions' => 'aft-editor',
			'conditions' => [ 'aft_has_comment = 1', 'aft_oversight = 0', 'aft_archive = 0', 'aft_hide = 0', 'aft_resolve = 1' ],
		],
		'noaction' => [
			'permissions' => 'aft-editor',
			'conditions' => [ 'aft_has_comment = 1', 'aft_oversight = 0', 'aft_archive = 0', 'aft_hide = 0', 'aft_noaction = 1' ],
		],
		'inappropriate' => [
			'permissions' => 'aft-editor',
			'conditions' => [ 'aft_has_comment = 1', 'aft_oversight = 0', 'aft_archive = 0', 'aft_hide = 0', 'aft_inappropriate = 1' ],
		],
		'archived' => [
			'permissions' => 'aft-reader',
			'conditions' => [ 'aft_has_comment = 1', 'aft_oversight = 0', 'aft_archive = 1' ],
		],
		'allcomment' => [
			'permissions' => 'aft-editor',
			'conditions' => [ 'aft_has_comment = 1', 'aft_oversight = 0', 'aft_hide = 0' ],
		],

		// monitor lists
		'hidden' => [
			'permissions' => 'aft-monitor',
			'conditions' => [ 'aft_has_comment = 1', 'aft_oversight = 0', 'aft_hide = 1' ],
		],
		'requested' => [
			'permissions' => 'aft-monitor',
			'conditions' => [ 'aft_has_comment = 1', 'aft_oversight = 0', 'aft_request = 1' ],
		],
		'declined' => [
			'permissions' => 'aft-oversighter',
			'conditions' => [ 'aft_has_comment = 1', 'aft_oversight = 0', 'aft_request = 1', 'aft_decline = 1' ],
		],

		// oversighter lists
		'oversighted' => [
			'permissions' => 'aft-oversighter',
			'conditions' => [ 'aft_has_comment = 1', 'aft_oversight = 1' ],
		],
		'all' => [
			'permissions' => 'aft-oversighter',
			'conditions' => [],
		]
	];

	/**
	 * Available sorts to order the data
	 *
	 * Key is the sort name, the value is the condition for the ORDER BY clause.
	 *
	 * When creating indexes on the database, create a compound index for each of
	 * the sort-columns, along with the id column.
	 *
	 * @var array
	 */
	public static $sorts = [
		'relevance' => 'aft_relevance_score',
		'age' => 'aft_timestamp',
		'helpful' => 'aft_net_helpful'
	];

	/**
	 * Get the backend object that'll store the data for real.
	 *
	 * @return DataModelBackend
	 */
	public static function getBackend() {
		if ( self::$backend === null ) {
			global $wgArticleFeedbackv5BackendClass;
			self::$backend = new $wgArticleFeedbackv5BackendClass( get_called_class(), static::getTable(), static::getIdColumn(), static::getShardColumn() );
		}

		return self::$backend;
	}

	/**
	 * Update the amount of people who marked "yes" to the question if they
	 * found what they were looking for.
	 * Votes for feedback marked as inappropriate/hidden/oversighted are disregarded.
	 */
	public function updateCountFound() {
		$wanCache = static::getCache();

		foreach ( [ $this->{self::getShardColumn()}, null ] as $shard ) {
			$key = $wanCache->makeKey( get_called_class() . '-getCountFound', $shard );
			$wanCache->touchCheckKey( $key );
		}
	}

	/**
	 * Get the percentage of people who marked "yes" to the question if they
	 * found what the were looking for.
	 * Votes for feedback marked as inappropriate/hidden/oversighted are
	 * disregarded, so make sure to ignore these too when calculating the
	 * percentage.
	 *
	 * @param int|null $pageId [optional] The page ID
	 * @return float
	 */
	public static function getCountFound( $pageId = null ) {
		$wanCache = static::getCache();

		$key = $wanCache->makeKey( get_called_class(), 'getCountFound', $pageId );

		return $wanCache->getWithSetCallback(
			$key,
			$wanCache::TTL_WEEK,
			function () use ( $pageId ) {
				return static::getBackend()->getCountFound( $pageId );
			},
			[
				// Avoid cache stampedes on invalidations
				'checkKeys' => [ $key ],
				'lockTSE' => 30
			]
		);
	}

	/**
	 * Get a user's AFT-contributions to add to the My Contributions special page
	 *
	 * @param ContribsPager $pager object hooked into
	 * @param string $offset index offset, inclusive
	 * @param int $limit exact query limit
	 * @param bool $descending query direction, false for ascending, true for descending
	 * @param array $userIds array of user_ids whose data is to be selected
	 * @return \Wikimedia\Rdbms\IResultWrapper
	 */
	public static function getContributionsData( $pager, $offset, $limit, $descending, $userIds = [] ) {
		return static::getBackend()->getContributionsData( $pager, $offset, $limit, $descending, $userIds );
	}

	/**
	 * Get watchlist list, based on user ID rather than page id ($shard)
	 *
	 * @param string $name The list name (see static::$lists)
	 * @param User $user The user who'se watchlisted feedback to fetch
	 * @param User $performer The acting user
	 * @param int|null $offset The offset to start from
	 * @param string $sort Sort to apply to list
	 * @param string $order Sort the list ASC or DESC
	 * @return DataModelList
	 */
	public static function getWatchlistList( $name, User $user, User $performer, $offset = null, $sort = 'relevance', $order = 'ASC' ) {
		/*
		 * Get array of page ids
		 *
		 * Note: even though the watchlist stuff is not up to par with other lists
		 * (because we can't properly shard and cache it), all code should still scale
		 * though.
		 * This line however does not scale: in theory, it's possible that the amount
		 * of article data grows too large to fit the machine's memory. This will most
		 * likely never happen though - and we just have to wish it won't, since there
		 * is not other way: both the feedback entries and the lists are sharded, so we
		 * can't perform a joined query ;)
		 */
		$articles = wfGetDB( DB_REPLICA )->select(
			[ 'watchlist', 'page' ],
			[ 'page_id' ],
			[ 'wl_user' => $user->getId() ],
			__METHOD__,
			[],
			[
				'page' => [
					'INNER JOIN',
					[
						'page_namespace = wl_namespace',
						'page_title = wl_title'
					]
				]
			]
		);

		$shards = [];
		foreach ( $articles as $article ) {
			$shards[] = $article->page_id;
		}

		return static::getList( $name, $performer, $shards, $offset, $sort, $order );
	}

	/**
	 * This is a workaround for watchlist-stuff. People's watchlist can change
	 * all the time and it makes not sense to cache the results for a watchlist.
	 * Instead of attempting to fetch feedback on someone's watchlisted pages
	 * ($shard will be an array of page id's in this case) from cache, get it
	 * straight from the DB - we've got an index on this table, and all filter
	 * results are on 1 partition, so this is quite an inexpensive query.
	 * The more expensive part is that the feedback itself for these different
	 * pages might/will be sharded over multiple partitions. Given that a watchlist
	 * is different per user, and it may change any given time, there is no way
	 * we can distribute the feedback over partitions in a way that is optimized
	 * for watchlists. Let's hope that most of that data will be in cache, or
	 * it might take a bit longer to present the result, because we'll be
	 * querying multiple partitions.
	 *
	 * @param string $name The list name (see static::$lists)
	 * @param array $shard Get only data for certain shard values
	 * @param User $user
	 * @param int|null $offset The offset to start from
	 * @param string $sort Sort to apply to list
	 * @param string $order Sort the list ASC or DESC
	 * @return DataModelList
	 */
	protected static function getListArray( $name, array $shard, User $user, $offset = null, $sort = 'relevance', $order = 'ASC' ) {
		// fetch data from db
		$rows = static::getBackend()->getList( $name, $shard, $offset, static::LIST_LIMIT, $sort, $order );

		$entries = [];
		foreach ( $rows as $row ) {
			// pre-cache entries
			$entry = static::loadFromRow( $row );
			$entry->cache();

			// build list of id's
			$entries[] = [
				'id' => $entry->{static::getIdColumn()},
				'shard' => $entry->{static::getShardColumn()},
				'offset' => ( isset( $row->offset_value ) ? $row->offset_value . '|' : '' ) . $entry->{static::getIdColumn()}
			];
		}

		$list = new DataModelList( $entries, get_called_class(), $user );

		return $list;
	}

	/**
	 * Validate the entry's data
	 *
	 * @return DataModel
	 */
	public function validate() {
		// when running unittests, ignore this
		if ( defined( 'MW_PHPUNIT_TEST' ) && MW_PHPUNIT_TEST ) {
			return $this;
		}

		global $wgArticleFeedbackv5MaxCommentLength;

		if ( !$this->getArticle() ) {
			throw new MWException( "Invalid page id '$this->aft_page'." );
		}

		if ( !$this->getRevision() ) {
			throw new MWException( "Invalid revision id '$this->aft_page_revision'." );
		}

		if ( $this->aft_user != 0 && !$this->getUser() ) {
			throw new MWException( "Invalid user id '$this->aft_user' or name '$this->aft_user_text'." );
		}

		global $wgArticleFeedbackv5DisplayBuckets;
		if ( !isset( $wgArticleFeedbackv5DisplayBuckets['buckets'][$this->aft_form] ) ) {
			throw new MWException( "Invalid form id '$this->aft_form'." );
		}

		global $wgArticleFeedbackv5CTABuckets;
		if ( !isset( $wgArticleFeedbackv5CTABuckets['buckets'][$this->aft_cta] ) ) {
			throw new MWException( "Invalid cta id '$this->aft_cta'." );
		}

		global $wgArticleFeedbackv5LinkBuckets;
		if ( !isset( $wgArticleFeedbackv5LinkBuckets['buckets'][$this->aft_link] ) ) {
			throw new MWException( "Invalid link id '$this->aft_link'." );
		}

		if ( !in_array( $this->aft_rating, [ 0, 1 ] ) ) {
			throw new MWException( "Invalid rating '$this->aft_rating'." );
		}

		if ( $wgArticleFeedbackv5MaxCommentLength > 0
			&& strlen( $this->aft_comment ) > $wgArticleFeedbackv5MaxCommentLength
		) {
			throw new MWException( "Comment length exceeds the maximum of '$wgArticleFeedbackv5MaxCommentLength'." );
		}

		if ( $this->aft_discuss && !in_array( $this->aft_discuss, [ 'talk', 'user' ] ) ) {
			throw new MWException( "Invalid discuss type '$this->aft_discuss'." );
		}

		return parent::validate();
	}

	/**
	 * @inheritDoc
	 */
	public static function getList( $name, User $user, $shard = null, $offset = null, $sort = 'relevance', $order = 'ASC' ) {
		if ( isset( self::$lists[$name] ) && !$user->isAllowed( self::$lists[$name]['permissions'] ) ) {
			throw new MWException( "List '$name' is not allowed for this user" );
		}

		// watchlist workaround
		if ( is_array( $shard ) ) {
			return static::getListArray( $name, $shard, $user, $offset, $sort, $order );
		}

		return parent::getList( $name, $user, $shard, $offset, $sort, $order );
	}

	/**
	 * Insert entry into the DB (& cache)
	 *
	 * @param bool $validate True if data should be validated
	 * @return DataModel
	 * @throws MWException
	 */
	public function insert( $validate = true ) {
		// if no creation timestamp is entered yet, fill it out
		if ( $this->aft_timestamp === null ) {
			$this->aft_timestamp = wfTimestampNow();
		}

		$this->aft_net_helpful = $this->aft_helpful - $this->aft_unhelpful;
		$this->aft_relevance_score = $this->getRelevanceScore();
		$this->aft_has_comment = (bool)$this->aft_comment;
		$this->aft_archive_date = $this->getArchiveDate();
		$this->updateCountFound();

		return parent::insert( $validate );
	}

	/**
	 * Update entry in the DB (& cache)
	 *
	 * @param bool $validate True if data should be validated
	 * @return DataModel
	 * @throws MWException
	 */
	public function update( $validate = true ) {
		$this->aft_net_helpful = $this->aft_helpful - $this->aft_unhelpful;
		$this->aft_relevance_score = $this->getRelevanceScore();
		$this->aft_has_comment = (bool)$this->aft_comment;
		$this->aft_archive_date = $this->getArchiveDate();
		$this->updateCountFound();

		return parent::update( $validate );
	}

	/**
	 * Populate object's properties with database (ResultWrapper) data.
	 *
	 * Assume that object properties & db columns are an exact match;
	 * if not, the extending class can extend this method.
	 *
	 * @param stdClass $row The db row
	 * @return DataModel
	 */
	public function toObject( stdClass $row ) {
		parent::toObject( $row );

		/*
		 * ID is saved as binary(32), but all older id values will remain
		 * unchanged, which will result in MySQL padding them to 32 length
		 * with null-bytes. We obviously want to strip these.
		 */
		$this->{static::getIdColumn()} = trim( $this->{static::getIdColumn()}, chr( 0 ) );

		return $this;
	}

	/**
	 * Will fetch a couple of items (from DB) and cache them.
	 *
	 * Fetching & caching as much as (useful) entries as possible will result
	 * in more efficient (fewer) queries to the backend.
	 *
	 * @param array $entries Array of items to be preloaded, in [id] => [shard] format
	 * @param User $user Acting user
	 */
	public static function preload( array $entries, User $user ) {
		parent::preload( $entries, $user );

		// when running unittests, ignore this
		if ( defined( 'MW_PHPUNIT_TEST' ) && MW_PHPUNIT_TEST ) {
			return;
		}

		/*
		 * Only editors will have the detailed toolbox, so only for editors,
		 * we'll need to know the details of the last editor activity.
		 * Readers will almost never need these details (apart from when
		 * visiting the permalink of a hidden post, in which case the mask
		 * will display details of when the post was hidden), so abstain
		 * from preloading this data.
		 */
		if ( $user->isAllowed( 'aft-editor' ) ) {
			// load editor activity for all requested entries
			ArticleFeedbackv5Activity::getLastEditorActivity( $entries );
		}
	}

	/**
	 * Get a list's conditions.
	 *
	 * @param string $name
	 * @return array
	 * @throws MWException
	 */
	public static function getListConditions( $name ) {
		if ( !isset( static::$lists[$name] ) ) {
			throw new MWException( "List '$name' is no known list" );
		}

		return isset( static::$lists[$name]['conditions'] ) ? static::$lists[$name]['conditions'] : [];
	}

	/**
	 * Calculate the relevance score based on the actions performed
	 *
	 * @return int
	 */
	public function getRelevanceScore() {
		global $wgArticleFeedbackv5RelevanceScoring;

		$total = 0;
		foreach ( $wgArticleFeedbackv5RelevanceScoring as $action => $score ) {
			if ( isset( $this->{"aft_$action"} ) ) {
				$total += $score * $this->{"aft_$action"};
			}
		}

		return $total;
	}

	/**
	 * Returns the archive date (if any)
	 *
	 * If there's a positive relevance score, the article can be
	 * considered useful and should not be auto-archived.
	 * Only set archive date if none is set already; otherwise
	 * leave the old date be
	 *
	 * @return mixed string with timestamp or null if no archive date
	 */
	public function getArchiveDate() {
		if ( $this->isFeatured() || $this->isResolved() || $this->isNonActionable() || $this->isHidden() ) {
			return null;
		} elseif ( !$this->aft_archive_date ) {
			global $wgArticleFeedbackv5AutoArchiveTtl;
			$wgArticleFeedbackv5AutoArchiveTtl = (array)$wgArticleFeedbackv5AutoArchiveTtl;
			$ttl = '+5 years';

			// ttl is set per x amount of unreviewed comments
			$count = static::getCount( 'unreviewed', $this->aft_page );

			ksort( $wgArticleFeedbackv5AutoArchiveTtl );
			foreach ( $wgArticleFeedbackv5AutoArchiveTtl as $amount => $time ) {
				if ( $amount <= $count ) {
					$ttl = $time;
				} else {
					break;
				}
			}

			$ttl = strtotime( $ttl ) - time();

			// convert creation timestamp to unix
			$creation = wfTimestamp( TS_UNIX, $this->aft_timestamp );

			// add ttl to creation timestamp and return in mediawiki timestamp format
			return wfTimestamp( TS_MW, $creation + $ttl );
		} else {
			return $this->aft_archive_date;
		}
	}

	/**
	 * @return string
	 */
	public function getExperiment() {
		return $this->aft_form . $this->aft_link;
	}

	/**
	 * Get article object for this entry
	 *
	 * @return Article|null Article object or null if invalid page
	 */
	public function getArticle() {
		return Article::newFromID( $this->aft_page );
	}

	/**
	 * Get the revision for this entry
	 *
	 * @return RevisionRecord|null RevisionRecord object or null if invalid revision
	 */
	private function getRevision() {
		return MediaWikiServices::getInstance()
			->getRevisionLookup()
			->getRevisionById( $this->aft_page_revision );
	}

	/**
	 * Get user object for this entry
	 *
	 * @return User|bool User object or false if invalid user
	 */
	public function getUser() {
		if ( $this->aft_user ) {
			return User::newFromId( $this->aft_user );
		} else {
			return User::newFromName( $this->aft_user_text );
		}
	}

	/**
	 * ACTIONS-RELATED
	 */

	/**
	 * Get an entry's last editor activity
	 *
	 * @return stdClass|null
	 */
	public function getLastEditorActivity() {
		$activity = false;

		$activities = ArticleFeedbackv5Activity::getLastEditorActivity( [ [ 'id' => $this->{static::getIdColumn()}, 'shard' => $this->{static::getShardColumn()} ] ] );
		foreach ( $activities as $activity ) {
			break;
		}

		return $activity;
	}

	/**
	 * @return bool
	 */
	public function isFlagged() {
		return $this->aft_flag + $this->aft_autoflag > 0;
	}

	/**
	 * @return bool
	 */
	public function isFeatured() {
		return (bool)$this->aft_feature;
	}

	/**
	 * @return bool
	 */
	public function isResolved() {
		return (bool)$this->aft_resolve;
	}

	/**
	 * @return bool
	 */
	public function isNonActionable() {
		return (bool)$this->aft_noaction;
	}

	/**
	 * @return bool
	 */
	public function isInappropriate() {
		return (bool)$this->aft_inappropriate;
	}

	/**
	 * @return bool
	 */
	public function isArchived() {
		return (bool)$this->aft_archive;
	}

	/**
	 * @return bool
	 */
	public function isHidden() {
		return (bool)$this->aft_hide;
	}

	/**
	 * @return bool
	 */
	public function isRequested() {
		return $this->aft_request && !$this->isDeclined();
	}

	/**
	 * @return bool
	 */
	public function isDeclined() {
		return (bool)$this->aft_decline;
	}

	/**
	 * @return bool
	 */
	public function isOversighted() {
		return (bool)$this->aft_oversight;
	}
}
