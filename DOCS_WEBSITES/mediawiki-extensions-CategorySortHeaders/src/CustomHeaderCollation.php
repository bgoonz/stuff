<?php
/**
 * Pretty much based on UppercaseCollation from core.
 *
 * Collation that is case-insensitive, and allows specify
 * custom 'first-character' headings for category pages.
 */

use MediaWiki\MediaWikiServices;

class CustomHeaderCollation extends Collation {
	public static function onRegistration() {
		global $wgCategoryCollation;

		/**
		 * We can't override this core variable with extension.json,
		 * so we set it here instead.
		 *
		 * Note, this extension is incompatible with changing $wgCategoryCollation
		 * in LocalSettings.php. It defines its own Collation here, which is
		 * roughly equivalent to 'uppercase', and thus can't be used
		 * with 'uca-default' or any other custom collation.
		 */
		$wgCategoryCollation = 'CustomHeaderCollation';
	}

	/**
	 * @param string $collationName
	 * @param mixed &$collationObject
	 * @return bool
	 */
	public static function onCategorySortHeadersSetup( $collationName, &$collationObject ) {
		if ( $collationName === 'CustomHeaderCollation' ) {
			$collationObject = new self;

			return false;
		}

		return true;
	}

	/**
	 * The basic idea is we store the sortkey as three parts A^B^C
	 * A is the capitalized first letter of the header it falls under.
	 * B is the is the header it falls under (In whatever case the user enters)
	 * C is the rest of the sortkey.
	 *
	 * The user enters something like [[category:some cat|^my header^foo]]
	 * which gets turned into "^my header^foo\n<page name>"
	 * which we turn into "M^my header^FOO\n<PAGE NAME>"
	 *
	 * @param string $string
	 * @return string
	 */
	public function getSortKey( $string ) {
		global $wgCategorySortHeaderAppendPageNameToKey;

		$contentLanguage = MediaWikiServices::getInstance()->getContentLanguage();

		$matches = [];
		if ( preg_match( '/^\^([^\n^]*)\^(.*)$/Ds', $string, $matches ) ) {
			if ( $matches[1] === '' ) {
				$matches[1] = ' ';
			}

			$part1 = $contentLanguage->firstChar( $contentLanguage->uc( $matches[1] ) );
			$part2 = $matches[1];
			$part3prefix = '';

			if ( $wgCategorySortHeaderAppendPageNameToKey ) {
				// This is kind of ugly, and seems wrong
				// because it shouldn't be the collations
				// job to do this type of thing (but then
				// again it shouldn't be doing headers either).

				// See Title::getCategorySortkey if you're
				// mystified by what this does.
				$trimmed = trim( $matches[2], "\n" );
				if ( $trimmed !== $matches[2] ) {
					$part3prefix = $trimmed;
				}
			}

			$part3 = $contentLanguage->uc( $part3prefix . $matches[2] );
		} else {
			// Ordinay sortkey, no header info.
			$part3 = $contentLanguage->uc( $string );
			$part1 = $part2 = $contentLanguage->firstChar( $part3 );
		}

		return $part1 . '^' . $part2 . '^' . $part3;
	}

	/**
	 * @param string $string
	 * @return string
	 */
	public function getFirstLetter( $string ) {
		# Stolen from UppercaseCollation
		# not sure when this could actually happen.
		if ( $string[0] === "\0" ) {
			$string = substr( $string, 1 );
		}

		$m = [];
		if ( preg_match( '/^\^([^\n^]*)\^/', $string, $m ) ) {
			return $m[1];
		} else {
			$contentLanguage = MediaWikiServices::getInstance()->getContentLanguage();

			return $contentLanguage->ucfirst( $contentLanguage->firstChar( $string ) );
		}
	}
}
