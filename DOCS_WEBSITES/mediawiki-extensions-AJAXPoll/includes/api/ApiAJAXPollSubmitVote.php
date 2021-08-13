<?php
/**
 * AJAXPoll API module to replace the old AJAX endpoint for MW 1.31+
 *
 * @file
 * @ingroup API
 * @date 11 May 2018
 * @see https://www.mediawiki.org/wiki/API:Extensions#ApiSampleApiExtension.php
 */
class ApiAJAXPollSubmitVote extends ApiBase {

	/**
	 * Main entry point.
	 *
	 * @return bool
	 */
	public function execute() {
		// Get the request parameters
		$params = $this->extractRequestParams();

		$id = $params['poll'];
		$answer = $params['answer'];

		// If the required params aren't present, we don't know what to do!
		/* @todo FIXME: interferes with the "revoke vote" functionality b/c in that case answer is
		literally 0
		if (
			!$id || $id === null ||
			!$answer || $answer === null
		) {
			$this->dieUsageMsg( 'missingparam' );
		}
		*/

		// This function checks if the user is allowed to vote etc.
		// This old method -- which really, *really* needs refactoring even more -- just sucks.
		$output = AJAXPoll::submitVote( $id, $answer, $this->getUser() );

		// Top level
		$this->getResult()->addValue( null, $this->getModuleName(), [ 'result' => $output ] );

		return true;
	}

	/**
	 * @see ApiBase#needsToken()
	 * @return string
	 */
	public function needsToken() {
		return 'csrf';
	}

	/**
	 * @see ApiBase#isWriteMode()
	 * @return bool
	 */
	public function isWriteMode() {
		return true;
	}

	/**
	 * @see ApiBase#getAllowedParams()
	 * @return array
	 */
	public function getAllowedParams() {
		return [
			'poll' => [
				ApiBase::PARAM_TYPE => 'string',
				ApiBase::PARAM_REQUIRED => true
			],
			'answer' => [
				ApiBase::PARAM_TYPE => 'integer',
				ApiBase::PARAM_REQUIRED => true
			]
		];
	}

	/**
	 * @see ApiBase#getExamplesMessages()
	 * @return array
	 */
	protected function getExamplesMessages() {
		return [
			'action=pollsubmitvote&poll=832A5FA2C2583A5732B90CEFF658FE25&answer=3'
				=> 'apihelp-pollsubmitvote-example-1',
		];
	}
}
