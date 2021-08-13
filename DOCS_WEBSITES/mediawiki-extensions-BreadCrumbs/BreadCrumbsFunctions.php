<?php

/* The BreadCrumbs extension, an extension for providing a breadcrumbs navigation
 * to users.
 *
 * @file BreadCrumbsFunctions.php
 * @ingroup BreadCrumbs
 * @author Manuel Schneider <manuel.schneider@wikimedia.ch>, Tony Boyles <ABoyles@milcord.com>
 * @copyright © 2007 by Manuel Schneider, 2012 by Tony Boyles, Milcord llc
 * @license http://www.gnu.org/copyleft/gpl.html GNU General Public License 2.0 or later
 */

use MediaWiki\MediaWikiServices;

class BreadCrumbsFunctions {
	/**
	 * @param OutputPage $out
	 * @param ParserOutput $parserOutput
	 * @return bool
	 */
	public static function fnBreadCrumbsShowHook( $out, $parserOutput ) {
		global $wgBreadCrumbsShowAnons, $wgBreadCrumbsIgnoreRefreshes,
			$wgBreadCrumbsLink, $wgBreadCrumbsIgnoreNameSpaces;

		$user = $out->getUser();
		$userOptionsLookup = MediaWikiServices::getInstance()->getUserOptionsLookup();
		$wluOptions = $userOptionsLookup->getOptions( $user );

		# Should we display breadcrumbs?
		if ( ( !$wgBreadCrumbsShowAnons && $user->isAnon() ) || ( !$wluOptions['breadcrumbs-showcrumbs'] ) ) {
			return true;
		}

		$request = $out->getRequest();

		# If we are Anons and should see breadcrumbs, but there's no session, let's start one so we can track from page-to-page
		$request->getSession()->persist();

		# Get our data from $_SESSION:
		$m_BreadCrumbs = $request->getSessionData( 'BreadCrumbs' );

		# if we have breadcrumbs, let's use them:
		if ( $m_BreadCrumbs === null ) {
			$m_BreadCrumbs = [];
		}

		# cache index of last element:
		$m_count = count( $m_BreadCrumbs );

		# Title string for the page we're viewing
		$title = $out->getTitle()->getPrefixedText();

		# Are there any Breadcrumbs to see?
		if ( $m_count > 0 ) {
			# Was this a page refresh and do we care?
			if ( !( $wgBreadCrumbsIgnoreRefreshes && strcmp( $title, $m_BreadCrumbs[$m_count - 1] ) == 0 ) ) {
				if ( !$wluOptions['breadcrumbs-filter-duplicates'] || !in_array( $title, $m_BreadCrumbs ) ) {
					$m_BreadCrumbs[] = $title;
				}
				# serialize data from array to session:
				$request->setSessionData( "BreadCrumbs", $m_BreadCrumbs );
			}
			# If there aren't any breadcrumbs, we still want to add to the current page to the list.
		} else {
			# add new page:
			$m_BreadCrumbs[] = $title;
			# serialize data from array to session:
			$request->setSessionData( "BreadCrumbs", $m_BreadCrumbs );
		}

		# Build the breadcrumbs trail:
		$breadcrumbs = '';
		$max = min( [ $wluOptions['breadcrumbs-numberofcrumbs'], count( $m_BreadCrumbs ) ] );
		for ( $i = 1; $i <= $max; $i++ ) {
			$j = count( $m_BreadCrumbs ) - $i;
			$title = Title::newFromText( $m_BreadCrumbs[$j] );
			if ( !in_array( $title->getNsText(), $wgBreadCrumbsIgnoreNameSpaces ) ) {
				if ( $wgBreadCrumbsLink ) {
					$linkRenderer = MediaWikiServices::getInstance()->getLinkRenderer();
					if ( $wluOptions['breadcrumbs-namespaces'] ) {
						$breadcrumb = $linkRenderer->makeLink( $title, $m_BreadCrumbs[$j] );
					} else {
						$breadcrumb = $linkRenderer->makeLink( $title, $title->getText() );
					}
				} elseif ( $wluOptions['breadcrumbs-namespaces'] ) {
					$breadcrumb = $m_BreadCrumbs[$j];
				} else {
					$breadcrumb = $title->getText();
				}
				$breadcrumbs = $breadcrumb . $breadcrumbs;
				if ( $i < $max ) {
					$breadcrumbs = ' ' . htmlspecialchars( $wluOptions['breadcrumbs-delimiter'] ) . ' ' . $breadcrumbs;
				}
			}
		}
		$breadcrumbs = '<div id="breadcrumbs">'
			. htmlspecialchars( $wluOptions['breadcrumbs-preceding-text'] )
			. ' ' . $breadcrumbs . '</div>';

		# Set up that styling...
		$out->addModuleStyles( 'ext.breadCrumbs' );

		# And add our BreadCrumbs!
		$out->addSubtitle( $breadcrumbs );

		# Finally, invalidate internal MediaWiki cache:
		$user->invalidateCache();
		# Must be done so that stale Breadcrumbs aren't cached into pages the user visits repeatedly.
		# This makes this a risky extension to run on a wiki which relies heavily on caching.

		# Return true to let the rest work.
		return true;
	}

	/**
	 * @param User $user
	 * @param array &$defaultPreferences
	 * @return bool
	 */
	public static function fnBreadCrumbsAddPreferences( $user, &$defaultPreferences ) {
		global $wgBreadCrumbsAllowUPOs;

		if ( $wgBreadCrumbsAllowUPOs ) {
			// Whether to provide breadcrumbs to users by default
			$defaultPreferences['breadcrumbs-showcrumbs'] = [
				'type' => 'toggle',
				'section' => 'rendering/breadcrumbs',
				'label-message' => 'prefs-breadcrumbs-showcrumbs' ];

			// Whether to show the breadcrumbs' namespaces
			$defaultPreferences['breadcrumbs-namespaces'] = [
				'type' => 'toggle',
				'section' => 'rendering/breadcrumbs',
				'label-message' => 'prefs-breadcrumbs-namespaces', ];

			// Whether to ignore pages that are already in breadcrumbs
			$defaultPreferences['breadcrumbs-filter-duplicates'] = [
				'type' => 'toggle',
				'section' => 'rendering/breadcrumbs',
				'label-message' => 'prefs-breadcrumbs-filter-duplicates' ];

			// number of breadcrumbs to use
			$defaultPreferences['breadcrumbs-numberofcrumbs'] = [
				'type' => 'int',
				'min' => 1,
				'max' => 20,
				'section' => 'rendering/breadcrumbs',
				'size' => 2,
				'maxlength' => 2,
				'label-message' => 'prefs-breadcrumbs-numberofcrumbs',
				'help-message' => 'prefs-breadcrumbs-numberofcrumbs-max' ];

			// Text to appear before breadcrumbs
			$defaultPreferences['breadcrumbs-preceding-text'] = [
				'type' => 'text',
				'section' => 'rendering/breadcrumbs',
				'size' => 34,
				'maxlength' => 30,
				'label-message' => 'prefs-breadcrumbs-preceding-text',
				'help-message' => 'prefs-breadcrumbs-preceding-text-max' ];

			// Delimiter between breadcrumbs
			$defaultPreferences['breadcrumbs-delimiter'] = [
				'type' => 'text',
				'section' => 'rendering/breadcrumbs',
				'size' => 2,
				'maxlength' => 2,
				'label-message' => 'prefs-breadcrumbs-separator',
				'help-message' => 'prefs-breadcrumbs-separator-max' ];
		}

		return true;
	}
}
