<?php

class DPLVariables {

	/**
	 * @var string[]
	 */
	static $memoryVar = array();

	/**
	 * Expects pairs of 'variable name' and 'value'
	 * if the first parameter is empty it will be ignored {{#vardefine:|a|b}} is the same as {{#vardefine:a|b}}
	 *
	 * @param string[] $arg
	 * @return string
	 */
	public static function setVar( $arg ) {
		$numargs = count( $arg );
		if ( $numargs >= 3 && $arg[2] == '' ) {
			$start = 3;
		} else {
			$start = 2;
		}
		for ( $i = $start; $i < $numargs; $i++ ) {
			$var = $arg[$i];
			if ( ++$i <= $numargs - 1 ) {
				self::$memoryVar[$var] = $arg[$i];
			} else {
				self::$memoryVar[$var] = '';
			}
		}
		return '';
	}

	public static function setVarDefault( $arg ) {
		$numargs = count( $arg );
		if ( $numargs > 3 ) {
			$value = $arg[3];
		} else {
			return '';
		}
		$var = $arg[2];
		if ( !array_key_exists( $var, self::$memoryVar ) || self::$memoryVar[$var] == '' ) {
			self::$memoryVar[$var] = $value;
		}
		return '';
	}

	public static function getVar( $var ) {
		if ( array_key_exists( $var, self::$memoryVar ) ) {
			return self::$memoryVar[$var];
		}
		return '';
	}

}
