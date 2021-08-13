<?php

namespace MediaWiki\Extension\DynamicSidebar;

use Article;
use MediaWiki\Hook\SidebarBeforeOutputHook;
use MediaWiki\HookContainer\HookContainer;
use MediaWiki\User\UserGroupManager;
use Skin;
use TextContent;
use Title;
use User;

class DynamicSidebarHooks implements SidebarBeforeOutputHook {
	/** @var HookContainer */
	private $hookContainer;
	/** @var UserGroupManager */
	private $userGroupManager;

	/**
	 * @param HookContainer $hookContainer
	 * @param UserGroupManager $userGroupManager
	 */
	public function __construct(
		HookContainer $hookContainer,
		UserGroupManager $userGroupManager
	) {
		$this->hookContainer = $hookContainer;
		$this->userGroupManager = $userGroupManager;
	}

	/**
	 * Called from SidebarBeforeOutput hook. Modifies the sidebar
	 * via callbacks.
	 *
	 * @param Skin $skin
	 * @param array &$sidebar
	 */
	public function onSidebarBeforeOutput( $skin, &$sidebar ): void {
		$config = $skin->getConfig();

		$dynamicSidebarUseGroups = $config->get( 'DynamicSidebarUseGroups' );
		$dynamicSidebarUseUserpages = $config->get( 'DynamicSidebarUseUserpages' );
		$dynamicSidebarUseCategories = $config->get( 'DynamicSidebarUseCategories' );
		$dynamicSidebarUsePageCategories = $config->get( 'DynamicSidebarUsePageCategories' );

		self::printDebug( "Entering onSidebarBeforeOutput" );
		$groupSB = [];
		$userSB = [];
		$catSB = [];
		$user = $skin->getUser();
		if ( $dynamicSidebarUseGroups && isset( $sidebar['GROUP-SIDEBAR'] ) ) {
			self::printDebug( "Using group sidebar" );
			$skin->addToSidebarPlain(
				$groupSB,
				self::doGroupSidebar( $user, $this->userGroupManager, $this->hookContainer )
			);
		}
		if ( $dynamicSidebarUseUserpages && isset( $sidebar['USER-SIDEBAR'] ) ) {
			self::printDebug( "Using user sidebar" );
			$skin->addToSidebarPlain( $userSB, self::doUserSidebar( $user ) );
		}
		if ( $dynamicSidebarUseCategories && isset( $sidebar['CATEGORY-SIDEBAR'] ) ) {
			self::printDebug( "Using category sidebar" );
			$skin->addToSidebarPlain( $catSB, self::doCategorySidebar( $user ) );
		}
		if ( $dynamicSidebarUsePageCategories && isset( $sidebar['CATEGORY-SIDEBAR'] ) ) {
			self::printDebug( "Using category sidebar" );
			$skin->addToSidebarPlain( $catSB, self::doPageCategorySidebar( $user, $skin->getTitle() ) );
		}

		$sidebar_copy = [];

		foreach ( $sidebar as $sidebar_key => $sidebar_item ) {
			if ( $sidebar_key == 'GROUP-SIDEBAR' ) {
				// Replace the GROUP-SIDEBAR entry with the group's sidebar
				foreach ( $groupSB as $groupSBkey => $groupSBvalue ) {
					$sidebar_copy[$groupSBkey] = $groupSBvalue;
				}
			} elseif ( $sidebar_key == 'USER-SIDEBAR' ) {
				// Replace the USER-SIDEBAR entry with the user's sidebar
				foreach ( $userSB as $userSBkey => $userSBvalue ) {
					$sidebar_copy[$userSBkey] = $userSBvalue;
				}
			} elseif ( $sidebar_key == 'CATEGORY-SIDEBAR' ) {
				// Replace the CATEGORY-SIDEBAR entry with the category's sidebar
				foreach ( $catSB as $catSBkey => $catSBvalue ) {
					$sidebar_copy[$catSBkey] = $catSBvalue;
				}
			} else {
				// Add the original array item back
				$sidebar_copy[$sidebar_key] = $sidebar_item;
			}
		}

		$sidebar = $sidebar_copy;
	}

	/**
	 * Grabs the sidebar for the current user
	 * User:<username>/Sidebar
	 *
	 * @param User $user
	 * @return string|null
	 */
	private static function doUserSidebar( User $user ) {
		$username = $user->getName();

		// does 'User:<username>/Sidebar' page exist?
		$title = Title::makeTitle( NS_USER, $username . '/Sidebar' );
		if ( !$title->exists() ) {
			// Remove this sidebar if not
			return '';
		}

		$revid = $title->getLatestRevID();
		$a = new Article( $title, $revid );

		$content = $a->getPage()->getContent();
		return ( $content instanceof TextContent ) ? $content->getText() : null;
	}

	/**
	 * Grabs the sidebar for the current user's groups
	 *
	 * @param User $user
	 * @param UserGroupManager $userGroupManager
	 * @param HookContainer $hookContainer
	 * @return string
	 */
	private static function doGroupSidebar(
		User $user,
		UserGroupManager $userGroupManager,
		HookContainer $hookContainer
	) {
		// Get group membership array.
		$groups = $userGroupManager->getUserEffectiveGroups( $user );
		$hookContainer->run( 'DynamicSidebarGetGroups', [ &$groups ] );
		// Did we find any groups?
		if ( count( $groups ) == 0 ) {
			// Remove this sidebar if not
			return '';
		}

		$text = '';
		foreach ( $groups as $group ) {
			// Form the path to the article:
			// MediaWiki:Sidebar/<group>
			$title = Title::makeTitle( NS_MEDIAWIKI, 'Sidebar/Group:' . $group );
			if ( !$title->exists() ) {
				continue;
			}
			$revid = $title->getLatestRevID();
			$a = new Article( $title, $revid );

			$content = $a->getPage()->getContent();
			$text .= ( $content instanceof TextContent ) ? $content->getText() : "" . "\n";

		}
		return $text;
	}

	/**
	 * @param User $user
	 * @param Title $title
	 * @return string
	 */
	private static function doPageCategorySidebar( User $user, Title $title ) {
		return self::doCategorySidebar( $user, $title->getParentCategories() );
	}

	/**
	 * Grabs the sidebar for the current user's categories
	 *
	 * @param User $user
	 * @param array|null $categories
	 * @return string
	 */
	private static function doCategorySidebar( User $user, array $categories = null ) {
		self::printDebug( "User name: {$user->getName()}" );
		if ( $categories === null ) {
			$categories = $user->getUserPage()->getParentCategories();
		}

		// Did we find any categories?
		if ( !is_array( $categories ) || count( $categories ) == 0 ) {
			// Remove this sidebar if not.
			return '';
		}

		$text = '';
		// getParentCategories() returns categories in the form:
		// [ParentCategory] => page
		// We only care about the parent category
		foreach ( $categories as $category => $unused ) {
			// $category is in form Category:<category>
			// We need <category>.
			$category = explode( ":", $category );
			$category = $category[1];
			self::printDebug( "Checking category: $category" );

			// Form the path to the article:
			// MediaWiki:Sidebar/<category>
			$title = Title::makeTitle( NS_MEDIAWIKI, 'Sidebar/Category:' . $category );
			if ( !$title->exists() ) {
				self::printDebug( "$category category page doesn't exist." );
				continue;
			}
			$revid = $title->getLatestRevID();
			$a = new Article( $title, $revid );
			$content = $a->getPage()->getContent();
			$text .= ( $content instanceof TextContent ) ? $content->getText() : "" . "\n";
			self::printDebug( "$category text output is: $text" );
		}
		return $text;
	}

	/**
	 * Prints debugging information. $debugText is what you want to print, $debugArr
	 * will expand into arrItem::arrItem2::arrItem3::... and is appended to $debugText
	 *
	 * @param string $debugText
	 * @param array|null $debugArr
	 */
	private static function printDebug( $debugText, array $debugArr = null ) {
		if ( isset( $debugArr ) ) {
			$text = $debugText . " " . implode( "::", $debugArr );
			wfDebugLog( 'dynamic-sidebar', $text, false );
		} else {
			wfDebugLog( 'dynamic-sidebar', $debugText, false );
		}
	}
}
