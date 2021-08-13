<?php

/**
 * Layer on top of the ad zones table
 */
class AdManagerZones {

	private const AD_ZONES_TABLE = 'adzones';

	/**
	 * @var array $zones Zones to be added to db
	 */
	private $zonesToAdd = [];

	/**
	 * @var array $zones Zones to be removed from db
	 */
	private $zonesToRemove = [];

	/**
	 * @var bool
	 */
	private $zonesAddedSuccessfully;

	/**
	 * @var bool
	 */
	private $zonesRemovedSuccessfully;

	/**
	 * @return array
	 */
	public function getZonesToAdd() {
		return $this->zonesToAdd;
	}

	/**
	 * @return array
	 */
	public function getZonesToRemove() {
		return $this->zonesToRemove;
	}

	/**
	 * @return bool
	 */
	public function getZonesAddedSuccessfully() {
		return $this->zonesAddedSuccessfully;
	}

	/**
	 * @return bool
	 */
	public function getZonesRemovedSuccessfully() {
		return $this->zonesRemovedSuccessfully;
	}

	/**
	 * @param array $zones
	 * @return array|null
	 */
	public function setZonesToAdd( array $zones ) {
		return wfSetVar( $this->zonesToAdd, $zones );
	}

	/**
	 * @param array $zonesToRemove
	 * @return array|null
	 */
	public function setZonesToRemove( $zonesToRemove ) {
		return wfSetVar( $this->zonesToRemove, $zonesToRemove );
	}

	/**
	 * @param bool $zonesAddedSuccessfully
	 * @return bool|null
	 */
	public function setZonesAddedSuccessfully( $zonesAddedSuccessfully ) {
		return wfSetVar( $this->zonesAddedSuccessfully, $zonesAddedSuccessfully );
	}

	/**
	 * @param bool $zonesRemovedSuccessfully
	 * @return bool|null
	 */
	public function setZonesRemovedSuccessfully( $zonesRemovedSuccessfully ) {
		return wfSetVar( $this->zonesRemovedSuccessfully, $zonesRemovedSuccessfully );
	}

	/**
	 * @param array $wantedZones
	 */
	public function __construct( array $wantedZones ) {
		$currentZones = $this->getZonesFromDB();

		$this->zonesToAdd = array_diff( $wantedZones, $currentZones );
		$this->zonesToRemove = array_diff( $currentZones, $wantedZones );
	}

	/**
	 * @return string
	 */
	public static function getTableName() {
		return self::AD_ZONES_TABLE;
	}

	/**
	 * @return string
	 */
	public static function getBlankZoneID() {
		return '----';
	}

	/**
	 * Check if the zone is valid
	 *
	 * @param string $zone
	 * @return bool
	 */
	public static function isValidZone( $zone ) {
		if ( empty( $zone ) ) {
			return true;
		}
		if ( !is_numeric( $zone ) ) {
			return false;
		}
		return true;
	}

	/**
	 * Validate single zone name and throw an error if invalid
	 *
	 * @param string $zone
	 * @return bool
	 * @throws ErrorPageError
	 */
	public static function validateZone( $zone ) {
		$zone = trim( $zone );
		if ( !self::isValidZone( $zone ) ) {
			throw new ErrorPageError( 'internalerror', 'admanager_zonenotnumber', $zone );
		}
		return true;
	}

	/**
	 * Validate array of zones
	 *
	 * @param array $zones
	 * @return bool
	 */
	public static function validateZones( $zones ) {
		foreach ( $zones as $zone ) {
			self::validateZone( $zone );
		}
		return true;
	}

	/**
	 * Check if the correct table exists
	 *
	 * @return bool
	 */
	public static function tableExists() {
		$dbr = self::getReadDbConnection();
		return $dbr->tableExists( self::getTableName() );
	}

	/**
	 * Retrieves current zones from the db
	 *
	 * @return array current zones in db
	 */
	public static function getZonesFromDB() {
		$dbr = self::getReadDbConnection();
		$current = $dbr->select(
			self::getTableName(), [ '*' ], [], __METHOD__
		);

		// Fetch current table into array
		$currentArray = [];
		foreach ( $current as $currentRow ) {
			$currentArray[] = $currentRow->ad_zone_id;
		}

		return $currentArray;
	}

	/**
	 * Add new zones to db and remove the old zones
	 *
	 * @return bool Successful if added and removed successfully
	 */
	public function execute() {
		$this->zonesAdded = $this->doAddZones();
		$this->zonesRemoved = $this->doRemoveZones();

		return $this->zonesAdded && $this->zonesRemoved;
	}

	/**
	 * Insert an array of zones into the db
	 *
	 * @return bool
	 */
	protected function doAddZones() {
		$dbw = $this->getWriteDbConnection();
		$rows = [];
		foreach ( $this->getZonesToAdd() as $zone ) {
			$rows[] = [ 'ad_zone_id' => $zone ];
		}
		$dbw->insert( self::getTableName(), $rows, __METHOD__, 'IGNORE' );

		return true;
	}

	/**
	 * Remove zones from the db
	 *
	 * @return bool True if all zones were removed
	 */
	protected function doRemoveZones() {
		$successAll = true;
		foreach ( $this->getZonesToRemove() as $zone ) {
			$successAll &= (bool)$this->removeZone( $zone );
		}
		return $successAll;
	}

	/**
	 * Remove a zone from the db
	 *
	 * @param string $zone
	 * @return bool|ResultWrapper
	 */
	protected function removeZone( $zone ) {
		$dbw = $this->getWriteDbConnection();
		$dbw->delete( self::getTableName(), [ 'ad_zone_id' => $zone ], __METHOD__ );

		return true;
	}

	/**
	 * @return \Wikimedia\Rdbms\IDatabase Read-only db connection
	 */
	public static function getReadDbConnection() {
		return wfGetDB( DB_REPLICA );
	}

	/**
	 * @return \Wikimedia\Rdbms\IDatabase Writable db connection
	 */
	public static function getWriteDbConnection() {
		return wfGetDB( DB_PRIMARY );
	}
}
