<?php

use MediaWiki\MediaWikiServices;

/**
 * This class formats all articlefeedbackv5log entries.
 *
 * @package    ArticleFeedback
 * @author     Matthias Mullie <mmullie@wikimedia.org>
 * @author     Reha Sterbin <reha@omniti.com>
 */
class ArticleFeedbackv5LogFormatter extends LogFormatter {
	/**
	 * Formats an activity log entry
	 *
	 * @return string The log entry
	 */
	protected function getActionMessage() {
		$action          = $this->entry->getSubtype();
		$target          = $this->entry->getTarget();
		$skin            = $this->plaintext ? null : $this->context->getSkin();
		$parameters      = $this->entry->getParameters();

		// this should not happen, but might occur for legacy entries
		if ( !isset( $parameters['feedbackId'] ) || !isset( $parameters['pageId'] ) ) {
			return '';
		}

		// this could happen when a page has since been removed
		$page = Title::newFromID( $parameters['pageId'] );
		if ( !$page ) {
			// Ideally we would build the page title from logging.log_title instead, as
			// it's a place which stores the human-readable page name, although for AFTv5
			// entries it is always in the form "ArticleFeedbackv5/<wiki page name>/<feedback ID>"
			// so we wouldn't be able use it simply as-is even if we had access to it.
			// The DB row for this log entry exists as $this->entry->row, but that
			// property is protected in core and there is no getRow() accessor or
			// anything, so we have to use getTarget(), which (hopefully) returns a
			// Title formed from the row's log_namespace and log_title.
			// Then we work our magic on this Title, first getting the
			// "ArticleFeedbackv5/<wiki page name>" part of "ArticleFeedbackv5/<wiki page name>/<feedback ID>"
			// and then extracting the deleted page's name from this.
			// @see https://phabricator.wikimedia.org/T167401
			$pageTitle = $this->entry->getTarget();
			if ( !$pageTitle instanceof Title ) {
				return '';
			}
			$pageTitle = $pageTitle->getText();
			$a = explode( '/', $pageTitle );
			array_shift( $a );
			if ( isset( $a[0] ) && $a[0] ) {
				$page = $a[0];
			} else {
				return '';
			}
		}

		// Give grep a chance to find the usages:
		// logentry-articlefeedbackv5-create, logentry-articlefeedbackv5-oversight, logentry-articlefeedbackv5-unoversight,
		// logentry-articlefeedbackv5-decline, logentry-articlefeedbackv5-request, logentry-articlefeedbackv5-unrequest,
		// logentry-articlefeedbackv5-flag, logentry-articlefeedbackv5-unflag, logentry-articlefeedbackv5-autoflag,
		// logentry-articlefeedbackv5-feature, logentry-articlefeedbackv5-unfeature, logentry-articlefeedbackv5-resolve,
		// logentry-articlefeedbackv5-unresolve, logentry-articlefeedbackv5-noaction, logentry-articlefeedbackv5-unnoaction,
		// logentry-articlefeedbackv5-inappropriate, logentry-articlefeedbackv5-uninappropriate, logentry-articlefeedbackv5-archive,
		// logentry-articlefeedbackv5-unarchive, logentry-articlefeedbackv5-hide, logentry-articlefeedbackv5-unhide,
		// logentry-articlefeedbackv5-autohide, logentry-articlefeedbackv5-helpful, logentry-articlefeedbackv5-unhelpful,
		// logentry-articlefeedbackv5-undo-helpful, logentry-articlefeedbackv5-undo-unhelpful, logentry-articlefeedbackv5-clear-flags
		$language = $skin === null ? MediaWikiServices::getInstance()->getContentLanguage() : $this->context->getLanguage();
		return wfMessage( "logentry-articlefeedbackv5-$action" )
			->params( [
				Message::rawParam( $this->getPerformerElement() ),
				$this->entry->getPerformerIdentity()->getId(),
				$target,
				ArticleFeedbackv5Utils::formatId( $parameters['feedbackId'] ),
				$page
			] )
			->inLanguage( $language )
			->parse();
	}

	/**
	 * The native LogFormatter::getActionText provides no clean way of
	 * handling the AFT action text in a plain text format (e.g. as
	 * used by CheckUser)
	 *
	 * @return string
	 */
	public function getActionText() {
		$text = $this->getActionMessage();
		return $this->plaintext ? strip_tags( $text ) : $text;
	}
}
