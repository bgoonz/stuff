<?php

class DPLLogger {

	/**
	 * @var int
	 */
	public $iDebugLevel;

	public function __construct() {
		$this->iDebugLevel = ExtDynamicPageList::$options['debug']['default'];
	}

	/**
	 * Get a message, with optional parameters
	 * Parameters from user input must be escaped for HTML *before* passing to this function
	 *
	 * @param int $msgid
	 * @return string HTML
	 */
	function msg( $msgid ) {
		if ( $this->iDebugLevel >= ExtDynamicPageList::$debugMinLevels[$msgid] ) {
			$args = func_get_args();
			array_shift( $args );
			$val = '';
			if ( array_key_exists( 0, $args ) ) {
				$val = $args[0];
			}
			array_shift( $args );
			/**
			 * @todo add a DPL id to identify the DPL tag that generates the message, in case of multiple DPLs in the page
			 */
			$text = '';
			if ( ExtDynamicPageList::$behavingLikeIntersection ) {
				if ( $msgid == ExtDynamicPageList::FATAL_TOOMANYCATS ) {
					$text = wfMessage( 'intersection_toomanycats', $args )->escaped();
				} elseif ( $msgid == ExtDynamicPageList::FATAL_TOOFEWCATS ) {
					$text = wfMessage( 'intersection_toofewcats', $args )->escaped();
				} elseif ( $msgid == ExtDynamicPageList::WARN_NORESULTS ) {
					$text = wfMessage( 'intersection_noresults', $args )->escaped();
				} elseif ( $msgid == ExtDynamicPageList::FATAL_NOSELECTION ) {
					$text = wfMessage( 'intersection_noincludecats', $args )->escaped();
				}
			}
			if ( $text == '' ) {
				$text = wfMessage( 'dpl_log_' . $msgid, $args )->escaped();
				$text = str_replace( '$0', $val, $text );
			}
			return '<p>Extension:DynamicPageList (DPL), version ' . ExtDynamicPageList::$DPLVersion . ' : ' . $text . '</p>';
		}
		return '';
	}

	/**
	 * Get a message.
	 * Parameters may be unescaped, this function will escape them for HTML.
	 *
	 * @param int $msgid
	 * @return string HTML
	 */
	public function escapeMsg( $msgid ) {
		$args = func_get_args();
		$args = array_map( 'htmlspecialchars', $args );
		return call_user_func_array( array( $this, 'msg' ), $args );
	}

	/**
	 * Get a "wrong parameter" message.
	 *
	 * @param string $paramvar The parameter name
	 * @param string $val The unescaped input value
	 * @return string HTML error message
	 */
	public function msgWrongParam( $paramvar, $val ) {
		$msgid = ExtDynamicPageList::WARN_WRONGPARAM;
		switch ( $paramvar ) {
			case 'namespace':
			case 'notnamespace':
				$msgid = ExtDynamicPageList::FATAL_WRONGNS;
				break;
			case 'linksto':
			case 'notlinksto':
			case 'linksfrom':
				$msgid = ExtDynamicPageList::FATAL_WRONGLINKSTO;
				break;
			case 'titlemaxlength':
			case 'includemaxlength':
			case 'randomseed':
				$msgid = ExtDynamicPageList::WARN_WRONGPARAM_INT;
				break;
		}
		$paramoptions = array_unique( ExtDynamicPageList::$options[$paramvar] );
		sort( $paramoptions );
		return $this->escapeMsg( $msgid, $paramvar, htmlspecialchars( $val ), ExtDynamicPageList::$options[$paramvar]['default'], implode( ' | ', $paramoptions ) );
	}

}
