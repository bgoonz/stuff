<?php

namespace ArticleCreationWorkflow;

use Article;
use MediaWiki\MediaWikiServices;
use OutputPage;
use Title;
use User;

/**
 * Hook handlers
 */
class Hooks {
	/**
	 * TitleQuickPermissions hook handler
	 * Prohibits creating pages in main namespace for users without a special permission
	 *
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/TitleQuickPermissions
	 * @param Title $title
	 * @param User $user
	 * @param string $action
	 * @param array &$errors
	 * @return bool
	 */
	public static function onTitleQuickPermissions( Title $title,
		User $user,
		$action,
		array &$errors
	) {
		if ( $action === 'create'
			&& $title->inNamespace( NS_MAIN )
			&& !$user->isAllowed( 'createpagemainns' )
		) {
			$errors[] = $user->isAnon() ? [ 'nocreatetext' ] : [ 'nocreate-loggedin' ];
			return false;
		}
		return true;
	}

	/**
	 * CustomEditor hook handler
	 * Redirects users attempting to create pages to the landing page, based on configuration
	 *
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/CustomEditor
	 *
	 * @param Article $article The requested page
	 * @param User $user The user trying to load the editor
	 * @return bool
	 */
	public static function onCustomEditor( Article $article, User $user ) {
		$workflow = self::getWorkflow();
		$context = $article->getContext();
		$title = $article->getTitle();

		if ( $workflow->interceptIfNeeded( $title, $user, $context ) ) {
			// Stop hook propagation, we're disallowing editing
			return false;
		}

		return true;
	}

	/**
	 * ShowMissingArticle hook handler
	 * If article doesn't exist, redirect non-autoconfirmed users to  AfC
	 *
	 * @see https://www.mediawiki.org/wiki/Manual:Hooks/ShowMissingArticle
	 *
	 * @param Article $article Article instance
	 */
	public static function onShowMissingArticle( Article $article ) {
		$workflow = self::getWorkflow();
		$context = $article->getContext();
		$user = $context->getUser();
		$title = $article->getTitle();

		$workflow->interceptIfNeeded( $title, $user, $context );
	}

	/**
	 * BeforePageDisplay hook handler
	 * If user is landing on our landing page, we add eventlogging
	 *
	 * @param OutputPage $out OutputPage instance
	 */
	public static function onBeforePageDisplay( OutputPage $out ) {
		$workflow = self::getWorkflow();
		if ( $out->getPageTitle() == $workflow->getLandingPageTitle() ) {
			if ( $workflow->getConfig()->get( 'UseCustomLandingPageStyles' ) ) {
				$out->addModuleStyles( 'ext.acw.landingPageStyles' );
			}
			$out->addModules( 'ext.acw.eventlogging' );
		}
	}

	/**
	 * @return Workflow
	 */
	private static function getWorkflow() {
		static $cached;

		if ( !$cached ) {
			$config = MediaWikiServices::getInstance()
				->getConfigFactory()
				->makeConfig( 'ArticleCreationWorkflow' );
			$cached = new Workflow( $config );
		}

		return $cached;
	}
}
