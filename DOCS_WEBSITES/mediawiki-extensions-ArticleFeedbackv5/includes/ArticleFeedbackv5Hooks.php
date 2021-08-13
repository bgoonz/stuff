<?php

use MediaWiki\Extension\AbuseFilter\Consequences\Parameters;
use MediaWiki\MediaWikiServices;
use Wikimedia\IPUtils;

/**
 * Hooks for ArticleFeedback
 *
 * @file
 * @ingroup Extensions
 */

class ArticleFeedbackv5Hooks {
	public static function registerExtension() {
		global $wgContentNamespaces, $wgGroupPermissions, $wgLogActionsHandlers;
		global $wgAbuseFilterValidGroups, $wgAbuseFilterEmergencyDisableThreshold, $wgAbuseFilterEmergencyDisableCount, $wgAbuseFilterEmergencyDisableAge;
		global $wgAbuseFilterActions;
		global $wgArticleFeedbackv5AbuseFilterGroup, $wgArticleFeedbackv5DefaultPermissions, $wgArticleFeedbackv5Namespaces;

		// register activity log formatter hooks
		foreach ( ArticleFeedbackv5Activity::$actions as $action => $options ) {
			if ( isset( $options['log_type'] ) ) {
				$log = $options['log_type'];
				$wgLogActionsHandlers["$log/$action"] = 'ArticleFeedbackv5LogFormatter';
			}
		}

		// Note, it's too early to use ExtensionRegistry->isLoaded()
		if ( $wgAbuseFilterActions !== null ) {
			if ( $wgArticleFeedbackv5AbuseFilterGroup != 'default' ) {
				// Add a custom filter group for AbuseFilter
				$wgAbuseFilterValidGroups[] = $wgArticleFeedbackv5AbuseFilterGroup;

				// set abusefilter emergency disable values for AFT feedback
				$wgAbuseFilterEmergencyDisableThreshold[$wgArticleFeedbackv5AbuseFilterGroup] = 0.10;
				$wgAbuseFilterEmergencyDisableCount[$wgArticleFeedbackv5AbuseFilterGroup] = 50;
				$wgAbuseFilterEmergencyDisableAge[$wgArticleFeedbackv5AbuseFilterGroup] = 86400; // One day.
			}

			$wgAbuseFilterActions += [
				'aftv5resolve' => true,
				'aftv5flagabuse' => true,
				'aftv5hide' => true,
				'aftv5request' => true
			];
		}

		// Permissions: 6 levels of permissions are built into ArticleFeedbackv5: reader, member, editor,
		// monitor, administrator, oversighter. The default (below-configured) permissions scheme can be seen at
		// https://www.mediawiki.org/wiki/Article_feedback/Version_5/Feature_Requirements#Access_and_permissions
		$wgArticleFeedbackv5DefaultPermissions = [
			'aft-reader' => [ '*', 'user', 'confirmed', 'autoconfirmed', 'rollbacker', 'reviewer', 'sysop', 'oversight' ],
			'aft-member' => [ 'user', 'confirmed', 'autoconfirmed', 'rollbacker', 'reviewer', 'sysop', 'oversight' ],
			'aft-editor' => [ 'confirmed', 'autoconfirmed', 'rollbacker', 'reviewer', 'sysop', 'oversight' ],
			'aft-monitor' => [ 'rollbacker', 'reviewer', 'sysop', 'oversight' ],
			'aft-administrator' => [ 'sysop', 'oversight' ],
			'aft-oversighter' => [ 'oversight' ],
		];
		foreach ( $wgArticleFeedbackv5DefaultPermissions as $permission => $groups ) {
			foreach ( (array)$groups as $group ) {
				if ( isset( $wgGroupPermissions[$group] ) ) {
					$wgGroupPermissions[$group][$permission] = true;
				}
			}
		}

		// Only load the module / enable the tool in these namespaces
		// Default to $wgContentNamespaces (defaults to array( NS_MAIN ) ).
		$wgArticleFeedbackv5Namespaces = $wgContentNamespaces;
	}

	/**
	 * LoadExtensionSchemaUpdates hook
	 *
	 * @param DatabaseUpdater $updater
	 */
	public static function loadExtensionSchemaUpdates( $updater ) {
		$updater->addExtensionTable(
			'aft_feedback',
			__DIR__ . '/../sql/ArticleFeedbackv5.sql'
		);

		// old schema support
		if ( $updater->getDB()->tableExists( 'aft_article_feedback' ) ) {
			$updater->addExtensionTable(
				'aft_article_answer_text',
				__DIR__ . '/../sql/offload_large_feedback.sql'
			);

			$updater->addExtensionIndex(
				'aft_article_feedback',
				'af_user_id_user_ip_created',
				__DIR__ . '/../sql/index_user_data.sql'
			);

			$updater->modifyExtensionField(
				'aft_article_feedback',
				'af_user_ip',
				__DIR__ . '/../sql/userip_length.sql'
			);

			// move all data from old schema to new, sharded, schema
			require_once __DIR__ . '/../maintenance/legacyToShard.php';
			$updater->addPostDatabaseUpdateMaintenance( 'ArticleFeedbackv5_LegacyToShard' );
			/*
			 * Because this update involves moving data around, the old schema
			 * will not automatically be removed (just to be sure no valuable
			 * data is destroyed by accident). After having verified the update
			 * was successful and if you really want to clean out your database
			 * (you don't have to delete it), you can run sql/remove_legacy.sql
			 */
		}

		$updater->addExtensionField(
			'aft_feedback',
			'aft_noaction',
			__DIR__ . '/../sql/noaction.sql'
		);

		$updater->addExtensionField(
			'aft_feedback',
			'aft_archive',
			__DIR__ . '/../sql/archive.sql'
		);
		// fix archive dates for existing feedback
		require_once __DIR__ . '/../maintenance/setArchiveDate.php';
		$updater->addPostDatabaseUpdateMaintenance( 'ArticleFeedbackv5_SetArchiveDate' );

		$updater->addExtensionField(
			'aft_feedback',
			'aft_inappropriate',
			__DIR__ . '/../sql/inappropriate.sql'
		);

		$updater->addExtensionIndex(
			'aft_feedback',
			'contribs',
			__DIR__ . '/../sql/index_contribs.sql'
		);

		$updater->addExtensionIndex(
			'aft_feedback',
			'relevance_page',
			__DIR__ . '/../sql/index_page.sql'
		);

		$updater->addExtensionField(
			'aft_feedback',
			'aft_discuss',
			__DIR__ . '/../sql/discuss.sql'
		);

		$updater->addExtensionField(
			'aft_feedback',
			'aft_claimed_user',
			__DIR__ . '/../sql/claimed_user.sql'
		);
	}

	/**
	 * BeforePageDisplay hook - this hook will determine if and what javascript will be loaded
	 *
	 * @param OutputPage $out
	 * @param Skin $skin
	 */
	public static function beforePageDisplay( OutputPage $out, Skin $skin ) {
		global $wgArticleFeedbackv5Namespaces;
		$title = $out->getTitle();
		$user = $out->getUser();

		// normal page where form can be displayed
		if ( in_array( $title->getNamespace(), $wgArticleFeedbackv5Namespaces ) ) {
			// check if we actually fetched article content & no error page
			if ( $out->getRevisionId() != null ) {
				// load module
				$out->addJsConfigVars( 'aftv5Article', self::getPageInformation( $title ) );
				$out->addModules( 'ext.articleFeedbackv5.startup' );
			}

		// talk page
		} elseif ( in_array( $title->getSubjectPage()->getNameSpace(), $wgArticleFeedbackv5Namespaces ) ) {
			// load module
			$out->addJsConfigVars( 'aftv5Article', self::getPageInformation( $title->getSubjectPage() ) );
			$out->addModules( 'ext.articleFeedbackv5.talk' );

		// special page
		} elseif ( $title->getNamespace() == NS_SPECIAL ) {
			// central feedback page, article feedback page, permalink page & watchlist feedback page
			if ( $out->getTitle()->isSpecial( 'ArticleFeedbackv5' ) || $out->getTitle()->isSpecial( 'ArticleFeedbackv5Watchlist' ) ) {
				// fetch the title of the article this special page is related to
				list( /* special */, $mainTitle ) = MediaWikiServices::getInstance()->getSpecialPageFactory()->resolveAlias( $out->getTitle()->getDBkey() );

				// Permalinks: drop the feedback ID
				$mainTitle = preg_replace( '/(\/[0-9]+)$/', '', $mainTitle );
				$mainTitle = Title::newFromDBkey( $mainTitle );

				// Central feedback page
				if ( $mainTitle === null ) {
					$article = [
						'id' => 0,
						'title' => '',
						'namespace' => '-1',
						'categories' => [],
						'permissionLevel' => ''
					];

				// Article feedback page
				} else {
					$article = self::getPageInformation( $mainTitle );
				}

				// load module
				$out->addJsConfigVars( 'aftv5Article', $article );
				$out->addModules( 'ext.articleFeedbackv5.dashboard' );
			} elseif ( $out->getTitle()->isSpecial( 'Watchlist' ) ) {
				// watchlist page
				global $wgArticleFeedbackv5Watchlist;

				if ( $wgArticleFeedbackv5Watchlist && $user->getId() ) {
					$records = ArticleFeedbackv5Model::getWatchlistList(
						'unreviewed',
						$user,
						$user
					);

					if ( $records->numRows() ) {
						$out->addModules( 'ext.articleFeedbackv5.watchlist' );
					}
				}
			}
		}
	}

	/**
	 * This will fetch some page information: the actual check if AFT can be loaded
	 * will be done JS-side (because PHP output may be cached and thus not completely
	 * up-to-date)
	 * However, not all checks can be performed on JS-side - well, they can only be
	 * performed on the article page, not on the talk page & special page. Since these
	 * pages don't have the appropriate information available for Javascript, this
	 * method will build the relevant info.
	 *
	 * @param Title $title the article
	 * @return array the article's info, to be exposed to JS
	 */
	public static function getPageInformation( Title $title ) {
		$permissions = ArticleFeedbackv5Permissions::getProtectionRestriction( $title->getArticleID() );

		$article = [
			'id' => $title->getArticleID(),
			'title' => $title->getFullText(),
			'namespace' => $title->getNamespace(),
			'categories' => [],
			'permissionLevel' => isset( $permissions->pr_level ) ? $permissions->pr_level : false,
		];

		foreach ( $title->getParentCategories() as $category => $page ) {
			// get category title without prefix
			$category = Title::newFromDBkey( $category );
			if ( $category ) {
				$article['categories'][] = str_replace( '_', ' ', $category->getDBkey() );
			}
		}

		return $article;
	}

	/**
	 * ResourceLoaderGetConfigVars hook
	 *
	 * @param array &$vars
	 */
	public static function resourceLoaderGetConfigVars( &$vars ) {
		global
			$wgArticleFeedbackv5Categories,
			$wgArticleFeedbackv5BlacklistCategories,
			$wgArticleFeedbackv5Debug,
			$wgArticleFeedbackv5DisplayBuckets,
			$wgArticleFeedbackv5CTABuckets,
			$wgArticleFeedbackv5LinkBuckets,
			$wgArticleFeedbackv5Namespaces,
			$wgArticleFeedbackv5EnableProtection,
			$wgArticleFeedbackv5LearnToEdit,
			$wgArticleFeedbackv5SurveyUrls,
			$wgArticleFeedbackv5ThrottleThresholdPostsPerHour,
			$wgArticleFeedbackv5ArticlePageLink,
			$wgArticleFeedbackv5TalkPageLink,
			$wgArticleFeedbackv5WatchlistLink,
			$wgArticleFeedbackv5Watchlist,
			$wgArticleFeedbackv5DefaultSorts,
			$wgArticleFeedbackv5LotteryOdds,
			$wgArticleFeedbackv5MaxCommentLength;

		$vars['wgArticleFeedbackv5Categories'] = $wgArticleFeedbackv5Categories;
		$vars['wgArticleFeedbackv5BlacklistCategories'] = $wgArticleFeedbackv5BlacklistCategories;
		$vars['wgArticleFeedbackv5Debug'] = $wgArticleFeedbackv5Debug;
		$vars['wgArticleFeedbackv5LinkBuckets'] = $wgArticleFeedbackv5LinkBuckets;
		$vars['wgArticleFeedbackv5Namespaces'] = $wgArticleFeedbackv5Namespaces;
		$vars['wgArticleFeedbackv5EnableProtection'] = $wgArticleFeedbackv5EnableProtection;
		$vars['wgArticleFeedbackv5LearnToEdit'] = $wgArticleFeedbackv5LearnToEdit;
		$vars['wgArticleFeedbackv5SurveyUrls'] = $wgArticleFeedbackv5SurveyUrls;
		$vars['wgArticleFeedbackv5ThrottleThresholdPostsPerHour'] = $wgArticleFeedbackv5ThrottleThresholdPostsPerHour;
		$vars['wgArticleFeedbackv5SpecialUrl'] = SpecialPage::getTitleFor( 'ArticleFeedbackv5' )->getLinkUrl();
		$vars['wgArticleFeedbackv5SpecialWatchlistUrl'] = SpecialPage::getTitleFor( 'ArticleFeedbackv5Watchlist' )->getPrefixedText();
		$vars['wgArticleFeedbackv5ArticlePageLink'] = $wgArticleFeedbackv5ArticlePageLink;
		$vars['wgArticleFeedbackv5TalkPageLink'] = $wgArticleFeedbackv5TalkPageLink;
		$vars['wgArticleFeedbackv5WatchlistLink'] = $wgArticleFeedbackv5WatchlistLink;
		$vars['wgArticleFeedbackv5Watchlist'] = $wgArticleFeedbackv5Watchlist;
		$vars['wgArticleFeedbackv5DefaultSorts'] = $wgArticleFeedbackv5DefaultSorts;
		$vars['wgArticleFeedbackv5LotteryOdds'] = $wgArticleFeedbackv5LotteryOdds;
		$vars['wgArticleFeedbackv5MaxCommentLength'] = $wgArticleFeedbackv5MaxCommentLength;

		// make sure that these keys are being encoded to an object rather than to an array
		$wgArticleFeedbackv5DisplayBuckets['buckets'] = (object)$wgArticleFeedbackv5DisplayBuckets['buckets'];
		$wgArticleFeedbackv5CTABuckets['buckets'] = (object)$wgArticleFeedbackv5CTABuckets['buckets'];
		$vars['wgArticleFeedbackv5DisplayBuckets'] = $wgArticleFeedbackv5DisplayBuckets;
		$vars['wgArticleFeedbackv5CTABuckets'] = (object)$wgArticleFeedbackv5CTABuckets;
	}

	/**
	 * MakeGlobalVariablesScript hook - this does pretty much the same as the ResourceLoaderGetConfigVars
	 * hook: it makes these variables accessible through JS. However, these are added on a per-page basis,
	 * on the page itself (also setting us free from potential browser cache issues)
	 *
	 * @param array &$vars
	 * @param OutputPage $out
	 */
	public static function makeGlobalVariablesScript( array &$vars, OutputPage $out ) {
		$user = $out->getUser();

		// expose AFT permissions for this user to JS
		$vars['wgArticleFeedbackv5Permissions'] = [];
		foreach ( ArticleFeedbackv5Permissions::$permissions as $permission ) {
			$vars['wgArticleFeedbackv5Permissions'][$permission] = $user->isAllowed( $permission ) && !$user->isBlocked();
		}
	}

	/**
	 * Add the preference in the user preferences with the GetPreferences hook.
	 *
	 * @param User $user
	 * @param array[] &$preferences
	 */
	public static function getPreferences( $user, &$preferences ) {
		// need to check for existing key, if deployed simultaneously with AFTv4
		if ( !array_key_exists( 'articlefeedback-disable', $preferences ) ) {
			$preferences['articlefeedback-disable'] = [
				'type' => 'check',
				'section' => 'rendering/advancedrendering',
				'label-message' => 'articlefeedbackv5-disable-preference',
			];
		}
	}

	/**
	 * Pushes fields into the edit page. This will allow us to pass on some parameter(s)
	 * until the submission of a page (at which point we can check for these parameters
	 * with a hook in PageContentSaveComplete)
	 *
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/EditPage::showEditForm:fields
	 * @param EditPage $editPage
	 * @param OutputPage $output
	 */
	public static function pushFieldsToEdit( $editPage, $output ) {
		// push AFTv5 values back into the edit page form, so we can pick them up after submitting the form
		foreach ( $output->getRequest()->getValues() as $key => $value ) {
			if ( strpos( $key, 'articleFeedbackv5_' ) === 0 ) {
				$editPage->editFormTextAfterContent .= Html::hidden( $key, $value );
			}
		}
	}

	/**
	 * Intercept contribution entries and format those belonging to AFT
	 *
	 * @param ContribsPager $pager The ContribsPager object hooked into
	 * @param string &$ret the HTML line
	 * @param stdClass $row Row the DB row for this line
	 * @param array &$classes the classes to add to the surrounding <li>
	 * @return bool
	 */
	public static function contributionsLineEnding( $pager, &$ret, $row, &$classes ) {
		if ( !isset( $row->aft_contribution ) || $row->aft_contribution !== 'AFT' ) {
			return true;
		}

		$pageTitle = Title::newFromId( $row->aft_page );
		if ( $pageTitle === null ) {
			return true;
		}

		$record = ArticleFeedbackv5Model::get( $row->aft_id, $row->aft_page );
		if ( !$record ) {
			return true;
		}

		$lang = $pager->getLanguage();
		$user = $pager->getUser();
		$feedbackTitle = SpecialPage::getTitleFor( 'ArticleFeedbackv5', $pageTitle->getPrefixedDBkey() . "/$record->aft_id" );
		$centralPageName = MediaWikiServices::getInstance()->getSpecialPageFactory()
			->getLocalNameFor( 'ArticleFeedbackv5', $pageTitle->getPrefixedDBkey() );
		$feedbackCentralPageTitle = Title::makeTitle( NS_SPECIAL, $centralPageName, "$record->aft_id" );

		// date & time
		$dateFormats = [];
		$dateFormats['timeAndDate'] = $lang->userTimeAndDate( $record->aft_timestamp, $user );
		$dateFormats['date'] = $lang->userDate( $record->aft_timestamp, $user );
		$dateFormats['time'] = $lang->userTime( $record->aft_timestamp, $user );

		$linkRenderer = MediaWikiServices::getInstance()->getLinkRenderer();

		// if feedback should be hidden from users, a special class "history-deleted" should be added
		$historyDeleted = ( $record->isHidden() || $record->isRequested() || $record->isOversighted() );
		foreach ( $dateFormats as $format => &$formattedTime ) {
			$formattedTime = $linkRenderer->makeLink( $feedbackTitle, $formattedTime );
			if ( $historyDeleted ) {
				$formattedTime = '<span class="history-deleted">' . $formattedTime . '</span>';
			}
		}

		// show user names for /newbies as there may be different users.
		$userlink = '';
		if ( $pager->contribs == 'newbie' ) {
			$username = User::whoIs( $record->aft_user );
			if ( $username !== false ) {
				$userlink = ' . . ' . Linker::userLink( $record->aft_user, $username );
				$userlink .= ' ' . wfMessage( 'parentheses' )->rawParams(
					Linker::userTalkLink( $record->aft_user, $username ) )->escaped() . ' ';
			}
		}

		// feedback (truncated)
		$feedback = '';
		if ( $record->aft_comment != '' ) {
			if ( $record->isHidden() || $record->isRequested() || $record->isOversighted() ) {
				// (probably) abusive comment that has been hidden/oversight-requested/oversighted
				$feedback = wfMessage( 'articlefeedbackv5-contribs-hidden-feedback' )->escaped();
			} else {
				$feedback = $lang->truncateForVisual( $record->aft_comment, 75 );
			}
		}

		// status (actions taken)
		$actions = [];
		if ( $record->aft_helpful > $record->aft_unhelpful ) {
			$actions[] = wfMessage( 'articlefeedbackv5-contribs-status-action-helpful' )->escaped();
		}
		if ( $record->isFlagged() ) {
			$actions[] = wfMessage( 'articlefeedbackv5-contribs-status-action-flag' )->escaped();
		}
		if ( $record->isFeatured() ) {
			$actions[] = wfMessage( 'articlefeedbackv5-contribs-status-action-feature' )->escaped();
		}
		if ( $record->isResolved() ) {
			$actions[] = wfMessage( 'articlefeedbackv5-contribs-status-action-resolve' )->escaped();
		}
		if ( $record->isNonActionable() ) {
			$actions[] = wfMessage( 'articlefeedbackv5-contribs-status-action-noaction' )->escaped();
		}
		if ( $record->isInappropriate() ) {
			$actions[] = wfMessage( 'articlefeedbackv5-contribs-status-action-inappropriate' )->escaped();
		}
		if ( $record->isHidden() ) {
			$actions[] = wfMessage( 'articlefeedbackv5-contribs-status-action-hide' )->escaped();
		}
		if ( $record->isRequested() ) {
			$actions[] = wfMessage( 'articlefeedbackv5-contribs-status-action-request' )->escaped();
		}
		if ( $record->isOversighted() ) {
			$actions[] = wfMessage( 'articlefeedbackv5-contribs-status-action-oversight' )->escaped();
		}

		$status = '';
		if ( $actions ) {
			$status = wfMessage( 'articlefeedbackv5-contribs-entry-status' )
				->params( $lang->listToText( $actions ) )
				->plain();
		}

		$ret = wfMessage( 'articlefeedbackv5-contribs-entry' )
			->rawParams( $dateFormats['timeAndDate'] ) // timeanddate
			->params(
				ChangesList::showCharacterDifference( 0, strlen( $record->aft_comment ) ), // chardiff
				$feedbackCentralPageTitle->getFullText(), // feedback link
				$pageTitle->getPrefixedText() // article title
			)
			->rawParams(
				$userlink, // userlink (for newbies)
				Linker::commentBlock( $feedback ) // comment
			)
			->params( $status ) // status
			->rawParams( $dateFormats['date'], $dateFormats['time'] ) // date, time
			->parse();

		$classes[] = 'mw-aft-contribution';

		return true;
	}

	/**
	 * Adds a user's AFT-contributions to the My Contributions special page
	 *
	 * @param array &$data an array of results of all contribs queries, to be merged to form all contributions data
	 * @param ContribsPager $pager ContribsPager object hooked into
	 * @param string $offset index offset, inclusive
	 * @param int $limit exact query limit
	 * @param bool $descending query direction, false for ascending, true for descending
	 * @return bool
	 */
	public static function contributionsData( &$data, $pager, $offset, $limit, $descending ) {
		if ( $pager->getNamespace() !== '' || $pager->getTagFilter() !== false ) {
			return true;
		}

		$userIds = [];

		$data[] = ArticleFeedbackv5Model::getContributionsData( $pager, $offset, $limit, $descending, $userIds );

		return true;
	}

	/**
	 * Add an AFT entry to article's protection levels
	 *
	 * Basically, all this code will do the same as adding a value to $wgRestrictionTypes
	 * However, that would use the same permission types as the other entries, whereas the
	 * AFT permission levels should be different.
	 *
	 * Parts of code are heavily "inspired" by ProtectionForm.
	 *
	 * @param Page $article
	 * @param string &$output
	 * @return bool
	 */
	public static function onProtectionForm( Page $article, &$output ) {
		global $wgArticleFeedbackv5Namespaces, $wgArticleFeedbackv5EnableProtection;
		$page = $article->getPage();
		$pageId = $page->getId();

		if ( !$page->exists() ) {
			return true;
		}

		// check if opt-in/-out is enabled
		if ( !$wgArticleFeedbackv5EnableProtection ) {
			return true;
		}

		$title = $article->getTitle();
		// only on pages in namespaces where it is enabled
		if ( !$title->inNamespaces( $wgArticleFeedbackv5Namespaces ) ) {
			return true;
		}

		$context = $article->getContext();
		$user = $context->getUser();
		$lang = $context->getLanguage();
		$permErrors = MediaWikiServices::getInstance()->getPermissionManager()
			->getPermissionErrors( 'protect', $user, $title );
		if ( wfReadOnly() ) {
			$permErrors[] = [ 'readonlytext', wfReadOnlyReason() ];
		}
		$disabled = $permErrors != [];
		$disabledAttrib = $disabled ? [ 'disabled' => 'disabled' ] : [];

		// on a per-page basis, AFT can only be restricted from these levels
		$levels = [
			'aft-reader' => 'protect-level-aft-reader',
			'aft-member' => 'protect-level-aft-member',
			'aft-editor' => 'protect-level-aft-editor',
			'aft-administrator' => 'protect-level-aft-administrator',
			'aft-noone' => 'protect-level-aft-noone',
		];

		// build permissions dropdown
		$existingRestriction = ArticleFeedbackv5Permissions::getAppliedRestriction( $pageId );
		$id = 'articlefeedbackv5-protection-level';
		$attribs = [
			'id' => $id,
			'name' => $id,
			'size' => count( $levels )
		] + $disabledAttrib;
		$permissionsDropdown = Xml::openElement( 'select', $attribs );
		foreach ( $levels as $key => $label ) {
			// possible labels: protect-level-aft-(reader|member|editor|administrator|noone)
			$permissionsDropdown .= Xml::option( wfMessage( $label )->text(), $key, $key == $existingRestriction->pr_level );
		}
		$permissionsDropdown .= Xml::closeElement( 'select' );

		$scExpiryOptions = wfMessage( 'protect-expiry-options' )->inContentLanguage()->text();
		$showProtectOptions = ( $scExpiryOptions !== '-' );

		list(
			$mExistingExpiry,
			$mExpiry,
			$mExpirySelection
		) = ArticleFeedbackv5Permissions::getExpiry( $pageId );

		if ( $showProtectOptions ) {
			$expiryFormOptions = '';

			// add option to re-use existing expiry
			if ( $mExistingExpiry && $mExistingExpiry != 'infinity' ) {
				$timestamp = $lang->timeanddate( $mExistingExpiry, true );
				$d = $lang->date( $mExistingExpiry, true );
				$t = $lang->time( $mExistingExpiry, true );
				$expiryFormOptions .=
					Xml::option(
						wfMessage( 'protect-existing-expiry', $timestamp, $d, $t )->text(),
						'existing',
						$mExpirySelection == 'existing'
					);
			}

			// add regular expiry options
			$expiryFormOptions .= Xml::option( wfMessage( 'protect-othertime-op' )->text(), 'othertime' );
			foreach ( explode( ',', $scExpiryOptions ) as $option ) {
				if ( strpos( $option, ':' ) === false ) {
					$show = $value = $option;
				} else {
					list( $show, $value ) = explode( ':', $option );
				}

				$expiryFormOptions .= Xml::option( $show, $value, $mExpirySelection == $value );
			}

			// build expiry dropdown
			$protectExpiry = Xml::tags( 'select',
				[
					'id' => 'articlefeedbackv5-protection-expiration-selection',
					'name' => 'articlefeedbackv5-protection-expiration-selection',
					// when selecting anything other than "othertime", clear the input field for other time
					'onchange' => 'javascript:if ( $( this ).val() != "othertime" ) $( "#articlefeedbackv5-protection-expiration" ).val( "" );',
				],
				$expiryFormOptions );
			$mProtectExpiry = Xml::label( wfMessage( 'protectexpiry' )->text(), 'mwProtectExpirySelection-aft' );
		}

		// build custom expiry field
		$attribs = [
			'id' => 'articlefeedbackv5-protection-expiration',
			// when entering an other time, make sure "othertime" is selected in the dropdown
			'onkeyup' => 'javascript:if ( $( this ).val() ) $( "#articlefeedbackv5-protection-expiration-selection" ).val( "othertime" );',
			'onchange' => 'javascript:if ( $( this ).val() ) $( "#articlefeedbackv5-protection-expiration-selection" ).val( "othertime" );'
		] + $disabledAttrib;

		$protectOther = Xml::input( 'articlefeedbackv5-protection-expiration', 50, $mExpiry, $attribs );
		$mProtectOther = Xml::label( wfMessage( 'protect-othertime' )->text(), "mwProtect-aft-expires" );

		// build output
		$output .= "
				<tr>
					<td>" .
			Xml::openElement( 'fieldset' ) .
			Xml::element( 'legend', null, wfMessage( 'articlefeedbackv5-protection-level' )->text() ) .
			Xml::openElement( 'table', [ 'id' => 'mw-protect-table-aft' ] ) . "
								<tr>
									<td>$permissionsDropdown</td>
								</tr>
								<tr>
									<td>";

		if ( $showProtectOptions && !$disabled ) {
			$output .= "				<table>
											<tr>
												<td class='mw-label'>$mProtectExpiry</td>
												<td class='mw-input'>$protectExpiry</td>
											</tr>
										</table>";
		}

		$output .= "					<table>
											<tr>
												<td class='mw-label'>$mProtectOther</td>
												<td class='mw-input'>$protectOther</td>
											</tr>
										</table>
									</td>
								</tr>" .
			Xml::closeElement( 'table' ) .
			Xml::closeElement( 'fieldset' ) . "
					</td>
				</tr>";

		return true;
	}

	/**
	 * Write AFT's article's protection levels to DB
	 *
	 * Parts of code are heavily "inspired" by ProtectionForm.
	 *
	 * @param Page $article
	 * @param string &$errorMsg
	 * @param string $reason
	 * @return bool
	 */
	public static function onProtectionSave( Page $article, &$errorMsg, $reason ) {
		global $wgRequest,
				$wgArticleFeedbackv5Namespaces,
				$wgArticleFeedbackv5EnableProtection;

		$page = $article->getPage();
		$pageId = $page->getId();

		if ( !$page->exists() ) {
			return true;
		}

		// check if opt-in/-out is enabled
		if ( !$wgArticleFeedbackv5EnableProtection ) {
			return true;
		}

		// only on pages in namespaces where it is enabled
		if ( !$article->getTitle()->inNamespaces( $wgArticleFeedbackv5Namespaces ) ) {
			return true;
		}

		$requestPermission = $wgRequest->getVal( 'articlefeedbackv5-protection-level' );
		$requestExpiry = $wgRequest->getText( 'articlefeedbackv5-protection-expiration' );
		$requestExpirySelection = $wgRequest->getVal( 'articlefeedbackv5-protection-expiration-selection' );

		if ( $requestExpirySelection == 'existing' ) {
			$expirationTime = ArticleFeedbackv5Permissions::getAppliedRestriction( $pageId )->pr_expiry;
		} else {
			if ( $requestExpirySelection == 'othertime' ) {
				$value = $requestExpiry;
			} else {
				$value = $requestExpirySelection;
			}

			if ( $value == 'infinite' || $value == 'indefinite' || $value == 'infinity' ) {
				$expirationTime = wfGetDB( DB_REPLICA )->getInfinity();
			} else {
				$unix = strtotime( $value );

				if ( !$unix || $unix === -1 ) {
					$errorMsg .= wfMessage( 'protect_expiry_invalid' )->escaped();
					return false;
				} else {
					// @todo FIXME: Non-qualified absolute times are not in user's specified timezone
					// and there isn't notice about it in the UI
					$expirationTime = wfTimestamp( TS_MW, $unix );
				}
			}
		}

		// don't save if nothing's changed
		$existingRestriction = ArticleFeedbackv5Permissions::getAppliedRestriction( $pageId );
		if ( $existingRestriction->pr_level == $requestPermission && $existingRestriction->pr_expiry == $expirationTime ) {
			return true;
		}

		$user = $article->getContext()->getUser();
		$success = ArticleFeedbackv5Permissions::setRestriction(
			$pageId,
			$requestPermission,
			$expirationTime,
			$user,
			$reason
		);

		return $success;
	}

	/**
	 * Add AFT permission logs to action=protect.
	 *
	 * @param Page $article
	 * @param OutputPage $out
	 * @return bool
	 */
	public static function onShowLogExtract( Page $article, OutputPage $out ) {
		global $wgArticleFeedbackv5Namespaces;

		// only on pages in namespaces where it is enabled
		if ( !$article->getTitle()->inNamespaces( $wgArticleFeedbackv5Namespaces ) ) {
			return true;
		}

		$protectLogPage = new LogPage( 'articlefeedbackv5' );
		$out->addHTML( Xml::element( 'h2', null, $protectLogPage->getName()->text() ) );
		LogEventsList::showLogExtract( $out, 'articlefeedbackv5', $article->getTitle() );
	}

	/**
	 * Post-login update new user's last feedback with his new id
	 *
	 * @param User $currentUser
	 * @param string $injected_html
	 */
	public static function userLoginComplete( $currentUser, $injected_html ) {
		global $wgRequest;

		$id = 0;

		// feedback id is c-parameter in the referrer, extract it
		$referrer = ( $wgRequest->getVal( 'referrer' ) ) ? $wgRequest->getVal( 'referrer' ) : $wgRequest->getHeader( 'referer' );
		$url = parse_url( $referrer );
		$values = [];
		if ( isset( $url['query'] ) ) {
			parse_str( $url['query'], $values );
		}
		if ( isset( $values['c'] ) ) {
			$id = $values['c'];

		// if c-parameter is no longer in url (e.g. account creation didn't work at first attempts), try cookie data
		} else {
			$cookie = json_decode( $wgRequest->getCookie( ArticleFeedbackv5Utils::getCookieName( 'feedback-ids' ) ), true );
			if ( is_array( $cookie ) ) {
				$id = array_shift( $cookie );
			}
		}

		// the page that feedback was added to is the one we'll be returned to
		$title = Title::newFromDBkey( $wgRequest->getVal( 'returnto' ) );
		if ( $title !== null && $id ) {
			$pageId = $title->getArticleID();

			/*
			 * If we find this feedback and it is not yet "claimed" (and the feedback was
			 * not submitted by a registered user), "claim" it to the current user.
			 * Make sure the current request's IP actually still matches the one saved for
			 * the original submission.
			 */
			$feedback = ArticleFeedbackv5Model::get( $id, $pageId );
			if (
				$feedback &&
				!$feedback->aft_user &&
				$feedback->aft_user_text == IPUtils::sanitizeIP( $wgRequest->getIP() ) &&
				!$feedback->aft_claimed_user
			 ) {
				$feedback->aft_claimed_user = $currentUser->getId();
				$feedback->update();
			}
		}
	}

	/**
	 * @param string[] &$names
	 */
	public static function onUserGetReservedNames( &$names ) {
		$names[] = 'msg:articlefeedbackv5-default-user';
	}

	/**
	 * Add AFTv5 events to Echo.
	 *
	 * @param array[] &$notifications Echo notifications
	 * @param array[] &$notificationCategories Echo notification categories
	 * @param array[] &$icons Icon details
	 */
	public static function onBeforeCreateEchoEvent( &$notifications, &$notificationCategories, &$icons ) {
		$notificationCategories['feedback'] = [
			'tooltip' => 'echo-pref-tooltip-feedback',
			'priority' => 5,
		];

		// feedback is submitted to a page on your watchlist
		$notifications['feedback-watch'] = [
			'icon' => 'feedback-watch',
			'category' => 'feedback',
			'group' => 'neutral',
			'presentation-model' => 'EchoArticleFeedbackv5PresentationModel',
			EchoAttributeManager::ATTR_LOCATORS => [
				'EchoUserLocator::locateUsersWatchingTitle'
			],
			'bundle' => [ 'web' => true, 'email' => true ],
			// @todo FIXME: these prolly shouldn't exist here anymore and likely don't do anything anymore
			'email-body-batch-message' => 'articlefeedbackv5-notification-feedback-watch-email-batch-body',
			'email-body-batch-params' => [ 'agent', 'title', 'aft-page-i18n-link', 'aft-moderation-flag' ],
			'email-body-batch-bundle-message' => 'articlefeedbackv5-notification-feedback-watch-email-batch-bundle-body',
			'email-body-batch-bundle-params' => [ 'agent', 'title', 'aft-page-i18n-link', 'aft-moderation-flag', 'aft-other-display', 'aft-other-count' ],
		];

		$icons['feedback-watch'] = [
			'path' => 'ArticleFeedbackv5/modules/ext.articleFeedbackv5/images/notification.png',
		];

		// your feedback is moderated
		$notifications['feedback-moderated'] = [
			'icon' => 'feedback-moderated',
			'category' => 'feedback',
			'group' => 'neutral',
			'presentation-model' => 'EchoArticleFeedbackv5ModeratedPresentationModel',
			EchoAttributeManager::ATTR_LOCATORS => [
				'EchoUserLocator::locateEventAgent'
			],
			'bundle' => [ 'web' => true, 'email' => true ],
			// @todo FIXME: these prolly shouldn't exist here anymore and likely don't do anything anymore
			'email-body-batch-message' => 'articlefeedbackv5-notification-feedback-moderated-email-batch-body',
			'email-body-batch-params' => [ 'agent', 'title', 'aft-permalink-i18n-link', 'aft-moderation-flag' ],
			'email-body-batch-bundle-message' => 'articlefeedbackv5-notification-feedback-moderated-email-batch-bundle-body',
			'email-body-batch-bundle-params' => [ 'agent', 'title', 'aft-permalink-i18n-link', 'aft-comment', 'agent-other-display', 'agent-other-count' ],
		];

		$icons['feedback-moderated'] = [
			'path' => 'ArticleFeedbackv5/modules/ext.articleFeedbackv5/images/notification.png',
		];
	}

	/**
	 * Add users to be notified on Echo events.
	 *
	 * @param EchoEvent $event
	 * @param User[] &$users
	 */
	public static function onEchoGetDefaultNotifiedUsers( EchoEvent $event, &$users ) {
		switch ( $event->getType() ) {
			// notify users who watch this page
			case 'feedback-watch':
				$extra = $event->getExtra();
				if ( !$event->getExtraParam( 'aft-page' ) ) {
					break;
				}

				$page = Title::newFromID( $extra['aft-page'] );

				// @todo Could we just use EchoUserLocator::locateUsersWatchingTitle( $event ) here instead?
				$dbw = wfGetDB( DB_PRIMARY );
				$res = $dbw->select(
					'watchlist',
					[ 'wl_user' ],
					[
						'wl_user != ' . intval( $event->getAgent()->getID() ),
						'wl_namespace' => $page->getNamespace(),
						'wl_title' => $page->getDBkey(),
					],
					__METHOD__
				);

				foreach ( $res as $row ) {
					$recipientId = intval( $row->wl_user );
					$recipient = User::newFromId( $recipientId );

					// make sure user still exists
					$recipient->loadFromId();
					if ( !$recipient->isAnon() ) {
						$users[$recipientId] = $recipient;
					}
				}

				// don't notify for self-submitted feedback
				if ( isset( $extra['aft-user'] ) ) {
					unset( $users[intval( $extra['aft-user'] )] );
				}

				break;

			// notify user who submitted the feedback
			case 'feedback-moderated':
				$extra = $event->getExtra();
				if ( !$extra || !$event->getExtraParam( 'aft-user' ) ) {
					break;
				}

				$recipientId = $extra['aft-user'];
				$recipient = User::newFromId( $recipientId );

				// make sure user still exists
				$recipient->loadFromId();
				if ( !$recipient->isAnon() ) {
					$users[$recipientId] = $recipient;
				}

				// don't notify for self-moderated feedback
				unset( $users[intval( $event->getAgent()->getID() )] );

				break;
		}
	}

	/**
	 * AFTv5 notification bundling rules.
	 *
	 * @param EchoEvent $event
	 * @param string &$bundleString
	 */
	public static function onEchoGetBundleRules( EchoEvent $event, &$bundleString ) {
		switch ( $event->getType() ) {
			// watched page feedback: bundle per page
			case 'feedback-watch':
				$bundleString = $event->getType() . '-' . $event->getExtraParam( 'aft-page' );
				break;

			// feedback moderation: bundle per feedback entry
			case 'feedback-moderated':
				$bundleString = $event->getType() . '-' . $event->getExtraParam( 'aft-id' );
				break;
		}
	}

	/**
	 * @param array &$actions
	 */
	public static function onAbuseFilterCustomActions( array &$actions ): void {
		$customActionNames = [ 'aftv5resolve', 'aftv5flagabuse', 'aftv5hide', 'aftv5request' ];
		foreach ( $customActionNames as $name ) {
			$actions[$name] = static function ( Parameters $params ) use ( $name ) {
				return new ArticleFeedbackv5AbuseFilterConsequence( $params, $name );
			};
		}
	}
}
