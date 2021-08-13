<?php
/**
 * SpecialArticleFeedbackv5 class
 *
 * @package    ArticleFeedback
 * @subpackage Job
 * @author     Elizabeth M Smith <elizabeth@omniti.com>
 */

/**
 * This is a job to do mailings for oversight requests
 *
 * @package    ArticleFeedback
 * @subpackage Job
 */
class ArticleFeedbackv5MailerJob extends Job {
	/**
	 * Params required to be able to send email.
	 *
	 * @var array
	 */
	protected $requiredParams = [
		'user_name',
		'user_url',
		'page_name',
		'page_url',
		'permalink',
	];

	/**
	 * Passthrough that sends the name of the class as the name of the job
	 *
	 * @param Title $title
	 * @param array $params
	 * @param int $id
	 */
	public function __construct( $title, $params, $id = 0 ) {
		parent::__construct( __CLASS__, $title, $params, $id );
	}

	/**
	 * Run the job
	 * @return bool success
	 */
	public function run() {
		global $wgArticleFeedbackv5OversightEmails, $wgArticleFeedbackv5OversightEmailName;
		global $wgPasswordSender, $wgNoReplyAddress;

		$params = $this->params;

		// if the oversight email address is empty we're going to just skip all this, but return true
		if ( $wgArticleFeedbackv5OversightEmails === null ) {
			return true;
		}

		// if we don't have the right params set return false, job can't run
		$missing = array_diff( $this->requiredParams, array_keys( $params ) );
		if ( $missing ) {
			return false;
		}

		// get our addresses
		$to = new MailAddress( $wgArticleFeedbackv5OversightEmails, $wgArticleFeedbackv5OversightEmailName );
		$from = new MailAddress( $wgPasswordSender, wfMessage( 'emailsender' )->text() );
		$replyto = new MailAddress( $wgNoReplyAddress );

		// get our text
		list( $subject, $body ) = $this->composeMail(
			$params['user_name'],
			$params['user_url'],
			$params['page_name'],
			$params['page_url'],
			$params['permalink'],
			isset( $params['notes'] ) ? $params['notes'] : ''
		);

		$status = UserMailer::send( $to, $from, $subject, $body, [ 'replyTo' => $replyto ] );

		return $status->isOK();
	}

	/**
	 * Generate the "an oversight request has been made" email for sending
	 * to the mailing list
	 *
	 * @param string $requestorName user name
	 * @param string $requestorUrl link to user page
	 * @param string $pageName page title
	 * @param string $pageUrl page url
	 * @param string $feedbackPermalink permalink url to feedback
	 * @param string $notes additional text
	 * @return string[]
	 */
	protected function composeMail( $requestorName, $requestorUrl, $pageName, $pageUrl, $feedbackPermalink, $notes = '' ) {
		global $wgArticleFeedbackv5OversightEmailHelp;

		// build the subject
		$subject = wfMessage( 'articlefeedbackv5-email-request-oversight-subject' )->escaped();

		// form notes text block only if notes have been added
		if ( $notes ) {
			$notes = wfMessage( 'articlefeedbackv5-email-request-oversight-body-notes', $notes )->plain();
		}

		// text version, no need to escape since client will interpret it as plain text
		$body = wfMessage( 'articlefeedbackv5-email-request-oversight-body' )
					->params( $requestorName, $pageName )
					->rawParams( $feedbackPermalink )
					->params( $wgArticleFeedbackv5OversightEmailHelp, $notes )
					->text();

		return [ $subject, $body ];
	}
}
