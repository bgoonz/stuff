<?php
/**
 * ArticleFeedbackv5Utils class
 *
 * @package    ArticleFeedback
 * @subpackage Api
 * @author     Greg Chiasson <greg@omniti.com>
 * @author     Reha Sterbin <reha@omniti.com>
 * @author     Matthias Mullie <mmullie@wikimedia.org>
 */

/**
 * Utility methods used by api calls
 *
 * ApiArticleFeedback and ApiQueryArticleFeedback don't descend from the same
 * parent, which is why these are all static methods instead of just a parent
 * class with inheritable methods. I don't get it either.
 *
 * @package    ArticleFeedback
 * @subpackage Api
 */

use MediaWiki\Extension\AbuseFilter\AbuseFilterServices;
use MediaWiki\MediaWikiServices;

class ArticleFeedbackv5Utils {
	/**
	 * @var array \Wikimedia\Rdbms\LoadBalancer
	 */
	protected static $lb = [];

	/**
	 * @var array [bool]
	 */
	public static $written = [];

	/**
	 * @param string $wiki The wiki ID, or false for the current wiki
	 * @return \Wikimedia\Rdbms\LoadBalancer
	 */
	public static function getLB( $wiki = false ) {
		if ( !isset( static::$lb[$wiki] ) ) {
			static::$lb[$wiki] = MediaWikiServices::getInstance()->getDBLoadBalancerFactory()->getMainLB( $wiki );
		}

		return static::$lb[$wiki];
	}

	/**
	 * Wrapper function for wfGetDB.
	 *
	 * @param int $db Index of the connection to get. May be DB_PRIMARY for the
	 *            primary database (for write queries), DB_REPLICA for potentially lagged read
	 *            queries, or an integer >= 0 for a particular server.
	 * @param array|string $groups Query groups. An array of group names that this query
	 *                belongs to. May contain a single string if the query is only
	 *                in one group.
	 * @param string $wiki The wiki ID, or false for the current wiki
	 * @return \Wikimedia\Rdbms\IDatabase
	 */
	public static function getDB( $db, $groups = [], $wiki = false ) {
		$lb = static::getLB( $wiki );

		if ( $db === DB_PRIMARY ) {
			// mark that we're writing data
			static::$written[$wiki] = true;
		} elseif ( isset( static::$written[$wiki] ) && static::$written[$wiki] ) {
			if ( $db === DB_REPLICA ) {
				/*
				 * Let's keep querying primary database to make sure we have up-to-date
				 * data (waiting for slaves to sync up might take some time)
				 */
				$db = DB_PRIMARY;
			} else {
				/*
				 * If another db is requested and we already requested primary database,
				 * make sure this slave has caught up!
				 */
				$lb->waitFor( $lb->getMasterPos() );
				static::$written[$wiki] = false;
			}
		}

		return $lb->getConnection( $db, $groups, $wiki );
	}

	/**
	 * Get the full, prefixed, name that data is saved at in cookie.
	 * The cookie name is prefixed by the extension name and a version number,
	 * to avoid collisions with other extensions or code versions.
	 *
	 * @param string $suffix
	 * @return string
	 */
	public static function getCookieName( $suffix ) {
		return 'AFTv5-' . $suffix;
	}

	/**
	 * Returns whether feedback is enabled for this page.
	 *
	 * This is equivalent to $.aftUtils.verify
	 * When changing conditions, make sure to change them there too.
	 *
	 * See jquery.articleFeedbackv5.utils.js for full implementation;
	 * this is more of a safety check.
	 *
	 * @param int $pageId The page ID
	 * @param User $user
	 * @return bool
	 */
	public static function isFeedbackEnabled( $pageId, User $user ) {
		global $wgArticleFeedbackv5Namespaces,
				$wgArticleFeedbackv5EnableProtection;

		$title = Title::newFromID( $pageId );
		if ( $title === null ) {
			return false;
		}

		$restriction = ArticleFeedbackv5Permissions::getProtectionRestriction( $title->getArticleID() );

		$enable = true;

		// only on pages in namespaces where it is enabled
		$enable &= in_array( $title->getNamespace(), $wgArticleFeedbackv5Namespaces );

		// check if user is not blocked
		$enable &= !$user->isBlocked();

		// check if a, to this user sufficient, permission level is defined
		if ( $wgArticleFeedbackv5EnableProtection && isset( $restriction->pr_level ) ) {
			$enable &= $user->isAllowed( $restriction->pr_level );

		} else {
			$enable &=
				// check if a, to this user sufficient, default permission level (based on lottery) is defined
				$user->isAllowed( ArticleFeedbackv5Permissions::getDefaultPermissionLevel( $pageId ) ) ||
				// or check whitelist
				self::isWhitelisted( $pageId );
		}

		// category is not blacklisted
		$enable &= !self::isBlacklisted( $pageId );

		// not disabled via preferences
		$enable &= !$user->getOption( 'articlefeedback-disable' );

		// not viewing a redirect
		$enable &= !$title->isRedirect();

		return $enable;
	}

	/**
	 * Get an array of unprefixed categories linked to a page, in both
	 * underscored and spaced format (to make sure that no matter how they're
	 * defined in config, we'll find the correct match)
	 *
	 * @param int $pageId
	 * @return array
	 */
	protected static function getPageCategories( $pageId ) {
		$title = Title::newFromID( $pageId );
		if ( $title === null ) {
			return [];
		}

		$categories = [];
		foreach ( $title->getParentCategories() as $category => $page ) {
			// get category title without prefix
			$category = Title::newFromDBkey( $category );
			if ( $category ) {
				$category = $category->getDBkey();
				// make both underscored or spaces category names work
				$categories[] = str_replace( ' ', '_', $category );
				$categories[] = str_replace( '_', ' ', $category );
			}
		}

		return $categories;
	}

	/**
	 * Check if an article is whitelisted (by means of a whitelist category)
	 *
	 * This is equivalent to $.aftUtils.whitelist
	 *
	 * @param int $pageId
	 * @return bool
	 */
	public static function isWhitelisted( $pageId ) {
		global $wgArticleFeedbackv5Categories;

		$categories = self::getPageCategories( $pageId );

		return (bool)array_intersect( $categories, $wgArticleFeedbackv5Categories );
	}

	/**
	 * Check if an article is blacklisted (by means of a blacklist category)
	 *
	 * This is equivalent to $.aftUtils.blacklist
	 *
	 * @param int $pageId
	 * @return bool
	 */
	public static function isBlacklisted( $pageId ) {
		global $wgArticleFeedbackv5BlacklistCategories;

		$categories = self::getPageCategories( $pageId );

		return (bool)array_intersect( $categories, $wgArticleFeedbackv5BlacklistCategories );
	}

	/**
	 * Check if a certain feedback was posted by the current user.
	 *
	 * Additional $unsafe parameter can be used to determine if untrusted data
	 * (in this case a cookie, that could be manipulated) can be evaluated.
	 * This can come in useful to restrict anonymous users (who have no fixed
	 * user id) from evaluating their own feedback, but should never be trusted.
	 *
	 * @param ArticleFeedbackv5Model $record The feedback record
	 * @param User $curUser
	 * @param WebRequest $request
	 * @param bool $unsafe True if untrusted data can be evaluated
	 * @return bool
	 */
	public static function isOwnFeedback(
		$record,
		User $curUser,
		WebRequest $request,
		$unsafe = false
	) {
		// if logged in user, we can know for certain if feedback was posted when logged in
		if ( $curUser->getId() && isset( $record->aft_user ) && $curUser->getId() == intval( $record->aft_user ) ) {
			return true;
		}

		if ( $unsafe ) {
			/*
			 * If either the feedback was posted when not logged in, or the visitor is now not
			 * logged in, compare the feedback's id with what's stored in a cookie.
			 */
			$cookie = json_decode( $request->getCookie( self::getCookieName( 'feedback-ids' ) ), true );
			if ( $cookie !== null && is_array( $cookie ) && isset( $record->aft_id ) ) {
				return in_array( $record->aft_id, $cookie );
			}
		}

		return false;
	}

	/**
	 * Creates a user link for a log row
	 *
	 * @param int $userId can be null or a user object
	 * @param string|null $userIp (name works too)
	 * @return string Anchor tag link to user
	 */
	public static function getUserLink( $userId, $userIp = null ) {
		if ( ( $userId instanceof User ) ) {
			// user is an object, all good, make link
			$user = $userId;
		} else {
			// if $userId is not an object
			$userId = (int)$userId;
			if ( $userId !== 0 ) { // logged-in users
				$user = User::newFromId( $userId );
			} elseif ( $userIp !== null ) { // IP users
				$userText = $userIp;
				$user = User::newFromName( $userText, false );
			} else { // magic user
				global $wgArticleFeedbackv5AutoHelp;
				$element = Linker::makeExternalLink(
					$wgArticleFeedbackv5AutoHelp,
					wfMessage( 'articlefeedbackv5-default-user' )->text()
				);
				return $element;
			}
		}

		$element = Linker::userLink( $user->getId(), $user->getName() );

		return $element;
	}

	/**
	 * Returns the percentage helpful, given a helpful count and an unhelpful count
	 *
	 * @param int $helpful The number of helpful votes
	 * @param int $unhelpful The number of unhelpful votes
	 * @return int The percentage
	 */
	public static function percentHelpful( $helpful, $unhelpful ) {
		if ( $helpful + $unhelpful > 0 ) {
			return intval( ( $helpful / ( $helpful + $unhelpful ) ) * 100 );
		}
		return 0;
	}

	/**
	 * Helper function to create a mask line
	 *
	 * @param string $type the type (hidden or oversight)
	 * @param int $feedbackId the feedback post id
	 * @param int $userId the user id
	 * @param string|null $timestamp the timestamp, from the db
	 * @return string the mask line
	 */
	public static function renderMaskLine( $type, $feedbackId, $userId, $timestamp = null ) {
		if ( (int)$userId !== 0 ) { // logged-in users
			$username = User::newFromId( $userId )->getName();
		} else { // magic user
			$username = wfMessage( 'articlefeedbackv5-default-user' )->text();
		}
		$timestamp = new MWTimestamp( $timestamp );

		// Give grep a chance to find the usages:
		// articlefeedbackv5-mask-text-oversight, articlefeedbackv5-mask-text-hide,
		// articlefeedbackv5-mask-text-inappropriate
		return wfMessage( 'articlefeedbackv5-mask-text-' . $type )
			->params( static::formatId( $feedbackId ), $username, $timestamp->getHumanTimestamp() )
			->escaped();
	}

	/**
	 * Run comment through SpamRegex
	 *
	 * @param string $value
	 * @return bool Will return boolean false if valid or true if flagged
	 */
	public static function validateSpamRegex( $value ) {
		// Respect $wgSpamRegex
		global $wgSpamRegex;
		if ( ( is_array( $wgSpamRegex ) && count( $wgSpamRegex ) > 0 )
			|| ( is_string( $wgSpamRegex ) && strlen( $wgSpamRegex ) > 0 ) ) {
			// In older versions, $wgSpamRegex may be a single string rather than
			// an array of regexes, so make it compatible.
			$regexes = (array)$wgSpamRegex;
			foreach ( $regexes as $regex ) {
				if ( preg_match( $regex, $value ) ) {
					return true;
				}
			}
		}

		return false;
	}

	/**
	 * Run comment through SpamBlacklist
	 *
	 * @param string $value
	 * @param int $pageId
	 * @param User $user
	 * @return bool Will return boolean false if valid or true if flagged
	 */
	public static function validateSpamBlacklist( $value, $pageId, User $user ) {
		// Check SpamBlacklist, if installed
		if ( ExtensionRegistry::getInstance()->isLoaded( 'SpamBlacklist' ) ) {
			$spam = BaseBlacklist::getSpamBlacklist();
			$title = Title::newFromText( 'ArticleFeedbackv5_' . $pageId );

			$options = new \ParserOptions;
			$output = MediaWikiServices::getInstance()->getParser()->parse( $value, $title, $options );
			$links = $output->getExternalLinks();

			$ret = $spam->filter( $links, $title, $user );
			if ( $ret !== false ) {
				return true;
			}
		}

		return false;
	}

	/**
	 * Run comment through AbuseFilter extension
	 *
	 * @param string $value
	 * @param int $pageId
	 * @param User $user
	 * @return bool|array Will return boolean false if valid or error message array if flagged
	 */
	public static function validateAbuseFilter( $value, $pageId, User $user ) {
		// Check AbuseFilter, if installed
		if ( ExtensionRegistry::getInstance()->isLoaded( 'Abuse Filter' ) ) {
			global $wgArticleFeedbackv5AbuseFilterGroup;

			// Set up variables
			$title = Title::newFromID( $pageId );
			if ( !$title ) {
				// XXX Can this happen?
				return false;
			}
			$gen = AbuseFilterServices::getVariableGeneratorFactory()->newGenerator();
			$vars = $gen->addUserVars( $user )->addTitleVars( $title, 'page' )->getVariableHolder();
			$vars->setVar( 'SUMMARY', 'Article Feedback 5' );
			$vars->setVar( 'ACTION', 'feedback' );
			$vars->setVar( 'new_wikitext', $value );
			$vars->setLazyLoadVar( 'new_size', 'length', [ 'length-var' => 'new_wikitext' ] );

			$status = AbuseFilter::filterAction( $vars, $title, $wgArticleFeedbackv5AbuseFilterGroup, $user );

			return $status->isOK() ? false : $status->getErrorsArray();
		}

		return false;
	}

	/**
	 * Pretty-format an id: the full 32 char length may be visually overwhelming
	 *
	 * @param string $id The full-length id
	 * @return string
	 */
	public static function formatId( $id ) {
		return MediaWikiServices::getInstance()->getContentLanguage()->truncateForVisual( $id, 10 );
	}

	/**
	 * Fire feedback-watch notification.
	 *
	 * @param ArticleFeedbackv5Model $feedback
	 * @param User $agent
	 * @param string $flag
	 * @param int $logId
	 * @return bool
	 */
	public static function notifyWatch( ArticleFeedbackv5Model $feedback, User $agent, $flag, $logId ) {
		if ( !ExtensionRegistry::getInstance()->isLoaded( 'Echo' ) ) {
			return false;
		}

		$page = Title::newFromID( $feedback->aft_page );
		if ( !$page ) {
			return false;
		}

		EchoEvent::create( [
			'type' => 'feedback-watch',
			'title' => $page,
			'extra' => [
				'aft-id' => $feedback->aft_id,
				'aft-page' => $feedback->aft_page,
				'aft-comment' => $feedback->aft_comment,
				'aft-user' => $feedback->aft_user,
				'aft-moderation-flag' => $flag,
				'aft-moderation-log-id' => $logId,
			],
			'agent' => $agent,
		] );

		return true;
	}

	/**
	 * Fire feedback-moderated notification.
	 *
	 * @param ArticleFeedbackv5Model $feedback
	 * @param User $agent
	 * @param string $flag
	 * @param int $logId
	 * @return bool
	 */
	public static function notifyModerated( ArticleFeedbackv5Model $feedback, User $agent, $flag, $logId ) {
		if ( !ExtensionRegistry::getInstance()->isLoaded( 'Echo' ) ) {
			return false;
		}

		$page = Title::newFromID( $feedback->aft_page );
		if ( !$page ) {
			return false;
		}

		EchoEvent::create( [
			'type' => 'feedback-moderated',
			'title' => $page,
			'extra' => [
				'aft-id' => $feedback->aft_id,
				'aft-page' => $feedback->aft_page,
				'aft-comment' => $feedback->aft_comment,
				'aft-user' => $feedback->aft_user,
				'aft-moderation-flag' => $flag,
				'aft-moderation-log-id' => $logId,
			],
			'agent' => $agent,
		] );

		return true;
	}
}
