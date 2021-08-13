<?php
/**
 * ApiArticleFeedbackv5 class
 *
 * @package    ArticleFeedback
 * @subpackage Api
 * @author     Greg Chiasson <greg@omniti.com>
 * @author     Reha Sterbin <reha@omniti.com>
 * @author     Matthias Mullie <mmullie@wikimedia.org>
 */

use MediaWiki\Extension\AbuseFilter\AbuseFilterServices;
use MediaWiki\MediaWikiServices;
use Wikimedia\ScopedCallback;

/**
 * This saves the ratings
 *
 * @package    ArticleFeedback
 * @subpackage Api
 */
class ApiArticleFeedbackv5 extends ApiBase {
	/**
	 * @var string[] Flags added by AbuseFilter
	 * FIXME Avoid global state.
	 * TODO This can only report issues from a single filter.
	 */
	public static $abuseFilterFlags = [];

	/** @var int[] filters incremented on creation */
	protected $filters = [ 'visible' => 1, 'notdeleted' => 1, 'all' => 1 ];

	/**
	 * @param ApiMain $main
	 * @param string $action
	 */
	public function __construct( $main, $action ) {
		parent::__construct( $main, $action );
	}

	/**
	 * Execute the API call: Save the form values
	 */
	public function execute() {
		// Blocked users are, well, blocked.
		$user = $this->getUser();
		if ( $user->isBlocked() ) {
			$this->dieWithError(
				'articlefeedbackv5-error-blocked',
				'userblocked'
			);
		}

		$params = $this->extractRequestParams();

		// get page object
		$pageObj = $this->getTitleOrPageId( $params, 'fromdb' );
		if ( !$pageObj->exists() ) {
			$this->dieWithError(
				'articlefeedbackv5-invalid-page-id',
				'notanarticle'
			);
		}

		// Check if feedback is enabled on this page
		if ( !ArticleFeedbackv5Utils::isFeedbackEnabled( $pageObj->getId(), $user ) ) {
			$this->dieWithError(
				'articlefeedbackv5-page-disabled',
				'invalidpage'
			);
		}

		// Build feedback entry
		$feedback = new ArticleFeedbackv5Model();
		$feedback->aft_page = $pageObj->getId();
		$feedback->aft_page_revision = $params['revid'];
		$feedback->aft_user = $user->getId();
		$feedback->aft_user_text = $user->getName();
		$feedback->aft_user_token = $params['anontoken'];
		$feedback->aft_claimed_user = $user->getId();
		$feedback->aft_form = $params['bucket'];
		$feedback->aft_cta = $params['cta'];
		$feedback->aft_link = $params['link'];
		$feedback->aft_rating = $params['found'];
		$feedback->aft_comment = trim( $params['comment'] );

		$services = MediaWikiServices::getInstance();
		/*
		 * Check submission against last entry: do not allow duplicates.
		 *
		 * The $user->mRights manipulation is a bit nasty. ArticleFeedbackModel's
		 * getList will check if a certain user's permissions suffice to see a
		 * certain list. To make sure that we get the absolute latest entry,
		 * we'll request a list that has no conditions at all - a list that should
		 * otherwise not be accessible. The solution here is to add a non-existing
		 * permission to the list and pretend to have that permission when attempting
		 * to fetch that list here. Now we can leave the permission-safeguard in place.
		 * Afterwards, clean up the rights by removing the bogus one.
		 *
		 * Manipulating $user->mRights directly isn't possible in MW 1.34+.
		 * @see https://phabricator.wikimedia.org/T228249
		 */
		$pm = $services->getPermissionManager();
		$guard = $pm->addTemporaryUserRights( $user, 'aft-noone' );
		$list = ArticleFeedbackv5Model::getList( '*', $user, $feedback->aft_page, 0, 'age', 'DESC' );
		// revoke temporary aft-noone right
		ScopedCallback::consume( $guard );

		$old = $list->fetchObject();
		if (
			$old &&
			$old->aft_user == $feedback->aft_user &&
			$old->aft_comment == $feedback->aft_comment &&
			$old->aft_timestamp > wfTimestamp( TS_MW, strtotime( '1 minute ago' ) )
		) {
			$this->dieWithError(
				'articlefeedbackv5-error-duplicate',
				'duplicate'
			);
		}

		/**
		 * Check for abusive comment in the following sequence (cheapest
		 * processing to most expensive, returning if we get a hit):
		 * 1) Respect $wgSpamRegex
		 * 2) Check SpamBlacklist
		 * 3) Check AbuseFilter
		 */
		global $wgArticleFeedbackv5AbuseFiltering;
		if ( $wgArticleFeedbackv5AbuseFiltering ) {
			if ( ArticleFeedbackv5Utils::validateSpamRegex( $feedback->aft_comment ) ) {
				$this->dieWithError(
					'articlefeedbackv5-error-spamregex',
					'articlefeedbackv5-error-abuse'
				);
			} elseif ( ArticleFeedbackv5Utils::validateSpamBlacklist( $feedback->aft_comment, $feedback->aft_page, $user ) ) {
				$this->dieWithError(
					'articlefeedbackv5-error-spamblacklist',
					'articlefeedbackv5-error-abuse'
				);
			} else {
				// Ensure that we're starting without flags.
				self::$abuseFilterFlags = [];
				$error = ArticleFeedbackv5Utils::validateAbuseFilter(
					$feedback->aft_comment,
					$feedback->aft_page,
					$user
				);

				if ( $error !== false ) {
					$messages = [];
					foreach ( $error as $message ) {
						$messages[] = $message[1];
					}

					$this->dieWithError(
						[
							'articlefeedbackv5-error-abuse',
							$this->msg( 'articlefeedbackv5-error-abuse-link' )->inContentLanguage()->plain(),
							count( $messages ),
							Message::listParam( $messages )
						],
						'afreject'
					);
				}
			}
		}

		// Save feedback
		try {
			$feedback->insert();
		} catch ( MWException $e ) {
			// $this->dieWithError( ( new RawMessage( '$1' ) )->plaintextParam( $e->getMessage() ), 'inserterror' ); // easier when debugging: show exact exception message
			$this->dieWithError(
				'articlefeedbackv5-error-submit',
				'inserterror'
			);
		}

		ArticleFeedbackv5Log::log(
			'create',
			$feedback->aft_page,
			$feedback->aft_id,
			'', // just like creation of page, no comment in logs
			$user,
			[]
		);

		// build URL to permalink and special page
		$page = Title::newFromID( $feedback->aft_page );
		if ( !$page ) {
			$this->dieWithError(
				'articlefeedbackv5-error-nonexistent-page',
				'invalidfeedbackid'
			);
		}
		$special = SpecialPage::getTitleFor( 'ArticleFeedbackv5', $page->getPrefixedDBkey() );
		$permalink = SpecialPage::getTitleFor( 'ArticleFeedbackv5', $page->getPrefixedDBkey() . '/' . $feedback->aft_id );

		// Are we set to auto-flag?
		$afUser = MediaWikiServices::getInstance()
			->getUserFactory()
			->newFromUserIdentity( AbuseFilterServices::getFilterUser()->getUser() );
		$flagger = new ArticleFeedbackv5Flagging( $afUser, $feedback->aft_id, $feedback->aft_page );
		foreach ( self::$abuseFilterFlags as $flag => $rule_desc ) {
			$notes = wfMessage(
				"articlefeedbackv5-abusefilter-note-aftv5$flag",
				[ $rule_desc ]
			)->parse();

			$res = $flagger->run( $flag, $notes, false, 'abusefilter' );
			if ( $res['result'] == 'Error' ) {
				// TODO: Log somewhere?
			}
		}

		$this->getResult()->addValue(
			null,
			$this->getModuleName(),
			[
				'feedback_id' => $feedback->aft_id,
				'aft_url'     => $special->getLinkUrl( [ 'ref' => 'cta' ] ),
				'permalink'   => $permalink->getLinkUrl( [ 'ref' => 'cta' ] ),
			]
		);
	}

	/**
	 * Gets the allowed parameters
	 *
	 * @return array the params info, indexed by allowed key
	 */
	public function getAllowedParams() {
		global $wgArticleFeedbackv5DisplayBuckets, $wgArticleFeedbackv5CTABuckets, $wgArticleFeedbackv5LinkBuckets;
		$formIds = array_map( 'strval', array_keys( $wgArticleFeedbackv5DisplayBuckets['buckets'] ) );
		$ctaIds = array_map( 'strval', array_keys( $wgArticleFeedbackv5CTABuckets['buckets'] ) );
		$linkIds = array_map( 'strval', array_keys( $wgArticleFeedbackv5LinkBuckets['buckets'] ) );

		$ret = [
			'title' => null,
			'pageid' => [
				ApiBase::PARAM_TYPE     => 'integer',
			],
			'revid' => [
				ApiBase::PARAM_TYPE     => 'integer',
				ApiBase::PARAM_REQUIRED => true,
			],
			'anontoken' => [
				ApiBase::PARAM_TYPE     => 'string',
				ApiBase::PARAM_REQUIRED => false,
			],
			'bucket' => [
				ApiBase::PARAM_TYPE     => $formIds,
				ApiBase::PARAM_REQUIRED => true,
			],
			'cta' => [
				ApiBase::PARAM_TYPE     => $ctaIds,
				ApiBase::PARAM_REQUIRED => true,
			],
			'link' => [
				ApiBase::PARAM_TYPE     => $linkIds,
				ApiBase::PARAM_REQUIRED => true,
			],
			'found' => [
				ApiBase::PARAM_TYPE     => [ '0', '1' ],
				ApiBase::PARAM_REQUIRED => false,
			],
			'comment' => [
				ApiBase::PARAM_TYPE     => 'string',
				ApiBase::PARAM_REQUIRED => false,
			]
		];

		return $ret;
	}

	/**
	 * Gets the parameter descriptions
	 *
	 * @return array the descriptions, indexed by allowed key
	 */
	public function getParamDescription() {
		$p = $this->getModulePrefix();
		return [
			'title'      => "Title of the page to submit feedback for. Cannot be used together with {$p}pageid",
			'pageid'     => "ID of the page to submit feedback for. Cannot be used together with {$p}title",
			'revid'      => 'Revision ID to submit feedback for',
			'anontoken'  => 'Token for anonymous users',
			'bucket'     => 'Which feedback form was shown to the user',
			'cta'        => 'CTA displayed after form submission',
			'link'       => 'Which link the user clicked on to get to the widget',
			'found'      => 'Yes/no feedback answering the question if the page was helpful',
			'comment'    => 'the fee-form textual feedback',
		];
	}

	/**
	 * Returns whether this API call is post-only
	 *
	 * @return bool
	 */
	public function mustBePosted() {
		return true;
	}

	/**
	 * Returns whether this is a write call
	 *
	 * @return bool
	 */
	public function isWriteMode() {
		return true;
	}

	/**
	 * Gets a description
	 *
	 * @return string
	 */
	public function getDescription() {
		return 'Submit article feedback';
	}

	/**
	 * TODO
	 * Gets a list of examples
	 *
	 * @return array
	 */
	protected function getExamples() {
		return [
			'api.php?action=articlefeedbackv5'
		];
	}
}
