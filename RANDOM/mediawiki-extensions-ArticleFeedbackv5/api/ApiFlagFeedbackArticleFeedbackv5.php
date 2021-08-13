<?php
/**
 * ApiFlagFeedbackArticleFeedbackv5 class
 *
 * @package    ArticleFeedback
 * @subpackage Api
 * @author     Greg Chiasson <greg@omniti.com>
 * @author     Elizabeth M Smith <elizabeth@omniti.com>
 * @author     Matthias Mullie <mmullie@wikimedia.org>
 */

/**
 * This class allows you to performs a certain action (e.g. resolve,
 * mark as useful) to feedback.
 *
 * @package    ArticleFeedback
 * @subpackage Api
 */
class ApiFlagFeedbackArticleFeedbackv5 extends ApiBase {
	/**
	 * @param ApiQuery $query
	 * @param string $moduleName
	 */
	public function __construct( $query, $moduleName ) {
		parent::__construct( $query, $moduleName, '' );
	}

	/**
	 * Execute the API call
	 *
	 * This single api call covers all cases where flags are being applied to
	 * a piece of feedback
	 */
	public function execute() {
		$user = $this->getUser();
		$results = [];

		// get important values from our parameters
		$params     = $this->extractRequestParams();
		$feedbackId = $params['feedbackid'];
		$flag       = $params['flagtype'];
		$notes      = $params['note'];
		$toggle     = $params['toggle'];
		$source     = $params['source'];

		// get page object
		$pageObj = $this->getTitleOrPageId( $params, 'fromdb' );
		if ( !$pageObj->exists() ) {
			$this->dieWithError(
				'articlefeedbackv5-invalid-page-id',
				'notanarticle'
			);
		} else {
			$pageId = $pageObj->getId();
		}

		// Fire up the flagging object
		$flagger = new ArticleFeedbackv5Flagging( $user, $feedbackId, $pageId );
		$status = $flagger->run( $flag, $notes, $toggle, $source );

		$feedback = ArticleFeedbackv5Model::get( $feedbackId, $pageId );
		if ( $feedback ) {
			// re-render feedback entry
			$permalink = $source == 'permalink';
			$central = $source == 'central';
			$renderer = new ArticleFeedbackv5Render( $user, $permalink, $central );
			$results['render'] = $renderer->run( $feedback );
		}

		if ( !$status ) {
			$this->dieWithError(
				$flagger->getError(),
				'flagerror',
				$results
			);
		} else {
			$results['log_id'] = $flagger->getLogId();
		}

		$this->getResult()->addValue(
			null,
			$this->getModuleName(),
			$results
		);
	}

	/**
	 * Gets the allowed parameters
	 *
	 * @return array the params info, indexed by allowed key
	 */
	public function getAllowedParams() {
		return [
			'title' => null,
			'pageid' => [
				ApiBase::PARAM_ISMULTI  => false,
				ApiBase::PARAM_TYPE     => 'integer'
			],
			'feedbackid' => [
				ApiBase::PARAM_REQUIRED => true,
				ApiBase::PARAM_ISMULTI  => false,
				ApiBase::PARAM_TYPE     => 'string'
			],
			'flagtype' => [
				ApiBase::PARAM_REQUIRED => true,
				ApiBase::PARAM_ISMULTI  => false,
				ApiBase::PARAM_TYPE     => array_keys( ArticleFeedbackv5Activity::$actions ),
			],
			'note' => [
				ApiBase::PARAM_REQUIRED => false,
				ApiBase::PARAM_ISMULTI  => false,
				ApiBase::PARAM_TYPE     => 'string'
			],
			'toggle' => [
				ApiBase::PARAM_TYPE     => 'boolean'
			],
			'source' => [
				ApiBase::PARAM_REQUIRED => false,
				ApiBase::PARAM_ISMULTI  => false,
				ApiBase::PARAM_TYPE     => [ 'article', 'central', 'watchlist', 'permalink', 'unknown' ]
			],
		];
	}

	/**
	 * Gets the parameter descriptions
	 *
	 * @return array the descriptions, indexed by allowed key
	 */
	public function getParamDescription() {
		$p = $this->getModulePrefix();
		return [
			'title' => "Title of the page to flag feedback for. Cannot be used together with {$p}pageid",
			'pageid' => "ID of the page to flag feedback for. Cannot be used together with {$p}title",
			'feedbackid' => 'FeedbackID to flag',
			'flagtype' => 'Type of flag to apply',
			'note' => 'Information on why the feedback activity occurred',
			'toggle' => 'The flag is being toggled atomically, only useful for (un)helpful',
			'source' => 'The origin of the flag: article (page), central (feedback page), watchlist (page), permalink',
		];
	}

	/**
	 * Gets the api descriptions
	 *
	 * @return array the description as the first element in an array
	 */
	public function getDescription() {
		return [
			'Flag a feedbackID as abusive or hidden.'
		];
	}

	/**
	 * Gets an example
	 *
	 * @return array the example as the first element in an array
	 */
	protected function getExamples() {
		return [
			'api.php?action=articlefeedbackv5-flag-feedback&feedbackid=1&pageid=1&flagtype=helpful'
		];
	}

	public function isWriteMode() {
		return true;
	}

	public function mustBePosted() {
		return true;
	}

}
