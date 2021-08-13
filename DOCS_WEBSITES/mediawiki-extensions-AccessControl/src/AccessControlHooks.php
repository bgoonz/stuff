<?php

use MediaWiki\MediaWikiServices;

/**
 * @license GPL-2.0-or-later
 */
class AccessControlHooks {

	/**
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/ParserFirstCallInit
	 *
	 * @param Parser $parser
	 */
	public static function accessControlExtension( Parser $parser ) {
		/* This the hook function adds the tag <accesscontrol> to the wiki parser */
		$parser->setHook( 'accesscontrol', [ __CLASS__, 'doControlUserAccess' ] );
	}

	/**
	 * @param string $input
	 * @param string[] $args
	 * @param Parser $parser
	 * @param PPFrame $frame
	 * @return string
	 */
	public static function doControlUserAccess( $input, array $args, Parser $parser, PPFrame $frame ) {
		/* Function called by accessControlExtension */
		return self::displayGroups();
	}

	/**
	 * @param string $tagContent
	 * @return string[][]
	 */
	public static function accessControl( $tagContent ) {
		$accessgroup = [ [], [] ];
		$listaccesslist = explode( ',', $tagContent );
		foreach ( $listaccesslist as $accesslist ) {
			if ( strpos( $accesslist, "(ro)" ) !== false ) {
				$accesslist = trim( str_replace( "(ro)", "", $accesslist ) );
				$group = self::makeGrouparray( $accesslist );
				$accessgroup[1] = array_merge( $accessgroup[1], $group[0] );
				$accessgroup[1] = array_merge( $accessgroup[1], $group[1] );
			} else {
				$accesslist = trim( $accesslist );
				$group = self::makeGrouparray( $accesslist );
				$accessgroup[0] = array_merge( $accessgroup[0], $group[0] );
				$accessgroup[1] = array_merge( $accessgroup[1], $group[1] );
			}
		}

		return $accessgroup;
	}

	/**
	 * @param string[] $accesslist
	 * @return string[][]
	 */
	public static function makeGrouparray( $accesslist ) {
		/* Function returns array with two lists.
			First is list full access users.
			Second is list readonly users. */
		$userswrite = [];
		$usersreadonly = [];
		$users = self::getUsersFromPages( $accesslist );
		foreach ( array_keys( $users ) as $user ) {
			switch ( $users[$user] ) {
				case 'read':
					$usersreadonly[] = $user;
					break;
				case 'edit':
					$userswrite[] = $user;
					break;
			}
		}

		return [ $userswrite, $usersreadonly ];
	}

	/**
	 * @return string
	 */
	public static function displayGroups() {
		/** Function replace the tag <accesscontrol> and his content,
		 * behind info about a protection this the page
		 */
		return '<p id="accesscontrol" style="text-align:center;color:#BA0000;font-size:8pt">' .
			wfMessage( 'accesscontrol-info' )->text() .
			"</p>";
	}

	/**
	 * @param int $namespace
	 * @param string $title
	 * @return string|null
	 */
	public static function getContentPage( $namespace, $title ) {
		/* Function get content the page identified by title object from database */
		$gt = Title::makeTitle( $namespace, $title );
		if ( $gt->isSpecialPage() || !$gt->canExist() ) {
			// Can't create WikiPage for special page or other impossible page titles
			return '';
		}
		// Article::fetchContent() is deprecated.
		// Replaced by WikiPage::getContent()
		$page = WikiPage::factory( $gt );
		$content = ContentHandler::getContentText( $page->getContent() );
		return $content;
	}

	/**
	 * @param string $template
	 * @return string|null
	 */
	public function getTemplatePage( $template ) {
		/* Function get content the template page identified by title object from database */
		$gt = Title::makeTitle( NS_TEMPLATE, $template );
		// Article::fetchContent() is deprecated.
		// Replaced by WikiPage::getContent()
		$page = WikiPage::factory( $gt );
		$content = ContentHandler::getContentText( $page->getContent() );
		return $content;
	}

	/**
	 * @param string $group
	 * @return string[]
	 */
	public static function getUsersFromPages( $group ) {
		/* Extracts the allowed users from the userspace access list */
		$allow = [];
		$gt = Title::makeTitle( NS_MAIN, $group );
		// Article::fetchContent() is deprecated.
		// Replaced by WikiPage::getContent()
		$groupPage = WikiPage::factory( $gt );
		$allowedUsers = ContentHandler::getContentText( $groupPage->getContent() );
		$groupPage = null;
		$usersAccess = explode( "\n", $allowedUsers );
		foreach ( $usersAccess as $userEntry ) {
			$userItem = trim( $userEntry );
			if ( substr( $userItem, 0, 1 ) == "*" ) {
				if ( strpos( $userItem, "(ro)" ) === false ) {
					$user = trim( str_replace( "*", "", $userItem ) );
					$allow[$user] = 'edit';
				} else {
					$user = trim( str_replace( "*", "", $userItem ) );
					$user = trim( str_replace( "(ro)", "", $user ) );
					$allow[$user] = 'read';
				}
			}
		}
		return $allow;
	}

	/**
	 * @param string $info
	 * @return void
	 */
	private static function doRedirect( $info ) {
		/* make redirection for non authorized users */
		global $wgScript, $wgSitename, $wgOut, $wgAccessControlRedirect;
		// removing info about redirect from session after move..
		unset( $_SESSION['redirect'] );
		$wgOut->clearHTML();
		$wgOut->prependHTML( wfMessage( 'accesscontrol-info-box' )->text() );
		if ( $wgAccessControlRedirect ) {
			header( "Location: " . $wgScript . "/" . $wgSitename . ":" . wfMessage( $info )->text() );
		}
	}

	/**
	 * @param string $string
	 * @param User $user
	 * @return true|void
	 */
	private static function fromTemplates( $string, User $user ) {
		global $wgActions, $wgAdminCanReadAll;
		// Template extraction
		if ( strpos( $string, '{{' ) >= 0 ) {
			if ( substr( $string, strpos( $string, '{{' ), 3 ) === '{{{' ) {
				$start = strpos( $string, '{{{' );
				$end = strlen( $string );
				$skok = $start + 3;
				self::fromTemplates( substr( $string, $skok, $end - $skok ), $user );
			} else {
				$start = strpos( $string, '{{' );
				$end = strpos( $string, '}}' );
				$skok = $start + 2;
				$templatepage = substr( $string, $skok, $end - $skok );
				if ( substr( $templatepage, 0, 1 ) == '{' ) {
					// The check of included code
					$rights = self::fromTemplates( $templatepage, $user );
				} elseif ( substr( $templatepage, 0, 1 ) == ':' ) {
					// The check of included page
					$rights = self::allRightTags( self::getContentPage( NS_MAIN, substr( $templatepage, 1 ) ), $user );
				} elseif ( ctype_alnum( substr( $templatepage, 0, 1 ) ) ) {
					// The check of included template
					if ( strpos( $templatepage, '|' ) > 0 ) {
						$templatename = substr( $templatepage, 0, strpos( $templatepage, '|' ) );
						$rights = self::allRightTags( self::getContentPage( NS_TEMPLATE, $templatename ), $user );
					} else {
						$rights = self::allRightTags( self::getContentPage( NS_TEMPLATE, $templatepage ), $user );
					}
				}

				if ( isset( $rights ) ) {
					if ( is_array( $rights ) ) {
						if ( $user->isAnon() ) {
							/* Redirection unknown users */
							$wgActions['view'] = false;
							self::doRedirect( 'accesscontrol-move-anonymous' );
						} else {
							if ( method_exists( MediaWikiServices::class, 'getUserGroupManager' ) ) {
								// MW 1.35+
								$groups = MediaWikiServices::getInstance()->getUserGroupManager()
									->getUserGroups( $user );
							} else {
								$groups = $user->getGroups();
							}
							if ( in_array( 'sysop', $groups, true ) &&
								$wgAdminCanReadAll
							) {
								return true;
							}
							$users = self::accessControl( $rights['groups'] );
							if ( !in_array( $user->getName(), $users[0], true ) ) {
								$wgActions['edit'] = false;
								$wgActions['history'] = false;
								$wgActions['submit'] = false;
								$wgActions['info'] = false;
								$wgActions['raw'] = false;
								$wgActions['delete'] = false;
								$wgActions['revert'] = false;
								$wgActions['revisiondelete'] = false;
								$wgActions['rollback'] = false;
								$wgActions['markpatrolled'] = false;
								if ( !in_array( $user->getName(), $users[1], true ) ) {
									$wgActions['view'] = false;

									return self::doRedirect( 'accesscontrol-move-users' );
								}
							}
						}
					}
				}
			}
		}
	}

	/**
	 * @param string $string
	 * @param User $user
	 * @return array|false|void
	 */
	private static function allRightTags( $string, User $user ) {
		/* Function for extraction content tag accesscontrol from raw source the page */
		$contenttag = [];
		$starttag = "<accesscontrol>";
		$endtag = "</accesscontrol>";
		$redirecttag = "redirect";

		if ( ( mb_substr( trim( $string ), 0, 1 ) == "#" ) &&
			( stripos( mb_substr( trim( $string ), 1, 9 ), $redirecttag ) == "0" )
		) {
			# Treatment redirects - content variable $string must
			# be replaced over content the target page
			$sourceredirecttag = mb_substr( $string, 0, strpos( $string, ']]' ) );
			$redirecttarget = trim( substr( $sourceredirecttag, strpos( $sourceredirecttag, '[[' ) + 2 ) );
			if ( strpos( $redirecttarget, '|' ) ) {
				$redirecttarget = trim( substr( $redirecttarget, 0, strpos( $redirecttarget, '|' ) ) );
			}
			$gt = Title::makeTitle( NS_MAIN, $redirecttarget );

			return self::allRightTags( self::getContentPage( $gt->getNamespace(), $gt ), $user );
		}

		// The control of included pages and templates on appearing of accesscontrol tag
		self::fromTemplates( $string, $user );
		$start = strpos( $string, $starttag );
		if ( $start !== false ) {
			$start += strlen( $starttag );
			$end = strpos( $string, $endtag );
			if ( $end !== false ) {
				$groupsString = substr( $string, $start, $end - $start );
				if ( strlen( $groupsString ) == 0 ) {
					$contenttag['end'] = strlen( $starttag ) + strlen( $endtag );
				} else {
					$contenttag['groups'] = $groupsString;
					$contenttag['end'] = $end + strlen( $endtag );
				}

				if ( isset( $_SESSION['redirect'] ) ) {
					$_SESSION['redirect'] = $contenttag;
				} else {
					return $contenttag;
				}
			}
		} else {
			return $_SESSION['redirect'] ?? false;
		}
	}

	/**
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/userCan
	 *
	 * @param Title $title
	 * @param User $user
	 * @param string $action
	 * @param string &$result
	 * @return true|void
	 */
	public static function onUserCan( $title, $user, $action, &$result ) {
		/* Main function control access for all users */
		global $wgActions, $wgAdminCanReadAll;
		if ( $user->isAnon() ) {
			/* Deny actions for all anonymous */
			$wgActions['edit'] = false;
			$wgActions['history'] = false;
			$wgActions['submit'] = false;
			$wgActions['info'] = false;
			$wgActions['raw'] = false;
			$wgActions['delete'] = false;
			$wgActions['revert'] = false;
			$wgActions['revisiondelete'] = false;
			$wgActions['rollback'] = false;
			$wgActions['markpatrolled'] = false;
		}

		$rights = self::allRightTags( self::getContentPage(
			$title->getNamespace(),
			$title->getDBkey()
		), $user );

		if ( is_array( $rights ) ) {
			if ( $user->isAnon() ) {
				/* Redirection unknown users */
				$wgActions['view'] = false;
				self::doRedirect( 'accesscontrol-redirect-anonymous' );
			} else {
				if ( method_exists( MediaWikiServices::class, 'getUserGroupManager' ) ) {
					// MW 1.35+
					$groups = MediaWikiServices::getInstance()->getUserGroupManager()
						->getUserGroups( $user );
				} else {
					$groups = $user->getGroups();
				}
				if ( in_array( 'sysop', $groups, true ) && $wgAdminCanReadAll ) {
					return true;
				}
				$users = self::accessControl( $rights['groups'] );
				if ( in_array( $user->getName(), $users[0], true ) ) {
					return true;
				} else {
					$wgActions['edit'] = false;
					$wgActions['history'] = false;
					$wgActions['submit'] = false;
					$wgActions['info'] = false;
					$wgActions['raw'] = false;
					$wgActions['delete'] = false;
					$wgActions['revert'] = false;
					$wgActions['revisiondelete'] = false;
					$wgActions['rollback'] = false;
					$wgActions['markpatrolled'] = false;
					if ( in_array( $user->getName(), $users[1], true ) ) {
						return true;
					} else {
						$wgActions['view'] = false;

						return self::doRedirect( 'accesscontrol-redirect-users' );
					}
				}
			}
		} else {
			return true;
		}
	}
}
