<?php
/**
 * Collection Extension for MediaWiki
 *
 * Copyright (C) 2008-2009, PediaPress GmbH
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301, USA.
 * http://www.gnu.org/copyleft/gpl.html
 */

/**
 * it needs 3 Lists:
 * - one with the bookmembers
 * - one where it can save the banned articles
 * - one where it can save the proposals
 *
 * the proposallist can be accessed with the public method getProposals()
 *
 * a list with the bookarticles as first and information about the outgoing
 * links of that article as second dimension can be accessed with the method
 * getLinkList()
 *
 * the Class can only sort the proposals, if it can access the function compareProps
 */
class CollectionProposals {

	/**
	 * @var array
	 */
	private $mColl;

	/**
	 * @var array[]
	 */
	private $mPropList;

	/**
	 * @var array[]
	 */
	private $mLinkList;

	/**
	 * @var string[]
	 */
	private $mBanList;

	/**
	 * @param array $coll the collection
	 * @param string[] $ban the list of the banned articles
	 * @param array[] $props the list of the proposals
	 */
	public function __construct( $coll, $ban, $props ) {
		$this->mPropList = [];
		$this->mColl = $coll;
		$this->mBanList = $ban;
		$this->mLinkList = is_array( $props ) ? $props : [];
	}

	/**
	 * @return array[]
	 */
	public function getLinkList() {
		return $this->mLinkList;
	}

	/**
	 * @param array $collection
	 */
	public function setCollection( array $collection ) {
		$this->mColl = $collection;
	}

	/**
	 * Calculate the new proposals and return it
	 *
	 * @param int $num number of proposals to be returned
	 *        0 or less means, that all proposals will be returned
	 *        this parameter is optional, the method will return
	 *        all proposals by defaulted
	 * @param bool $doUpdate when true, $linkList will
	 *        updated before calculating the proposals
	 *        default is true
	 * @return array[] a 2-dimensional array that contains the proposals
	 *         the first dimesion is numeric, the second contains
	 *         3 entries:
	 *         - 'name': the name of a proposed article
	 *         - 'num' : how often this artikel was linked in the
	 *                   bookmembers
	 *         - 'val' : a value between 1 and 1.5, the higher the
	 *                   more this article is proposed
	 */
	public function getProposals( $num = 0, $doUpdate = true ) {
		if ( $doUpdate ) {
			$this->updateLinkList();
		}

		$this->getPropList();

		if ( $num > 0 ) {
			return array_slice( $this->mPropList, 0, $num );
		} else {
			return $this->mPropList;
		}
	}

	/**
	 * @return bool
	 */
	public function hasBans() {
		return count( $this->mBanList ) > 0;
	}

	private function updateLinkList() {
		$this->addCollectionArticles();
		$this->deleteUnusedArticles();
	}

	/**
	 * Check if all articles form the book are in $mLinkList
	 */
	private function addCollectionArticles() {
		global $wgCollectionSuggestThreshhold;

		$numItems = isset( $this->mColl['items'] ) ? count( $this->mColl['items'] ) : 0;

		if ( $numItems === 0 || $numItems > $wgCollectionSuggestThreshhold ) {
			return;
		}

		foreach ( $this->mColl['items'] as $item ) {
			if ( $this->searchEntry( $item['title'], $this->mLinkList ) === false
				&& $item['type'] == 'article'
			) {
				$articleName = $item['title'];
				$title = Title::makeTitleSafe( NS_MAIN, $articleName );
				$article = new Article( $title, $item['revision'] );

				if ( $article === null ) {
					continue;
				}

				$this->mLinkList[] = [
					'name' => $articleName,
					'links' => $this->getWeightedLinks(
						$numItems,
						ContentHandler::getContentText( $article->getPage()->getContent() )
					),
				];
			}
		}
	}

	/**
	 * Delete items from $mLinkList that are not in the collection any more
	 */
	private function deleteUnusedArticles() {
		$newList = [];
		foreach ( $this->mLinkList as $item ) {
			if ( CollectionSession::findArticle( $item['name'] ) != -1 ) {
				$newList[] = $item;
			}
		}
		$this->mLinkList = $newList;
	}

	/**
	 * @param Title $title
	 * @return Title
	 */
	private function resolveRedirects( $title ) {
		if ( !$title->isRedirect() ) {
			return $title;
		}

		$article = new Article( $title, 0 );
		return $article->getPage()->getContent()->getUltimateRedirectTarget();
	}

	/**
	 * Extract & count links from wikitext
	 *
	 * @param int $num_articles
	 * @param string $wikitext article text
	 * @return float[] with links and their weights
	 */
	private function getWeightedLinks( $num_articles, $wikitext ) {
		global $wgCollectionSuggestCheapWeightThreshhold;

		$allLinks = [];
		preg_match_all(
			'/\[\[(.+?)\]\]/',
			$wikitext,
			$allLinks,
			PREG_SET_ORDER
		);

		$linkmap = [];
		foreach ( $allLinks as $link ) {
			$link = $link[1];

			if ( preg_match( '/[:#]/', $link ) ) { // skip links with ':' and '#'
				continue;
			}

			// handle links with a displaytitle
			if ( preg_match( '/(.+?)\|(.+)/', $link, $matches ) ) {
				list( , $link, $alias ) = $matches;
			} else {
				$alias = $link;
			}

			// check & normalize title
			$title = Title::makeTitleSafe( NS_MAIN, $link );
			if ( $title === null || !$title->exists() ) {
				continue;
			}
			$resolved = $this->resolveRedirects( $title );
			if ( !$resolved ) {
				continue;
			}
			$link = $resolved->getText();

			if ( isset( $linkmap[$link] ) ) {
				$linkmap[$link][$link] = true;
			} else {
				$linkmap[$link] = [ $link => true ];
			}
			if ( $link != $alias ) {
				if ( isset( $linkmap[$alias] ) ) {
					$linkmap[$alias][$link] = true;
				} else {
					$linkmap[$alias] = [ $link => true ];
				}
			}
		}

		$linkcount = [];
		if ( $num_articles < $wgCollectionSuggestCheapWeightThreshhold ) {
			// more expensive algorithm: count words
			foreach ( $linkmap as $alias => $linked ) {
				$matches = [];
				preg_match_all(
					'/\W' . preg_quote( $alias, '/' ) . '\W/i',
					$wikitext,
					$matches
				);
				$num = count( $matches[0] );

				foreach ( $linked as $link => $dummy ) {
					if ( isset( $linkcount[$link] ) ) {
						$linkcount[$link] += $num;
					} else {
						$linkcount[$link] = $num;
					}
				}
			}

			if ( count( $linkcount ) == 0 ) {
				return [];
			}

			// normalize:
			$lc_max = 0;
			foreach ( $linkcount as $count ) {
				if ( $count > $lc_max ) {
					$lc_max = $count;
				}
			}
			$norm = log( $lc_max );
			$result = [];
			if ( $norm > 0 ) {
				foreach ( $linkcount as $link => $count ) {
					$result[$link] = 1 + 0.5 * log( $count ) / $norm;
				}
			} else {
				foreach ( $linkcount as $link => $count ) {
					$result[$link] = 1;
				}
			}

			return $result;
		} else {
			// cheaper algorithm: just count links
			foreach ( $linkmap as $linked ) {
				foreach ( $linked as $link => $dummy ) {
					$linkcount[$link] = 1;
				}
			}

			return $linkcount;
		}
	}

	/**
	 * Calculate the $mPropList from $mLinkList and $mBanList
	 */
	private function getPropList() {
		$prop = [];
		foreach ( $this->mLinkList as $article ) {
			foreach ( $article['links'] as $linkName => $val ) {
				if ( !$this->checkLink( $linkName ) ) {
					continue;
				}
				$key = $this->searchEntry( $linkName, $prop );
				if ( $key !== false ) {
					$prop[$key]['val'] += $val;
				} else {
					$prop[] = [
						'name' => $linkName,
						'val' => $val,
					];
				}
			}
		}
		usort(
			$prop,
			static function ( $a, $b ) {
				if ( $a['val'] == $b['val'] ) {
					return strcmp( $a['name'], $b['name'] );
				}
				if ( $a['val'] < $b['val'] ) {
					return 1;
				} else {
					return -1;
				}
			}
		);
		$this->mPropList = [];
		$have_real_weights = false;
		foreach ( $prop as $p ) {
			if ( $p['val'] > 1 ) {
				$have_real_weights = true;
			}
			if ( $p['val'] <= 1 && $have_real_weights ) {
				break;
			}
			$this->mPropList[] = $p;
		}
	}

	/**
	 * Search an article in an array and returns its key or false
	 * if the array doesn't contain the article
	 *
	 * @param string $entry an articlename
	 * @param array[] $array to be searched, it has to 2-dimensional
	 *               the 2nd dimension needs the key 'name'
	 * @return bool|int the key as integer or false
	 */
	private function searchEntry( $entry, $array ) {
		for ( $i = 0, $count = count( $array ); $i < $count; $i++ ) {
			if ( $array[$i]['name'] == $entry ) {
				return $i;
			}
		}
		return false;
	}

	/**
	 * Check if an article is banned or belongs to the book/collection
	 *
	 * @param string $link an articlename
	 * @return bool true: if the article can be added to the proposals
	 *                        false: if the article can't be added to the proposals
	 */
	private function checkLink( $link ) {
		foreach ( $this->mColl['items'] as $item ) {
			if ( $item['type'] == 'article' && $item['title'] == $link ) {
				return false;
			}
		}

		if ( $this->hasBans() && in_array( $link, $this->mBanList ) ) {
			return false;
		}

		return true;
	}

	/**
	 * @return int
	 */
	private function getPropCount() {
		return count( $this->mPropList );
	}
}
