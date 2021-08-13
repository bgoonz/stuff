<?php

/**
 * Some hooks for Calendar extension.
 */
class CalendarHooks {
	/**
	 * @param Parser $parser
	 */
	public static function setupParserHooks( Parser $parser ) {
		$parser->setFunctionHook( 'calendar', [ 'CalendarHooks', 'calendarMagicWord' ] );
	}

	/**
	 * @param Parser $parser
	 * @param string ...$args
	 * @return string
	 */
	public static function calendarMagicWord( Parser $parser, ...$args ) {
		$parser->getOutput()->addModuleStyles( 'ext.calendar' );

		$calendar = new CalendarTable;
		$calendar->setParameters( $args );
		return $calendar->buildTable();
	}
}
