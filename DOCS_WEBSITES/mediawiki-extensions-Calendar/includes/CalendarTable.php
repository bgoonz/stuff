<?php

use MediaWiki\MediaWikiServices;

class CalendarTable {

	/** @var string */
	protected $lng = 'content';
	/** @var string */
	protected $prevLink = '';
	/** @var string */
	protected $nextLink = '';
	/** @var string */
	protected $calTitle = '';
	/** @var string[] */
	protected $highlightedDays = [];
	/** @var string[] */
	protected $dailyLinks = [];
	/** @var int */
	protected $weekStart = 0;
	/** @var string */
	protected $position = '';
	/** @var string */
	protected $titleLink = '';
	/** @var string */
	protected $generalLinks = '';
	/** @var int */
	protected $dayCharsCount = 0;
	/** @var int */
	protected $monthCharsCount = 0;
	/** @var string */
	protected $tableWidth = 'default';
	/** @var bool */
	protected $showToday = true;

	/** @var int */
	protected $today;
	/** @var int */
	protected $curDay;
	/** @var int */
	protected $curMonth;
	/** @var int */
	protected $curYear;
	/** @var int */
	protected $month;
	/** @var int */
	protected $year;
	/** @var string[] */
	protected $monthArr;
	/** @var string[] */
	protected $dayArr;

	/**
	 * @param int $timestamp
	 * @return int
	 */
	public function dayOfWeek( $timestamp ) {
		return intval( strftime( "%w", $timestamp ) );
	}

	/**
	 * @param int $aMonth
	 * @param int $aYear
	 * @return int
	 */
	public function daysInMonth( $aMonth, $aYear ) {
		for ( $day = 27; checkdate( $aMonth, $day, $aYear ); $day++ ) {
		}
		return --$day;
	}

	/**
	 * @param int $aYear
	 * @return bool
	 */
	public function isLeapYear( $aYear ) {
		return $this->daysInMonth( 2, $aYear ) == 29;
	}

	/**
	 * @param int $aMonth
	 * @param int $aYear
	 * @return int
	 */
	public function dayOfWeekOfFirstOfMonth( $aMonth, $aYear ) {
		return $this->dayOfWeek( mktime( 0, 0, 0, $aMonth, 1, $aYear ) );
	}

	/**
	 * @param int $aMonth
	 * @param int $aLen
	 * @return string
	 */
	public function getMonthName( $aMonth, $aLen ) {
		$out = $this->getLang()->getMonthName( $aMonth );
		return $this->cutLength( $out, $aLen );
	}

	/**
	 * @param int $aMonth
	 * @param int $aLen
	 * @return string
	 */
	public function getMonthNameAbbrev( $aMonth, $aLen ) {
		$out = $this->getLang()->getMonthAbbreviation( $aMonth );
		return $this->cutLength( $out, $aLen );
	}

	/**
	 * @param int $aDay
	 * @param int $aLen
	 * @return string
	 */
	public function getWeekday( $aDay, $aLen ) {
		// Language::getWeekdayName will subtract 1 from key
		$out = $this->getLang()->getWeekdayName( $aDay % 7 + 1 );
		return $this->cutLength( $out, $aLen );
	}

	/**
	 * @param int $aDay
	 * @param int $aLen
	 * @return string
	 */
	public function getWeekdayAbbrev( $aDay, $aLen ) {
		// Language::getWeekdayAbbreviation will subtract 1 from key
		$out = $this->getLang()->getWeekdayAbbreviation( $aDay % 7 + 1 );
		return $this->cutLength( $out, $aLen );
	}

	/**
	 * @param string $string
	 * @param int $len
	 * @return string
	 */
	private function cutLength( $string, $len ) {
		if ( $len > 0 ) {
			$string = mb_substr( $string, 0, $len );
		}
		return ucfirst( $string );
	}

	/**
	 * @return Language
	 */
	private function getLang() {
		if ( $this->lng == 'user' ) {
			global $wgLang;
			return $wgLang;
		}
		return MediaWikiServices::getInstance()->getContentLanguage();
	}

	/**
	 * @param string $str
	 * @param string[] $array
	 * @return string
	 */
	public function replace( $str, array $array ) {
		foreach ( $array as $key => $val ) {
			$str = str_replace( '$' . $key, $val, $str );
		}
		return str_replace( '$%', '$', $str );
	}

	/**
	 * @return string
	 */
	public function buildTable() {
		$day1 = $this->dayOfWeekOfFirstOfMonth( $this->month, $this->year );
		if ( ( $this->weekStart > 0 ) && ( $day1 == 0 ) ) {
			$day1 = 7;
		}
		$days = $this->daysInMonth( $this->month, $this->year );

		$style = '';
		$result = 'calendar';
		switch ( $this->position ) {
			case 'left':
				$result .= ' calLeft';
				break;
			case 'right':
				$result .= ' calRight';
				break;
			case 'center':
				$result .= ' calCenter';
				$style = ' align="center"';
		}

		if ( $this->tableWidth == 'default' ) {
			$result .= ' calWidth';
		} elseif ( $this->tableWidth != 'none' ) {
			$style .= ' style="width: ' . $this->tableWidth . '"';
		}
		$result = '{| class="' . $result . '"' . $style . "\n|-\n";

		$colSpan = 5;
		if ( $this->calTitle == '' ) {
			$this->calTitle = $this->getMonthName( $this->month, $this->monthCharsCount )
				. ' ' . $this->year;
		}
		if ( $this->titleLink != '' ) {
			$this->calTitle = '[[' . $this->titleLink . '|' . $this->calTitle . ']]';
		}
		if ( $this->nextLink == '' ) {
			$colSpan++;
		}
		if ( $this->prevLink == '' ) {
			$colSpan++;
		} else {
			$result .= '| class="prevNext" | ' . $this->prevLink . "\n";
		}
		$result .= '| class="calTitle" colspan="' . $colSpan . '" | ' . $this->calTitle . "\n";
		if ( $this->nextLink != '' ) {
			$result .= '| class="prevNext" | ' . $this->nextLink . "\n";
		}

		$result .= "|-\n";
		for ( $i = $this->weekStart; $i < 7; $i++ ) {
			$result .= "! " . $this->getWeekdayAbbrev( $i, $this->dayCharsCount ) . "\n";
		}
		if ( $this->weekStart > 0 ) {
			for ( $i = 0; $i < $this->weekStart; $i++ ) {
				$result .= "! " . $this->getWeekdayAbbrev( $i, $this->dayCharsCount ) . "\n";
			}
		}

		$c = 1 - $day1 + $this->weekStart;
		while ( $c <= $days ) {
			$result .= "|-\n";
			for ( $i = 0; $i < 7; $i++ ) {
				$this->dayArr['a'] = $this->getWeekdayAbbrev( $i + $this->weekStart, 0 );
				$this->dayArr['A'] = $this->getWeekday( $i + $this->weekStart, 0 );
				$this->dayArr['D'] = (string)$c;
				$this->dayArr['d'] = sprintf( '%02s', $c );
				$this->dayArr['e'] = sprintf( '%2s', $c );
				$styles = [];
				if ( $i == 0 && $this->weekStart == 0 ) {
					$styles[] = 'sundays';
				} elseif ( $i == 6 && $this->weekStart == 1 ) {
					$styles[] = 'sundays';
				}
				if ( $this->showToday && ( $c == $this->curDay ) && ( $this->curMonth == $this->month )
					&& ( $this->curYear == $this->year )
				) {
					$styles[] = 'today';
				}
				if ( in_array( $c, $this->highlightedDays ) ) {
					$styles[] = 'highlighted';
				}
				$allStyles = implode( ' ', $styles );
				if ( $allStyles == '' ) {
					$result .= '| ';
				} else {
					$result .= '| class="' . $allStyles . '" | ';
				}
				if ( $c > 0 && $c <= $days ) {
					if ( $this->dailyLinks[$c] != '' ) {
						$result .= '[[' . $this->dailyLinks[$c] . '|' . $c . ']]';
					} elseif ( $this->generalLinks != '' ) {
						$result .= '[[' . $this->replace( $this->generalLinks, $this->dayArr ) . '|' . $c . ']]';
					} else {
						$result .= $c;
					}
				} else {
					$result .= '&nbsp;';
				}
				$result .= "\n";
				$c++;
			}
		}
		return $result . "|}\n";
	}

	/**
	 * @param array $args
	 */
	public function setParameters( array $args ) {
		$this->today = strtotime( "now" );
		$this->curDay = intval( strftime( "%d", $this->today ) );
		$this->curMonth = intval( strftime( "%m", $this->today ) );
		$this->curYear = intval( strftime( "%Y", $this->today ) );
		$this->month = $this->curMonth;
		$this->year = $this->curYear;
		for ( $i = 0; $i < 32; $i++ ) {
			$this->dailyLinks[$i] = '';
		}
		$offset = 0;

		foreach ( $args as $arg ) {
			$parts = array_map( 'trim', explode( '=', $arg, 2 ) );
			if ( ( count( $parts ) == 2 ) && ( $parts[0] > 0 ) && ( $parts[0] < 32 ) ) {
				$this->dailyLinks[$parts[0]] = $parts[1];
			} else {
				if ( count( $parts ) != 2 ) {
					continue;
				}
				switch ( $parts[0] ) {
					case 'month':
						$this->month = intval( $parts[1] );
						break;
					case 'year':
						$this->year = intval( $parts[1] );
						break;
					case 'offset':
						$offset = intval( $parts[1] );
						break;
					case 'lang':
						$this->lng = strtolower( $parts[1] );
						if ( $this->lng != 'user' ) {
							$this->lng = 'content';
						}
						break;
					case 'prevLink':
						$this->prevLink = $parts[1];
						break;
					case 'nextLink':
						$this->nextLink = $parts[1];
						break;
					case 'title':
						$this->calTitle = $parts[1];
						break;
					case 'highlightedDays':
						$this->highlightedDays =
							preg_split( '/\s+/', $parts[1], 32, PREG_SPLIT_NO_EMPTY );
						break;
					case 'start':
						$this->weekStart = (int)$parts[1];
						if ( $this->weekStart != 1 ) {
							$this->weekStart = 0;
						}
						break;
					case 'position':
						$this->position = strtolower( $parts[1] );
						break;
					case 'titleLink':
						$this->titleLink = $parts[1];
						break;
					case 'generalLinks':
						$this->generalLinks = $parts[1];
						break;
					case 'dayCharsCount':
						$this->dayCharsCount = intval( $parts[1] );
						if ( $this->dayCharsCount < 0 ) {
							$this->dayCharsCount = 0;
						}
						break;
					case 'monthCharsCount':
						$this->monthCharsCount = intval( $parts[1] );
						if ( $this->monthCharsCount < 0 ) {
							$this->monthCharsCount = 0;
						}
						break;
					case 'tableWidth':
						$this->tableWidth = $parts[1];
						if ( $this->tableWidth != 'default' && $this->tableWidth != 'none'
							&& preg_match( '/^\d+(\%|em|ex|pc|pt|px|in|mm|cm)$/', $this->tableWidth ) == 0
						) {
							$this->tableWidth = 'default';
						}
						break;
					case 'showToday':
						$this->showToday = $parts[1] === 'true';
						break;
				}
			}
		}

		if ( ( $this->month < 1 ) || ( $this->month > 12 ) ) {
			$this->month = $this->curMonth;
			$this->year = $this->curYear;
		}

		if ( $offset != 0 ) {
			$offM = $offset % 12;
			$offset = (int)round( ( $offset - $offM ) / 12 );
			$this->month += $offM;
			$this->year += $offset;
			if ( $this->month > 12 ) {
				$this->month -= 12;
				$this->year++;
			}
			if ( $this->month < 1 ) {
				$this->month += 12;
				$this->year--;
			}
		}
		if ( $this->year < 1970 ) {
			$this->month = 1;
			$this->year = 1970;
		} elseif ( $this->year > 2037 ) {
			$this->month = 12;
			$this->year = 2037;
		}

		$prevMonthYear = $this->year;
		$prevMonth = $this->month - 1;
		if ( $prevMonth == 0 ) {
			$prevMonth = 12;
			$prevMonthYear--;
		}
		$nextMonthYear = $this->year;
		$nextMonth = $this->month + 1;
		if ( $nextMonth == 13 ) {
			$nextMonth = 1;
			$nextMonthYear++;
		}
		$this->monthArr = [
			'b' => $this->getMonthNameAbbrev( $this->month, 0 ),
			'B' => $this->getMonthName( $this->month, 0 ),
			'm' => sprintf( '%02s', $this->month ),
			'M' => sprintf( '%02s', $nextMonth ),
			'n' => $this->getMonthNameAbbrev( $nextMonth, 0 ),
			'N' => $this->getMonthName( $nextMonth, 0 ),
			'o' => substr( (string)$nextMonthYear, 2, 2 ),
			'O' => (string)$nextMonthYear,
			'p' => $this->getMonthNameAbbrev( $prevMonth, 0 ),
			'P' => $this->getMonthName( $prevMonth, 0 ),
			'q' => substr( (string)$prevMonthYear, 2, 2 ),
			'Q' => (string)$prevMonthYear,
			'R' => sprintf( '%02s', $prevMonth ),
			'y' => substr( (string)$this->year, 2, 2 ),
			'Y' => (string)$this->year
		];
		$this->dayArr = $this->monthArr;
		$this->titleLink = $this->replace( $this->titleLink, $this->monthArr );
		$this->prevLink = $this->replace( $this->prevLink, $this->monthArr );
		$this->nextLink = $this->replace( $this->nextLink, $this->monthArr );
	}
}
