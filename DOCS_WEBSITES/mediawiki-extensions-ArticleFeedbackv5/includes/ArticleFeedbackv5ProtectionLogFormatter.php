<?php

use MediaWiki\MediaWikiServices;

/**
 * This class formats AFTv5 protection log entries.
 *
 * @package    ArticleFeedback
 * @author     Matthias Mullie <mmullie@wikimedia.org>
 */
class ArticleFeedbackv5ProtectionLogFormatter extends LogFormatter {
	/**
	 * @return array
	 */
	protected function getMessageParameters() {
		$params = parent::getMessageParameters();

		$articleId = $this->entry->getTarget()->getArticleID();
		$page = WikiPage::newFromID( $articleId );
		if ( $page ) {
			$parameters = $this->entry->getParameters();
			$permission = [ 'articlefeedbackv5' => $parameters['permission'] ];
			$expiry = [ 'articlefeedbackv5' => $parameters['expiry'] ];

			$params[] = $page->protectDescriptionLog( $permission, $expiry );
		}

		return $params;
	}

	/**
	 * Returns extra links that comes after the action text, like "revert", etc.
	 *
	 * @return string
	 */
	public function getActionLinks() {
		$links = [
			MediaWikiServices::getInstance()->getLinkRenderer()->makeLink(
				$this->entry->getTarget(),
				$this->msg( 'hist' )->text(),
				[],
				[
					'action' => 'history',
					'offset' => $this->entry->getTimestamp()
				]
			)
		];

		return $this->msg( 'parentheses' )->rawParams(
			$this->context->getLanguage()->pipeList( $links ) )->escaped();
	}
}
