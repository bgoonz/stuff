<?php
/**
 * AntiSpoof.php
 * Username spoofing prevention for MediaWiki
 * Version 0.04
 *
 * Copyright (C) Neil Harris 2006
 * Python->PHP conversion by Brion Vibber <brion@pobox.com>
 *
 * 2006-06-30 Handles non-CJK scripts as per UTR #39 + my extensions
 * 2006-07-01 Now handles Simplified <-> Traditional Chinese rules, as
 *            per JET Guidelines for Internationalized Domain Names,
 *            and the ICANN language registry values for .cn
 * 2006-09-14 Now handles 'rn' etc better, and uses stdin for input
 * 2006-09-18 Added exception handling for nasty cases, eg BiDi violations
 * 2006-09-19 Converted to PHP for easier integration into a MW extension
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301
 * USA
 */

use UtfNormal\Utils;
use UtfNormal\Validator;
use Wikimedia\Equivset\Equivset;

class AntiSpoof {

	private const SCRIPT_DEPRECATED = 'DEPRECATED';
	private const SCRIPT_UNASSIGNED = 'UNASSIGNED';

	private const SCRIPT_ARABIC = 'ARABIC';
	private const SCRIPT_ARMENIAN = 'ARMENIAN';
	private const SCRIPT_ASCII_DIGITS = 'ASCII_DIGITS';
	private const SCRIPT_ASCII_PUNCTUATION = 'ASCII_PUNCTUATION';
	private const SCRIPT_BENGALI = 'BENGALI';
	private const SCRIPT_BOPOMOFO = 'BOPOMOFO';
	private const SCRIPT_BUGINESE = 'BUGINESE';
	private const SCRIPT_BUHID = 'BUHID';
	private const SCRIPT_CANADIAN_ABORIGINAL = 'CANADIAN_ABORIGINAL';
	private const SCRIPT_CHEROKEE = 'CHEROKEE';
	private const SCRIPT_COMBINING_MARKS = 'COMBINING_MARKS';
	private const SCRIPT_COPTIC = 'COPTIC';
	private const SCRIPT_COPTIC_EXTRAS = 'COPTIC_EXTRAS';
	private const SCRIPT_CYPRIOT = 'CYPRIOT';
	private const SCRIPT_CYRILLIC = 'CYRILLIC';
	private const SCRIPT_DESERET = 'DESERET';
	private const SCRIPT_DEVANAGARI = 'DEVANAGARI';
	private const SCRIPT_ETHIOPIC = 'ETHIOPIC';
	private const SCRIPT_GEORGIAN = 'GEORGIAN';
	private const SCRIPT_GLAGOLITIC = 'GLAGOLITIC';
	private const SCRIPT_GOTHIC = 'GOTHIC';
	private const SCRIPT_GREEK = 'GREEK';
	private const SCRIPT_GUJARATI = 'GUJARATI';
	private const SCRIPT_GURMUKHI = 'GURMUKHI';
	private const SCRIPT_HAN = 'HAN';
	private const SCRIPT_HANGUL = 'HANGUL';
	private const SCRIPT_HANUNOO = 'HANUNOO';
	private const SCRIPT_HEBREW = 'HEBREW';
	private const SCRIPT_HIRAGANA = 'HIRAGANA';
	private const SCRIPT_KANNADA = 'KANNADA';
	private const SCRIPT_KATAKANA = 'KATAKANA';
	private const SCRIPT_KHAROSHTHI = 'KHAROSHTHI';
	private const SCRIPT_KHMER = 'KHMER';
	private const SCRIPT_LAO = 'LAO';
	private const SCRIPT_LATIN = 'LATIN';
	private const SCRIPT_LIMBU = 'LIMBU';
	private const SCRIPT_LINEAR_B = 'LINEAR_B';
	private const SCRIPT_MALAYALAM = 'MALAYALAM';
	private const SCRIPT_MEETEI_MAYEK = 'MEETEI_MAYEK';
	private const SCRIPT_MEETEI_MAYEK_EXTENSIONS = 'MEETEI_MAYEK_EXTENSIONS';
	private const SCRIPT_MONGOLIAN = 'MONGOLIAN';
	private const SCRIPT_MYANMAR = 'MYANMAR';
	private const SCRIPT_NEW_TAI_LUE = 'NEW_TAI_LUE';
	private const SCRIPT_NKO = 'NKO';
	private const SCRIPT_OGHAM = 'OGHAM';
	private const SCRIPT_OL_CHIKI = 'OL_CHIKI';
	private const SCRIPT_OLD_ITALIC = 'OLD_ITALIC';
	private const SCRIPT_OLD_PERSIAN = 'OLD_PERSIAN';
	private const SCRIPT_ORIYA = 'ORIYA';
	private const SCRIPT_OSMANYA = 'OSMANYA';
	private const SCRIPT_RUNIC = 'RUNIC';
	private const SCRIPT_SHAVIAN = 'SHAVIAN';
	private const SCRIPT_SINHALA = 'SINHALA';
	private const SCRIPT_SYLOTI_NAGRI = 'SYLOTI_NAGRI';
	private const SCRIPT_SYRIAC = 'SYRIAC';
	private const SCRIPT_TAGALOG = 'TAGALOG';
	private const SCRIPT_TAGBANWA = 'TAGBANWA';
	private const SCRIPT_TAI_LE = 'TAI_LE';
	private const SCRIPT_TAMIL = 'TAMIL';
	private const SCRIPT_TELUGU = 'TELUGU';
	private const SCRIPT_THAANA = 'THAANA';
	private const SCRIPT_THAI = 'THAI';
	private const SCRIPT_TIBETAN = 'TIBETAN';
	private const SCRIPT_TIFINAGH = 'TIFINAGH';
	private const SCRIPT_UGARITIC = 'UGARITIC';
	private const SCRIPT_WARANG_CITI = 'WARANG_CITI';
	private const SCRIPT_YI = 'YI';

	/**
	 * Define script tag codes for various Unicode codepoint ranges
	 * If it does not have a code here, it does not have a script assignment
	 * NB: Braille is not in this list since it is a transliteration system, not a script;
	 * this does not disadvantage blind people, who will use Braille input/output methods
	 * and not raw Braille...
	 * NB: Middle dot is included in SCRIPT_LATIN for use in Catalan
	 * NB: All scripts described by the Unicode Consortium as "Other Scripts" or "Ancient Scripts"
	 * are commented out: these are either not in modern use, or only used for specialized
	 * religious purposes, or only of literary interest
	 */
	private const ALL_SCRIPT_RANGES = [
		[ 0x0020, 0x002F,
			self::SCRIPT_ASCII_PUNCTUATION ], // ASCII Punctuation 1, Hyphen, ASCII Punctuation 2
		[ 0x0030, 0x0039, self::SCRIPT_ASCII_DIGITS ], // ASCII Digits
		[ 0x003A, 0x0040, self::SCRIPT_ASCII_PUNCTUATION ], // Colon, ASCII Punctuation 3
		[ 0x0041, 0x005A, self::SCRIPT_LATIN ], // ASCII Uppercase
		[ 0x005B, 0x0060,
			self::SCRIPT_ASCII_PUNCTUATION ], // ASCII Punctuation 4, Underscore, ASCII Punctuation 5
		[ 0x0061, 0x007A, self::SCRIPT_LATIN ], // ASCII Lowercase
		[ 0x007B, 0x007E, self::SCRIPT_ASCII_PUNCTUATION ], // ASCII Punctuation 5
		[ 0x00B7, 0x00B7, self::SCRIPT_LATIN ], // Middle Dot
		[ 0x00C0, 0x00D6, self::SCRIPT_LATIN ], // Latin-1 Letters 1
		[ 0x00D8, 0x00F6, self::SCRIPT_LATIN ], // Latin-1 Letters 2
		[ 0x00F8, 0x02AF,
			self::SCRIPT_LATIN ], // Latin-1 Letters 3, Latin Extended-A, Latin Extended-B, IPA Extensions
		[ 0x0300, 0x036F, self::SCRIPT_COMBINING_MARKS ], // Combining Diacritical Marks
		[ 0x0370, 0x03E1, self::SCRIPT_GREEK ], // Greek and Coptic (Greek)
		[ 0x03E2, 0x03EF, self::SCRIPT_COPTIC_EXTRAS ], // Greek and Coptic (Coptic-unique)
		[ 0x03F0, 0x03FF, self::SCRIPT_GREEK ], // Greek and Coptic (Greek)
		[ 0x0400, 0x052F, self::SCRIPT_CYRILLIC ], // Cyrillic, Cyrillic Supplement
		[ 0x0530, 0x058F, self::SCRIPT_ARMENIAN ], // Armenian
		[ 0x0590, 0x05FF, self::SCRIPT_HEBREW ], // Hebrew
		[ 0x0600, 0x06FF, self::SCRIPT_ARABIC ], // Arabic
		[ 0x0700, 0x074F, self::SCRIPT_SYRIAC ], // Syriac
		[ 0x0750, 0x077F, self::SCRIPT_ARABIC ], // Arabic Supplement
		[ 0x0780, 0x07BF, self::SCRIPT_THAANA ], // Thaana
		[ 0x07C0, 0x07FF, self::SCRIPT_NKO ], // NKo (N'Ko)
		[ 0x0900, 0x097F, self::SCRIPT_DEVANAGARI ], // Devanagari
		[ 0x0980, 0x09FF, self::SCRIPT_BENGALI ], // Bengali
		[ 0x0A00, 0x0A7F, self::SCRIPT_GURMUKHI ], // Gurmukhi
		[ 0x0A80, 0x0AFF, self::SCRIPT_GUJARATI ], // Gujarati
		[ 0x0B00, 0x0B7F, self::SCRIPT_ORIYA ], // Oriya
		[ 0x0B80, 0x0BFF, self::SCRIPT_TAMIL ], // Tamil
		[ 0x0C00, 0x0C7F, self::SCRIPT_TELUGU ], // Telugu
		[ 0x0C80, 0x0CFF, self::SCRIPT_KANNADA ], // Kannada
		[ 0x0D00, 0x0D7F, self::SCRIPT_MALAYALAM ], // Malayalam
		[ 0x0D80, 0x0DFF, self::SCRIPT_SINHALA ], // Sinhala
		[ 0x0E00, 0x0E7F, self::SCRIPT_THAI ], // Thai
		[ 0x0E80, 0x0EFF, self::SCRIPT_LAO ], // Lao
		[ 0x0F00, 0x0FFF, self::SCRIPT_TIBETAN ], // Tibetan
		[ 0x1000, 0x109F, self::SCRIPT_MYANMAR ], // Myanmar
		[ 0x10A0, 0x10FF, self::SCRIPT_GEORGIAN ], // Georgian
		[ 0x1100, 0x11FF, self::SCRIPT_HANGUL ], // Hangul Jamo
		[ 0x1200, 0x139F, self::SCRIPT_ETHIOPIC ], // Ethiopic, Ethiopic Supplement
		[ 0x13A0, 0x13FF, self::SCRIPT_CHEROKEE ], // Cherokee
		[ 0x1400, 0x167F, self::SCRIPT_CANADIAN_ABORIGINAL ], // Unified Canadian Aboriginal Syllabics
		// [ 0x1680, 0x169F, self::SCRIPT_OGHAM ], // Ogham
		// [ 0x16A0, 0x16FF, self::SCRIPT_RUNIC ], // Runic
		[ 0x1700, 0x171F, self::SCRIPT_TAGALOG ], // Tagalog
		[ 0x1720, 0x173F, self::SCRIPT_HANUNOO ], // Hanunoo
		[ 0x1740, 0x175F, self::SCRIPT_BUHID ], // Buhid
		[ 0x1760, 0x177F, self::SCRIPT_TAGBANWA ], // Tagbanwa
		[ 0x1780, 0x17FF, self::SCRIPT_KHMER ], // Khmer
		[ 0x1800, 0x18AF, self::SCRIPT_MONGOLIAN ], // Mongolian
		[ 0x1900, 0x194F, self::SCRIPT_LIMBU ], // Limbu
		[ 0x1950, 0x197F, self::SCRIPT_TAI_LE ], // Tai Le
		[ 0x1980, 0x19DF, self::SCRIPT_NEW_TAI_LUE ], // New Tai Lue
		[ 0x1A00, 0x1A1F, self::SCRIPT_BUGINESE ], // Buginese
		[ 0x1C50, 0x1C7F, self::SCRIPT_OL_CHIKI ], // Ol Chiki
		[ 0x1E00, 0x1EFF, self::SCRIPT_LATIN ], // Latin Extended Additional
		[ 0x1F00, 0x1FFF, self::SCRIPT_GREEK ], // Greek Extended
		// [ 0x2C00, 0x2C5F, self::SCRIPT_GLAGOLITIC ], // Glagolitic
		[ 0x2C80, 0x2CFF, self::SCRIPT_COPTIC ], // Coptic
		[ 0x2D00, 0x2D2F, self::SCRIPT_GEORGIAN ], // Georgian Supplement
		[ 0x2D30, 0x2D7F, self::SCRIPT_TIFINAGH ], // Tifinagh
		[ 0x2D80, 0x2DDF, self::SCRIPT_ETHIOPIC ], // Ethiopic Extended
		[ 0x2E80, 0x2FDF, self::SCRIPT_DEPRECATED ], // CJK Radicals Supplement, Kangxi Radicals
		[ 0x3040, 0x309F, self::SCRIPT_HIRAGANA ], // Hiragana
		[ 0x30A0, 0x30FF, self::SCRIPT_KATAKANA ], // Katakana
		[ 0x3100, 0x312F, self::SCRIPT_BOPOMOFO ], // Bopomofo
		[ 0x3130, 0x318F, self::SCRIPT_HANGUL ], // Hangul Compatibility Jamo
		[ 0x31A0, 0x31BF, self::SCRIPT_BOPOMOFO ], // Bopomofo Extended
		[ 0x3400, 0x4DBF, self::SCRIPT_HAN ], // CJK Unified Ideographs Extension A
		[ 0x4E00, 0x9FFF, self::SCRIPT_HAN ], // CJK Unified Ideographs
		[ 0xA000, 0xA4CF, self::SCRIPT_YI ], // Yi Syllables, Yi Radicals
		[ 0xA800, 0xA82F, self::SCRIPT_SYLOTI_NAGRI ], // Syloti Nagri
		// [ 0xAAE0, 0xAAFF, self::SCRIPT_MEETEI_MAYEK_EXTENSIONS ] // Meetei Mayek Extensions
		[ 0xABC0, 0xABFF, self::SCRIPT_MEETEI_MAYEK ], // Meetei Mayek
		[ 0xAC00, 0xD7AF, self::SCRIPT_HANGUL ], // Hangul Syllables
		[ 0xF900, 0xFAFF, self::SCRIPT_DEPRECATED ], // CJK Compatibility Ideographs
		// [ 0x10000, 0x100FF, self::SCRIPT_LINEAR_B ], // Linear B Syllabary, Linear B Ideograms
		// [ 0x10140, 0x1018F, self::SCRIPT_GREEK ], // Ancient Greek Numbers
		// [ 0x10300, 0x1032F, self::SCRIPT_OLD_ITALIC ], // Old Italic
		[ 0x10330, 0x1034F, self::SCRIPT_GOTHIC ], // Gothic
		// [ 0x10380, 0x1039F, self::SCRIPT_UGARITIC ], // Ugaritic
		// [ 0x103A0, 0x103DF, self::SCRIPT_OLD_PERSIAN ], // Old Persian
		// [ 0x10400, 0x1044F, self::SCRIPT_DESERET ], // Deseret
		// [ 0x10450, 0x1047F, self::SCRIPT_SHAVIAN ], // Shavian
		// [ 0x10480, 0x104AF, self::SCRIPT_OSMANYA ], // Osmanya
		// [ 0x10800, 0x1083F, self::SCRIPT_CYPRIOT ], // Cypriot Syllabary
		[ 0x10A00, 0x10A5F, self::SCRIPT_KHAROSHTHI ], // Kharoshthi
		[ 0x118A0, 0x118FF, self::SCRIPT_WARANG_CITI ], // Warang Citi
		[ 0x20000, 0x2A6DF, self::SCRIPT_HAN ], // CJK Unified Ideographs Extension B
		[ 0x2F800, 0x2FA1F, self::SCRIPT_DEPRECATED ] // CJK Compatibility Ideographs Supplement
	];

	private const ALLOWED_SCRIPT_COMBINATIONS = [
		[ self::SCRIPT_COPTIC, self::SCRIPT_COPTIC_EXTRAS ], # Coptic, using old Greek chars
		[ self::SCRIPT_GREEK, self::SCRIPT_COPTIC_EXTRAS ], # Coptic, using new Coptic chars
		[ self::SCRIPT_HAN, self::SCRIPT_BOPOMOFO ], # Chinese
		[ self::SCRIPT_HAN, self::SCRIPT_HANGUL ], # Korean
		[ self::SCRIPT_HAN, self::SCRIPT_KATAKANA, self::SCRIPT_HIRAGANA ] # Japanese
	];

	/**
	 * @var Equivset
	 */
	private static $equivset;

	/**
	 * @return Equivset
	 */
	public static function getEquivSet() {
		if ( !self::$equivset ) {
			self::$equivset = new Equivset();
		}

		return self::$equivset;
	}

	/**
	 * @param int $ch
	 * @return string
	 */
	private static function getScriptCode( $ch ) {
		# Linear search: binary chop would be faster...
		foreach ( self::ALL_SCRIPT_RANGES as $range ) {
			if ( $ch >= $range[0] && $ch <= $range[1] ) {
				return $range[2];
			}
		}
		# Otherwise...
		return self::SCRIPT_UNASSIGNED;
	}

	/**
	 * @param array $aList
	 * @param array $bList
	 * @return bool
	 */
	private static function isSubsetOf( $aList, $bList ) {
		return count( array_diff( $aList, $bList ) ) == 0;
	}

	/**
	 * Is this an allowed script mixture?
	 *
	 * @param array $scriptList
	 * @return bool
	 */
	private static function isAllowedScriptCombination( $scriptList ) {
		foreach ( self::ALLOWED_SCRIPT_COMBINATIONS as $allowedCombo ) {
			if ( self::isSubsetOf( $scriptList, $allowedCombo ) ) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Convert string into array of Unicode code points as integers
	 * @param string $str
	 * @return int[]
	 */
	private static function stringToList( $str ) {
		$ar = [];
		if ( !preg_match_all( '/./us', $str, $ar ) ) {
			return [];
		}
		$out = [];
		foreach ( $ar[0] as $char ) {
			$out[] = Utils::utf8ToCodepoint( $char );
		}
		return $out;
	}

	/**
	 * @param array $list
	 * @return string
	 */
	private static function listToString( $list ) {
		$out = '';
		foreach ( $list as $cp ) {
			$out .= Utils::codepointToUtf8( $cp );
		}
		return $out;
	}

	/**
	 * @param array $a_list
	 * @return string
	 */
	private static function hardjoin( $a_list ) {
		return implode( '', $a_list );
	}

	/**
	 * @param string $testName
	 * @return string
	 */
	public static function normalizeString( $testName ) {
		return self::getEquivSet()->normalize( $testName );
	}

	/**
	 * @param int[] $text
	 * @param string $script
	 * @return int[]
	 */
	private static function stripScript( array $text, $script ) {
		$scripts = array_map( [ __CLASS__, 'getScriptCode' ], $text );
		$out = [];
		foreach ( $text as $index => $char ) {
			if ( $scripts[$index] !== $script ) {
				$out[] = $char;
			}
		}
		return $out;
	}

	/**
	 * Helper function for checkUnicodeStringStatus: Return an error on a bad character.
	 * @todo I would like to show Unicode character name, but it is not clear how to get it.
	 * @param string $msgId message identifier.
	 * @param int $point codepoint of the bad character.
	 * @return Status
	 */
	private static function badCharErr( $msgId, $point ) {
		$symbol = Utils::codepointToUtf8( $point );
		// Combining marks are combined with the previous character. If abusing character is a
		// combining mark, prepend it with space to show them correctly.
		if ( self::getScriptCode( $point ) === self::SCRIPT_COMBINING_MARKS ) {
			$symbol = ' ' . $symbol;
		}
		$code = sprintf( 'U+%04X', $point );
		if ( preg_match( '/\A\p{C}\z/u', $symbol ) ) {
			$char = wfMessage( 'antispoof-bad-char-non-printable', $code );
		} else {
			$char = wfMessage( 'antispoof-bad-char', $symbol, $code );
		}
		return Status::newFatal( wfMessage( $msgId, $char ) );
	}

	/**
	 * TODO: does too much in one routine, refactor...
	 * @param string $testName
	 * @return Status
	 * @since 1.32
	 */
	public static function checkUnicodeStringStatus( $testName ) {
		global $wgAntiSpoofProhibitedCharacters;

		// Start with some sanity checking
		if ( !is_array( $wgAntiSpoofProhibitedCharacters ) ) {
			throw new MWException( '$wgAntiSpoofProhibitedCharacters should be an array!' );
		}
		if ( !is_string( $testName ) ) {
			return Status::newFatal( 'antispoof-badtype' );
		}

		if ( strlen( $testName ) == 0 ) {
			return Status::newFatal( 'antispoof-empty' );
		}

		foreach ( self::stringToList( $testName ) as $char ) {
			if ( in_array( $char, $wgAntiSpoofProhibitedCharacters ) ) {
				return self::badCharErr( 'antispoof-prohibited', $char );
			}
		}

		// Perform Unicode _compatibility_ decomposition
		$testName = Validator::toNFKD( $testName );
		$testChars = self::stringToList( $testName );

		// Be paranoid: check again, just in case Unicode normalization code changes...
		foreach ( $testChars as $char ) {
			if ( in_array( $char, $wgAntiSpoofProhibitedCharacters ) ) {
				return self::badCharErr( 'antispoof-prohibited', $char );
			}
		}

		// Check for this: should not happen in any valid Unicode string
		if ( self::getScriptCode( $testChars[0] ) === self::SCRIPT_COMBINING_MARKS ) {
			return self::badCharErr( 'antispoof-combining', $testChars[0] );
		}

		// Strip all combining characters in order to crudely strip accents
		// Note: NFKD normalization should have decomposed all accented chars earlier
		$testChars = self::stripScript( $testChars, self::SCRIPT_COMBINING_MARKS );

		$testScripts = array_map( [ __CLASS__, 'getScriptCode' ], $testChars );
		$unassigned = array_search( self::SCRIPT_UNASSIGNED, $testScripts );
		if ( $unassigned !== false ) {
			return self::badCharErr( 'antispoof-unassigned', $testChars[$unassigned] );
		}
		$deprecated = array_search( self::SCRIPT_DEPRECATED, $testScripts );
		if ( $deprecated !== false ) {
			return self::badCharErr( 'antispoof-deprecated', $testChars[$deprecated] );
		}
		$testScripts = array_unique( $testScripts );

		// We don't mind ASCII punctuation or digits
		$testScripts = array_diff( $testScripts,
			[ self::SCRIPT_ASCII_PUNCTUATION, self::SCRIPT_ASCII_DIGITS ] );

		if ( !$testScripts ) {
			return Status::newFatal( 'antispoof-noletters' );
		}

		if ( count( $testScripts ) > 1 && !self::isAllowedScriptCombination( $testScripts ) ) {
			return Status::newFatal( 'antispoof-mixedscripts' );
		}

		// At this point, we should probably check for BiDi violations if they aren't
		// caught above...

		// Squeeze out all punctuation chars
		// TODO: almost the same code occurs twice, refactor into own routine
		$testChars = self::stripScript( $testChars, self::SCRIPT_ASCII_PUNCTUATION );

		$testName = self::listToString( $testChars );

		// Replace characters in confusables set with equivalence chars
		$testName = self::normalizeString( $testName );

		// Do very simple sequence processing: "vv" -> "w", "rn" -> "m"...
		// Not exhaustive, but ups the ante...
		// Do this _after_ canonicalization: looks weird, but needed for consistency
		$testName = str_replace( 'VV', 'W', $testName );
		$testName = str_replace( 'RN', 'M', $testName );

		// Remove all remaining spaces, just in case any have snuck through...
		$testName = self::hardjoin( explode( " ", $testName ) );

		// Reduce repeated char sequences to single character
		// BUG: TODO: implement this

		if ( strlen( $testName ) < 1 ) {
			return Status::newFatal( 'antispoof-tooshort' );
		}

		// Don't ASCIIfy: we assume we are UTF-8 capable on output

		// Prepend version string, for futureproofing if this algorithm changes
		$testName = "v2:" . $testName;

		// And return the canonical version of the name
		return Status::newGood( $testName );
	}
}
