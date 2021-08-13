<?php
/**
 * Allows sysops to unlock a page and all subpages of that page for anonymous editing
 * via MediaWiki:Unlockedpages
 */
class ExtEditSubpages {
	/**
	 * @var array
	 */
	private static $cache = [];

	/**
	 * @param Title $title
	 * @param User $user
	 * @param string $action
	 * @param bool &$result
	 * @return bool
	 */
	public static function editSubpages( $title, $user, $action, &$result ) {
		global $wgEditSubpagesDefaultFlags;

		if ( $title->getNamespace() < 0 ) {
			return true; // don't operate on "special" namespaces
		}

		$pagename = $title->getText(); // name of page w/ spaces, not underscores

		if ( !isset( self::$cache['pagename'] ) || $pagename != self::$cache['pagename'] ) {
			$ns = $title->getNsText(); // namespace

			if ( $title->isTalkPage() ) {
				$ns = $title->getTalkNsText();
				$nstalk = '';
			} else {
				$nstalk = $title->getTalkNsText();
			}

			if ( $ns == '' ) {
				$text = $pagename;
			} else {
				$text = $ns . ':' . $pagename;
			}

			if ( $nstalk != '' ) {
				$talktext = $nstalk . ':' . $pagename;
			} else {
				$talktext = $pagename;
			}

			// underscores -> spaces
			$ns = str_replace( '_', ' ', $ns );
			$nstalk = str_replace( '_', ' ', $nstalk );
			$pages = explode( "\n", wfMessage( 'unlockedpages' )->plain() );

			// cache the values so future checks on the same page take less time
			self::$cache = [
				'pagename' => $pagename,
				'ns' => $ns,
				'nstalk' => $nstalk,
				'text' => $text,
				'talktext' => $talktext,
				'pages' => $pages,
				'loggedin' => $user->isRegistered(),
			];
		}

		if ( $action == 'edit' || $action == 'submit' ) {
			foreach ( self::$cache['pages'] as $value ) {
				if ( strpos( $value, '*' ) === false || strpos( $value, '*' ) !== 0 ) {
					continue; // "*" doesn't start the line, so treat it as a comment (aka skip over it)
				}

				if ( !is_array( $wgEditSubpagesDefaultFlags ) ) {
					$config_flags = self::parseFlags( $wgEditSubpagesDefaultFlags );
				} else {
					$config_flags = $wgEditSubpagesDefaultFlags;
				}

				// also hardcode the default flags just in case they are not set in $config_flags
				$default_flags = [
					's' => true,  // unlock subpages
					'c' => true,  // allow page creation
					't' => true,  // unlock talk pages
					'e' => true,  // allow editing existing pages
					'b' => false, // unlock base pages
					'u' => false, // apply restrictions to users as well
					'i' => false, // case insensitive
					'n' => false, // namespace inspecific
					'r' => false, // regex fragment
					'w' => false, // wildcard matching
				];
				$flags = array_merge( $default_flags, $config_flags );
				$value = trim( trim( trim( trim( $value ), '*[]' ) ), '*[]' );
				$pieces = explode( '|', $value, 3 );

				if ( isset( $pieces[1] ) ) {
					$flags = array_merge( $flags, self::parseFlags( $pieces[1] ) );
				}

				$found = self::checkPage( $pieces[0], self::$cache['text'], $flags );
				$newtitle = Title::newFromText( $pieces[0] );

				// make sure that it's a valid title
				if ( !( $newtitle instanceof Title ) ) {
					continue;
				}

				if ( !$found && $flags['n'] ) {
					$found = self::checkPage( $pieces[0], self::$cache['pagename'], $flags );
				}

				if ( !$found && $flags['t'] && !$newtitle->isTalkPage() && $newtitle->canHaveTalkPage() ) {
					$talk = $newtitle->getTalkPage();
					$talkpage = $talk->getPrefixedText();
					$found = self::checkPage( $talkpage, self::$cache['talktext'], $flags );

					if ( !$found ) {
						$found = self::checkPage( $talkpage, self::$cache['text'], $flags );
					}
				}

				if ( !$found ) {
					continue;
				}

				if ( !$flags['u'] && self::$cache['loggedin'] ) {
					return true;
				}

				// the page matches, now process it and let the software know whether or not to allow the user
				// to do this action
				if ( !$flags['c'] && !$newtitle->exists() ) {
					$result = false;
					return false;
				}

				if ( !$flags['e'] && $newtitle->exists() ) {
					$result = false;
					return false;
				}

				$result = true;
				return false;
			}

			if ( !self::$cache['loggedin'] ) {
				$result = false;
				return false;
			}
		}

		return true;
	}

	/**
	 * Parses a string of flags in the form +blah-blah (or -blah+blah, or +b+l+a+h-b-l-a-h, etc.) into an array
	 * If a flag is encountered multiple times, the - will override the +,
	 * regardless of what position it was in originally.
	 *
	 * If no + or - prefixes a flag, it assumes that it is following the last seen + or -,
	 * if it is at the beginning, + is implied
	 *
	 * @param string $flags_string Flags in +- format
	 * @return array of flags with the flag letter as the key and boolean true or false as the value
	 */
	protected static function parseFlags( $flags_string = '' ) {
		$flags = [
			'+' => [],
			'-' => []
		];
		$type = '+';
		$strflags = str_split( $flags_string );

		foreach ( $strflags as $c ) {
			if ( $c == '+' ) {
				$type = '+';
			} elseif ( $c == '-' ) {
				$type = '-';
			} else {
				$flags[$type][$c] = ( $type == '+' );
			}
		}

		return array_merge( $flags['+'], $flags['-'] );
	}

	/**
	 * @param WikiPage $page
	 * @param bool $check
	 * @param int $flags
	 * @return bool
	 */
	protected static function checkPage( $page, $check, $flags ) {
		if ( $flags['r'] ) {
			$i = ( $flags['i'] ) ? 'i' : '';
			if ( strpos( $page, '#' ) !== false ) {
				return false; // # isn't valid in pagenames anyway
			}

			return preg_match( '#^' . $page . '$#' . $i, $check );
		}

		if ( $flags['i'] ) {
			$page = mb_strtolower( $page );
			$check = mb_strtolower( $check );
		}

		if ( $flags['w'] ) {
			return fnmatch( $page, $check );
		}

		if ( $page == $check ) {
			return true;
		}

		if ( $flags['s'] && strpos( $check, $page . '/' ) === 0 ) {
			return true;
		}

		if ( $flags['b'] && strpos( $page, $check . '/' ) === 0 ) {
			return true;
		}

		return false;
	}
}
