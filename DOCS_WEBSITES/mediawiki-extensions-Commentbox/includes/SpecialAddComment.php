<?php

namespace MediaWiki\Extension\Commentbox;

use Article;
use ContentHandler;
use EditPage;
use FauxRequest;
use MediaWiki\MediaWikiServices;
use PermissionsError;
use ReadOnlyError;
use Title;
use UnlistedSpecialPage;
use UserBlockedError;
use WikiPage;

/**
 * Specialpage for the Commentbox extension.
 *
 * @file
 * @ingroup Extensions
 */

class SpecialAddComment extends UnlistedSpecialPage {
	public function __construct() {
		parent::__construct( 'AddComment', 'edit' );
	}

	/**
	 * @inheritDoc
	 */
	public function execute( $par ) {
		$out = $this->getOutput();
		if ( !$this->getRequest()->wasPosted() ) {
			$out->redirect( Title::newMainPage()->getFullURL() );
			return;
		}
		$this->setHeaders();

		$Pagename = $this->getRequest()->getText( 'wpPageName' );
		$Author   = $this->getRequest()->getText( 'wpAuthor', '' );
		$Comment  = $this->getRequest()->getText( 'wpComment', '' );
		$title = Title::newFromText( $Pagename );
		if ( $title == null || !$title->exists() ) {
			$this->fail( 'commentbox-error-page-nonexistent' );
			return;
		}

		$commentboxNamespaces = $this->getConfig()->get( 'CommentboxNamespaces' );
		if ( !array_key_exists( $title->getNamespace(), $commentboxNamespaces )
			|| !$commentboxNamespaces[ $title->getNamespace() ]
		) {
			$this->fail( 'commentbox-error-namespace', $title );
			return;
		}

		if ( $Comment == '' || $Comment == $this->msg( 'commentbox-prefill' )->plain() ) {
			$this->fail( 'commentbox-error-empty-comment', $title );
			return;
		}

		if ( class_exists( 'MediaWiki\Permissions\PermissionManager' ) ) {
			// MW 1.33+
			if ( !MediaWikiServices::getInstance()
				->getPermissionManager()
				->userCan( 'edit', $this->getUser(), $title )
			) {
				$this->displayRestrictionError();
				return;
			}
		} else {
			if ( !$title->userCan( 'edit' ) ) {
				$this->displayRestrictionError();
				return;
			}
		}

		// TODO: Integrate with SpamBlacklist etc.
		// Currently, no http/https-links are allowed at all
		$matches = [];
		if ( preg_match( '@https?://[-.\w]+@', $Comment, $matches ) ||
			preg_match( '@https?://[-.\w]+@', $Author, $matches ) ) {
			$out->setPageTitle( $this->msg( 'spamprotectiontitle' ) );
			$out->setRobotPolicy( 'noindex,nofollow' );
			$out->setArticleRelated( false );

			$out->addWikiMsg( 'spamprotectiontext' );
			$out->addWikiMsg( 'spamprotectionmatch', "<nowiki>{$matches[0]}</nowiki>" );
			$out->returnToMain( false, $title );
			return;
		}

		$user = $this->getUser();
		$page = WikiPage::factory( $title );
		$text = ContentHandler::getContentText( $page->getContent() );
		$subject = '';
		if ( !preg_match( $this->msg( 'commentbox-regex' )->inContentLanguage()->plain(), $text ) ) {
			$subject = $this->msg( 'commentbox-first-comment-heading' )->inContentLanguage()->text() . "\n";
		}
		$sig = $user->isRegistered() ? "-- ~~~~" : "-- $Author ~~~~~";
		// Append <br /> after each newline, except if the user started a new paragraph
		$Comment = preg_replace( '/(?<!\n)\n(?!\n)/', "<br />\n", $Comment );
		$text .= "\n\n" . $subject . $Comment . "\n<br />" . $sig;

		$reqArr = [
			'wpTextbox1' => $text,
			'wpSummary' => $this->msg( 'commentbox-log' )->inContentLanguage()->text(),
			'wpEditToken' => $user->getEditToken(),
			'wpIgnoreBlankSummary' => '',
			'wpStarttime' => wfTimestampNow(),
			'wpEdittime' => $page->getTimestamp(),
			'wpUnicodeCheck' => $this->getRequest()->getText( 'wpUnicodeCheck' ),
		];
		$request = new FauxRequest( $reqArr, true );
		$ep = new EditPage( Article::newFromWikiPage( $page, $this->getContext() ) );
		$ep->setContextTitle( $title );
		$ep->importFormData( $request );
		$details = [];
		$status = $ep->internalAttemptSave( $details );
		$retval = $status->value;

		switch ( $retval ) {
		case EditPage::AS_SUCCESS_UPDATE:
			$out->redirect( $title->getFullURL() );
			break;
		case EditPage::AS_SPAM_ERROR:
			$ep->spamPageWithContent( $details['spam'] );
			break;
		case EditPage::AS_BLOCKED_PAGE_FOR_USER:
			throw new UserBlockedError( $user->getBlock() );
		case EditPage::AS_READ_ONLY_PAGE_ANON:
		case EditPage::AS_READ_ONLY_PAGE_LOGGED:
			throw new PermissionsError( 'edit' );
		case EditPage::AS_READ_ONLY_PAGE:
			throw new ReadOnlyError;
		default:
			$this->fail( $status->getMessage(), $title );
		}
	}

	/**
	 * Add an error message to the output.
	 * @param string $str
	 * @param Title|null $title
	 */
	private function fail( string $str, ?Title $title = null ) {
		$out = $this->getOutput();
		$out->setPageTitle( $this->msg( 'commentbox-errorpage-title' )->text() );
		$out->wrapWikiMsg( "<div class='errorbox'>$1</div><br clear='both' />", $str );
		if ( $title != null ) {
			$out->returnToMain( false, $title );
		}
	}

}
