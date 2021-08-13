<?php

/**
 * Layer on top of the ad table with some helper functions
 */
class AdManager {

	private const AD_TABLE = 'ad';

	/** @var int[] */
	private static $catList = [];

	/**
	 * @var array Ads to be added to db
	 */
	private $ads = [];

	/**
	 * @param array $ads
	 */
	public function __construct( array $ads ) {
		$this->setAds( $ads );
	}

	/**
	 * @return string
	 */
	public static function getTableName() {
		return self::AD_TABLE;
	}

	/**
	 * @return string[]
	 */
	public static function getTypes() {
		return [ 'Page', 'Category' ];
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
	 *
	 * @return array of Titles in multi-dimensional form
	 */
	public static function getAdsFromDB() {
		$types = self::getTypes();

		$allAds = [];
		foreach ( $types as $type ) {
			$allAds[$type] = self::getSomeAdsfromDB( $type );
		}
		return $allAds;
	}

	/**
	 *
	 * @return array of strings in multi-dimensional form
	 */
	public static function getAdTextsFromDB() {
		$allAdTitles = self::getAdsFromDB();
		$allAdTexts = [];
		foreach ( self::getTypes() as $type ) {
			foreach ( $allAdTitles[$type] as $zone => $adTitles ) {
				foreach ( $adTitles as $adTitle ) {
					if ( $type == 'Page' ) {
						$allAdTexts[$type][$zone][] = $adTitle->getFullText();
					} else {
						$allAdTexts[$type][$zone][] = $adTitle->getText();
					}
				}
			}
		}
		return $allAdTexts;
	}

	/**
	 * Get only the Page or Category ad settings, depending on $type
	 *
	 * @param string $type either 'Page' or 'Category'
	 * @return Title[][]|Category[][]
	 */
	public static function getSomeAdsfromDB( $type ) {
		$blank = AdManagerZones::getBlankZoneID();
		$dbr = self::getReadDbConnection();
		$current = $dbr->select(
			self::getTableName(), [
			'ad_id', 'ad_page_id', 'ad_zone', 'ad_page_is_category'
			], 'ad_page_is_category IS ' . ( $type == 'Page' ? 'NOT ' : '' ) . 'TRUE', __METHOD__
		);

		// Fetch current table into array
		$currentArray = [];
		foreach ( $current as $currentRow ) {
			// If ad_zone is null, it's the "NOAD" zone
			$adZone = $currentRow->ad_zone ? $currentRow->ad_zone : $blank;
			$adPageID = $currentRow->ad_page_id;
			$adTitle = $type == 'Page' ? Title::newFromID( $adPageID ) :
				Category::newFromID( $adPageID )->getTitle();
			$currentArray[$adZone][] = $adTitle;
		}
		return $currentArray;
	}

	/**
	 * Purge the db and insert new ads
	 *
	 * @return bool
	 */
	public function execute() {
		$dbw = $this->getWriteDbConnection();
		/** @todo Not such a good idea. What if insert fails? */
		$dbw->delete( self::getTableName(), '*', __METHOD__ );

		return $this->addAllAds( $this->ads );
	}

	/**
	 * Insert an array of ads into the db
	 *
	 * @param array|null $allAds
	 * @return bool
	 */
	protected function addAllAds( $allAds = null ) {
		if ( !$allAds ) {
			if ( isset( $this->ads ) ) {
				$allAds = $this->ads;
			} else {
				return false;
			}
		}
		foreach ( $allAds as $type => $someAds ) {
			if ( !$this->addSomeAds( $type, $someAds ) ) {
				return false;
			}
		}
		return true;
	}

	/**
	 * Add ads of either Page or Category
	 *
	 * @param string $type either Page or Category
	 * @param array $someAds
	 * @return bool
	 */
	protected function addSomeAds( $type, $someAds ) {
		foreach ( $someAds as $adZoneID => $ads ) {
			if ( $adZoneID == AdManagerZones::getBlankZoneID() ) {
				$adZoneID = null;
			}
			foreach ( $ads as $ad ) {
				if ( !$this->addAd( $type, $adZoneID, $ad ) ) {
					return false;
				}
			}
		}
		return true;
	}

	/**
	 * Insert a single ad slot into the db
	 *
	 * @param string $type either Page or Category
	 * @param string|null $adZoneID set to null for the NOAD zone
	 * @param string $ad
	 * @return bool
	 */
	protected function addAd( $type, $adZoneID, $ad ) {
		$dbw = $this->getReadDbConnection();

		// Depending on fields being processed, lookup either the
		// text's Page ID or Category ID
		if ( $type == 'Page' ) {
			$targetPageID = Title::newFromText( $ad )->getArticleID();
		} else {
			$targetPageID = Category::newFromName( $ad )->getID();
		}

		$dbw->insert(
			self::getTableName(),
			[
			'ad_page_id' => $targetPageID,
			'ad_zone' => $adZoneID,
			'ad_page_is_category' => ( $type == 'Category' ? true : false )
			], __METHOD__
		);

		return true;
	}

	/**
	 * @param array $ads
	 */
	public function setAds( array $ads ) {
		$this->ads = $ads;
	}

	/**
	 * Recursively walks through tree array.
	 * Creates array containing each input's level.
	 * (array_walk_recursive doesn't like when the value is an array)
	 * A lower count indicates a closer ancestor to the page, that is
	 * supercategories are assigned higher numbers than subcategories
	 * @param string $value
	 * @param string $catName
	 * @param int $count
	 */
	private static function assignLevel( $value, $catName, $count = 0 ) {
		$count++;

		if ( !empty( $value ) ) {
			array_walk( $value, 'self::assignLevel', $count );
		}

		self::$catList[$catName] = $count;
	}

	/**
	 * Get HTML for all ads that should be displayed for this page
	 *
	 * @param Title $title Title of the page
	 * @return false|array false on error or an array with HTML for each ad
	 */
	public static function getAdOutputFor( Title $title ) {
		if ( !self::tableExists() ) {
			return false;
		}
		$adManagerCode = self::getAdManagerCode();
		if ( !isset( $adManagerCode ) ) {
			return false; // TODO: show error
		}

		$thisPageAdZones = self::getAdZonesFor( $title );
		if ( empty( $thisPageAdZones ) ) { // No zone set for this page or its categories
			return [];
		}

		$adsOut = [];
		foreach ( $thisPageAdZones as $thisPageAdZone ) {
			$adsOut[] = str_replace( '$1', $thisPageAdZone, $adManagerCode );
		}
		return $adsOut;
	}

	/**
	 * Get all the ad slot ids that should be displayed for this title
	 *
	 * @param Title $title
	 * @return array all ad zones for this title
	 */
	public static function getAdZonesFor( Title $title ) {
		$pageAdZones = self::getPageAdZonesFor( $title );
		// If a page is set to one zone's Page textarea and another zone's
		// Category textarea, only the Page zone's ad will display. Is that
		// the expected behavior?
		if ( empty( $pageAdZones ) ) {
			$pageAdZones = self::getCategoryAdZonesFor( $title );
		}
		if ( in_array( AdManagerZones::getBlankZoneID(), $pageAdZones ) ) {
			// An entry in this array was set to "None" so show no ads
			return [];
		}

		return $pageAdZones;
	}

	/**
	 * Get only the Page ad slots for this title
	 *
	 * @param Title $title
	 * @return array
	 */
	public static function getPageAdZonesFor( Title $title ) {
		$thisPageID = $title->getArticleID();
		if ( !$thisPageID ) {
			return [];
		}

		$thisPageAdZones = [];
		$pagesAdsAll = self::getSomeAdsfromDB( 'Page' );
		foreach ( $pagesAdsAll as $adID => $pagesAds ) {
			foreach ( $pagesAds as $pagesAd ) {
				if ( $pagesAd->getArticleID() == $thisPageID ) {
					$thisPageAdZones[] = $adID;
				}
			}
		}
		return $thisPageAdZones;
	}

	/**
	 * Get only the Category ad slots for this title
	 *
	 * @param Title $title
	 * @return array
	 */
	public static function getCategoryAdZonesFor( $title ) {
		$fullTableName = self::getTableName();
		$dbr = self::getReadDbConnection();
		$thisPageAdZones = [];
		// check if an ad zone was set for any of this page's categories
		$allCategories = $dbr->select(
			$fullTableName, [ 'ad_page_id', 'ad_zone' ], 'ad_page_is_category IS TRUE', __METHOD__
		);

		$thisCategoryIDS = $title->getParentCategoryTree();
		array_walk( $thisCategoryIDS, 'self::assignLevel' );
		asort( self::$catList ); // give precedence to the closest ancestors

		if ( !empty( self::$catList ) ) {
			// find first match in this page's catlist that exists in the database
			foreach ( self::$catList as $catNameNamespaced => $level ) {
				$catName = Title::newFromText( $catNameNamespaced )->getText(); // strips Category: prefix
				$catID = Category::newFromName( $catName )->getID();
				$firstMatch = $dbr->select(
					$fullTableName, [ 'ad_zone' ], "ad_page_id = $catID AND ad_page_is_category IS TRUE",
					__METHOD__
				);
				if ( $firstMatch->numRows() !== 0 ) {
					break;
				}
			}

			foreach ( $firstMatch as $row ) {
				$adZone = $row->ad_zone;
				if ( $adZone == null ) {
					$thisPageAdZones[] = AdManagerZones::getBlankZoneID();
				} else {
					$thisPageAdZones[] = $adZone;
				}
			}
		}
		return $thisPageAdZones;
	}

	/**
	 * Get the code that should be inserted to generate the ad display
	 * If both $wgAdManagerService & $wgAdManagerCode, the service will override
	 *
	 * @return string
	 */
	public static function getAdManagerCode() {
		global $wgAdManagerService, $wgAdManagerCode;

		if ( $wgAdManagerService == 'openx' ) {
			return "<a href='http://d1.openx.org/ck.php?cb=91238047' target='_blank'>\""
				. "<img src='http://d1.openx.org/avw.php?zoneid=$1&amp;cb=1378957897235' border='0' alt='' />"
				. "</a>";
			// Other ad services can be added here, with the same format as above
		} else {
			// Allows admins to use any ad service or inclusion code they
			// desire by inserting in LocalSettings.php
			return $wgAdManagerCode;
		}
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
