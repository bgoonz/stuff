<?php
/**
 * The data backend to power DataModel, to save the real data to.
 *
 * DataModel will allow
 * for easy implementation of a sharded data structure, by automatically taking
 * care of some of the additional logic inherent of a sharded data structure,
 * like fetching multiple (perhaps cross-shard) entries at once, caching, ...
 *
 * DataModel was originally developed with RDBStore - a class that would allow
 * data to be sharded over several servers - in mind.
 * RDBStore is currently discontinued, with no alternative (yet) on the horizon.
 * RDBStore-related code is pulled out of DataModel and turned it into a more
 * general class, so that other backends may be used to power the DataModel class.
 *
 * @author     Matthias Mullie <mmullie@wikimedia.org>
 */
abstract class DataModelBackend {
	/**
	 * DataModel details.
	 *
	 * @var string
	 */
	protected $datamodel;
	/** @var string */
	protected $table;
	/** @var string */
	protected $idColumn;
	/** @var string */
	protected $shardColumn;

	/**
	 * @param string $datamodel
	 * @param string $table
	 * @param string $idColumn
	 * @param string $shardColumn
	 */
	public function __construct( $datamodel, $table, $idColumn, $shardColumn ) {
		$this->datamodel = $datamodel;
		$this->table = $table;
		$this->idColumn = $idColumn;
		$this->shardColumn = $shardColumn;
	}

	/**
	 * Before caching data read from backend, we have to make sure that the
	 * content read is in fact "cacheable" (e.g. not read from a lagging slave)
	 *
	 * @return bool
	 */
	public function allowCache() {
		return true;
	}

	/**
	 * Query to fetch entries from DB.
	 *
	 * To fetch all entries for a certain shard value, leave $id null.
	 * To fetch a specific entry without knowing the shard value, leave $shard null.
	 *
	 * @param mixed|null $id The id(s) to fetch, either a single id or an array of them
	 * @param mixed|null $shard The corresponding shard value(s)
	 * @return \Wikimedia\Rdbms\IResultWrapper
	 */
	abstract public function get( $id = null, $shard = null );

	/**
	 * Insert entry.
	 *
	 * @param DataModel $entry
	 * @return int
	 */
	abstract public function insert( DataModel $entry );

	/**
	 * Update entry.
	 *
	 * @param DataModel $entry
	 * @return int
	 */
	abstract public function update( DataModel $entry );

	/**
	 * Delete entry.
	 *
	 * @param DataModel $entry
	 * @return int
	 */
	abstract public function delete( DataModel $entry );

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
	abstract public function getList( $name, $shard = null, $offset = null, $limit, $sort = null, $order );

	/**
	 * Get the amount of entries in a certain list.
	 *
	 * @param string $name The list name (see <datamodel>::$lists)
	 * @param mixed|null $shard Get only data for a certain shard value
	 * @return array
	 */
	abstract public function getCount( $name, $shard = null );

	/**
	 * Evaluate an entry to possible conditions.
	 *
	 * Before updating data, DataModel will want to re-evaluate en entry to
	 * all possible conditions, to know which caches need to be purged/updated.
	 *
	 * @param DataModel $entry
	 * @return \Wikimedia\Rdbms\IResultWrapper
	 */
	abstract public function evaluateConditions( DataModel $entry );

	/**
	 * For a given list name, this will fetch the list's conditions.
	 *
	 * @param string $name The list name (see <datamodel>::$lists)
	 * @return string
	 */
	public function getConditions( $name ) {
		$class = $this->datamodel;

		$conditions = [];
		if ( isset( $class::$lists[$name] ) ) {
			$conditions = $class::$lists[$name];
		}

		if ( empty( $conditions ) ) {
			$conditions = [];
		}

		return $conditions;
	}

	/**
	 * For a given sort, this will fetch the SQL-sort.
	 *
	 * @param string $sort The sort name (see <datamodel>::$sorts)
	 * @return string
	 */
	public function getSort( $sort ) {
		$class = $this->datamodel;

		$sorts = [];
		if ( isset( $class::$sorts[$sort] ) ) {
			return $class::$sorts[$sort];
		}

		return '';
	}

	/**
	 * Interprets $offset variable, reads out the continue value for
	 * the sort value & the id.
	 *
	 * $offset should be the value of the offset_value column for rows
	 * returned by ::getList. It will be either the row's id, or the row's
	 * id plus the value of the column that is being sorted on. Based on
	 * these 2 values, we can create a where-clause that will accurately
	 * select a subset following the entry whose $offset was passed here.
	 *
	 * @param string $offsets Either in the format "<sort>|<id>" or "<id>"
	 * @return array
	 */
	public function unpackOffset( $offsets ) {
		// interpret $offset
		$sortOffset = null;
		$idOffset = null;
		if ( $offsets ) {
			$offsets = explode( '|', $offsets ); // <sortvalue>|<id> or <id>
			if ( count( $offsets ) > 1 ) {
				$sortOffset = $offsets[0];
				$idOffset = $offsets[1];
			} else {
				$idOffset = $offsets[0];
			}
		}

		return [ $sortOffset, $idOffset ];
	}
}
