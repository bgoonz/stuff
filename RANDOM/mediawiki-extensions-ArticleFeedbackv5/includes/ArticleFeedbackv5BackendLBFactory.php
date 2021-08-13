<?php
/**
 * AFTv5-specific implementation to power DataModel, allowing AFTv5 to be
 * put on a separate cluster.
 *
 * This class will connect to a single database setup with primary/replicas
 * architecture.
 *
 * @author     Matthias Mullie <mmullie@wikimedia.org>
 */

use MediaWiki\MediaWikiServices;

class ArticleFeedbackv5BackendLBFactory extends DataModelBackendLBFactory {
	/**
	 * Override getLB so that AFT's data can be on a separate cluster.
	 *
	 * @param string|false $wiki
	 * @return \Wikimedia\Rdbms\LoadBalancer
	 */
	public function getLB( $wiki = false ) {
		global $wgArticleFeedbackv5Cluster;

		// connect to external, aft-specific, cluster
		if ( $wgArticleFeedbackv5Cluster ) {
			return MediaWikiServices::getInstance()->getDBLoadBalancerFactory()->getExternalLB( $wgArticleFeedbackv5Cluster, $wiki );
		} else {
			return parent::getLB( $wiki );
		}
	}

	/**
	 * Query to fetch entries from DB.
	 *
	 * @param mixed|null $id The id(s) to fetch, either a single id or an array of them
	 * @param mixed|null $shard The corresponding shard value(s)
	 * @return \Wikimedia\Rdbms\IResultWrapper
	 */
	public function get( $id = null, $shard = null ) {
		$ids = null;
		if ( $id != null ) {
			$ids = (array)$id;
			$ids = array_map( [ $this, 'standardizeId' ], $ids );
		}

		return parent::get( $ids, $shard );
	}

	/**
	 * Update entry.
	 *
	 * @param DataModel $entry
	 * @return int
	 */
	public function update( DataModel $entry ) {
		/*
		 * The clone will make sure it's no longer the same object referenced
		 * inside DataModel.
		 */
		$entry = clone $entry;
		$entry->{$this->idColumn} = $this->standardizeId( $entry->{$this->idColumn} );

		return parent::update( $entry );
	}

	/**
	 * Delete entry.
	 *
	 * @param DataModel $entry
	 * @return int
	 */
	public function delete( DataModel $entry ) {
		/*
		 * The clone will make sure it's no longer the same object referenced
		 * inside DataModel.
		 */
		$entry = clone $entry;
		$entry->{$this->idColumn} = $this->standardizeId( $entry->{$this->idColumn} );

		return parent::delete( $entry );
	}

	/**
	 * Evaluate an entry to possible conditions.
	 *
	 * Before updating data, DataModel will want to re-evaluate en entry to
	 * all possible conditions, to know which caches need to be purged/updated.
	 *
	 * @param DataModel $entry
	 * @return \Wikimedia\Rdbms\IResultWrapper
	 */
	public function evaluateConditions( DataModel $entry ) {
		/*
		 * The clone will make sure it's no longer the same object referenced
		 * inside DataModel.
		 */
		$entry = clone $entry;
		$entry->{$this->idColumn} = $this->standardizeId( $entry->{$this->idColumn} );

		return parent::evaluateConditions( $entry );
	}

	/**
	 * For a given list name, this will fetch the list's conditions.
	 *
	 * @param string $name The list name (see <datamodel>::$lists)
	 * @return string
	 */
	public function getConditions( $name ) {
		$class = $this->datamodel;

		$conditions = [];
		if ( isset( $class::$lists[$name]['conditions'] ) ) {
			$conditions = $class::$lists[$name]['conditions'];
		}

		if ( empty( $conditions ) ) {
			$conditions = [];
		}

		return $conditions;
	}

	/**
	 * Get the amount of people who marked "yes" to the question if they
	 * found what the were looking for.
	 * Votes for feedback marked as inappropriate/hidden/oversighted are disregarded.
	 *
	 * This is quite an expensive function, whose result should be cached.
	 *
	 * @param int|null $pageId [optional] The page ID
	 * @return int
	 */
	public function getCountFound( $pageId = null ) {
		// build where condition
		$where = [];
		$where['aft_rating'] = 1;
		if ( $pageId !== null ) {
			$where['aft_page'] = $pageId;
		}

		// ignore feedback marked as inappropriate
		$where['aft_inappropriate'] = 0;
		$where['aft_hide'] = 0;
		$where['aft_oversight'] = 0;

		return (int)$this->getDB( DB_REPLICA )->selectField(
			$this->table,
			[ 'COUNT(*)' ],
			$where,
			__METHOD__,
			[]
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
	public function getContributionsData( $pager, $offset, $limit, $descending, $userIds = [] ) {
		$tables[] = 'aft_feedback';

		$fields[] = 'aft_id';
		$fields[] = 'aft_page';
		$fields[] = '"AFT" AS aft_contribution';
		$fields[] = 'aft_timestamp AS ' . $pager->getIndexField(); // used for navbar

		$uid = User::idFromName( $pager->getTarget() );
		if ( $uid ) {
			$conds['aft_user'] = $uid;
		} else {
			$conds['aft_user'] = 0;
			$conds['aft_user_text'] = $pager->getTarget();
		}

		if ( $offset ) {
			$operator = $descending ? '>' : '<';
			$conds[] = "aft_timestamp $operator " . $pager->getDatabase()->addQuotes( $offset );
		}

		$order = $descending ? 'ASC' : 'DESC'; // something's wrong with $descending - see logic applied in includes/Pager.php
		$options['ORDER BY'] = [ $pager->getIndexField() . " $order" ];
		$options['LIMIT'] = $limit;

		return $this->getDB( DB_REPLICA )->select( $tables, $fields, $conds, __METHOD__, $options, [] );
	}

	/**
	 * ID is saved as binary(32), but all older id values (of feedback
	 * prior to major code refactor, that have been migrated) will
	 * remain unchanged, which will result in MySQL padding them to 32
	 * length with null-bytes. Make sure out values are re-padded to
	 * 32 characters before looking for them in the database.
	 *
	 * @param string $id The id
	 * @return string
	 */
	protected function standardizeId( $id ) {
		return str_pad( $id, 32, chr( 0 ) );
	}
}
