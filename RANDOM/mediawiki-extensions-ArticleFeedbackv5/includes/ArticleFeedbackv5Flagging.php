<?php
/**
 * ArticleFeedbackv5Flagging class
 *
 * @package    ArticleFeedback
 * @author     Elizabeth M Smith <elizabeth@omniti.com>
 * @author     Reha Sterbin <reha@omniti.com>
 * @author     Matthias Mullie <mmullie@wikimedia.org>
 */

/**
 * Handles flagging of feedback
 *
 * Some weird stuff goed on here with flags. E.g.
 * * request feedback: request 0 -> 1; decline 0
 * * request declined: request 1; decline 0 -> 1
 * * requested again: request 1; decline 1 -> 0
 * * unrequested: request 1 -> 0; decline 0
 *
 * If you're expecting the data in the database to contain totals
 * for all actions executed, you're out of luck; their nothing
 * more than vague indicators that you can extract the current state
 * from, no flagging history of flagging totals. That information
 * should be sought in logging table (but there currently is no
 * functionality that requires this)
 *
 * @package    ArticleFeedback
 */
class ArticleFeedbackv5Flagging {
	/**
	 * The user performing the action
	 *
	 * Either zero for a system call, or the current user for a user-directed one
	 * FIXME The system call case is not correctly handled everywhere (e.g. in case of AbuseFilter
	 * actions)
	 *
	 * @var User|int
	 */
	private $user;

	/**
	 * The feedback object
	 *
	 * @var ArticleFeedbackv5Model
	 */
	private $feedback;

	/**
	 * The origin of the flag
	 *
	 * @var string
	 */
	private $source = 'unknown';

	/**
	 * Last error message, after error has occurred
	 *
	 * @var string
	 */
	private $error = '';

	/**
	 * The id of the inserted log entry
	 *
	 * @var int
	 */
	private $logId;

	/**
	 * Constructor
	 *
	 * @param User|null $user the user performing the action, or
	 *                          zero if it's a system call
	 * @param int $feedbackId the feedback ID
	 * @param int $pageId the page ID
	 */
	public function __construct( ?User $user, $feedbackId, $pageId ) {
		$this->user = $user ?: 0;
		$this->feedback = ArticleFeedbackv5Model::get( $feedbackId, $pageId );
	}

	/**
	 * Run a flagging action
	 *
	 * @param string $flag the flag
	 * @param string $notes any notes to send to the activity log
	 * @param bool $toggle whether to toggle the flag
	 * @param string $source the origin of the flag (article, central, watchlist, permalink)
	 * @return bool true upon successful flagging, false on failure. In the event of a failure,
	 *                    the error can be fetched through ->getError())
	 */
	public function run( $flag, $notes = '', $toggle = false, $source = 'unknown' ) {
		// check if feedback record exists
		if ( !$this->feedback ) {
			$this->error = 'articlefeedbackv5-invalid-feedback-id';
			return false;
		}

		// check permissions
		if (
			// system calls (e.g. autoabuse by AbuseFilter) are always permitted
			!$this->isSystemCall() &&
			// check permissions map
			!ArticleFeedbackv5Activity::canPerformAction( $flag, $this->user ) &&
			// users are always allowed to flag their own feedback
			!( $this->user->getId() && $this->user->getId() == intval( $this->feedback->aft_user ) )
		) {
			$this->error = 'articlefeedbackv5-invalid-feedback-flag';
			return false;
		}

		// determine the appropriate method for this action
		$method = str_replace( '-', '_', $flag );
		if ( !method_exists( $this, $method ) ) {
			$this->error = 'articlefeedbackv5-invalid-feedback-flag';
			return false;
		}

		// save origin
		$this->source = $source;

		/*
		 * The method corresponding to the requested "flag" will be called;
		 * these methods then each will perform the particular changes that
		 * an individual flag entails.
		 * The method is - at least - supposed to make the required adjustments
		 * to $this->feedback and add the id of the log entry for the requested
		 * flag to $this->logId.
		 * Some additional stuff may be done as well (e.g. certain flags result
		 * in follow-up automated flags), but these should be done "under the
		 * radar"; no logId is required for these automated actions.
		 */
		$result = $this->{$method}( $notes, $toggle ? true : false );
		if ( !$result ) {
			return false;
		}

		if ( !is_int( $this->logId ) ) {
			$this->error = 'articlefeedbackv5-invalid-log-id';
			return false;
		}

		// update feedback entry for real
		$this->feedback->update( false );

		return true;
	}

	/**
	 * Log the performed action
	 *
	 * @param string $action
	 * @param int $pageId
	 * @param mixed $feedbackId
	 * @param string $comment
	 * @param User|int|null $user
	 * @return int
	 */
	protected function log( $action, $pageId, $feedbackId, $comment, $user = null ) {
		$params = [];
		if ( $this->source ) {
			$params['source'] = $this->source;
		}

		return ArticleFeedbackv5Activity::log( $action, $pageId, $feedbackId, $comment, $user, $params );
	}

	/**
	 * Flag: request oversight
	 *
	 * This flag allows monitors (who can hide feedback but not delete it) to
	 * submit a post for deletion.
	 *
	 * @param string $notes any notes passed in
	 * @param bool $toggle whether to toggle the flag
	 * @return array|bool
	 */
	public function request( $notes, $toggle ) {
		// already requested?
		if ( $this->feedback->isRequested() ) {
			$this->error = 'articlefeedbackv5-invalid-feedback-state';
			return false;
		}

		$this->feedback->aft_request = 1;
		$this->feedback->aft_decline = 0;
		$this->logId = $this->log( __FUNCTION__, $this->feedback->aft_page, $this->feedback->aft_id, $notes, $this->user );

		// autohide if not yet hidden
		if ( !$this->feedback->isHidden() ) {
			/*
			 * We want to keep track of hides/unhides, but also autohides.
			 * Feedback will be hidden when hide + autohide > unhide
			 */
			$this->feedback->aft_hide = 1;
			$this->feedback->aft_autohide = 1;
			$this->log( 'autohide', $this->feedback->aft_page, $this->feedback->aft_id, 'Automatic hide', $this->user );
		}

		// send an email to oversighter(s)
		$this->sendOversightEmail( $notes );

		return true;
	}

	/**
	 * Flag: un-request oversight
	 *
	 * @param string $notes any notes passed in
	 * @param bool $toggle whether to toggle the flag
	 * @return array|bool
	 */
	public function unrequest( $notes, $toggle ) {
		// not yet requested?
		if ( !$this->feedback->isRequested() ) {
			$this->error = 'articlefeedbackv5-invalid-feedback-state';
			return false;
		}

		$this->feedback->aft_request = 0;
		$this->logId = $this->log( __FUNCTION__, $this->feedback->aft_page, $this->feedback->aft_id, $notes, $this->user );

		// un-hide if autohidden
		if ( $this->feedback->aft_hide && $this->feedback->aft_autohide ) {
			$this->feedback->aft_hide = 0;
			$this->feedback->aft_autohide = 0;
			$this->log( 'unhide', $this->feedback->aft_page, $this->feedback->aft_id, 'Automatic un-hide', $this->user );
		}

		return true;
	}

	/**
	 * Flag: decline oversight
	 *
	 * This flag allows oversighters to decline a request for oversight.  It
	 * unsets all request/unrequest on a piece of feedback.
	 *
	 * @param string $notes any notes passed in
	 * @param bool $toggle whether to toggle the flag
	 * @return array|bool
	 */
	public function decline( $notes, $toggle ) {
		// not requested?
		if ( !$this->feedback->isRequested() ) {
			$this->error = 'articlefeedbackv5-invalid-feedback-state';
			return false;
		}

		$this->feedback->aft_decline = 1;
		$this->logId = $this->log( __FUNCTION__, $this->feedback->aft_page, $this->feedback->aft_id, $notes, $this->user );

		return true;
	}

	/**
	 * Flag: feature feedback
	 *
	 * This flag allows monitors to highlight a particularly useful or
	 * interesting post.
	 *
	 * @param string $notes any notes passed in
	 * @param bool $toggle whether to toggle the flag
	 * @return array|bool
	 */
	public function feature( $notes, $toggle ) {
		if (
			$this->feedback->isFeatured() ||
			$this->feedback->isResolved() ||
			$this->feedback->isNonActionable() ||
			$this->feedback->isInappropriate() ||
			$this->feedback->isArchived() ||
			$this->feedback->isHidden() ||
			$this->feedback->isOversighted()
		) {
			$this->error = 'articlefeedbackv5-invalid-feedback-state';
			return false;
		}

		$this->feedback->aft_feature = 1;
		$this->feedback->aft_resolve = 0;
		$this->feedback->aft_noaction = 0;
		$this->feedback->aft_inappropriate = 0;
		$this->feedback->aft_archive = 0;
		$this->feedback->aft_hide = 0;
		$this->feedback->aft_oversight = 0;

		$this->logId = $this->log( __FUNCTION__, $this->feedback->aft_page, $this->feedback->aft_id, $notes, $this->user );

		// clear all abuse flags
		if ( $this->feedback->aft_flag && $this->feedback->aft_autoflag ) {
			$this->clear_flags( $notes, $toggle );
		}

		// send notifications
		ArticleFeedbackv5Utils::notifyWatch( $this->feedback, $this->user, __FUNCTION__, $this->logId );
		ArticleFeedbackv5Utils::notifyModerated( $this->feedback, $this->user, __FUNCTION__, $this->logId );

		return true;
	}

	/**
	 * Flag: un-feature
	 *
	 * @param string $notes any notes passed in
	 * @param bool $toggle whether to toggle the flag
	 * @return array|bool
	 */
	public function unfeature( $notes, $toggle ) {
		if (
			!$this->feedback->isFeatured() ||
			$this->feedback->isResolved() ||
			$this->feedback->isNonActionable() ||
			$this->feedback->isInappropriate() ||
			$this->feedback->isHidden() ||
			$this->feedback->isArchived() ||
			$this->feedback->isOversighted()
		) {
			$this->error = 'articlefeedbackv5-invalid-feedback-state';
			return false;
		}

		$this->feedback->aft_feature = 0;
		$this->feedback->aft_resolve = 0;
		$this->feedback->aft_noaction = 0;
		$this->feedback->aft_inappropriate = 0;
		$this->feedback->aft_archive = 0;
		$this->feedback->aft_hide = 0;
		$this->feedback->aft_oversight = 0;

		$this->logId = $this->log( __FUNCTION__, $this->feedback->aft_page, $this->feedback->aft_id, $notes, $this->user );

		return true;
	}

	/**
	 * Flag: mark feedback resolved
	 *
	 * This flag allows monitors to mark a post as resolved, when the
	 * suggestion has been implemented.
	 *
	 * @param string $notes any notes passed in
	 * @param bool $toggle whether to toggle the flag
	 * @return array|bool
	 */
	public function resolve( $notes, $toggle ) {
		if (
			// $this->feedback->isFeatured() || // can go straight from featured to resolved
			$this->feedback->isResolved() ||
			$this->feedback->isNonActionable() ||
			$this->feedback->isInappropriate() ||
			$this->feedback->isArchived() ||
			$this->feedback->isHidden() ||
			$this->feedback->isOversighted()
		) {
			$this->error = 'articlefeedbackv5-invalid-feedback-state';
			return false;
		}

		$this->feedback->aft_feature = 0;
		$this->feedback->aft_resolve = 1;
		$this->feedback->aft_noaction = 0;
		$this->feedback->aft_inappropriate = 0;
		$this->feedback->aft_archive = 0;
		$this->feedback->aft_hide = 0;
		$this->feedback->aft_oversight = 0;

		$this->logId = $this->log( __FUNCTION__, $this->feedback->aft_page, $this->feedback->aft_id, $notes, $this->user );

		// send notifications
		ArticleFeedbackv5Utils::notifyModerated( $this->feedback, $this->user, __FUNCTION__, $this->logId );

		return true;
	}

	/**
	 * Flag: un-mark a post as resolved
	 *
	 * @param string $notes any notes passed in
	 * @param bool $toggle whether to toggle the flag
	 * @return array|bool
	 */
	public function unresolve( $notes, $toggle ) {
		if (
			$this->feedback->isFeatured() ||
			!$this->feedback->isResolved() ||
			$this->feedback->isNonActionable() ||
			$this->feedback->isInappropriate() ||
			$this->feedback->isArchived() ||
			$this->feedback->isHidden() ||
			$this->feedback->isOversighted()
		) {
			$this->error = 'articlefeedbackv5-invalid-feedback-state';
			return false;
		}

		$this->feedback->aft_feature = 0;
		$this->feedback->aft_resolve = 0;
		$this->feedback->aft_noaction = 0;
		$this->feedback->aft_inappropriate = 0;
		$this->feedback->aft_archive = 0;
		$this->feedback->aft_hide = 0;
		$this->feedback->aft_oversight = 0;

		$this->logId = $this->log( __FUNCTION__, $this->feedback->aft_page, $this->feedback->aft_id, $notes, $this->user );

		return true;
	}

	/**
	 * Flag: mark feedback as not actionable
	 *
	 * This flag allows monitors to mark a post as not actionable.
	 *
	 * @param string $notes any notes passed in
	 * @param bool $toggle whether to toggle the flag
	 * @return array|bool
	 */
	public function noaction( $notes, $toggle ) {
		if (
			$this->feedback->isFeatured() ||
			$this->feedback->isResolved() ||
			$this->feedback->isNonActionable() ||
			$this->feedback->isInappropriate() ||
			$this->feedback->isArchived() ||
			$this->feedback->isHidden() ||
			$this->feedback->isOversighted()
		) {
			$this->error = 'articlefeedbackv5-invalid-feedback-state';
			return false;
		}

		$this->feedback->aft_feature = 0;
		$this->feedback->aft_resolve = 0;
		$this->feedback->aft_noaction = 1;
		$this->feedback->aft_inappropriate = 0;
		$this->feedback->aft_archive = 0;
		$this->feedback->aft_hide = 0;
		$this->feedback->aft_oversight = 0;

		$this->logId = $this->log( __FUNCTION__, $this->feedback->aft_page, $this->feedback->aft_id, $notes, $this->user );

		return true;
	}

	/**
	 * Flag: un-mark a post as not actionable
	 *
	 * @param string $notes any notes passed in
	 * @param bool $toggle whether to toggle the flag
	 * @return array|bool
	 */
	public function unnoaction( $notes, $toggle ) {
		if (
			$this->feedback->isFeatured() ||
			$this->feedback->isResolved() ||
			!$this->feedback->isNonActionable() ||
			$this->feedback->isInappropriate() ||
			$this->feedback->isArchived() ||
			$this->feedback->isHidden() ||
			$this->feedback->isOversighted()
		) {
			$this->error = 'articlefeedbackv5-invalid-feedback-state';
			return false;
		}

		$this->feedback->aft_feature = 0;
		$this->feedback->aft_resolve = 0;
		$this->feedback->aft_noaction = 0;
		$this->feedback->aft_inappropriate = 0;
		$this->feedback->aft_archive = 0;
		$this->feedback->aft_hide = 0;
		$this->feedback->aft_oversight = 0;

		$this->logId = $this->log( __FUNCTION__, $this->feedback->aft_page, $this->feedback->aft_id, $notes, $this->user );

		return true;
	}

	/**
	 * Flag: mark a post as inappropriate
	 *
	 * @param string $notes any notes passed in
	 * @param bool $toggle whether to toggle the flag
	 * @return array|bool
	 */
	public function inappropriate( $notes, $toggle ) {
		if (
			$this->feedback->isFeatured() ||
			$this->feedback->isResolved() ||
			$this->feedback->isNonActionable() ||
			$this->feedback->isInappropriate() ||
			$this->feedback->isArchived() ||
			$this->feedback->isHidden() ||
			$this->feedback->isOversighted()
		) {
			$this->error = 'articlefeedbackv5-invalid-feedback-state';
			return false;
		}

		$this->feedback->aft_feature = 0;
		$this->feedback->aft_resolve = 0;
		$this->feedback->aft_noaction = 0;
		$this->feedback->aft_inappropriate = 1;
		$this->feedback->aft_archive = 0;
		$this->feedback->aft_hide = 0;
		$this->feedback->aft_oversight = 0;

		$this->logId = $this->log( __FUNCTION__, $this->feedback->aft_page, $this->feedback->aft_id, $notes, $this->user );

		return true;
	}

	/**
	 * Flag: unmark a post as inappropriate
	 *
	 * @param string $notes any notes passed in
	 * @param bool $toggle whether to toggle the flag
	 * @return array|bool
	 */
	public function uninappropriate( $notes, $toggle ) {
		if (
			$this->feedback->isFeatured() ||
			$this->feedback->isResolved() ||
			$this->feedback->isNonActionable() ||
			!$this->feedback->isInappropriate() ||
			$this->feedback->isArchived() ||
			$this->feedback->isHidden() ||
			$this->feedback->isOversighted()
		) {
			$this->error = 'articlefeedbackv5-invalid-feedback-state';
			return false;
		}

		$this->feedback->aft_feature = 0;
		$this->feedback->aft_resolve = 0;
		$this->feedback->aft_noaction = 0;
		$this->feedback->aft_inappropriate = 0;
		$this->feedback->aft_archive = 0;
		$this->feedback->aft_hide = 0;
		$this->feedback->aft_oversight = 0;

		$this->logId = $this->log( __FUNCTION__, $this->feedback->aft_page, $this->feedback->aft_id, $notes, $this->user );

		return true;
	}

	/**
	 * Flag: hide
	 *
	 * @param string $notes any notes passed in
	 * @param bool $toggle whether to toggle the flag
	 * @return array|bool
	 */
	public function hide( $notes, $toggle ) {
		if (
			$this->feedback->isFeatured() ||
			$this->feedback->isResolved() ||
			$this->feedback->isNonActionable() ||
			!$this->feedback->isInappropriate() || // hiding is secondary action; post should already be marked inappropriate
			$this->feedback->isArchived() ||
			$this->feedback->isHidden() ||
			$this->feedback->isOversighted()
		) {
			$this->error = 'articlefeedbackv5-invalid-feedback-state';
			return false;
		}

		$this->feedback->aft_feature = 0;
		$this->feedback->aft_resolve = 0;
		$this->feedback->aft_noaction = 0;
		$this->feedback->aft_inappropriate = 0;
		$this->feedback->aft_archive = 0;
		$this->feedback->aft_hide = 1;
		$this->feedback->aft_oversight = 0;

		$this->logId = $this->log( __FUNCTION__, $this->feedback->aft_page, $this->feedback->aft_id, $notes, $this->user );

		return true;
	}

	/**
	 * Flag: un-hide
	 *
	 * @param string $notes any notes passed in
	 * @param bool $toggle whether to toggle the flag
	 * @return array|bool
	 */
	public function unhide( $notes, $toggle ) {
		if (
			$this->feedback->isFeatured() ||
			$this->feedback->isResolved() ||
			$this->feedback->isNonActionable() ||
			$this->feedback->isInappropriate() ||
			$this->feedback->isArchived() ||
			!$this->feedback->isHidden() ||
			$this->feedback->isOversighted()
		) {
			$this->error = 'articlefeedbackv5-invalid-feedback-state';
			return false;
		}

		$this->feedback->aft_feature = 0;
		$this->feedback->aft_resolve = 0;
		$this->feedback->aft_noaction = 0;
		$this->feedback->aft_inappropriate = 0;
		$this->feedback->aft_archive = 0;
		$this->feedback->aft_hide = 0;
		$this->feedback->aft_oversight = 0;

		$this->feedback->aft_autohide = 0;

		$this->logId = $this->log( __FUNCTION__, $this->feedback->aft_page, $this->feedback->aft_id, $notes, $this->user );

		// clear all abuse flags
		if ( $this->feedback->aft_flag && $this->feedback->aft_autoflag ) {
			$this->clear_flags( $notes, $toggle );
		}

		return true;
	}

	/**
	 * Flag: mark feedback as archived
	 *
	 * @param string $notes any notes passed in
	 * @param bool $toggle whether to toggle the flag
	 * @return array|bool
	 */
	public function archive( $notes, $toggle ) {
		if (
			$this->feedback->isFeatured() ||
			$this->feedback->isResolved() ||
			$this->feedback->isNonActionable() ||
			$this->feedback->isInappropriate() ||
			$this->feedback->isArchived() ||
			$this->feedback->isHidden() ||
			$this->feedback->isOversighted()
		) {
			$this->error = 'articlefeedbackv5-invalid-feedback-state';
			return false;
		}

		$this->feedback->aft_feature = 0;
		$this->feedback->aft_resolve = 0;
		$this->feedback->aft_noaction = 0;
		$this->feedback->aft_inappropriate = 0;
		$this->feedback->aft_archive = 1;
		$this->feedback->aft_hide = 0;
		$this->feedback->aft_oversight = 0;

		$this->logId = $this->log( __FUNCTION__, $this->feedback->aft_page, $this->feedback->aft_id, $notes, $this->user );

		return true;
	}

	/**
	 * Flag: un-mark a post as archived
	 *
	 * @param string $notes any notes passed in
	 * @param bool $toggle whether to toggle the flag
	 * @return array|bool
	 */
	public function unarchive( $notes, $toggle ) {
		if (
			$this->feedback->isFeatured() ||
			$this->feedback->isResolved() ||
			$this->feedback->isNonActionable() ||
			$this->feedback->isInappropriate() ||
			!$this->feedback->isArchived() ||
			$this->feedback->isHidden() ||
			$this->feedback->isOversighted()
		) {
			$this->error = 'articlefeedbackv5-invalid-feedback-state';
			return false;
		}

		$this->feedback->aft_feature = 0;
		$this->feedback->aft_resolve = 0;
		$this->feedback->aft_noaction = 0;
		$this->feedback->aft_inappropriate = 0;
		$this->feedback->aft_archive = 0;
		$this->feedback->aft_hide = 0;
		$this->feedback->aft_oversight = 0;

		$this->logId = $this->log( __FUNCTION__, $this->feedback->aft_page, $this->feedback->aft_id, $notes, $this->user );

		return true;
	}

	/**
	 * Flag: oversight
	 *
	 * @param string $notes any notes passed in
	 * @param bool $toggle whether to toggle the flag
	 * @return array|bool
	 */
	public function oversight( $notes, $toggle ) {
		if (
			$this->feedback->isFeatured() ||
			$this->feedback->isResolved() ||
			$this->feedback->isNonActionable() ||
			$this->feedback->isArchived() ||
			!(
				$this->feedback->isInappropriate() || // oversight is secondary action; post should already be marked inappropriate
				$this->feedback->isHidden() // ... or marked as hidden by monitor
			) ||
			$this->feedback->isOversighted()
		) {
			$this->error = 'articlefeedbackv5-invalid-feedback-state';
			return false;
		}

		$this->feedback->aft_feature = 0;
		$this->feedback->aft_resolve = 0;
		$this->feedback->aft_noaction = 0;
		$this->feedback->aft_inappropriate = 0;
		$this->feedback->aft_archive = 0;
		$this->feedback->aft_hide = 0;
		$this->feedback->aft_oversight = 1;

		$this->logId = $this->log( __FUNCTION__, $this->feedback->aft_page, $this->feedback->aft_id, $notes, $this->user );

		return true;
	}

	/**
	 * Flag: unoversight
	 *
	 * @param string $notes any notes passed in
	 * @param bool $toggle whether to toggle the flag
	 * @return array|bool
	 */
	public function unoversight( $notes, $toggle ) {
		if (
			$this->feedback->isFeatured() ||
			$this->feedback->isResolved() ||
			$this->feedback->isNonActionable() ||
			$this->feedback->isInappropriate() ||
			$this->feedback->isArchived() ||
			$this->feedback->isHidden() ||
			!$this->feedback->isOversighted()
		) {
			$this->error = 'articlefeedbackv5-invalid-feedback-state';
			return false;
		}

		$this->feedback->aft_feature = 0;
		$this->feedback->aft_resolve = 0;
		$this->feedback->aft_noaction = 0;
		$this->feedback->aft_inappropriate = 0;
		$this->feedback->aft_archive = 0;
		$this->feedback->aft_hide = 0;
		$this->feedback->aft_oversight = 0;

		$this->feedback->aft_request = 0;

		$this->logId = $this->log( __FUNCTION__, $this->feedback->aft_page, $this->feedback->aft_id, $notes, $this->user );

		return true;
	}

	/**
	 * Flag: mark as helpful
	 *
	 * This flag allows readers to vote a piece of feedback up.
	 *
	 * @param string $notes any notes passed in
	 * @param bool $toggle whether to toggle the flag
	 * @return array|bool
	 */
	public function helpful( $notes, $toggle ) {
		$this->feedback->aft_helpful++;
		$this->logId = $this->log( __FUNCTION__, $this->feedback->aft_page, $this->feedback->aft_id, $notes, $this->user );

		// was voted unhelpful already, now voting helpful should also remove unhelpful vote
		if ( $toggle && $this->feedback->aft_unhelpful > 0 ) {
			$this->feedback->aft_unhelpful--;
		}

		return true;
	}

	/**
	 * Flag: un-mark as helpful
	 *
	 * This flag allows readers to un-vote a piece of feedback up.
	 *
	 * @param string $notes any notes passed in
	 * @param bool $toggle whether to toggle the flag
	 * @return array|bool
	 */
	public function undo_helpful( $notes, $toggle ) {
		if ( $this->feedback->aft_helpful < 1 ) {
			$this->error = 'articlefeedbackv5-invalid-feedback-state';
			return false;
		}

		$this->feedback->aft_helpful--;
		$this->logId = $this->log( 'undo-helpful', $this->feedback->aft_page, $this->feedback->aft_id, $notes, $this->user );

		return true;
	}

	/**
	 * Flag: mark as unhelpful
	 *
	 * This flag allows readers to vote a piece of feedback down.
	 *
	 * @param string $notes any notes passed in
	 * @param bool $toggle whether to toggle the flag
	 * @return array|bool
	 */
	public function unhelpful( $notes, $toggle ) {
		$this->feedback->aft_unhelpful++;
		$this->logId = $this->log( __FUNCTION__, $this->feedback->aft_page, $this->feedback->aft_id, $notes, $this->user );

		// was voted helpful already, now voting unhelpful should also remove helpful vote
		if ( $toggle && $this->feedback->aft_helpful > 0 ) {
			$this->feedback->aft_helpful--;
		}

		return true;
	}

	/**
	 * Flag: un-mark as unhelpful
	 *
	 * This flag allows readers to un-vote a piece of feedback down.
	 *
	 * @param string $notes any notes passed in
	 * @param bool $toggle whether to toggle the flag
	 * @return array|bool
	 */
	public function undo_unhelpful( $notes, $toggle ) {
		if ( $this->feedback->aft_unhelpful < 1 ) {
			$this->error = 'articlefeedbackv5-invalid-feedback-state';
			return false;
		}

		$this->feedback->aft_unhelpful--;
		$this->logId = $this->log( 'undo-unhelpful', $this->feedback->aft_page, $this->feedback->aft_id, $notes, $this->user );

		return true;
	}

	/**
	 * Flag: flag as abuse
	 *
	 * This flag allows readers to flag a piece of feedback as abusive.
	 *
	 * @param string $notes any notes passed in
	 * @param bool $toggle whether to toggle the flag
	 * @return array|bool
	 */
	public function flag( $notes, $toggle ) {
		$flag = $this->isSystemCall() ? 'autoflag' : 'flag';
		$this->feedback->{"aft_$flag"}++;
		$this->logId = $this->log( $flag, $this->feedback->aft_page, $this->feedback->aft_id, $notes, $this->isSystemCall() ? null : $this->user );

		global $wgArticleFeedbackv5HideAbuseThreshold;

		// auto-hide after [threshold] flags
		if ( $this->feedback->aft_flag + $this->feedback->aft_autoflag > $wgArticleFeedbackv5HideAbuseThreshold &&
			!$this->feedback->isHidden() ) {
			/*
			 * We want to keep track of hides/unhides, but also autohides.
			 * Feedback will be hidden when hide + autohide > unhide
			 */
			$this->feedback->aft_hide = 1;
			$this->feedback->aft_autohide = 1;
			$this->log( 'autohide', $this->feedback->aft_page, $this->feedback->aft_id, 'Automatic hide', $this->user );
		}

		return true;
	}

	/**
	 * Flag: flag as abuse
	 *
	 * This flag allows readers to remove an abuse flag on a piece of feedback.
	 *
	 * @param string $notes any notes passed in
	 * @param bool $toggle whether to toggle the flag
	 * @return array|bool
	 */
	public function unflag( $notes, $toggle ) {
		if ( $this->feedback->aft_flag <= 0 ) {
			$this->feedback->aft_autoflag = 0;
		} else {
			$this->feedback->aft_flag--;
		}
		$this->logId = $this->log( __FUNCTION__, $this->feedback->aft_page, $this->feedback->aft_id, $notes, $this->user );

		global $wgArticleFeedbackv5HideAbuseThreshold;

		// un-hide if autohidden & we don't have [threshold] flags anymore
		if ( $this->feedback->aft_flag + $this->feedback->aft_autoflag < $wgArticleFeedbackv5HideAbuseThreshold &&
			$this->feedback->aft_autohide ) {
			$this->feedback->aft_autohide = 0;
			$this->log( 'unhide', $this->feedback->aft_page, $this->feedback->aft_id, 'Automatic un-hide', $this->user );
		}

		return true;
	}

	/**
	 * Flag: clear all abuse flags
	 *
	 * @param string $notes any notes passed in
	 * @param bool $toggle whether to toggle the flag
	 * @return array|bool
	 */
	protected function clear_flags( $notes, $toggle ) {
		$this->feedback->aft_autoflag = 0;
		$this->feedback->aft_flag = 0;

		/*
		 * Note: this one does not save logId because (currently) it will never
		 * be called directly, but only as an automated result after certain flags.
		 */
		$this->log( 'clear-flags', $this->feedback->aft_page, $this->feedback->aft_id, 'Automatically clearing all flags', $this->user );

		return true;
	}

	/**
	 * Returns whether this is a system call rather than a user-directed one
	 *
	 * @return bool
	 */
	public function isSystemCall() {
		return !( $this->user instanceof User );
	}

	/**
	 * Helper function to dig out page url and title, feedback permalink, and
	 * requestor page url and name - if all this data can be retrieved properly
	 * it shoves an email job into the queue for sending to the oversighters'
	 * mailing list - only called for NEW oversight requests
	 *
	 * @param string $notes Additional text to include in the email
	 */
	protected function sendOversightEmail( $notes = '' ) {
		global $wgArticleFeedbackv5OversightEmails;

		if ( $this->isSystemCall() ) {
			throw new LogicException( 'A User object must be set when calling this method.' );
		}

		// if the oversight email address is empty we're going to just skip all this
		if ( $wgArticleFeedbackv5OversightEmails === null ) {
			return;
		}

		// jobs need a title object
		$page = Title::newFromID( $this->feedback->aft_page );
		if ( !$page ) {
			return;
		}

		// make a title out of our user (sigh)
		$userPage = $this->user->getUserPage();
		if ( !$userPage ) {
			return; // no user title object, no mail
		}

		// to build our permalink, use the feedback entry key + the page name (isn't page name a title? but title is an object? confusing)
		$permalink = SpecialPage::getTitleFor( 'ArticleFeedbackv5', $page->getPrefixedDBkey() . '/' . $this->feedback->aft_id );

		// build our params
		$params = [
			'user_name' => $this->user->getName(),
			'user_url' => $userPage->getFullURL( '', false, PROTO_HTTPS ),
			'page_name' => $page->getPrefixedText(),
			'page_url' => $page->getFullURL( '', false, PROTO_HTTPS ),
			'permalink' => $permalink->getFullURL( '', false, PROTO_HTTPS ),
			'notes' => $notes
		];

		$job = new ArticleFeedbackv5MailerJob( $page, $params );
		JobQueueGroup::singleton()->push( $job );
	}

	/**
	 * Return the error message (if any)
	 *
	 * @return string the message
	 */
	public function getError() {
		return $this->error;
	}

	/**
	 * Return the id of the requested flag's log entry
	 *
	 * @return int the id
	 */
	public function getLogId() {
		return $this->logId;
	}
}
