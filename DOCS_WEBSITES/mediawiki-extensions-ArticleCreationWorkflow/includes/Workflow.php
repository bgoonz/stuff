<?php

namespace ArticleCreationWorkflow;

use Config;
use IContextSource;
use Title;
use User;

/**
 * Contains this extension's business logic
 */
class Workflow {

	/** @var Config */
	private $config;

	/**
	 * @param Config $config Configuration to use
	 */
	public function __construct( Config $config ) {
		$this->config = $config;
	}

	/**
	 * @return Config
	 */
	public function getConfig() {
		return $this->config;
	}

	/**
	 * Returns the message defining the landing page
	 *
	 * @return Title|null
	 */
	public function getLandingPageTitle() {
		$landingPageName = $this->config->get( 'ArticleCreationLandingPage' );
		return Title::newFromText( $landingPageName );
	}

	/**
	 * Checks whether an attempt to edit a page should be intercepted and redirected to our workflow
	 *
	 * @param Title $title The title $user attempts to create
	 * @param User $user The user trying to load the editor
	 * @return bool
	 */
	public function shouldInterceptPage( Title $title, User $user ) {
		// We are only interested in creation
		if ( $title->exists() ) {
			return false;
		}

		// Articles only
		if ( !$title->inNamespace( NS_MAIN ) ) {
			return false;
		}

		// User has perms, don't intercept
		if ( $user->isAllowed( 'createpagemainns' ) ) {
			return false;
		}

		// Only intercept users who can potentially create articles otherwise
		if ( !$user->isAllowed( 'createpage' ) ) {
			return false;
		}

		// Don't intercept if the landing page is not configured
		$landingPage = $this->getLandingPageTitle();
		if ( $landingPage === null || !$landingPage->exists() ) {
			return false;
		}

		return true;
	}

	/**
	 * If a user without sufficient permissions attempts to create a page in the main namespace
	 *
	 * @param Title $title
	 * @param User $user
	 * @param IContextSource $context
	 * @return bool
	 */
	public function interceptIfNeeded( Title $title, User $user, IContextSource $context ) {
		if ( $this->shouldInterceptPage( $title, $user ) ) {
			// If the landing page didn't exist, we wouldn't have intercepted.
			$redirTo = $this->getLandingPageTitle();
			$output = $context->getOutput();
			$output->redirect( $redirTo->getFullURL(
				[ 'page' => $title->getPrefixedText() ]
			) );

			return true;
		}
		return false;
	}
}
