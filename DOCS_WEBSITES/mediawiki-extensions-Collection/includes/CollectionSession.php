<?php

use MediaWiki\MediaWikiServices;
use MediaWiki\Session\SessionManager;

/**
 * Collection Extension for MediaWiki
 *
 * Copyright (C) PediaPress GmbH
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

class CollectionSession {
	/**
	 * @return bool
	 */
	public static function hasSession() {
		$session = SessionManager::getGlobalSession();
		return isset( $session['wsCollection'] );
	}

	public static function startSession() {
		$session = SessionManager::getGlobalSession();
		$session->persist();

		self::clearCollection();
	}

	public static function touchSession() {
		$session = SessionManager::getGlobalSession();
		$collection = $session['wsCollection'];
		$collection['timestamp'] = wfTimestampNow();
		$session['wsCollection'] = $collection;
	}

	public static function clearCollection() {
		$session = SessionManager::getGlobalSession();
		$session['wsCollection'] = [
			'enabled' => true,
			'title' => '',
			'subtitle' => '',
			'settings' => [],
			'items' => [],
		];
		CollectionSuggest::clear();
		self::touchSession();
	}

	public static function enable() {
		$session = SessionManager::getGlobalSession();
		$session->persist();

		$session['wsCollection']['enabled'] = true;
		self::touchSession();
	}

	public static function disable() {
		$session = SessionManager::getGlobalSession();

		if ( !isset( $session['wsCollection'] ) ) {
			return;
		}
		self::clearCollection();
		$session['wsCollection']['enabled'] = false;
		self::touchSession();
	}

	/**
	 * @return bool
	 */
	public static function isEnabled() {
		$session = SessionManager::getGlobalSession();

		return isset( $session['wsCollection'] ) &&
			isset( $session['wsCollection']['enabled'] ) &&
			$session['wsCollection']['enabled'];
	}

	/**
	 * @return bool
	 */
	public static function hasItems() {
		$session = SessionManager::getGlobalSession();

		return isset( $session['wsCollection'] ) &&
			isset( $session['wsCollection']['items'] );
	}

	/**
	 * @return int
	 */
	public static function countArticles() {
		$session = SessionManager::getGlobalSession();

		if ( !self::hasItems() ) {
			return 0;
		}
		$count = 0;
		foreach ( $session['wsCollection']['items'] as $item ) {
			if ( $item['type'] == 'article' ) {
				$count++;
			}
		}
		return $count;
	}

	/**
	 * @param string $title
	 * @param int $oldid
	 * @return int
	 */
	public static function findArticle( $title, $oldid = 0 ) {
		if ( !self::hasItems() ) {
			return -1;
		}

		$session = SessionManager::getGlobalSession();

		foreach ( $session['wsCollection']['items'] as $index => $item ) {
			if ( $item['type'] == 'article' && $item['title'] == $title ) {
				if ( $oldid ) {
					if ( $item['revision'] == strval( $oldid ) ) {
						return $index;
					}
				} else {
					if ( $item['revision'] == $item['latest'] ) {
						return $index;
					}
				}
			}
		}
		return -1;
	}

	/**
	 * @return bool
	 */
	public static function purge() {
		$session = SessionManager::getGlobalSession();

		if ( !isset( $session['wsCollection'] ) ) {
			return false;
		}

		$coll = $session['wsCollection'];
		$newitems = [];
		if ( isset( $coll['items'] ) ) {
			$batch = new LinkBatch;
			$lc = MediaWikiServices::getInstance()->getLinkCache();
			foreach ( $coll['items'] as $item ) {
				if ( $item['type'] == 'article' ) {
					$t = Title::newFromText( $item['title'] );
					$batch->addObj( $t );
				}
			}
			$batch->execute();
			foreach ( $coll['items'] as $item ) {
				if ( $item['type'] == 'article' ) {
					$t = Title::newFromText( $item['title'] );
					if ( $t && !$lc->isBadLink( $t->getPrefixedDBkey() ) ) {
						$newitems[] = $item;
					}
				} else {
					$newitems[] = $item;
				}
			}
		}
		$coll['items'] = $newitems;
		$session['wsCollection'] = $coll;
		return true;
	}

	/**
	 * @return array
	 */
	public static function getCollection() {
		$session = SessionManager::getGlobalSession();
		$collection = self::purge() ? $session['wsCollection'] : [];
		return array_merge( [
			/* Make sure required properties are present.  */
			'title' => '',
			'subtitle' => '',
			'settings' => [],
			'items' => [],
		], $collection );
	}

	/**
	 * @param array $collection
	 */
	public static function setCollection( array $collection ) {
		$session = SessionManager::getGlobalSession();
		$session['wsCollection'] = $collection;
		self::touchSession();
	}
}
