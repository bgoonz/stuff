<?php

class BibManagerValidator {

	public static function validateRequired ( $fieldName, $value, $allData ) {
		if ( !empty( $value ) )
			return true;
		$entryType = $allData['bm_bibtexEntryType'];
		$typeDefs = BibManagerFieldsList::getTypeDefinitions(); // TODO RBV (17.12.11 13:34): Cache?
		$currentType = $typeDefs[$entryType];
		if ( in_array( $fieldName, $currentType['required'] ) ) {
			return wfMessage( 'bm_required-field-empty' )->text();
		}
		return true;
	}

	/**
	 * checks if value is set.
	 * @param type $value
	 * @param type $allData
	 * @return type mixed true if valid, else error-message
	 */
	public static function validateEmpty ( $value, $allData = '' ) {
		if ( empty( $value ) )
			return wfMessage( 'bm_required-field-empty' )->text();
	}

	/**
	 * checks if citation exists in database.
	 * @param type $value
	 * @param type $allData
	 * @return type mixed true if valid, else error-message
	 */
	public static function validateCitation ( $value, $allData = '' ) {
		global $wgBibManagerCitationArticleNamespace;
		if ( empty( $value ) )
			return wfMessage( 'bm_required-field-empty' )->text();
		//HINT: https://www.mediawiki.org/wiki/Help:Bad_title
		$title = Title::newFromText( $value, $wgBibManagerCitationArticleNamespace );
		if ( $title === null )
			return wfMessage( 'bm_error_citation_invalid' )->text();

		$repo = BibManagerRepository::singleton();
		if ( $repo->getBibEntries( array ( "bm_bibtexCitation" => $value ) ) !== false ) {
			return $repo->getCitationsLike( $value ); // TODO RBV (18.12.11 15:47): Bad interface! Better get citations by PK and if not empty create error message here!
		}

		$result = true;
		Hooks::run( 'BibManagerValidateCitation', array ( $value, $allData, &$result ) );

		return $result;
	}

	/**
	 * checks if the input-string only consists of Letters (all utf-8)
	 * @param String $value
	 * @param Array $allData
	 * @return mixed true if valid, else error-message 
	 */
	public static function validateLetter ( $value, $allData = '' ) {
		if ( !empty( $value ) && !preg_match( "/^[\pL]*$/", $value ) )
			return wfMessage( 'bm_wrong-character' )->text();
		return true;
	}

	/**
	 * checks if the input-string only consists of Letters (all utf-8) and Integers
	 * @param String $value
	 * @param Array $allData
	 * @return mixed true if valid, else error-message 
	 */
	public static function validateLetterAndNumber ( $value, $allData = '' ) {

		if ( !empty( $value ) && !preg_match( "/^[\pL0-9\ ]*$/", $value ) )
			return wfMessage( 'bm_wrong-character' )->text();
		return true;
	}

	/**
	 * checks if the input-string only consists Integers
	 * @param String $value
	 * @param Array $allData
	 * @return mixed true if valid, else error-message 
	 */
	public static function validateInt ( $value, $allData = '' ) {
		if ( !empty( $value ) && !filter_var( $value, FILTER_VALIDATE_INT ) )
			return wfMessage( 'bm_wrong-character' )->text();
		return true;
	}

	//<editor-fold defaultstate="collapsed" desc="One callback a day keeps the doctor away" >

	/**
	 * 
	 * @param String $value
	 * @param Array $allData
	 * @return mixed true if valid, else error-message 
	 */
	public static function validateAddress ( $value, $allData = '' ) {
		//This is necessary because MW 1.16.x does not validate required fields itself.
		$result = self::validateRequired( 'address', $value, $allData );
		return $result;
	}

	/**
	 * 
	 * @param String $value
	 * @param Array $allData
	 * @return mixed true if valid, else error-message 
	 */
	public static function validateAnnote ( $value, $allData = '' ) {
		$result = self::validateRequired( 'annote', $value, $allData );
		return $result;
	}

	/**
	 * 
	 * @param String $value
	 * @param Array $allData
	 * @return mixed true if valid, else error-message 
	 */
	public static function validateAuthor ( $value, $allData = '' ) {
		$result = self::validateRequired( 'author', $value, $allData );
		//Even if author is required it is sufficient if an editor is provided.
		if( $result !== true && !empty( $allData['bm_editor'] ) ) $result = true;
		return $result;
	}

	/**
	 * 
	 * @param String $value
	 * @param Array $allData
	 * @return mixed true if valid, else error-message 
	 */
	public static function validateBooktitle ( $value, $allData = '' ) {
		$result = self::validateRequired( 'booktitle', $value, $allData );
		return $result;
	}

	/**
	 * 
	 * @param String $value
	 * @param Array $allData
	 * @return mixed true if valid, else error-message 
	 */
	public static function validateChapter ( $value, $allData = '' ) {
		$result = self::validateRequired( 'chapter', $value, $allData );
		if ( $result === true ) {
			$result = self::validateInt( $value, $allData );
		}
		return $result;
	}

	/**
	 * 
	 * @param String $value
	 * @param Array $allData
	 * @return mixed true if valid, else error-message 
	 */
	public static function validateCrossref ( $value, $allData = '' ) {
		$result = self::validateRequired( 'crossref', $value, $allData ); // TODO RBV (17.12.11 13:28): validate, hook?
		return $result;
	}

	/**
	 * 
	 * @param String $value
	 * @param Array $allData
	 * @return mixed true if valid, else error-message 
	 */
	public static function validateEdition ( $value, $allData = '' ) {
		$result = self::validateRequired( 'edition', $value, $allData );
		return $result;
	}

	/**
	 * 
	 * @param String $value
	 * @param Array $allData
	 * @return mixed true if valid, else error-message 
	 */
	public static function validateEditor ( $value, $allData = '' ) {
		$result = self::validateRequired( 'editor', $value, $allData );
		//Even if editor is required it is sufficient if an author is provided.
		if( $result !== true && !empty( $allData['bm_author'] ) ) $result = true;
		return $result;
	}

	/**
	 * 
	 * @param String $value
	 * @param Array $allData
	 * @return mixed true if valid, else error-message 
	 */
	public static function validateHowpublished ( $value, $allData = '' ) {
		$result = self::validateRequired( 'howpublished', $value, $allData );
		return $result;
	}

	/**
	 * 
	 * @param String $value
	 * @param Array $allData
	 * @return mixed true if valid, else error-message 
	 */
	public static function validateInstitution ( $value, $allData = '' ) {
		$result = self::validateRequired( 'institution', $value, $allData );
		return $result;
	}

	/**
	 * 
	 * @param String $value
	 * @param Array $allData
	 * @return mixed true if valid, else error-message 
	 */
	public static function validateJournal ( $value, $allData = '' ) {
		$result = self::validateRequired( 'journal', $value, $allData );
		return $result;
	}

	/**
	 * 
	 * @param String $value
	 * @param Array $allData
	 * @return mixed true if valid, else error-message 
	 */
	public static function validateKey ( $value, $allData = '' ) {
		$result = self::validateRequired( 'key', $value, $allData );
		return $result;
	}

	/**
	 * 
	 * @param String $value
	 * @param Array $allData
	 * @return mixed true if valid, else error-message 
	 */
	public static function validateMonth ( $value, $allData = '' ) {
		$result = self::validateRequired( 'month', $value, $allData );
		return $result;
	}

	/**
	 * 
	 * @param String $value
	 * @param Array $allData
	 * @return mixed true if valid, else error-message 
	 */
	public static function validateNote ( $value, $allData = '' ) {
		$result = self::validateRequired( 'note', $value, $allData );
		return $result;
	}

	/**
	 * 
	 * @param String $value
	 * @param Array $allData
	 * @return mixed true if valid, else error-message 
	 */
	public static function validateNumber ( $value, $allData = '' ) {
		$result = self::validateRequired( 'number', $value, $allData );
		if ( $result === true ) {
			$result = self::validateInt( $value, $allData );
		}
		return $result;
	}

	/**
	 * 
	 * @param String $value
	 * @param Array $allData
	 * @return mixed true if valid, else error-message 
	 */
	public static function validateOrganization ( $value, $allData = '' ) {
		$result = self::validateRequired( 'organization', $value, $allData );
		return $result;
	}

	/**
	 * checks if the input-string is a valid page-type (just Int plus : or =)
	 * @param String $value
	 * @param Array $allData
	 * @return mixed true if valid, else error-message 
	 */
	public static function validatePages ( $value, $allData = '' ) {
		$result = self::validateRequired( 'pages', $value, $allData );
		if ( $result === true && !empty( $value ) && !preg_match( "/^[0-9\:\=-]*$/", $value ) )
			$result = wfMessage( 'bm_wrong-character' )->text();
		return $result;
	}

	/**
	 * 
	 * @param String $value
	 * @param Array $allData
	 * @return mixed true if valid, else error-message 
	 */
	public static function validatePublisher ( $value, $allData = '' ) {
		$result = self::validateRequired( 'publisher', $value, $allData );
		return $result;
	}

	/**
	 * 
	 * @param String $value
	 * @param Array $allData
	 * @return mixed true if valid, else error-message 
	 */
	public static function validateSchool ( $value, $allData = '' ) {
		$result = self::validateRequired( 'school', $value, $allData );
		return $result;
	}

	/**
	 * 
	 * @param String $value
	 * @param Array $allData
	 * @return mixed true if valid, else error-message 
	 */
	public static function validateSeries ( $value, $allData = '' ) {
		$result = self::validateRequired( 'series', $value, $allData );
		return $result;
	}

	/**
	 * 
	 * @param String $value
	 * @param Array $allData
	 * @return mixed true if valid, else error-message 
	 */
	public static function validateTitle ( $value, $allData = '' ) {
		$result = self::validateRequired( 'title', $value, $allData );
		return $result;
	}

	/**
	 * 
	 * @param String $value
	 * @param Array $allData
	 * @return mixed true if valid, else error-message 
	 */
	public static function validateType ( $value, $allData = '' ) {
		$result = self::validateRequired( 'type', $value, $allData );
		return $result;
	}

	/**
	 * checks if the input-string is a valid url (leading http:// required)
	 * @param String $value
	 * @param Array $allData
	 * @return mixed true if valid, else error-message 
	 */
	public static function validateUrl ( $value, $allData = '' ) {
		$result = self::validateRequired( 'url', $value, $allData );
		if ( $result === true && !empty( $value ) && !filter_var( $value, FILTER_VALIDATE_URL ) )
			$result = wfMessage( 'bm_wrong-url-format' )->text();
		return $result;
	}

	/**
	 * 
	 * @param String $value
	 * @param Array $allData
	 * @return mixed true if valid, else error-message 
	 */
	public static function validateVolume ( $value, $allData = '' ) {
		$result = self::validateRequired( 'volume', $value, $allData );
		if ( $result === true ) {
			$result = self::validateInt( $value, $allData );
		}
		return $result;
	}

	/**
	 * checks if the input-string just consists of Integer
	 * @param String $value
	 * @param Array $allData
	 * @return mixed true if valid, else error-message 
	 */
	public static function validateYear ( $value, $allData = '' ) {
		$result = self::validateRequired( 'year', $value, $allData );
		if ( !empty( $value ) && !preg_match( "/^[0-9]*$/", $value ) )
			$result = wfMessage( 'bm_wrong-character' )->text();
		return $result;
	}

	//</editor-fold>
}
