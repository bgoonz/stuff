<?php
/**
 * ArticleFeedbackv5Render class
 *
 * @package    ArticleFeedback
 * @author     Elizabeth M Smith <elizabeth@omniti.com>
 * @author     Reha Sterbin <reha@omniti.com>
 * @author     Matthias Mullie <mmullie@wikimedia.org>
 */

use MediaWiki\MediaWikiServices;
use Wikimedia\IPUtils;

/**
 * Handles rendering of a submitted feedback entry in the Special page's list view
 *
 * @package    ArticleFeedback
 */
class ArticleFeedbackv5Render {
	/**
	 * Whether this is a permalink
	 *
	 * @var bool
	 */
	private $isPermalink;

	/**
	 * Whether this is on the central log
	 *
	 * @var bool
	 */
	private $isCentral;

	/**
	 * Whether this is a highlighted row
	 *
	 * @var bool
	 */
	private $isHighlighted;

	/**
	 * Current user
	 *
	 * @var User
	 */
	private $user;

	/**
	 * Constructor
	 *
	 * @param User $user Current user.
	 * @param bool $permalink whether this is a permalink?
	 * @param bool $central whether this is on the central log?
	 * @param bool $highlight whether this is a highlighted row?
	 */
	public function __construct(
		User $user,
		$permalink = false,
		$central = false,
		$highlight = false
	) {
		$this->setIsPermalink( $permalink );
		$this->setIsCentral( $central );
		$this->setIsHighlighted( $highlight );
		$this->user = $user;
	}

	/**
	 * Returns the HTML for the given feedback entry
	 *
	 * @param ArticleFeedbackv5Model $record the record
	 * @return string the rendered row
	 */
	public function run( $record ) {
		if ( !$record instanceof ArticleFeedbackv5Model ) {
			return '';
		}

		try {
			$record->validate();
		} catch ( Exception $e ) {
			return '';
		}

		// Special cases: when the record is deleted/hidden/inappropriate,
		// but the user doesn't have permission to see it
		if ( ( $record->isOversighted() && !ArticleFeedbackv5Activity::canPerformAction( 'oversight', $this->getUser() ) ) ||
			( $record->isHidden() && !ArticleFeedbackv5Activity::canPerformAction( 'hide', $this->getUser() ) ) ||
			( $record->isInappropriate() && !ArticleFeedbackv5Activity::canPerformAction( 'inappropriate', $this->getUser() ) ) ) {
			// Called via permalink: show an empty gray mask
			if ( $this->isPermalink ) {
				return $this->emptyGrayMask( $record );
			} else {
				return '';
			}
		}

		// Build with the actual content of the feedback (header + comment)
		$content = $this->render( $record );

		// Build the footer
		$footer = $this->renderFooter( $record );

		// Build the toolbox
		$toolbox = $this->renderToolbox( $record );

		// Get the top class
		$topClass = 'articleFeedbackv5-feedback';
		if ( $record->isOversighted() ) {
			$topClass .= ' articleFeedbackv5-feedback-oversight';
		}
		if ( $record->isHidden() ) {
			$topClass .= ' articleFeedbackv5-feedback-hide';
		}
		if ( $record->isFeatured() ) {
			$topClass .= ' articleFeedbackv5-feedback-feature';
		}
		if ( $record->isResolved() ) {
			$topClass .= ' articleFeedbackv5-feedback-resolve';
		}
		if ( $record->isNonActionable() ) {
			$topClass .= ' articleFeedbackv5-feedback-noaction';
		}
		if ( $record->isInappropriate() ) {
			$topClass .= ' articleFeedbackv5-feedback-inappropriate';
		}
		if ( $record->isArchived() ) {
			$topClass .= ' articleFeedbackv5-feedback-archive';
		}
		if ( !$toolbox ) {
			$topClass .= ' articleFeedbackv5-comment-notoolbox';
		}
		if ( $this->isPermalink ) {
			$topClass .= ' articleFeedbackv5-feedback-permalink';
		}
		if ( $this->isHighlighted ) {
			$topClass .= ' articleFeedbackv5-feedback-highlighted';
		}

		// Get the class for the comment wrap
		$wrapClass = 'articleFeedbackv5-comment-wrap articleFeedbackv5-comment-' . $this->getMood( $record );

		// Permalink info
		$permalinkInfo = '';
		if ( $this->isPermalink ) {
			$permalinkInfo = $this->renderPermalinkInfo( $record );
		}

		return Html::rawElement(
				'div',
				[
					'class' => $topClass,
					'data-id' => $record->aft_id,
					'data-pageid' => $record->aft_page
				],
				// {toolbox, e.g. feature, hide}
				$toolbox .
				// {gray mask, if applicable}
				$this->grayMask( $record ) .
				Html::rawElement( 'div', [ 'class' => 'articleFeedbackv5-comment-container' ],
					Html::rawElement( 'div', [ 'class' => $wrapClass ],
						// {feedback content}
						$content .
						// {footer links, e.g. helpful, abuse}
						$footer
					)
				)
			) .
			// {info section for permalinks}
			$permalinkInfo;
	}

	/**
	 * Gets whether this is a permalink
	 *
	 * @return bool whether this is a permalink
	 */
	public function getIsPermalink() {
		return $this->isPermalink;
	}

	/**
	 * Sets whether this is a permalink
	 *
	 * @param bool $isPermalink whether this is a permalink
	 * @return bool whether it passed validation and was set
	 */
	public function setIsPermalink( $isPermalink ) {
		$this->isPermalink = $isPermalink ? true : false;
		return true;
	}

	/**
	 * Gets whether this is on the central log
	 *
	 * @return bool whether this is on the central log
	 */
	public function getIsCentral() {
		return $this->isCentral;
	}

	/**
	 * Sets whether this is on the central log
	 *
	 * @param bool $isCentral whether this is on the central log
	 * @return bool whether it passed validation and was set
	 */
	public function setIsCentral( $isCentral ) {
		$this->isCentral = $isCentral ? true : false;
		return true;
	}

	/**
	 * Gets whether this is is a highlighted row
	 *
	 * @return bool whether this is is a highlighted row
	 */
	public function getIsHighlighted() {
		return $this->isHighlighted;
	}

	/**
	 * Sets whether this is is a highlighted row
	 *
	 * @param bool $isHighlighted whether this is is a highlighted row
	 * @return bool whether it passed validation and was set
	 */
	public function setIsHighlighted( $isHighlighted ) {
		$this->isHighlighted = $isHighlighted ? true : false;
		return true;
	}

	/**
	 * Sets a permission
	 *
	 * @param string $key the key
	 * @param bool $value whether that permission is on
	 * @return bool whether it passed validation and was set
	 */
	public function setPermission( $key, $value ) {
		if ( !isset( $this->permissions[$key] ) ) {
			return false;
		}
		$this->permissions[$key] = $value ? true : false;
		return true;
	}

	/**
	 * Returns whether a permission is on
	 *
	 * @param string $key the key
	 * @return bool whether the permission is on
	 */
	public function hasPermission( $key ) {
		if ( !isset( $this->permissions[$key] ) ) {
			return false;
		}
		return $this->permissions[$key];
	}

	/**
	 * @return User
	 */
	public function getUser(): User {
		return $this->user;
	}

	/**
	 * @param User $user
	 */
	public function setUser( User $user ): void {
		$this->user = $user;
	}

	/**
	 * Returns an empty gray mask
	 *
	 * @param ArticleFeedbackv5Model $record the record
	 * @return string the empty gray mask
	 */
	private function emptyGrayMask( $record ) {
		// hide or oversight?
		if ( $record->isOversighted() ) {
			$class = 'oversight';
		} elseif ( $record->isHidden() ) {
			$class = 'hide';
		} elseif ( $record->isInappropriate() ) {
			$class = 'inappropriate';
		} else {
			return '';
		}

		return Html::rawElement(
				'div',
				[ 'class' => "articleFeedbackv5-feedback articleFeedbackv5-feedback-$class articleFeedbackv5-feedback-emptymask" ],
				$this->grayMask( $record, true ) .
				Html::element( 'div', [ 'class' => 'articleFeedbackv5-comment-wrap' ] )
			);
	}

	/**
	 * Returns a gray mask
	 *
	 * @param ArticleFeedbackv5Model $record the record
	 * @param bool $empty whether the mask is empty; defaults to false
	 * @return string the gray mask
	 */
	private function grayMask( $record, $empty = false ) {
		if ( $record->isOversighted() ) {
			$type = 'oversight';
		} elseif ( $record->isHidden() ) {
			$type = 'hide';
		} elseif ( $record->isInappropriate() ) {
			$type = 'inappropriate';
		} else {
			return '';
		}

		$viewLink = '';
		if ( !$empty ) {
			$viewLink =
				Html::rawElement(
					'span',
					[ 'class' => 'articleFeedbackv5-mask-view' ],
					Html::rawElement(
						'a',
						[
							'href' => '#',
							'onclick' => 'return false;',
						],
						wfMessage( 'articlefeedbackv5-mask-view-contents' )->escaped()
					)
				);
		}

		$last = $record->getLastEditorActivity();
		if ( !$last ) {
			// if this happens, some data is corrupt
			return '';
		}

		return Html::rawElement(
				'div',
				[ 'class' => 'articleFeedbackv5-post-screen' ],
				Html::rawElement(
					'div',
					[ 'class' => 'articleFeedbackv5-mask-text-wrapper' ],
					Html::rawElement(
						'span',
						[ 'class' => 'articleFeedbackv5-mask-text' ],
						Html::rawElement(
							'span',
							[ 'class' => 'articleFeedbackv5-mask-info' ],
							ArticleFeedbackv5Utils::renderMaskLine(
								$type,
								$record->aft_id,
								$last->log_user,
								$last->log_timestamp
							)
						) .
						$viewLink
					)
				)
			);
	}

	/**
	 * Returns the mood of the feedback
	 *
	 * @param ArticleFeedbackv5Model $record the record
	 * @return string the mood (positive or negative)
	 */
	public function getMood( $record ) {
		return $record->aft_rating ? 'positive' : 'negative';
	}

	/**
	 * Returns the feedback head and comment
	 *
	 * @param ArticleFeedbackv5Model $record the record
	 * @return string the rendered feedback info
	 */
	private function render( $record ) {
		if ( $this->isCentral ) {
			$msg = 'articlefeedbackv5-central-header-left-comment';
		} else {
			$mood = $this->getMood( $record );

			if ( $mood == 'positive' ) {
				$msg = 'articlefeedbackv5-form1-header-found';
			} elseif ( $mood == 'negative' ) {
				$msg = 'articlefeedbackv5-form1-header-not-found';
			}
		}

		return $this->feedbackHead( $msg, $record ) .
			$this->renderComment( $record );
	}

	/**
	 * Returns the feedback head
	 *
	 * @param string $message the message key describing the nature of the
	 *                           feedback (e.g., "USER found what they were
	 *                           looking for")
	 * @param ArticleFeedbackv5 $record the record
	 * @return string the rendered feedback head
	 */
	private function feedbackHead( $message, $record ) {
		$anonMessage = '';
		$linkRender = MediaWikiServices::getInstance()->getLinkRenderer();

		// User info
		if ( $record->aft_user == 0 ) {
			// This is an anonymous (IP) user

			$title = SpecialPage::getTitleFor( 'Contributions', $record->aft_user_text );

			if ( IPUtils::isIPv4( $record->aft_user_text ) ) {
				// IPv4 - display the same way regular users are displayed

				// display name = visitor's ip
				$userName = $linkRender->makeLink( $title, $record->aft_user_text );
			} else {
				// not IPv4 - display IP on next line (since IPv6 is rather long, it'd break our display)

				// display name = "a reader" (without link to contributions)
				$userName = wfMessage( 'articlefeedbackv5-form-anon-username' )->escaped();

				// additional line to be printed with the IPv6 address (with link to contributions)
				$userLink = $linkRender->makeLink( $title, $record->aft_user_text );
				$anonMessage = wfMessage( 'articlefeedbackv5-form-anon-message' )->rawParams( $userLink )->escaped();
			}
		} else {
			// This is a logged in user

			// build link to user's page
			$title = Title::makeTitleSafe( NS_USER, $record->aft_user_text );

			// no user page = build link to user's contributions
			if ( !$title || !$title->exists() ) {
				$title = SpecialPage::getTitleFor( 'Contributions', $record->aft_user_text );
			}

			// display name = username
			$userName = $linkRender->makeLink( $title, $record->aft_user_text );
		}

		if ( $this->isCentral ) {
			$article = Title::newFromId( $record->aft_page );
			$centralPageName = MediaWikiServices::getInstance()->getSpecialPageFactory()
				->getLocalNameFor( 'ArticleFeedbackv5', $article->getPrefixedDBkey() );
			$feedbackCentralPageTitle = Title::makeTitle( NS_SPECIAL, $centralPageName, "$record->aft_id" );

			$userMessage = wfMessage( $message, $record->aft_user_text )
				->rawParams( $userName, $linkRender->makeKnownLink( $article ) )
				->params( $feedbackCentralPageTitle->getFullText() )
				->parse();
		} else {
			$userMessage = wfMessage( $message, $record->aft_user_text )->rawParams( $userName )->escaped();
		}

		// build messages
		$userMessage = Html::rawElement( 'h3', [], $userMessage );
		if ( $anonMessage ) {
			$anonMessage = Html::rawElement(
				'p',
				[ 'class' => 'articleFeedbackv5-comment-anon-message' ],
				$anonMessage
			);
		}

		return Html::rawElement(
				'div',
				[ 'class' => 'articleFeedbackv5-comment-head' ],
				$this->renderTagBlock( $record ) .
				$userMessage .
				$this->renderPermalinkTimestamp( $record ) .
				$anonMessage
			);
	}

	/**
	 * Returns the permalink/timestamp
	 *
	 * @param ArticleFeedbackv5Model $record the record
	 * @return string the rendered permalink/timestamp
	 */
	private function renderPermalinkTimestamp( $record ) {
		$title = Title::newFromId( $record->aft_page );
		$timestamp = new MWTimestamp( $record->aft_timestamp );

		// link to permalink page
		$permalink = '';
		if ( !$this->isPermalink ) {
			$permalink =
				wfMessage( 'pipe-separator' )->escaped() .
				Html::rawElement(
					'span',
					[ 'class' => 'articleFeedbackv5-comment-details-link' ],
					MediaWikiServices::getInstance()->getLinkRenderer()->makeLink(
						SpecialPage::getTitleFor( 'ArticleFeedbackv5', $title->getPrefixedDBkey() . '/' . $record->aft_id ),
						wfMessage( 'articlefeedbackv5-details-link' )->text()
					)
				);
		}

		return Html::rawElement(
				'span',
				[ 'class' => 'articleFeedbackv5-comment-details' ],
				Html::element(
					'span',
					[ 'class' => 'articleFeedbackv5-comment-details-date' ],
					$timestamp->getHumanTimestamp()
				) .
				$permalink
			);
	}

	/**
	 * Returns the marked-up feedback comment
	 *
	 * @param ArticleFeedbackv5Model $record the record
	 * @return string the rendered comment
	 */
	private function renderComment( $record ) {
		$id = $record->aft_id;
		$text = $record->aft_comment;

		// permalink should always display long version ;)
		$short = $this->isPermalink ? $text : RequestContext::getMain()->getLanguage()->truncateForVisual( $text, 250 );

		// If the short string is the same size as the original, no truncation
		// happened, so no controls are needed.  If it's longer, show the short
		// text, with the 'show more' control.
		$fullLengthToggle = '';
		if ( strlen( $short ) != strlen( $text ) ) {
			$title = Title::newFromID( $record->aft_page )->getPrefixedDBkey();

			$fullLengthToggle =
				Html::element(
					'span',
					[
						'class' => 'articleFeedbackv5-comment-full',
						'id' => "articleFeedbackv5-comment-full-$id"
					],
					$text
				) .
				Html::element(
					'a',
					[
						'href' => SpecialPage::getTitleFor( 'ArticleFeedbackv5', "$title/$id" )->getLinkURL(),
						'class' => 'articleFeedbackv5-comment-toggle',
						'id' => "articleFeedbackv5-comment-toggle-$id"
					],
					wfMessage( 'articlefeedbackv5-comment-more' )->text()
				);
		}

		// if no comment was entered, display message
		if ( $text == '' ) {
			$short = Linker::commentBlock( wfMessage( 'articlefeedbackv5-comment-empty' )->escaped() );
		} else {
			$short = Html::element( 'span',
				[
					'class' => 'articleFeedbackv5-comment-short',
					'id' => "articleFeedbackv5-comment-short-$id"
				],
				$short
			);
		}

		return Html::rawElement(
				'blockquote',
				[ 'dir' => 'auto' ],
				$short .
				$fullLengthToggle
			);
	}

	/**
	 * Returns the footer links
	 *
	 * @param ArticleFeedbackv5Model $record the record
	 * @return string the rendered footer
	 */
	private function renderFooter( $record ) {
		global $wgRequest;

		$id = $record->aft_id;
		$ownFeedback = ArticleFeedbackv5Utils::isOwnFeedback(
			$record,
			$this->getUser(),
			$wgRequest,
			true
		);

		$voteLinks = '';
		$voteStats = '';
		$abuseLink = '';
		$abuseStats = '';

		// Add helpful/unhelpful voting links (for posts other than your own)
		// only for readers; editors have more powerful tools
		if ( !$this->isAllowed( 'aft-editor' ) && !$ownFeedback ) {
			$voteLinks =
				Html::element(
					'span',
					[ 'class' => 'articleFeedbackv5-helpful-caption' ],
					wfMessage( 'articlefeedbackv5-form-helpful-label' )->text()
				) .
				Html::element(
					'a',
					[
						'id' => "articleFeedbackv5-helpful-link-$id",
						'class' => 'articleFeedbackv5-helpful-link',
						'href' => '#',
						'data-action' => 'helpful'
					],
					wfMessage( 'articlefeedbackv5-form-helpful-yes-label' )->text()
				) .
				Html::element(
					'a',
					[
						'id' => "articleFeedbackv5-unhelpful-link-$id",
						'class' => 'articleFeedbackv5-unhelpful-link',
						'href' => '#',
						'data-action' => 'unhelpful'
					],
					wfMessage( 'articlefeedbackv5-form-helpful-no-label' )->text()
				);

		// add helpful voting percentage for editors
		} elseif ( $this->isAllowed( 'aft-editor' ) ) {
			$percent =
				wfMessage( 'articlefeedbackv5-form-helpful-votes-percent' )
					->numParams(
						ArticleFeedbackv5Utils::percentHelpful(
							$record->aft_helpful,
							$record->aft_unhelpful
						)
					)->escaped();

			$counts =
				wfMessage( 'articlefeedbackv5-form-helpful-votes-count' )
					->numParams( $record->aft_helpful, $record->aft_unhelpful )
					->text();

			$votesClass = 'articleFeedbackv5-helpful-votes';
			if ( $record->aft_helpful + $record->aft_unhelpful > 0 ) {
				$votesClass .= ' articleFeedbackv5-has-votes';

				if ( $record->aft_helpful >= $record->aft_unhelpful ) {
					$votesClass .= ' articleFeedbackv5-votes-positive';
				} else {
					$votesClass .= ' articleFeedbackv5-votes-negative';
				}
			}

			$voteStats =
				Html::rawElement(
					'span',
					[
						'class' => $votesClass,
						'id' => "articleFeedbackv5-helpful-votes-$id",
						'title' => $counts
					],
					$percent
				);
		}

		// add abuse flagging (for posts other than your own)
		// only for readers; editors have more powerful tools
		if ( $this->isAllowed( 'aft-reader' ) && !$ownFeedback ) {
			global $wgArticleFeedbackv5AbusiveThreshold;

			if ( !$this->isAllowed( 'aft-editor' ) ) {
				$abuseLink =
					Html::element(
						'a',
						[
							'id'    => "articleFeedbackv5-flag-link-$id",
							'class' => 'articleFeedbackv5-flag-link',
							'title' => wfMessage( 'articlefeedbackv5-form-tooltip-flag' )->text(),
							'href'  => '#',
							'data-action'  => 'flag',
						],
						wfMessage(
							'articlefeedbackv5-form-flag'
						)->numParams(
							$record->aft_flag
						)->text()
					);

			// add count for editors
			} else {
				$aclass = 'articleFeedbackv5-abuse-count';
				if ( $record->aft_flag > 0 ) {
					$aclass .= ' articleFeedbackv5-has-abuse-flags';
				}
				if ( $record->aft_flag >= $wgArticleFeedbackv5AbusiveThreshold ) {
					$aclass .= ' abusive';
				}

				$abuseStats =
					Html::element(
						'span',
						[
							'id' => "articleFeedbackv5-abuse-count-$id",
							'class' => $aclass
						],
						wfMessage(
							'articlefeedbackv5-form-abuse-count'
						)->numParams(
							$record->aft_flag
						)->text()
					);
			}
		}

		$ownPost = '';
		if ( $ownFeedback && !$this->isAllowed( 'aft-editor' ) ) {
			// Add ability for readers to mark own posts as non-actionable, only
			// when we're certain that the feedback was posted by the current user
			if ( ArticleFeedbackv5Utils::isOwnFeedback( $record, $this->getUser(), $wgRequest, false ) ) {
				// get details on last editor action
				$last = $record->getLastEditorActivity();

				$action = '';
				if ( !$record->isNonActionable() ) {
					$action = 'noaction';
				// can not unmark a post someone else has marked as non-actionable!
				} elseif ( $last->log_user && $last->log_user == $this->getUser()->getId() ) {
					$action = 'unnoaction';
				}

				if ( $action ) {
					$ownPost =
						Html::rawElement(
							'div',
							[ 'class' => 'articleFeedbackv5-comment-foot-hide' ],
							Html::element(
								'a',
								[
									'id' => "articleFeedbackv5-$action-link-$id",
									'class' => "articleFeedbackv5-$action-link articleFeedbackv5-$action-own-link",
									// Give grep a chance to find the usages:
									// articlefeedbackv5-form-tooltip-noaction-own, articlefeedbackv5-form-tooltip-unnoaction-own
									'title' => wfMessage( "articlefeedbackv5-form-tooltip-$action-own" )->text(),
									'href' => '#',
									'data-action' => $action,
								],
								// Give grep a chance to find the usages:
								// articlefeedbackv5-form-noaction-own, articlefeedbackv5-form-unnoaction-own
								wfMessage( "articlefeedbackv5-form-$action-own" )->text()
							)
						);
				}

			// display message they can't monitor own feedback
			} else {
				$ownPost .=
					Html::element(
						'p',
						[ 'class' => 'articleFeedbackv5-form-own-feedback' ],
						wfMessage( 'articlefeedbackv5-form-own-feedback' )->text()
					);
			}
		}

		return Html::rawElement(
				'div',
				[ 'class' => 'articleFeedbackv5-vote-wrapper' ],
				Html::rawElement(
					'div',
					[ 'class' => 'articleFeedbackv5-comment-foot-helpful' ],
					$voteLinks . $voteStats
				) .
				Html::rawElement(
					'div',
					[ 'class' => 'articleFeedbackv5-comment-foot-abuse' ],
					$abuseLink . $abuseStats
				) .
				$ownPost .
				Html::element( 'div', [ 'class' => 'articleFeedbackv5-clear' ] )
			);
	}

	/**
	 * Returns the tag block
	 *
	 * @param ArticleFeedbackv5Model $record The record
	 * @return string The rendered tag block
	 */
	private function renderTagBlock( $record ) {
		$last = $record->getLastEditorActivity();
		if ( !$last ) {
			return '';
		}

		// Give grep a chance to find the usages:
		// articlefeedbackv5-new-marker, articlefeedbackv5-oversight-marker, articlefeedbackv5-autohide-marker,
		// articlefeedbackv5-hide-marker, articlefeedbackv5-feature-marker, articlefeedbackv5-resolve-marker,
		// articlefeedbackv5-noaction-marker, articlefeedbackv5-inappropriate-marker, articlefeedbackv5-archive-marker
		return Html::rawElement(
			'div',
			[ 'class' => 'articleFeedbackv5-comment-tags' ],
			Html::element(
				'span',
				[ 'class' => "articleFeedbackv5-$last->log_action-marker" ],
				wfMessage( "articlefeedbackv5-$last->log_action-marker" )->text()
			)
		);
	}

	/**
	 * Returns the toolbox
	 *
	 * @param ArticleFeedbackv5Model $record the record
	 * @return string the rendered toolbox
	 */
	private function renderToolbox( $record ) {
		// check if people are allowed to perform actions
		if ( !$this->isAllowed( 'aft-editor' ) ) {
			return '';
		}

		global $wgRequest;

		$ownFeedback = ArticleFeedbackv5Utils::isOwnFeedback( $record, $this->getUser(), $wgRequest, true );
		$toolbox = '';

		// no editor-action has yet been performed, show tools
		if ( !$record->isFeatured() &&
			!$record->isResolved() &&
			!$record->isNonActionable() &&
			!$record->isInappropriate() &&
			!$record->isArchived() &&
			!$record->isHidden() &&
			!$record->isOversighted()
		) {
			$tools =
				( $ownFeedback ? '' : $this->buildToolboxLink( $record, 'feature' ) ) .
				$this->buildToolboxLink( $record, 'resolve' ) .
				$this->buildToolboxLink( $record, 'noaction' ) .
				$this->buildToolboxLink( $record, 'inappropriate' );

			if ( $tools ) {
				$message = ( $ownFeedback ? 'articlefeedbackv5-form-own-toolbox-label' : 'articlefeedbackv5-form-toolbox-label' );
				$toolbox .=
					Html::element(
						'p',
						[ 'class' => 'articleFeedbackv5-form-toolbox-label' ],
						wfMessage( $message )->text()
					) .
					Html::rawElement(
						'ul',
						[ 'id' => "articleFeedbackv5-feedback-tools-list-$record->aft_id" ],
						$tools
				);
			}

		// editor-action already performed; display "undo" + details
		} else {
			// get details on last editor action
			$last = $record->getLastEditorActivity();

			// it shouldn't even be possible that $last contains nothing, but hey
			if ( $last ) {
				$tools = '';

				// undo-link
				$tools .= $this->buildToolboxLink( $record, "un$last->log_action" );

				// if feedback is featured, it should still be resolvable in 1 click
				if ( $record->isFeatured() && !$record->isResolved() ) {
					$tools .= $this->buildToolboxLink( $record, 'resolve' );
				}

				// build discussion tools
				$discussType = '';
				$discussPage = false;
				if ( $record->isFeatured() ) {
					// discuss on talk page
					$discussType = 'talk';
					$discussPage = $record->getArticle()->getTitle()->getTalkPage();
				} elseif ( $record->getUser() ) {
					// contact user
					$discussType = 'user';
					$discussPage = $record->getUser()->getTalkPage();
				}

				if ( $discussPage ) {
					$lang = RequestContext::getMain()->getLanguage();
					// Give grep a chance to find the usages:
					// articlefeedbackv5-discuss-talk-section-title, articlefeedbackv5-discuss-user-section-title
					$sectionTitle = wfMessage( "articlefeedbackv5-discuss-$discussType-section-title" )
						->params( $record->aft_comment, $record->getArticle()->getTitle() )
						->inContentLanguage()
						->text();
					$sectionTitleTruncated = $lang->truncateForVisual( $sectionTitle, 60 );

					$title = Title::newFromId( $record->aft_page )->getPrefixedDBkey();
					$userText = $record->aft_user_text; // anon users
					if ( $record->getUser() ) {
						$userText = '[[' . $record->getUser()->getUserPage()->getPrefixedDBKey() . '|]]'; // link to user page
					}

					if ( strlen( $sectionTitle ) != strlen( $sectionTitleTruncated ) ) {
						/*
						 * Truncate the title even further - this was added to make sure
						 * that we don't truncate at 48chars when there are only 50 total.
						 */
						$sectionTitleTruncated = $lang->truncateForVisual( $sectionTitle, 48 );
					}
					// Give grep a chance to find the usages:
					// articlefeedbackv5-discuss-talk-section-content, articlefeedbackv5-discuss-user-section-content
					$sectionContent = wfMessage( "articlefeedbackv5-discuss-$discussType-section-content" )
						->inContentLanguage()
						->params(
							$userText,
							SpecialPage::getTitleFor( 'ArticleFeedbackv5', "$title/$record->aft_id" ),
							$lang->userDate( $record->aft_timestamp, $this->getUser() ),
							$lang->userTime( $record->aft_timestamp, $this->getUser() ),
							SpecialPage::getTitleFor( 'ArticleFeedbackv5', $title ),
							Message::rawParam( Html::element( 'blockquote', [], $record->aft_comment ) ),
							$record->getArticle()->getTitle()
						)
						->text();

					$sectionExists = ( $record->aft_discuss == $discussType );

					if ( $sectionExists ) {
						$sectionAnchor = Sanitizer::normalizeSectionNameWhitespace( $sectionTitleTruncated );
						$sectionAnchor = Sanitizer::escapeId( $sectionAnchor );

						$discussLink = $discussPage->getLinkURL() . '#' . $sectionAnchor;
					} else {
						$discussLink = $discussPage->getLinkURL(
							[
								'action' => 'edit',
								'section' => 'new',
								'preloadtitle' => $sectionTitleTruncated,
								'articleFeedbackv5_discuss_id' => $record->aft_id,
								'articleFeedbackv5_discuss_page' => $record->aft_page,
								'articleFeedbackv5_discuss_type' => $discussType,
							]
						);
					}

					$action = 'discuss';
					$class = "articleFeedbackv5-$action-link articleFeedbackv5-$action-$discussType-link";
					if ( $sectionExists ) {
						$class .= " articleFeedbackv5-$action-exists-link";
					}

					$tools .= Html::rawElement(
						'li',
						[],
						Html::element(
							'a',
							[
								'id' => "articleFeedbackv5-$action-link-$record->aft_id",
								'class' => $class,
								// Give grep a chance to find the usages:
								// articlefeedbackv5-form-tooltip-discuss-talk, articlefeedbackv5-form-tooltip-discuss-user
								'title' => wfMessage( "articlefeedbackv5-form-tooltip-$action-$discussType" )->text(),
								'href' => $discussLink,
								'data-action' => $action,
								// expose some additional details to JS
								'data-type' => $discussType,
								'data-section-exists' => (int)$sectionExists,
								'data-section-title' => $sectionTitleTruncated,
								'data-section-content' => $sectionContent,
								'data-section-edittime' => wfTimestampNow(),
								'data-section-edittoken' => $this->getUser()->getEditToken(),
								'data-section-watchlist' => (int)$this->getUser()->isWatched( $discussPage )
							],
							// Give grep a chance to find the usages:
							// articlefeedbackv5-form-discuss-talk, articlefeedbackv5-form-discuss-user,
							// articlefeedbackv5-form-discuss-talk-exists, articlefeedbackv5-form-discuss-user-exists
							wfMessage( "articlefeedbackv5-form-$action-$discussType" . ( $sectionExists ? '-exists' : '' ) )->text()
						)
					);
				}

				// hide (monitors & oversighters), request (monitors), oversight & decline (oversighters)
				if ( $record->isInappropriate() || $record->isHidden() || $record->isOversighted() ) {
					if ( $this->isAllowed( 'aft-monitor' ) ) {
						if ( !$record->isHidden() && !$record->isOversighted() ) {
							$tools .= $this->buildToolboxLink( $record, 'hide', 'articleFeedbackv5-tipsy-link' );
						} else {
							// unhide will have been built through "un$last->log_action" already ;)
						}

						if ( !$this->isAllowed( 'aft-oversighter' ) ) {
							/*
							 * Request oversight.
							 *
							 * When requested by this user already, it will be transformed into an unrequest
							 * link through JS. When the request has been declined already, add a class to
							 * make sure this user knows about it & is no longer capable to request for this entry.
							 */
							$class = $record->isDeclined() ? 'inactive' : '';
							$tools .= $this->buildToolboxLink( $record, 'request', "articleFeedbackv5-tipsy-link $class" );
						}
					}

					if ( $this->isAllowed( 'aft-oversighter' ) ) {
						if ( !$record->isOversighted() ) {
							// decline oversight request
							if ( $record->isRequested() || $record->isDeclined() ) {
								$class = $record->isDeclined() ? 'inactive' : '';
								$tools .= $this->buildToolboxLink( $record, 'decline', $class );
							}

							$tools .= $this->buildToolboxLink( $record, 'oversight', 'articleFeedbackv5-tipsy-link' );
						} else {
							// unoversight will have been built through "un$last->log_action" already ;)
						}
					}
				}

				$note = '';
				// if current user is the one who performed the action, add a link to
				// leave a note to clarify why the action was performed
				if ( $last->log_comment == '' && $last->log_user && $last->log_user == $this->getUser()->getId() ) {
					$note .=
						Html::element(
							'a',
							[
								'id' => "articleFeedbackv5-note-link-$record->aft_id",
								'class' => 'articleFeedbackv5-tipsy-link articleFeedbackv5-note-link', // tipsy for given data-action will be loaded when clicked
								'title' => wfMessage( 'articlefeedbackv5-form-tooltip-note' )->text(),
								'href' => '#',
								'data-action' => $last->log_action,
								'data-log-id' => $last->log_id,
							],
							wfMessage( 'articlefeedbackv5-form-note' )->text()
						);
				} elseif ( $last->log_comment ) {
					$note .= Html::rawElement(
						'span',
						[ 'class' => "articleFeedbackv5-note-added" ],
						wfMessage( 'articlefeedbackv5-form-note-added' )->parse()
					);
				}

				$toolbox .=
					// performer/action info
					// Give grep a chance to find the usages:
					// articlefeedbackv5-short-status-request, articlefeedbackv5-short-status-unrequest,
					// articlefeedbackv5-short-status-decline, articlefeedbackv5-short-status-autohide,
					// articlefeedbackv5-short-status-oversight, articlefeedbackv5-short-status-unoversight,
					// articlefeedbackv5-short-status-unflag, articlefeedbackv5-short-status-flag,
					// articlefeedbackv5-short-status-autoflag, articlefeedbackv5-short-status-feature,
					// articlefeedbackv5-short-status-unfeature, articlefeedbackv5-short-status-resolve,
					// articlefeedbackv5-short-status-unresolve, articlefeedbackv5-short-status-noaction,
					// articlefeedbackv5-short-status-unnoaction, articlefeedbackv5-short-status-inappropriate,
					// articlefeedbackv5-short-status-uninappropriate, articlefeedbackv5-short-status-hide,
					// articlefeedbackv5-short-status-unhide, articlefeedbackv5-short-status-archive,
					// articlefeedbackv5-short-status-unarchive, articlefeedbackv5-short-status-helpful,
					// articlefeedbackv5-short-status-undo-helpful, articlefeedbackv5-short-status-unhelpful,
					// articlefeedbackv5-short-status-undo-unhelpful
					Html::rawElement(
						'div',
						[ 'class' => "articleFeedbackv5-feedback-tools-details" ],

						Html::rawElement(
							'p',
							[ 'class' => "articleFeedbackv5-activity-short-status" ],

							// performer/action info
							wfMessage( "articlefeedbackv5-short-status-$last->log_action" )
								->rawParams( ArticleFeedbackv5Utils::getUserLink( $last->log_user, $last->log_user_text ) )
								->parse()
						) .

						// link to add note
						$note .

						// link for activity log popup
						Html::element(
							'a',
							[
								'id' => "articleFeedbackv5-activity-link-$record->aft_id",
								'class' => 'articleFeedbackv5-tipsy-link articleFeedbackv5-activity-link', // tipsy for given data-action will be loaded when clicked
								'href' => '#',
								'data-action' => 'activity',
							],
							wfMessage( 'articlefeedbackv5-viewactivity' )->text()
						) .

						// tools (undo & possibly oversight-related actions)
						Html::rawElement(
							'ul',
							[ 'id' => "articleFeedbackv5-feedback-tools-list-$record->aft_id" ],
							$tools
						)
					);
			}
		}

		return Html::rawElement(
				'div',
				[
					'class' => 'articleFeedbackv5-feedback-tools',
					'id' => "articleFeedbackv5-feedback-tools-$record->aft_id"
				],
				$toolbox
			);
	}

	/**
	 * Returns the permalink info section
	 *
	 * @param array $record the record, with keys 0 + answers
	 * @return string the rendered info section
	 */
	private function renderPermalinkInfo( $record ) {
		if ( !$this->isAllowed( 'aft-editor' ) ) {
			return '';
		}

		$context = RequestContext::getMain();
		$lang = $context->getLanguage();

		// Metadata section
		$metadata =
			Html::rawElement(
				'div',
				[ 'class' => 'articleFeedbackv5-feedback-permalink-meta' ],
				Html::rawElement(
					'p',
					[],
					wfMessage( 'articlefeedbackv5-permalink-info-post-id' )
						->params( $record->aft_id )
						->escaped()
				) .
				Html::rawElement(
					'p',
					[],
					// Give grep a chance to find the usages:
					// articlefeedbackv5-permalink-written-by-reader, articlefeedbackv5-permalink-written-by-editor
					wfMessage( 'articlefeedbackv5-permalink-written-by-' . ( $record->aft_user == 0 ? 'reader' : 'editor' ) )
						->params( $record->getExperiment() )
						->parse()
				) .
				Html::rawElement(
					'p',
					[],
					wfMessage( 'articlefeedbackv5-permalink-info-posted' )
						->params(
							$lang->userDate( $record->aft_timestamp, $this->getUser() ),
							$lang->userTime( $record->aft_timestamp, $this->getUser() )
						)
						->escaped()
				) .
				Html::rawElement(
					'p',
					[ 'class' => 'articleFeedbackv5-old-revision' ],
					MediaWikiServices::getInstance()->getLinkRenderer()->makeLink(
						Title::newFromID( $record->aft_page ),
						wfMessage( 'articlefeedbackv5-permalink-info-revision-link' )->text(),
						[],
						[ 'oldid' => $record->aft_page_revision ]
					)
				)
			);

		$comment = '';
		if ( $record->aft_comment ) {
			$comment .=
				Html::rawElement(
					'dt',
					[],
					wfMessage( 'articlefeedbackv5-permalink-info-stats-title-length' )->escaped()
				) .
				Html::rawElement(
					'dd',
					[],
					wfMessage(
						'articlefeedbackv5-permalink-info-length-words',
						$this->str_word_count_utf8( $record->aft_comment )
					)->escaped() .
					'&nbsp;' .
					Html::rawElement(
						'span',
						[],
						wfMessage(
							'articlefeedbackv5-permalink-info-length-characters',
							mb_strlen( $record->aft_comment )
						)->escaped()
					)
				);
		}

		// Stats section
		$relevance = $record->aft_relevance_score;
		$helpfulness = $record->aft_helpful - $record->aft_unhelpful;
		$stats =
			Html::rawElement(
				'dl',
				[ 'class' => 'articleFeedbackv5-feedback-permalink-stats' ],
				$comment .
				Html::rawElement(
					'dt',
					[],
					wfMessage( 'articlefeedbackv5-permalink-info-stats-title-scores' )->escaped()
				) .
				Html::rawElement(
					'dd',
					[ 'class' => 'articleFeedbackv5-feedback-permalink-scores' ],
					Html::rawElement(
						'dl',
						[],
						Html::rawElement(
							'dt',
							[],
							wfMessage( 'articlefeedbackv5-permalink-info-stats-subtitle-relevance' )->escaped()
						) .
						Html::element(
							'dd',
							[],
							$relevance > 0 ? '+' . $relevance : $relevance
						) .
						Html::rawElement(
							'dt',
							[],
							wfMessage( 'articlefeedbackv5-permalink-info-stats-subtitle-helpfulness' )->escaped()
						) .
						Html::element(
							'dd',
							[],
							$helpfulness > 0 ? '+' . $helpfulness : $helpfulness
						)
					)
				)
			);

		// Activity section
		$last = $this->getLastActivity( $record );
		if ( $last ) {
			$timestamp = new MWTimestamp( $last->log_timestamp );

			$notes = '';
			if ( $last->log_comment ) {
				$notes .=
					Html::rawElement(
						'span',
						[ 'class' => 'articlefeedbackv5-permalink-last-action-comment' ],
						Linker::formatComment( $last->log_comment )
					);
			}

			// Give grep a chance to find the usages:
			// articlefeedbackv5-permalink-status-request, articlefeedbackv5-permalink-status-unrequest,
			// articlefeedbackv5-permalink-status-decline, articlefeedbackv5-permalink-status-autohide,
			// articlefeedbackv5-permalink-status-oversight, articlefeedbackv5-permalink-status-unoversight,
			// articlefeedbackv5-permalink-status-flag, articlefeedbackv5-permalink-status-unflag,
			// articlefeedbackv5-permalink-status-autoflag, articlefeedbackv5-permalink-status-feature,
			// articlefeedbackv5-permalink-status-unfeature, articlefeedbackv5-permalink-status-resolve,
			// articlefeedbackv5-permalink-status-unresolve, articlefeedbackv5-permalink-status-noaction,
			// articlefeedbackv5-permalink-status-unnoaction, articlefeedbackv5-permalink-status-inappropriate,
			// articlefeedbackv5-permalink-status-uninappropriate, articlefeedbackv5-permalink-status-archive,
			// articlefeedbackv5-permalink-status-unarchive, articlefeedbackv5-permalink-status-hide,
			// articlefeedbackv5-permalink-status-unhide, articlefeedbackv5-permalink-status-helpful,
			// articlefeedbackv5-permalink-status-undo-helpful, articlefeedbackv5-permalink-status-unhelpful,
			// articlefeedbackv5-permalink-status-undo-unhelpful
			$activity =
				Html::rawElement(
					'p',
					[ 'class' => 'articleFeedbackv5-feedback-permalink-activity-status' ],
					Html::element(
						'span',
						[ 'class' => 'articlefeedbackv5-permalink-last-action' ],
						wfMessage( 'articlefeedbackv5-permalink-last-action' )->text()
					) .
					Html::rawElement(
						'span',
						[ 'class' => 'articleFeedbackv5-feedback-permalink-status articleFeedbackv5-laststatus-' . $last->log_action ],
						wfMessage( 'articlefeedbackv5-permalink-status-' . $last->log_action )
							->rawParams( ArticleFeedbackv5Utils::getUserLink( $last->log_user, $last->log_user_text ) )
							->params( $timestamp->getHumanTimestamp() )
							->parse()
					) .
					$notes
				) .
				Html::rawElement(
					'p',
					[ 'class' => 'articleFeedbackv5-feedback-permalink-activity-more' ],
					Html::rawElement(
						'a',
						[
							'href' => '#',
							'class' => 'articleFeedbackv5-activity2-link', // tipsy for given data-action will be loaded when clicked
							'data-action' => 'activity2'
						],
						wfMessage( 'articlefeedbackv5-permalink-activity-more' )->escaped()
					)
				) .
				Html::element(
					'div',
					[ 'id' => 'articleFeedbackv5-permalink-activity-log' ]
				);
		} else {
			$activity =
				Html::rawElement(
					'p',
					[ 'class' => 'articleFeedbackv5-feedback-permalink-activity-none' ],
					wfMessage( 'articlefeedbackv5-permalink-activity-none' )->escaped()
				);
		}

		// Frame and return
		return Html::rawElement(
				'div',
				[ 'id' => 'articleFeedbackv5-feedback-permalink-info' ],
				Html::rawElement(
					'div',
					[ 'class' => 'articleFeedbackv5-feedback-permalink-about' ],
					Html::rawElement(
						'h4',
						[],
						wfMessage( 'articlefeedbackv5-permalink-info-title' )->escaped()
					) .
					$metadata .
					$stats
				) .
				Html::rawElement(
					'div',
					[ 'class' => 'articleFeedbackv5-feedback-permalink-activity' ],
					Html::rawElement(
						'h4',
						[],
						wfMessage( 'articlefeedbackv5-permalink-activity-title' )->escaped() .
						Html::rawElement(
							'span',
							[],
							wfMessage( 'articlefeedbackv5-permalink-activity-subtitle' )
								->params( ArticleFeedbackv5Activity::getActivityCount( $record, $this->getUser() ) )
								->escaped()
						)
					) .
					$activity
				)
			);
	}

	/**
	 * Will build the link to perform a certain action
	 *
	 * @param ArticleFeedbackv5Model $record
	 * @param string $action
	 * @param string $class [optional] Additional class to add
	 * @return string
	 */
	private function buildToolboxLink( $record, $action, $class = '' ) {
		global $wgRequest;
		// check if user is allowed to perform this action
		if ( !isset( ArticleFeedbackv5Activity::$actions[$action] ) ||
			!ArticleFeedbackv5Activity::canPerformAction( $action, $this->getUser() ) ) {
			return '';
		}

		$ownFeedback = ArticleFeedbackv5Utils::isOwnFeedback( $record, $this->getUser(), $wgRequest, true );
		$class .= " articleFeedbackv5-$action-link";
		$class .= ( $ownFeedback ? " articleFeedbackv5-$action-own-link" : '' );

		// Give grep a chance to find the usages:
		// articlefeedbackv5-form-tooltip-note, articlefeedbackv5-form-tooltip-feature,
		// articlefeedbackv5-form-tooltip-unfeature, articlefeedbackv5-form-tooltip-resolve,
		// articlefeedbackv5-form-tooltip-unresolve, articlefeedbackv5-form-tooltip-noaction,
		// articlefeedbackv5-form-tooltip-unnoaction, articlefeedbackv5-form-tooltip-inappropriate,
		// articlefeedbackv5-form-tooltip-uninappropriate, articlefeedbackv5-form-tooltip-hide,
		// articlefeedbackv5-form-tooltip-unhide, articlefeedbackv5-form-tooltip-hide-own,
		// articlefeedbackv5-form-tooltip-unhide-own, articlefeedbackv5-form-tooltip-archive,
		// articlefeedbackv5-form-tooltip-unarchive, articlefeedbackv5-form-tooltip-flag,
		// articlefeedbackv5-form-tooltip-oversight, articlefeedbackv5-form-tooltip-unoversight,
		// articlefeedbackv5-form-tooltip-request, articlefeedbackv5-form-tooltip-unrequest,
		// articlefeedbackv5-form-tooltip-decline, articlefeedbackv5-form-tooltip-discuss-talk,
		// articlefeedbackv5-form-tooltip-discuss-user
		// Give grep a chance to find the usages:
		// articlefeedbackv5-form-note, articlefeedbackv5-form-feature, articlefeedbackv5-form-unfeature,
		// articlefeedbackv5-form-resolve, articlefeedbackv5-form-unresolve, articlefeedbackv5-form-noaction,
		// articlefeedbackv5-form-unnoaction, articlefeedbackv5-form-inappropriate, articlefeedbackv5-form-uninappropriate,
		// articlefeedbackv5-form-hide, articlefeedbackv5-form-unhide, articlefeedbackv5-form-hide-own,
		// articlefeedbackv5-form-unhide-own, articlefeedbackv5-form-archive, articlefeedbackv5-form-unarchive,
		// articlefeedbackv5-form-flag, articlefeedbackv5-form-oversight, articlefeedbackv5-form-unoversight,
		// articlefeedbackv5-form-request, articlefeedbackv5-form-unrequest, articlefeedbackv5-form-decline,
		// articlefeedbackv5-form-discuss-talk, articlefeedbackv5-form-discuss-user
		return Html::rawElement(
			'li',
			[],
			Html::element(
				'a',
				[
					'id' => "articleFeedbackv5-$action-link-$record->aft_id",
					'class' => $class,
					'title' => wfMessage( "articlefeedbackv5-form-tooltip-$action" )->text(),
					'href' => '#',
					'data-action' => $action,
				],
				wfMessage( "articlefeedbackv5-form-$action" )->text()
			)
		);
	}

	/**
	 * @param ArticleFeedbackv5Model $record
	 * @return \Wikimedia\Rdbms\IResultWrapper|bool
	 */
	public function getLastActivity( ArticleFeedbackv5Model $record ) {
		foreach ( ArticleFeedbackv5Activity::getList( $record, $this->getUser(), 1 ) as $last ) {
			return $last;
		}
		return false;
	}

	/**
	 * Returns whether an action is allowed
	 *
	 * @param string $permission User right name
	 * @return bool whether it's allowed
	 */
	public function isAllowed( $permission ) {
		return $this->getUser()->isAllowed( $permission ) && !$this->getUser()->isBlocked();
	}

	/**
	 * UTF-8 friendlier version of PHP's str_word_count() function by
	 * php dot net at salagir dot com
	 *
	 * @see https://www.php.net/manual/en/function.str-word-count.php#122242
	 * @see https://phabricator.wikimedia.org/T60280
	 *
	 * @param string $str Input string
	 * @return int Calculated word count
	 */
	private function str_word_count_utf8( $str ) {
		$a = preg_split( '/\W+/u', $str, -1, PREG_SPLIT_NO_EMPTY );
		return count( $a );
	}
}
