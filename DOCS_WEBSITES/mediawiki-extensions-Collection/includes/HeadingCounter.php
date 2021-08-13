<?php

namespace MediaWiki\Extensions\Collection;

use LogicException;

/**
 * Helper class for counting sections and displaying current section number.
 * The numbering is done in a way to avoid showing zeroes in the counter:
 * e.g. for "<h2/><h4/><h2/><h3/>" the result will be "1 1.1 2 2.1" and not "1 1.0.1 2 2.1".
 */
class HeadingCounter {

	/**
	 * List of current numbers, left is highest-level.
	 * @var int[] level => count
	 */
	private $headingNumbers = [];

	/**
	 * Increment the section counter and get the number of the new section.
	 * @param int $level Level of the current section. Smaller number means higher in the DOM;
	 *   other than that the class is agnostic to what level numbering scheme is used. E.g.
	 *   could be 1 for h1, 2 for h2 etc.
	 * @return string
	 */
	public function incrementAndGet( $level ) {
		$top = reset( $this->headingNumbers );
		$this->headingNumbers = array_filter( $this->headingNumbers,
			static function ( $l ) use ( $level ) {
				return $l <= $level;
			}, ARRAY_FILTER_USE_KEY );
		if ( !$this->headingNumbers && $top ) {
			// The new section is higher than all previous ones. Let's inherit the count from the
			// previous top section. E.g. for "<h3/><h2/>" we want the section numbers to be
			// "1 2", not "1 1".
			$this->headingNumbers[$level] = $top;
		}
		if ( isset( $this->headingNumbers[$level] ) ) {
			$this->headingNumbers[$level]++;
		} else {
			$this->headingNumbers[$level] = 1;
		}
		return implode( '.', $this->headingNumbers );
	}

	/**
	 * Increment section number for a top-level section and get new value.
	 * Calls to this method must be preceded with at least one incrementAndGet() call.
	 * Intended for the Contributors section the level of which depends on whether the book
	 * has chapters and/or multiple articles.
	 * @return string
	 */
	public function incrementAndGetTopLevel() {
		if ( !$this->headingNumbers ) {
			throw new LogicException( __METHOD__ . ' called with calling increment() first' );
		}
		return $this->incrementAndGet( array_keys( $this->headingNumbers )[0] );
	}

}
