<?php
/**
 * Formatter for feedback-watch
 */
class EchoArticleFeedbackv5PresentationModel extends EchoEventPresentationModel {
	/** @inheritDoc */
	public function getIconType() {
		return 'feedback-watch';
	}

	/**
	 * @return string Message key that will be used in getHeaderMessage
	 */
	protected function getHeaderMessageKey() {
		// For grep: articlefeedbackv5-notification-feedback-watch-flyout (used here),
		// articlefeedbackv5-notification-feedback-moderated-flyout (used by a subclass)
		return "articlefeedbackv5-notification-{$this->getType()}-flyout";
	}

	/** @inheritDoc */
	public function getHeaderMessage() {
		// XXX FIXME
		// getMessageWithAgent() adds the username as $2 for GENDER
		// the i18n strings don't currently take that into account as doing that
		// would require renumbering all the numeric keys there
		$msg = $this->msg( $this->getHeaderMessageKey() );
		list( $formattedName, /* $genderName */ ) = $this->getAgentForOutput();
		$msg->params( $formattedName );

		// $msg = $this->getMessageWithAgent( $this->getHeaderMessageKey() );
		// PITFALL WARNING!
		// $this->event->getTitle() returns a Title normally...but not when the alert is
		// pertaining to a since-deleted page.
		if ( !$this->event->getTitle() instanceof Title ) {
			// Let's get creative!
			$title = $this->getTitleFromLogId( $this->event->getExtraParam( 'aft-moderation-log-id' ) );
			$this->event->setTitle( $title );
		}

		$msg->params( $this->getTruncatedTitleText( $this->event->getTitle() ) );
		$msg->params( $this->getAFTv5PermalinkTitleFromEvent( $this->event )->getFullText() );
		$msg->params( $this->event->getExtraParam( 'aft-moderation-flag' ) );

		return $msg;
	}

	/** @inheritDoc */
	public function getBodyMessage() {
		// Don't want to show this since it just duplicates the "header"/main message,
		// but unlike in the header/main message, at least in the flyout menu the
		// links aren't parsed at all...
		return false;
		/*
		if ( $this->isBundled() ) {
			$msgKey = 'articlefeedbackv5-notification-feedback-watch-bundle';
		} else {
			$msgKey = 'articlefeedbackv5-notification-feedback-watch';
		}

		// XXX FIXME
		// getMessageWithAgent() adds the username as $2 for GENDER
		// the i18n strings don't currently take that into account as doing that
		// would require renumbering all the numeric keys there
		$msg = $this->msg( $msgKey );
		list( $formattedName, $genderName ) = $this->getAgentForOutput();
		$msg->params( $formattedName );
		// $msg = $this->getMessageWithAgent( $msgKey );
		$msg->params( $this->getTruncatedTitleText( $this->event->getTitle() ) );
		$msg->params( $this->event->getExtraParam( 'aft-page' ) );
		$msg->params( $this->event->getExtraParam( 'aft-moderation-flag' ) );

		if ( $this->isBundled() ) {
			$msg->params( $this->event->getExtraParam( 'aft-other-display' ) );
			$msg->params( $this->event->getExtraParam( 'aft-other-count' ) ); // @todo CHECKME: would(n't) $this->getBundleCount() do? --ashley
			// Or this?
			// $count = $this->getNotificationCountForOutput( true );
		}

		return $msg;
		*/
	}

	/** @inheritDoc */
	public function getPrimaryLink() {
		return [
			'url' => $this->getAFTv5PermalinkTitleFromEvent( $this->event, '#' )->getLocalURL(),
			'label' => $this->msg( 'articlefeedbackv5-notification-link-text-view-feedback' )->escaped()
		];
	}

	/** @inheritDoc */
	public function getSecondaryLinks() {
		$title = $this->getAFTv5PermalinkTitleFromEvent( $this->event );
		return [
			$this->getAgentLink(),
			$this->getAFTv5FeedbackPageLink( $title, '', true, [] )
		];
	}

	/**
	 * Given a log_id, attempts to look it up and construct a page title from log_title.
	 * Used for deleted pages, since AFTv5 stores only page IDs but they change upon page
	 * deletion/undeletion...
	 *
	 * @see https://phabricator.wikimedia.org/T167401
	 * @param int $id log_id, stored as an EchoEvent's aft-moderation-log-id extra param
	 * @return Title
	 */
	protected function getTitleFromLogId( $id ) {
		$dbr = wfGetDB( DB_REPLICA );
		$titleText = $dbr->selectField(
			'logging',
			'log_title',
			[ 'log_id' => $id ],
			__METHOD__
		);
		// @todo FIXME: Duplicates the T167401 solution code in ArticleFeedbackv5Log.php
		// Consolidate both usages into a new, static ArticleFeedbackv5Utils method?
		$a = explode( '/', $titleText );
		array_shift( $a );
		if ( isset( $a[0] ) && $a[0] ) {
			$page = $a[0];
			return Title::newFromText( $page );
		} else {
			return Title::newFromText( uniqid() . uniqid() . '-INVALID-TITLE' );
		}
	}

	/**
	 * EchoEventPresentationModel#getPageLink is marked as final and thus not
	 * overrideable here, hence why we copy it here to have the link labeled as
	 * "Your feedback" (articlefeedbackv5-notification-link-text-view-feedback)
	 * instead of "ArticleFeedback...".
	 *
	 * @param Title $title
	 * @param string $description
	 * @param bool $prioritized
	 * @param array $query
	 * @return array
	 */
	protected function getAFTv5FeedbackPageLink( Title $title, $description, $prioritized, $query = [] ) {
		if ( $title->getNamespace() === NS_USER_TALK ) {
			$icon = 'userSpeechBubble';
		} elseif ( $title->isTalkPage() ) {
			$icon = 'speechBubbles';
		} else {
			$icon = 'article';
		}
		$msg = $this->msg( 'articlefeedbackv5-notification-link-text-view-feedback' )->escaped();
		return [
			'url' => $title->getFullURL( $query ),
			'label' => $msg,
			'tooltip' => $title->getPrefixedText(),
			'description' => $description,
			'icon' => $icon,
			'prioritized' => $prioritized,
		];
	}

	/**
	 * Construct a Title object pointing to a permalink to AFTv5 entry
	 * (Special:ArticleFeedbackv5/<PageTitle><separator><FeedbackId>),
	 * separator being the slash for a certain feedback entry and hash for when
	 * you want to link to the main AFTv5 overview page for a given PageTitle.
	 *
	 * @param EchoEvent $event
	 * @param string $separator Slash (/) or hash (#), the latter being used to link to all feedbacks per page
	 * @return Title
	 */
	protected function getAFTv5PermalinkTitleFromEvent( EchoEvent $event, $separator = '/' ) {
		$feedbackId = $event->getExtraParam( 'aft-id' );
		$feedbackPage = $event->getExtraParam( 'aft-page' );

		$page = Title::newFromID( $feedbackPage );
		if ( $page ) {
			$title = SpecialPage::getTitleFor(
				'ArticleFeedbackv5',
				$page->getPrefixedDBkey() . $separator . $feedbackId
			);
		} else {
			// Well, this *really* shouldn't happen, should it now?
			$title = SpecialPage::getTitleFor( 'ArticleFeedbackv5' );
		}

		return $title;
	}

	/**
	 * @return string Message key that will be used in getSubjectMessage
	 */
	protected function getSubjectMessageKey() {
		// For grep: articlefeedbackv5-notification-feedback-watch-email-subject (used here),
		// articlefeedbackv5-notification-feedback-moderated-email-subject (used by a subclass)
		return "articlefeedbackv5-notification-{$this->getType()}-email-subject";
	}

	/**
	 * Get a message object and add the performer's name as a parameter.
	 * The output of the message should be plaintext.
	 *
	 * This message is used as the subject line in single-notification emails.
	 *
	 * @return Message
	 */
	public function getSubjectMessage() {
		$msgKey = $this->getSubjectMessageKey();
		// XXX FIXME
		// getMessageWithAgent() adds the username as $2 for GENDER
		// the i18n strings don't currently take that into account as doing that
		// would require renumbering all the numeric keys there
		$msg = $this->msg( $msgKey );
		list( $formattedName, /* $genderName */ ) = $this->getAgentForOutput();
		$msg->params( $formattedName );

		// $msg = $this->getMessageWithAgent( $msgKey );

		// $2 = page title
		// $3 = AFTv5 (special page) feedback page
		$feedbackId = $this->event->getExtraParam( 'aft-id' );
		$feedbackPage = $this->event->getExtraParam( 'aft-page' );

		$page = Title::newFromID( $feedbackPage );
		if ( $page ) {
			$title = SpecialPage::getTitleFor( 'ArticleFeedbackv5', $page->getPrefixedDBkey(), $feedbackId );
			$msg->params( $page->getPrefixedDBkey() );
		} else {
			// I guess this is always guaranteed to exist... --ashley
			$title = SpecialPage::getTitleFor( 'ArticleFeedbackv5' );
			$msg->params( '' );
		}
		$msg->params( $title->getPrefixedText() );

		// $4 = aft-moderation-flag
		// For grep, list all the used i18n msg keys:
		// articlefeedbackv5-notification-feedback-moderation-flag-feature
		// articlefeedbackv5-notification-feedback-moderation-flag-resolve
		$flag = $this->event->getExtraParam( 'aft-moderation-flag' );
		$status = $this->msg( 'articlefeedbackv5-notification-feedback-moderation-flag-' . $flag )->text();

		$msg->params( $status );

		return $msg;
	}
}
