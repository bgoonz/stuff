<?php

abstract class BibManagerRepository {

	static $instance = null;

	/**
	 * Singleton factory method.
	 * @return BibManagerRepository
	 */
	public static function singleton () {
		if ( self::$instance instanceof BibManagerRepository )
			return self::$instance;

		global $wgBibManagerRepoClass;
		self::$instance = new $wgBibManagerRepoClass();
		return self::$instance;
	}

	/**
	 * @return array
	 */
	public abstract function getBibEntryByCitation ( $sCitation );

	public abstract function getBibEntries ( $aOptions );

	public abstract function saveBibEntry ( $sCitation, $sEntryType, $aFields );

	public abstract function updateBibEntry ( $sCitation, $sEntryType, $aFields );

	/**
	 * @return string Empty string if okay, otherwise a suggestion (alpha-incremented)
	 */
	public abstract function getCitationsLike ( $sCtiation );

	public abstract function deleteBibEntry ( $sCitation );
}