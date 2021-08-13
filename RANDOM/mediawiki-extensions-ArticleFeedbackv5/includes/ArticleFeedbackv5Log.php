<?php

/**
 * This class formats all articlefeedbackv5log entries.
 *
 * @package    ArticleFeedback
 * @author     Matthias Mullie <mmullie@wikimedia.org>
 * @author     Reha Sterbin <reha@omniti.com>
 */
class ArticleFeedbackv5Log {
	/**
	 * Adds an activity item to the global log under the articlefeedbackv5
	 *
	 * @param string $type The type of activity we'll be logging
	 * @param int $pageId The id of the page so we can look it up
	 * @param int $itemId The id of the feedback item, used to build permalinks
	 * @param string $notes Any notes that were stored with the activity
	 * @param User|int|null $doer User who did the action
	 * @param array $params Array of parameters that can be passed into the msg thing - used for "perpetrator" for log entry
	 * @return int The id of the newly inserted log entry
	 */
	public static function log( $type, $pageId, $itemId, $notes, $doer, array $params = [] ) {
		global $wgLogActionsHandlers, $wgArticleFeedbackv5MaxActivityNoteLength;

		if ( isset( ArticleFeedbackv5Activity::$actions[$type]['log_type'] ) ) {
			// log type for actions (the more delicate actions should go to suppression log)
			$logType = ArticleFeedbackv5Activity::$actions[$type]['log_type'];
		} elseif ( isset( $wgLogActionsHandlers["articlefeedbackv5/$type"] ) ) {
			// other AFTv5-related log entry (e.g. "create")
			$logType = 'articlefeedbackv5';
		} else {
			return null;
		}

		// fetch title of the page the feedback was given for: Special:ArticleFeedbackv5/<pagename>/<feedbackid>
		$pageTitle = Title::newFromID( $pageId );
		if ( !$pageTitle ) {
			return null;
		}
		$target = SpecialPage::getTitleFor( 'ArticleFeedbackv5', $pageTitle->getPrefixedDBkey() . "/$itemId" );

		// if no doer specified, use default AFT user
		if ( !( $doer instanceof User ) ) {
			$defaultUser = wfMessage( 'articlefeedbackv5-default-user' )->text();
			$doer = User::newFromName( $defaultUser );
			if ( !$doer ) {
				throw new MWException( "Default user '$defaultUser' does not exist." );
			}
		}

		// truncate comment
		$note = RequestContext::getMain()->getLanguage()->truncateForDatabase(
			$notes,
			$wgArticleFeedbackv5MaxActivityNoteLength
		);

		// add page id & feedback id to params
		$params['feedbackId'] = (string)$itemId;
		$params['pageId'] = (int)$pageId;

		// insert logging entry
		$logEntry = new ManualLogEntry( $logType, $type );
		$logEntry->setTarget( $target );
		$logEntry->setPerformer( $doer );
		$logEntry->setParameters( $params );
		$logEntry->setComment( $note );
		$logId = $logEntry->insert();
		$logEntry->publish( $logId );

		/**
		 * ManualLogEntry will have written to database. To make sure that subsequent
		 * reads are up-to-date, I'll set a flag to know that we've written data, so
		 * DB_PRIMARY will be queried.
		 */
		$wiki = false;
		ArticleFeedbackv5Utils::$written[$wiki] = true;

		return $logId;
	}
}
