<?php
/**
 * ApiViewActivityArticleFeedbackv5 class
 *
 * @package    ArticleFeedback
 * @subpackage Api
 * @author     Elizabeth M Smith <elizabeth@omniti.com>
 */

use MediaWiki\MediaWikiServices;

/**
 * This class pulls the aggregated ratings for display in Bucket #5
 *
 * @package    ArticleFeedback
 * @subpackage Api
 */
class ApiViewActivityArticleFeedbackv5 extends ApiQueryBase {

	/**
	 * @param ApiQuery $query
	 * @param string $moduleName
	 */
	public function __construct( $query, $moduleName ) {
		parent::__construct( $query, $moduleName, 'aa' );
	}

	/**
	 * Execute the API call: Pull max 25 activity log items for page
	 */
	public function execute() {
		/*
		 * To bust caches, this GET value may be added to the querystring. Codewise,
		 * we won't really use it for anything, but we don't want it to output a
		 * "Unrecognized parameter" warning either, so let's make sure ApiMain
		 * considers it used ;)
		 */
		$this->getMain()->getVal( '_' );

		$user = $this->getUser();
		$lang = $this->getLanguage();

		if ( !$user->isAllowed( 'aft-editor' ) ) {
			$this->dieWithError(
				'articlefeedbackv5-error-permission-denied',
				'permissiondenied'
			);
		}

		// get our parameter information
		$params = $this->extractRequestParams();
		$limit = $params['limit'];
		$continue = $params['continue'];
		$result = $this->getResult();

		// get page object
		$pageObj = $this->getTitleOrPageId( $params, 'fromdb' );
		if ( !$pageObj->exists() ) {
			$this->dieWithError( 'notanarticle' );
		}

		// fetch our activity database information
		$feedback = ArticleFeedbackv5Model::get( $params['feedbackid'], $pageObj->getId() );
		// if this is false, this is bad feedback - move along
		if ( !$feedback ) {
			$this->dieWithError(
				'articlefeedbackv5-error-nonexistent-feedback',
				'invalidfeedbackid'
			);
		}

		// get the string title for the page
		$page = Title::newFromID( $feedback->aft_page );
		if ( !$page ) {
			$this->dieWithError(
				'articlefeedbackv5-error-nonexistent-page',
				'invalidfeedbackid'
			);
		}

		// get our activities
		try {
			$activities = ArticleFeedbackv5Activity::getList( $feedback, $user, $limit, $continue );
		} catch ( Exception $e ) {
			$this->dieWithError( ( new RawMessage( '$1' ) )->plaintextParam( $e->getMessage() ), $e->getCode() );
		}

		// generate our html
		$html = '';

		// only do this if continue is not null
		if ( !$continue && !$params['noheader'] ) {
			$result->addValue( $this->getModuleName(), 'hasHeader', true );

			$html .=
				Html::rawElement(
					'div',
					[ 'class' => 'articleFeedbackv5-activity-pane' ],
					Html::rawElement(
						'div',
						[ 'class' => 'articleFeedbackv5-activity-feedback' ],
						Html::rawElement(
							'div',
							[],
							wfMessage( 'articlefeedbackv5-activity-feedback-info' )
								->params( $feedback->aft_id )
								->rawParams( ArticleFeedbackv5Utils::getUserLink( $feedback->aft_user, $feedback->aft_user_text ) )
								->params( $feedback->aft_user_text ) // username or ip
								->text()
						) .
						Html::element(
							'div',
							[],
							wfMessage( 'articlefeedbackv5-activity-feedback-date' )
								->params(
									$lang->userTimeAndDate( $feedback->aft_timestamp, $user ),
									$lang->userDate( $feedback->aft_timestamp, $user ),
									$lang->userTime( $feedback->aft_timestamp, $user )
								)->text()
						) .
						Html::rawElement(
							'div',
							[ 'class' => 'articleFeedbackv5-activity-feedback-permalink' ],
							MediaWikiServices::getInstance()->getLinkRenderer()->makeLink(
								SpecialPage::getTitleFor( 'ArticleFeedbackv5', $page->getPrefixedDBkey() . '/' . $feedback->aft_id ),
								wfMessage( 'articlefeedbackv5-activity-permalink' )->text()
							)
						)
					) .
					Html::element(
						'div',
						[ 'class' => 'articleFeedbackv5-activity-count' ],
						wfMessage( 'articlefeedbackv5-activity-count' )->numParams( ArticleFeedbackv5Activity::getActivityCount( $feedback, $user ) )->text()
					)
				);

			$html .=
				Html::openElement(
					'div',
					[ 'class' => 'articleFeedbackv5-activity-log-items' ]
				);
		}

		$count = 0;

		// divs of activity items
		foreach ( $activities as $item ) {
			// skip item if user is not permitted to see it
			if ( !ArticleFeedbackv5Activity::canPerformAction( $item->log_action, $user ) ) {
				continue;
			}

			// figure out if we have more if we have another row past our limit
			$count++;
			if ( $count > $limit ) {
				break;
			}

			$sentiment = ArticleFeedbackv5Activity::$actions[$item->log_action]['sentiment'];

			// Give grep a chance to find the usages:
			// articlefeedbackv5-activity-item-request, articlefeedbackv5-activity-item-unrequest,
			// articlefeedbackv5-activity-item-decline, articlefeedbackv5-activity-item-flag,
			// articlefeedbackv5-activity-item-unflag, articlefeedbackv5-activity-item-autoflag,
			// articlefeedbackv5-activity-item-oversight, articlefeedbackv5-activity-item-unoversight,
			// articlefeedbackv5-activity-item-feature, articlefeedbackv5-activity-item-unfeature,
			// articlefeedbackv5-activity-item-resolve, articlefeedbackv5-activity-item-unresolve,
			// articlefeedbackv5-activity-item-noaction, articlefeedbackv5-activity-item-unnoaction,
			// articlefeedbackv5-activity-item-inappropriate, articlefeedbackv5-activity-item-uninappropriate,
			// articlefeedbackv5-activity-item-hide, articlefeedbackv5-activity-item-unhide,
			// articlefeedbackv5-activity-item-autohide, articlefeedbackv5-activity-item-archive,
			// articlefeedbackv5-activity-item-unarchive, articlefeedbackv5-activity-item-helpful,
			// articlefeedbackv5-activity-item-unhelpful, articlefeedbackv5-activity-item-undo-helpful,
			// articlefeedbackv5-activity-item-undo-unhelpful, articlefeedbackv5-activity-item-clear-flags
			$html .=
				Html::rawElement(
					'div',
					[ 'class' => 'articleFeedbackv5-activity-item' ],
					Html::rawElement(
						'span',
						[ 'class' => "articleFeedbackv5-activity-item-action articleFeedbackv5-activity-item-action-$sentiment" ],
						wfMessage( 'articlefeedbackv5-activity-item-' . $item->log_action )
							->rawParams(
								ArticleFeedbackv5Utils::getUserLink( $item->log_user, $item->log_user_text ),
								Linker::commentBlock( $item->log_comment ),
								Html::element( 'span', [], $lang->userTimeAndDate( $item->log_timestamp, $user ) ),
								Html::element( 'span', [], $lang->userDate( $item->log_timestamp, $user ) ),
								Html::element( 'span', [], $lang->userTime( $item->log_timestamp, $user ) )
							)
							->params( $item->log_user_text )
							->escaped()
					)
				);
		}

		if ( $count > $limit ) {
			$html .=
				Html::element(
					'a',
					[
						'class' => "articleFeedbackv5-activity-more",
						'href' => '#',
					],
					wfMessage( "articlefeedbackv5-activity-more" )->text()
				);
		}

		$html .= Html::closeElement( 'div' );

		// finally add our generated html data
		$result->addValue( $this->getModuleName(), 'limit', $limit );
		$result->addValue( $this->getModuleName(), 'activity', $html );

		// continue only goes in if it's not empty
		if ( $count > $limit ) {
			$this->setContinueEnumParameter( 'continue', ArticleFeedbackv5Activity::getContinue( $item ) );
		}
	}

	/**
	 * Gets the allowed parameters
	 *
	 * @return array the params info, indexed by allowed key
	 */
	public function getAllowedParams() {
		return [
			'feedbackid' => [
				ApiBase::PARAM_REQUIRED => true,
				ApiBase::PARAM_TYPE     => 'string',
			],
			'title' => null,
			'pageid' => [
				ApiBase::PARAM_TYPE     => 'integer',
			],
			'limit' => [
				ApiBase::PARAM_DFLT => 25,
				ApiBase::PARAM_TYPE => 'limit',
				ApiBase::PARAM_MIN => 1,
				ApiBase::PARAM_MAX => ApiBase::LIMIT_BIG1,
				ApiBase::PARAM_MAX2 => ApiBase::LIMIT_BIG2
			],
			'continue' => null,
			'noheader' => [
				ApiBase::PARAM_TYPE => 'boolean',
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
			'feedbackid' => 'ID of article feedback to get activity for',
			'title' => "Title of the page the feedback was given for. Cannot be used together with {$p}pageid",
			'pageid' => "ID of the page the feedback was given for. Cannot be used together with {$p}title",
			'limit' => 'How many activity results to return',
			'continue' => 'When more results are available, use this to continue',
			'noheader' => 'Skip the header markup, even if this is the first page',
		];
	}

	/**
	 * Gets the api descriptions
	 *
	 * @return array the description as the first element in an array
	 */
	public function getDescription() {
		return [
			'List article feedback activity for a specified page'
		];
	}

	/**
	 * Gets an example
	 *
	 * @return array the example as the first element in an array
	 */
	protected function getExamples() {
		return [
			'api.php?action=query&list=articlefeedbackv5-view-activity&aafeedbackid=429384108662e9d4e41ab6e275d0392e&aapageid=1',
		];
	}
}
