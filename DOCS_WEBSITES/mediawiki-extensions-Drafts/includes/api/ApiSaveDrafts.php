<?php
/**
 * API module to save Drafts
 *
 * @file
 * @ingroup API
 * @author Kunal Mehta
 */
class ApiSaveDrafts extends ApiBase {
	public function execute() {
		if ( $this->getUser()->isAnon() ) {
			$this->dieWithError(
				'apierror-mustbeloggedin-save-drafts',
				'notloggedin'
			);
		}

		$params = $this->extractRequestParams();

		$draft = Draft::newFromID( $params['id'] );
		$draft->setToken( $params['drafttoken'] );
		$draft->setTitle( Title::newFromText( $params['title'] ) );
		$draft->setSection( $params['section'] == '' ? null : $params['section'] );
		$draft->setStartTime( $params['starttime'] );
		$draft->setEditTime( $params['edittime'] );
		$draft->setSaveTime( wfTimestampNow() );
		$draft->setScrollTop( $params['scrolltop'] );
		$draft->setText( $params['text'] );
		$draft->setSummary( $params['summary'] );
		$draft->setMinorEdit( $params['minoredit'] );
		$draft->save();

		$this->getResult()->addValue(
			null,
			$this->getModuleName(),
			[ 'id' => $draft->getID() ]
		);
	}

	/**
	 * @deprecated since MediaWiki core 1.25
	 */
	public function getDescription() {
		return 'Save a draft';
	}

	public function getAllowedParams() {
		return [
			'id' => [
				ApiBase::PARAM_TYPE => 'integer',
			],
			'drafttoken' => [
				ApiBase::PARAM_TYPE => 'string',
				ApiBase::PARAM_REQUIRED => true,
			],
			'title' => [
				ApiBase::PARAM_TYPE => 'string',
				ApiBase::PARAM_REQUIRED => true,
			],
			'section' => [
				ApiBase::PARAM_TYPE => null,
			],
			'starttime' => [
				ApiBase::PARAM_REQUIRED => true,
			],
			'edittime' => [
				ApiBase::PARAM_REQUIRED => true,
			],
			'scrolltop' => [
				ApiBase::PARAM_TYPE => 'integer',
				ApiBase::PARAM_REQUIRED => true,
			],
			'text' => [
				ApiBase::PARAM_TYPE => 'string',
				ApiBase::PARAM_REQUIRED => true,
			],
			'summary' => [
				ApiBase::PARAM_TYPE => 'string',
			],
			'minoredit' => [
				ApiBase::PARAM_TYPE => 'boolean',
				ApiBase::PARAM_REQUIRED => true,
			],
			'token' => null,
		];
	}

	public function mustBePosted() {
		return true;
	}

	public function needsToken() {
		return 'csrf';
	}

	public function getTokenSalt() {
		return '';
	}

	public function isWriteMode() {
		return true;
	}

}
