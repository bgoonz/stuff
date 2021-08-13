<?php
/**
 * CategoryTests extension by Ryan Schmidt
 * Functions for category testing
 * Check https://www.mediawiki.org/wiki/Extension:CategoryTests for more info on what everything does
 */
class ExtCategoryTests {
	function ifcategory( &$parser, $category = '', $then = '', $else = '', $pagename = '' ) {
		if ( $category === '' ) {
			return $then;
		}
		if ( $pagename === '' ) {
			$title = $parser->getTitle();
			$page = $title->getDBkey();
			$ns = $title->getNamespace();
		} else {
			$title = Title::newFromText( $pagename );
			if ( !( $title instanceof Title ) || !$title->exists() ) {
				return $else;
			}
			$page = $title->getDBkey();
			$ns = $title->getNamespace();
		}
		$cattitle = Title::makeTitleSafe( NS_CATEGORY, $category );
		if ( !( $cattitle instanceof Title ) ) {
			return $else;
		}
		$catkey = $cattitle->getDBkey();
		$dbr = wfGetDB( DB_REPLICA );
		$res = $dbr->select(
			[ 'page', 'categorylinks' ],
			'cl_from',
			[
				'page_id=cl_from',
				'page_namespace' => $ns,
				'page_title' => $page,
				'cl_to' => $catkey
			],
			__METHOD__,
			[ 'LIMIT' => 1 ]
		);
		if ( $dbr->numRows( $res ) == 0 ) {
			return $else;
		}
		return $then;
	}

	function ifnocategories( &$parser, $then = '', $else = '', $pagename = '' ) {
		if ( $pagename === '' ) {
			$title = $parser->getTitle();
			$page = $title->getDBkey();
			$ns = $title->getNamespace();
		} else {
			$title = Title::newFromText( $pagename );
			if ( !( $title instanceof Title ) || !$title->exists() ) {
				return $then;
			}
			$page = $title->getDBkey();
			$ns = $title->getNamespace();
		}
		$dbr = wfGetDB( DB_REPLICA );
		$res = $dbr->select(
			[ 'page', 'categorylinks' ],
			'cl_from',
			[
				'page_id=cl_from',
				'page_namespace' => $ns,
				'page_title' => $page
			],
			__METHOD__,
			[ 'LIMIT' => 1 ]
		);
		if ( $dbr->numRows( $res ) == 0 ) {
			return $then;
		}
		return $else;
	}

	function switchcategory( &$parser ) {
		$args = func_get_args();
		array_shift( $args );
		$found = false;
		$parts = null;
		$default = null;
		$page = '';
		$magicWordFactory = \MediaWiki\MediaWikiServices::getInstance()->getMagicWordFactory();

		foreach ( $args as $arg ) {
			$parts = array_map( 'trim', explode( '=', $arg, 2 ) );
			if ( count( $parts ) == 2 ) {
				$mwPage = $magicWordFactory->get( 'page' );
				if ( $mwPage->matchStartAndRemove( $parts[0] ) ) {
					$page = $parts[1];
					continue;
				}
				if ( $found || $this->ifcategory( $parser, $parts[0], true, false, $page ) ) {
					return $parts[1];
				} else {
					$mwDefault = $magicWordFactory->get( 'default' );
					if ( $mwDefault->matchStartAndRemove( $parts[0] ) ) {
						$default = $parts[1];
					}
				}
			} elseif ( count( $parts ) == 1 ) {
				if ( $this->ifcategory( $parser, $parts[0], true, false, $page ) ) {
					$found = true;
				}
			}
		}

		if ( count( $parts ) == 1 ) {
			return $parts[0];
		} elseif ( $default !== null ) {
			return $default;
		} else {
			return '';
		}
	}
}
