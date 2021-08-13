<?php
/**
 * Formatter for feedback-moderated
 *
 * This is the per-feedback entry formatter.
 */
class EchoArticleFeedbackv5ModeratedPresentationModel extends EchoArticleFeedbackv5PresentationModel {
	/** @inheritDoc */
	public function getIconType() {
		return 'feedback-moderated';
	}

	/** @inheritDoc */
	public function getBodyMessage() {
		// Don't want to show this since it just duplicates the "header"/main message,
		// but unlike in the header/main message, at least in the flyout menu the
		// links aren't parsed at all...
		return false;

		/*
		if ( $this->isBundled() ) {
			$msgKey = 'articlefeedbackv5-notification-feedback-moderated-bundle';
		} else {
			$msgKey = 'articlefeedbackv5-notification-feedback-moderated';
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
		$msg->params( $this->getAFTv5PermalinkTitleFromEvent( $this->event )->getFullText() );

		if ( $this->isBundled() ) {
			$msg->params( $this->event->getExtraParam( 'agent-other-display' ) );
			$msg->params( $this->event->getExtraParam( 'agent-other-count' ) );
		} else {
			$msg->params( $this->event->getExtraParam( 'aft-moderation-flag' ) );
		}

		return $msg;
		*/
	}

	/**
	 * Overriding this because the other Echo class uses the hash as a separator in
	 * the permalink function and we don't want that here
	 * @return string[]
	 */
	public function getPrimaryLink() {
		return [
			'url' => $this->getAFTv5PermalinkTitleFromEvent( $this->event )->getFullURL(),
			'label' => $this->msg( 'articlefeedbackv5-notification-link-text-view-feedback' )->escaped()
		];
	}
}
