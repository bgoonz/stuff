<?php
/**
 * AutoProxyBlock. Allows to automatically block or tag edits performed
 * by proxies.
 *
 * Copyright (C) 2011 Cryptocoryne
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; either version 2
 * of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */
use MediaWiki\MediaWikiServices;

class AutoProxyBlock {
	static function isProxy( $ip ) {
		$cache = MediaWikiServices::getInstance()->getMainWANObjectCache();

		$data = $cache->getWithSetCallback(
			$cache->makeKey( 'autoproxyblock-status', $ip ),
			$cache::TTL_DAY,
			function () use ( $ip ) {
				global $wgAutoProxyBlockSources;

				if ( isset( $wgAutoProxyBlockSources['api'] ) ) {
					foreach ( $wgAutoProxyBlockSources['api'] as $url ) {
						$request_options = [
							'action' => 'query',
							'list' => 'blocks',
							'bkip' => $ip,
							'bklimit' => '1',
							'bkprop' => 'expiry|reason',
						];
						$ban = self::requestForeignAPI( $url, $request_options );
						if (
							isset( $ban['query']['blocks'][0] ) &&
							preg_match(
								$wgAutoProxyBlockSources['key'],
								$ban['query']['blocks'][0]['reason']
							)
						) {
							return 'proxy';
						}
					}
				}

				if ( isset( $wgAutoProxyBlockSources['raw'] ) ) {
					$list = [];
					foreach ( $wgAutoProxyBlockSources['raw'] as $file ) {
						if ( file_exists( $file ) ) {
							$p = file( $file );
							if ( $p ) {
								array_merge( $list, $p );
							}
						}
					}

					return in_array( $ip, array_unique( $list ) ) ? 'proxy' : 'not';
				}

				// uncached
				return false;
			}
		);

		return ( $data === 'proxy' ) ? true : false;
	}

	static function checkProxy( $title, $user, $action, &$result ) {
		global $wgProxyCanPerform, $wgAutoProxyBlockLog, $wgRequest;

		if ( in_array( $action, $wgProxyCanPerform ) || $user->isAllowed( 'proxyunbannable' ) ) {
			return true;
		}

		$userIP = $wgRequest->getIP();
		if ( self::isProxy( $userIP ) ) {
			if ( $wgAutoProxyBlockLog ) {
				$log = new LogPage( 'proxyblock' );
				$log->addEntry(
					'blocked',
					$title,
					false,
					[ $action, $user->getName() ],
					$user
				);

				// hack for 1.19-
				$dbw = wfGetDB( DB_PRIMARY );
				$blocker = User::newFromName( 'AutoProxyBlock' );
				$dbw->update(
					'logging',
					[ 'log_user' => $blocker->getID(), 'log_user_text' => 'AutoProxyBlock' ],
					[ 'log_type' => 'proxyblock', 'log_user_text' => $user->getName() ],
					__METHOD__,
					[ 'ORDER BY' => 'log_timestamp DESC' ]
				);
			}
			$result[] = [ 'proxy-blocked', $userIP ];
			return false;
		}

		return true;
	}

	function AFSetVar( &$vars, $title ) {
		global $wgRequest;
		$vars->setVar( 'is_proxy', self::isProxy( $wgRequest->getIP() ) ? 1 : 0 );
		return true;
	}

	function AFBuilderVars( &$builder ) {
		$builder['vars']['is_proxy'] = 'is-proxy';
		return true;
	}

	static function onRecentChangeSave( RecentChange $rc ) {
		global $wgTagProxyActions, $wgRequest;

		if ( method_exists( 'RecentChange', 'getPerformerIdentity' ) ) {
			// MW 1.36+
			$rcPerformer = User::newFromIdentity( $rc->getPerformerIdentity() );
		} else {
			$rcPerformer = $rc->getPerformer();
		}

		if ( $wgTagProxyActions && self::isProxy( $wgRequest->getIP() ) &&
			!$rcPerformer->isAllowed( 'notagproxychanges' )
		) {
			$rc->addTags( 'proxy' );
		}
		return true;
	}

	static function addProxyTag( &$emptyTags ) {
		global $wgTagProxyActions;

		if ( $wgTagProxyActions ) {
			$emptyTags[] = 'proxy';
		}
		return true;
	}

	static function requestForeignAPI( $url, $options ) {
		$url .= '?format=json&' . wfArrayToCgi( $options );

		$content = Http::get( $url );
		return json_decode( $content, true );
	}
}
