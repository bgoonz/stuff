<?php
/**
 * "wfGetDB" implementation to power DataModel.
 *
 * This class connects to a single database setup with primary/replicas
 * architecture.
 *
 * @author     Matthias Mullie <mmullie@wikimedia.org>
 */

use MediaWiki\MediaWikiServices;

class DataModelBackendLBFactory extends DataModelBackend {
	/**
	 * @var array [bool]
	 */
	protected static $written = [];

	/**
	 * @param string|bool $wiki The wiki ID, or false for the current wiki
	 * @return \Wikimedia\Rdbms\LoadBalancer
	 */
	public function getLB( $wiki = false ) {
		return MediaWikiServices::getInstance()->getDBLoadBalancerFactory()->getMainLB( $wiki );
	}

	/**
	 * Wrapper function for wfGetDB.
	 *
	 * @param int $db Index of the connection to get. May be DB_PRIMARY for the
	 *            primary database (for write queries), DB_REPLICA for potentially lagged read
	 *            queries, or an integer >= 0 for a particular server.
	 * @param string|array $groups Query groups. An array of group names that this query
	 *                belongs to. May contain a single string if the query is only
	 *                in one group.
	 * @param string|bool $wiki The wiki ID, or false for the current wiki
	 * @return \Wikimedia\Rdbms\IDatabase
	 */
	public function getDB( $db, $groups = [], $wiki = false ) {
		/*
		 * Since we'll save a flag to indicate if a certain wiki has been written
		 * to, we'll want to be certain that this data is accurate, and we don't
		 * want a lower-down function to determine that false will result in
		 * wfWikiID().
		 * Let's make sure that false also translates to a literal wiki name (e.g.
		 * "enwiki", or whatever wfWikiID() results in); this way, if we access 2
		 * the same wiki in 2 different ways, we'll still know for sure if data
		 * has been written to that database already.
		 */
		$wikiId = ( $wiki === false ) ? wfWikiID() : $wiki;

		$lb = $this->getLB( $wiki );

		if ( $db === DB_PRIMARY ) {
			// mark that we're writing data
			static::$written[$wikiId] = true;
		} elseif ( isset( static::$written[$wikiId] ) && static::$written[$wikiId] ) {
			if ( $db === DB_REPLICA ) {
				/*
				 * Let's keep querying primary database to make sure we have up-to-date
				 * data (waiting for slaves to sync up might take some time)
				 */
				$db = DB_PRIMARY;
			} else {
				/*
				 * If another db is requested and we already requested primary database,
				 * make sure this slave has caught up!
				 */
				$lb->waitFor( $lb->getMasterPos() );
				static::$written[$wikiId] = false;
			}
		}

		return $lb->getConnection( $db, $groups, $wiki );
	}

	/**
	 * Before caching data read from backend, we have to make sure that the
	 * content read is in fact "cacheable" (e.g. not read from a lagging slave)
	 *
	 * @return bool
	 */
	public function allowCache() {
		return !$this->getLB()->getLaggedReplicaMode();
	}

	/**
	 * Query to fetch entries from DB.
	 *
	 * @param mixed|null $id The id(s) to fetch
	 * @param mixed|null $shard The corresponding shard value(s)
	 * @return \Wikimedia\Rdbms\IResultWrapper
	 */
	public function get( $id = null, $shard = null ) {
		// query conditions
		$conds = [];
		if ( $id ) {
			$conds[$this->idColumn] = $id;
		}
		if ( $shard ) {
			$conds[$this->shardColumn] = $shard;
		}

		return $this->getDB( DB_REPLICA )->select(
			$this->table,
			'*',
			$conds,
			__METHOD__,
			[]
		);
	}

	/**
	 * Insert entry.
	 *
	 * @param DataModel $entry
	 * @return int
	 */
	public function insert( DataModel $entry ) {
		return $this->getDB( DB_PRIMARY )->insert(
			$this->table,
			$entry->toArray(),
			__METHOD__
		);
	}

	/**
	 * Update entry.
	 *
	 * @param DataModel $entry
	 * @return int
	 */
	public function update( DataModel $entry ) {
		$data = $entry->toArray();
		unset( $data[$this->shardColumn] );

		return $this->getDB( DB_PRIMARY )->update(
			$this->table,
			$data,
			[
				$this->idColumn => $entry->{$this->idColumn},
				$this->shardColumn => $entry->{$this->shardColumn}
			],
			__METHOD__
		);
	}

	/**
	 * Delete entry.
	 *
	 * @param DataModel $entry
	 * @return int
	 */
	public function delete( DataModel $entry ) {
		return $this->getDB( DB_PRIMARY )->delete(
			$this->table,
			[
				$this->idColumn => $entry->{$this->idColumn},
				$this->shardColumn => $entry->{$this->shardColumn}
			],
			__METHOD__
		);
	}

	/**
	 * Fetch a list.
	 *
	 * @param string $name The list name (see <datamodel>::$lists)
	 * @param mixed|null $shard Get only data for a certain shard value
	 * @param int|null $offset The offset to start fetching entries from
	 * @param int $limit The amount of entries to fetch
	 * @param string|null $sort Sort to apply to list
	 * @param string $order Sort the list ASC or DESC
	 * @return \Wikimedia\Rdbms\IResultWrapper
	 */
	public function getList( $name, $shard = null, $offset = null, $limit, $sort = null, $order ) {
		$dbr = $this->getDB( DB_REPLICA );

		$tables = [];
		$vars = [];
		$conds = [];
		$options = [];

		$tables[] = $this->table;

		$vars[] = '*';

		/*
		 * This class does not really allow for sharding data over multiple
		 * servers (since wfGetDB will only return one write primary database).
		 * As a result, even if no specific shard column is specified (in
		 * which case we'd have to query all servers), we don't need to do
		 * anything special here: out data is on only 1 server.
		 * If we were sharding for real, multiple servers would have to be
		 * queried & the results combined ;)
		 */
		if ( $shard ) {
			$conds[$this->shardColumn] = $shard;
		}

		// "where"
		$conditions = $this->getConditions( $name );
		$conds += $conditions;

		// "order by"
		$sort = $this->getSort( $sort );
		$options['ORDER BY'] = [];
		if ( $sort ) {
			$options['ORDER BY'][] = "$sort $order";
		}
		$options['ORDER BY'][] = "$this->idColumn $order";

		// "offset"-alternative
		if ( $sort ) {
			$vars['offset_value'] = $sort;
		}

		$options['LIMIT'] = $limit;
		list( $sortOffset, $idOffset ) = $this->unpackOffset( $offset );
		if ( $idOffset !== null ) {
			$direction = $order == 'ASC' ? '>' : '<';
			$sortOffset = $dbr->addQuotes( $sortOffset );
			$idOffset = $dbr->addQuotes( $idOffset );
			if ( $sort && $sortOffset ) {
				// sort offset defined; add to conditions
				$conds[] = "
					($sort $direction $sortOffset) OR
					($sort = $sortOffset AND $this->idColumn $direction= $idOffset)";
			} elseif ( !$sort && $idOffset ) {
				$conds[] = "$this->idColumn $direction= $idOffset";
			}
		}

		return $dbr->select(
			$tables,
			$vars,
			$conds,
			__METHOD__,
			$options
		);
	}

	/**
	 * Get the amount of entries in a certain list.
	 *
	 * @param string $name The list name (see <datamodel>::$lists)
	 * @param mixed|null $shard Get only data for a certain shard value
	 * @return array
	 */
	public function getCount( $name, $shard = null ) {
		$dbr = $this->getDB( DB_REPLICA );

		$tables = [];
		$vars = [];
		$conds = [];
		$options = [];

		$tables[] = $this->table;

		$vars[] = 'COUNT(*)';

		/*
		 * This class does not really allow for sharding data over multiple
		 * servers (since wfGetDB will only return one write primary database).
		 * As a result, even if no specific shard column is specified (in
		 * which case we'd have to query all servers), we don't need to do
		 * anything special here: out data is on only 1 server.
		 * If we were sharding for real, multiple servers would have to be
		 * queried & the results combined ;)
		 */
		if ( $shard ) {
			$conds[$this->shardColumn] = $shard;
		}

		// "where"
		$conditions = $this->getConditions( $name );
		$conds += $conditions;

		return (int)$dbr->selectField(
			$tables,
			$vars,
			$conds,
			__METHOD__,
			$options
		);
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
		$class = $this->datamodel;

		// get list of all conditions
		$conditions = [];
		foreach ( $class::$lists as $list => $properties ) {
			$conditions = array_merge( $conditions, $class::getListConditions( $list ) );
		}

		// sorts and conditions are to be treated alike for this purpose
		$conditions = array_merge( $conditions, array_values( $class::$sorts ) );

		return $this->getDB( DB_REPLICA )->selectRow(
			$this->table,
			array_unique( $conditions ),
			[
				$this->idColumn => $entry->{$this->idColumn},
				$this->shardColumn => $entry->{$this->shardColumn},
			],
			__METHOD__
		);
	}
}
