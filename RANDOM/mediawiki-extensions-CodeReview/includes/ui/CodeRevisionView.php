<?php

use MediaWiki\MediaWikiServices;

/**
 * Special:Code/MediaWiki/40696
 */
class CodeRevisionView extends CodeView {
	protected $showButtonsFormatReference = false, $showButtonsFormatSignoffs = false;
	protected $referenceInputName = '';
	protected $user;

	/**
	 * @param string|CodeRepository $repo
	 * @param string|CodeRevision $rev
	 * @param User $user
	 * @param null $replyTarget
	 */
	public function __construct( $repo, $rev, User $user, $replyTarget = null ) {
		parent::__construct( $repo );
		global $wgRequest;

		$this->user = $user;
		if ( $rev instanceof CodeRevision ) {
			$this->mRevId = $rev->getId();
			$this->mRev = $rev;
		} else {
			$this->mRevId = intval( ltrim( $rev, 'r' ) );
			$this->mRev = $this->mRepo
				? $this->mRepo->getRevision( $this->mRevId )
				: null;
		}

		$this->mPreviewText = false;
		# Search path for navigation links
		$this->mPath = trim( $wgRequest->getVal( 'path' ) );
		if ( strlen( $this->mPath ) && $this->mPath[0] !== '/' ) {
			$this->mPath = "/{$this->mPath}"; // make sure this is a valid path
		}
		# URL params...
		$this->mAddTags = $wgRequest->getText( 'wpTag' );
		$this->mRemoveTags = $wgRequest->getText( 'wpRemoveTag' );
		$this->mStatus = $wgRequest->getText( 'wpStatus' );
		$this->jumpToNext = $wgRequest->getCheck( 'wpSaveAndNext' )
			|| $wgRequest->getCheck( 'wpNext' );
		$this->mReplyTarget = $replyTarget ?
			(int)$replyTarget : $wgRequest->getIntOrNull( 'wpParent' );
		$this->text = $wgRequest->getText( "wpReply{$this->mReplyTarget}" );
		$this->mSkipCache = ( $wgRequest->getVal( 'action' ) == 'purge' );
		# Make tag arrays
		$this->mAddTags = $this->splitTags( $this->mAddTags );
		$this->mRemoveTags = $this->splitTags( $this->mRemoveTags );
		$this->mSignoffFlags = $wgRequest->getCheck( 'wpSignoff' ) ?
			$wgRequest->getArray( 'wpSignoffFlags' ) : [];
		$this->mSelectedSignoffs = $wgRequest->getArray( 'wpSignoffs' );
		$this->mStrikeSignoffs = $wgRequest->getCheck( 'wpStrikeSignoffs' ) ?
			$this->mSelectedSignoffs : [];

		$this->mAddReferences = $wgRequest->getCheck( 'wpAddReferencesSubmit' )
				? $this->stringToRevList( $wgRequest->getText( 'wpAddReferences' ) )
				: [];

		$this->mRemoveReferences = $wgRequest->getCheck( 'wpRemoveReferences' ) ?
			$wgRequest->getIntArray( 'wpReferences', [] ) : [];

		$this->mAddReferenced = $wgRequest->getCheck( 'wpAddReferencedSubmit' )
				? $this->stringToRevList( $wgRequest->getText( 'wpAddReferenced' ) )
				: [];

		$this->mRemoveReferenced = $wgRequest->getCheck( 'wpRemoveReferenced' ) ?
				$wgRequest->getIntArray( 'wpReferenced', [] ) : [];
	}

	/**
	 * @param string $item
	 * @return int
	 */
	private function ltrimIntval( $item ) {
		$item = ltrim( trim( $item ), 'r' );
		return intval( $item );
	}

	/**
	 * @param string $input
	 * @return array
	 */
	private function stringToRevList( $input ) {
		return array_map( [ $this, 'ltrimIntval' ], explode( ',', $input ) );
	}

	public function execute() {
		global $wgOut, $wgLang;
		if ( !$this->mRepo ) {
			$view = new CodeRepoListView();
			$view->execute();
			return;
		}
		if ( !$this->mRev ) {
			if ( $this->mRevId !== 0 ) {
				$wgOut->addWikiMsg( 'code-rev-not-found', $this->mRevId );
			}

			$view = new CodeRevisionListView( $this->mRepo->getName() );
			$view->execute();
			return;
		}
		if ( $this->mStatus == '' ) {
			$this->mStatus = $this->mRev->getStatus();
		}

		$redirectOnPost = $this->checkPostings();
		if ( $redirectOnPost ) {
			$wgOut->redirect( $redirectOnPost );
			return;
		}

		$user = $this->user;

		$pageTitle = $this->mRepo->getName() . wfMessage( 'word-separator' )->text() .
			$this->mRev->getIdString();
		$htmlTitle = $this->mRev->getIdString() . wfMessage( 'word-separator' )->text() .
			$this->mRepo->getName();
		$wgOut->setPageTitle( wfMessage( 'code-rev-title', $pageTitle ) );
		$wgOut->setHTMLTitle( wfMessage( 'code-rev-title', $htmlTitle ) );

		$linkRenderer = \MediaWiki\MediaWikiServices::getInstance()->getLinkRenderer();
		$repoLink = $linkRenderer->makeLink(
			SpecialPage::getTitleFor( 'Code', $this->mRepo->getName() ),
			$this->mRepo->getName()
		);
		$revText = $this->navigationLinks();
		$paths = '';
		$modifiedPaths = $this->mRev->getModifiedPaths();
		foreach ( $modifiedPaths as $row ) {
			// Don't output NOOP paths
			if ( strtolower( $row->cp_action ) == 'n' ) {
				continue;
			}
			$paths .= $this->formatPathLine( $row->cp_path, $row->cp_action );
		}
		if ( $paths ) {
			$paths = "<div class='mw-codereview-paths mw-content-ltr'><ul>\n$paths</ul></div>\n";
		}
		$comments = $this->formatComments( $user );
		$commentsLink = '';
		if ( $comments ) {
			$commentsLink = " (<a href=\"#code-comments\">" .
				wfMessage( 'code-comments' )->escaped() . "</a>)\n";
		}
		$fields = [
			'code-rev-repo' => $repoLink,
			'code-rev-rev' => $revText,
			'code-rev-date' => $wgLang->timeanddate( $this->mRev->getTimestamp(), true ),
			'code-rev-author' => $this->authorLink( $this->mRev->getAuthor() ),
			'code-rev-status' => $this->statusForm() . $commentsLink,
			'code-rev-tags' => $this->tagForm(),
			'code-rev-message' => Html::rawElement( 'div', [ 'class' => 'mw-codereview-message' ],
				$this->formatMessage( $this->mRev->getMessage() ) ),
			'code-rev-paths' => $paths,
		];
		$special = SpecialPage::getTitleFor( 'Code',
			$this->mRepo->getName() . '/' . $this->mRev->getId() );

		$html = '';
		if ( $this->mPath != '' ) {
			$links = [];
			foreach ( explode( '|', $this->mPath ) as $path ) {
				$links[] = $linkRenderer->makeLink(
					SpecialPage::getTitleFor( 'Code', $this->mRepo->getName() ),
					$path,
					[],
					[ 'path' => $path ]
				);
			}
			$html .= wfMessage( 'code-browsing-path' )->rawParams( $wgLang->commaList( $links ) )
				->parseAsBlock();
		}
		# Output form
		$html .= Xml::openElement( 'form',
			[ 'action' => $special->getLocalURL(), 'method' => 'post' ] );

		$canPostComments = $this->canPostComments( $user );
		if ( $canPostComments ) {
			$html .= $this->addActionButtons();
		}

		$html .= $this->formatMetaData( $fields );
		# Output diff
		if ( $this->mRev->isDiffable() ) {
			$diffHtml = $this->formatDiff();
			// @todo FIXME: Hard coded brackets.
			// Even in the cases of DIFFRESULT_TooManyPaths or too large,
			// users can purge the diff to regenerate it after the relevant
			// variables have been changed
			$html .=
				"<h2>" . wfMessage( 'code-rev-diff' )->escaped() .
				' <small>[' . $linkRenderer->makeLink(
					$special,
					wfMessage( 'code-rev-purge-link' )->text(),
					[],
					[ 'action' => 'purge' ]
				) . ']</small></h2>' .
				"<div class='mw-codereview-diff' id='mw-codereview-diff'>" . $diffHtml . "</div>\n";
			$html .= $this->formatImgDiff();
		}

		# Show sign-offs
		$userCanSignoff = $user->isAllowed( 'codereview-signoff' ) && !$user->isBlocked();
		$signOffs = $this->mRev->getSignoffs();
		if ( count( $signOffs ) || $userCanSignoff ) {
			$html .= "<h2 id='code-signoffs'>" . wfMessage( 'code-signoffs' )->escaped() .
				"</h2>\n" . $this->formatSignoffs( $signOffs, $userCanSignoff );
		}

		# Show code relations
		$userCanAssociate = $user->isAllowed( 'codereview-associate' ) && !$user->isBlocked();
		$references = $this->mRev->getFollowupRevisions();
		if ( count( $references ) || $userCanAssociate ) {
			$html .= "<h2 id='code-references'>" . wfMessage( 'code-references' )->escaped() .
				"</h2>\n" . $this->formatReferences( $references, $userCanAssociate, 'References' );
		}

		$referenced = $this->mRev->getFollowedUpRevisions();
		if ( count( $referenced ) || $userCanAssociate ) {
			$html .= "<h2 id='code-referenced'>" . wfMessage( 'code-referenced' )->escaped() .
				"</h2>\n" . $this->formatReferences( $referenced, $userCanAssociate, 'Referenced' );
		}

		# Add revision comments
		if ( $comments ) {
			$html .= "<h2 id='code-comments'>" . wfMessage( 'code-comments' )->escaped() .
				"</h2>\n" . $comments;
		}

		if ( $canPostComments ) {
			$html .= $this->addActionButtons();
		}

		$changes = $this->formatPropChanges();
		if ( $changes ) {
			$html .= "<h2 id='code-changes'>" . wfMessage( 'code-prop-changes' )->escaped() .
				"</h2>\n" . $changes;
		}
		$html .= Xml::closeElement( 'form' );

		$wgOut->addHTML( $html );
	}

	protected function navigationLinks() {
		global $wgLang;

		$rev = $this->mRev->getId();
		$prev = $this->mRev->getPrevious( $this->mPath );
		$next = $this->mRev->getNext( $this->mPath );
		$repo = $this->mRepo->getName();

		$links = [];

		$linkRenderer = \MediaWiki\MediaWikiServices::getInstance()->getLinkRenderer();
		if ( $prev ) {
			$prevTarget = SpecialPage::getTitleFor( 'Code', "$repo/$prev" );
			$links[] = '&lt;&#160;' .
				$linkRenderer->makeLink( $prevTarget, $this->mRev->getIdString( $prev ),
					[], [ 'path' => $this->mPath ] ) . $wgLang->getDirMark();
		}

		$revText = "<b>" . $this->mRev->getIdString( $rev ) . "</b>";
		$viewvc = $this->mRepo->getViewVcBase();
		if ( $viewvc ) {
			$url = htmlspecialchars( "$viewvc/?view=rev&revision=$rev" );
			$viewvcTxt = wfMessage( 'code-rev-rev-viewvc' )->escaped();
			$revText .= " (<a href=\"$url\" title=\"revision $rev\">$viewvcTxt</a>)" .
				$wgLang->getDirMark();
		}
		$links[] = $revText;

		if ( $next ) {
			$nextTarget = SpecialPage::getTitleFor( 'Code', "$repo/$next" );
			$links[] = $linkRenderer->makeLink( $nextTarget, $this->mRev->getIdString( $next ),
				[], [ 'path' => $this->mPath ] ) . '&#160;&gt;';
		}

		return $wgLang->pipeList( $links );
	}

	protected function checkPostings() {
		global $wgRequest;
		if ( $wgRequest->wasPosted()
			&& $this->user->matchEditToken( $wgRequest->getVal( 'wpEditToken' ) )
		) {
			// Look for a posting...
			$text = $wgRequest->getText( "wpReply{$this->mReplyTarget}" );
			$isPreview = $wgRequest->getCheck( 'wpPreview' );
			if ( $isPreview ) {
				// Save the text for reference on later comment display...
				$this->mPreviewText = $text;
			}
		}
		return false;
	}

	/**
	 * @param User $user
	 * @return bool
	 */
	protected function canPostComments( User $user ) {
		return $user->isAllowed( 'codereview-post-comment' ) && !$user->isBlocked();
	}

	protected function formatPathLine( $path, $action ) {
		$action = strtolower( $action );

		// If NOOP passed, return ''
		if ( $action == 'n' ) {
			return '';
		}
		// Uses messages 'code-rev-modified-a', 'code-rev-modified-r', 'code-rev-modified-d',
		// 'code-rev-modified-m'
		$desc = wfMessage( 'code-rev-modified-' . $action )->escaped();
		// Find any ' (from x)' from rename comment in the path.
		$matches = [];
		preg_match( '/ \([^\)]+\)$/', $path, $matches );
		$from = $matches[0] ?? '';
		// Remove ' (from x)' from rename comment in the path.
		$path = preg_replace( '/ \([^\)]+\)$/', '', $path );
		$viewvc = $this->mRepo->getViewVcBase();
		$diff = '';
		$linkRenderer = \MediaWiki\MediaWikiServices::getInstance()->getLinkRenderer();
		$hist = $linkRenderer->makeLink(
			SpecialPage::getTitleFor( 'Code', $this->mRepo->getName() ),
			wfMessage( 'code-rev-history-link' )->text(), [], [ 'path' => $path ]
		);
		$safePath = wfUrlEncode( $path );
		if ( $viewvc ) {
			$rev = $this->mRev->getId();
			$prev = $rev - 1;
			if ( $action === 'd' ) {
				if ( $rev > 1 ) {
					$link = Linker::makeExternalLink( // last rev
						"{$viewvc}{$safePath}?view=markup&pathrev=" . ( $rev - 1 ),
						$path . $from );
				} else {
					$link = $safePath; // imported to SVN or something
				}
			} else {
				$link = Linker::makeExternalLink(
					"{$viewvc}{$safePath}?view=markup&pathrev=$rev",
					$path . $from );
			}
			if ( $action !== 'a' && $action !== 'd' ) {
				$diff = ' (' .
					Linker::makeExternalLink(
						"$viewvc$safePath?&pathrev=$rev&r1=$prev&r2=$rev",
						wfMessage( 'code-rev-diff-link' )->text() ) .
					')';
			}
		} else {
			$link = $safePath;
		}
		return "<li><b>$link</b> ($desc) ($hist)$diff</li>\n";
	}

	protected function tagForm() {
		$tags = $this->mRev->getTags();
		$list = '';
		if ( count( $tags ) ) {
			$list = implode( ', ',
				array_map(
					[ $this, 'formatTag' ],
					$tags )
			) . '&#160;';
		}
		if ( $this->user->isAllowed( 'codereview-add-tag' ) ) {
			$list .= $this->addTagForm( $this->mAddTags, $this->mRemoveTags );
		}
		return $list;
	}

	/**
	 * @param string $input
	 * @return array|null
	 */
	protected function splitTags( $input ) {
		if ( !$this->mRev ) {
			return [];
		}
		$tags = array_map( 'trim', explode( ',', $input ) );
		foreach ( $tags as $key => $tag ) {
			$normal = $this->mRev->normalizeTag( $tag );
			if ( $normal === false ) {
				return null;
			}
			$tags[$key] = $normal;
		}
		return $tags;
	}

	/**
	 * @param array $tags
	 * @return string
	 */
	private static function listTags( $tags ) {
		if ( empty( $tags ) ) {
			return '';
		}
		return implode( ',', $tags );
	}

	/**
	 * @return string
	 */
	protected function statusForm() {
		if ( $this->user->isAllowed( 'codereview-set-status' ) ) {
			return Xml::openElement( 'select', [ 'name' => 'wpStatus' ] ) .
				self::buildStatusList( $this->mStatus, $this ) .
				Xml::closeElement( 'select' );
		} else {
			return htmlspecialchars( $this->statusDesc( $this->mRev->getStatus() ) );
		}
	}

	/**
	 * @param string $status
	 * @param CodeView $view
	 * @return string
	 */
	public static function buildStatusList( $status, $view ) {
		$states = CodeRevision::getPossibleStates();
		$out = '';
		foreach ( $states as $state ) {
			$out .= Xml::option( $view->statusDesc( $state ), $state,
						$status === $state );
		}
		return $out;
	}

	/**
	 * Parameters are the tags to be added/removed sent with the request
	 * @param array $addTags
	 * @param array $removeTags
	 * @return string
	 */
	public static function addTagForm( $addTags, $removeTags ) {
		return '<div><table><tr><td>' .
			Xml::inputLabel( wfMessage( 'code-rev-tag-add' )->text(), 'wpTag', 'wpTag', 20,
				self::listTags( $addTags ) ) . '</td><td>&#160;</td><td>' .
			Xml::inputLabel( wfMessage( 'code-rev-tag-remove' )->text(), 'wpRemoveTag',
				'wpRemoveTag', 20, self::listTags( $removeTags ) ) . '</td></tr></table></div>';
	}

	/**
	 * @param string $tag
	 * @return string
	 */
	protected function formatTag( $tag ) {
		$repo = $this->mRepo->getName();
		$special = SpecialPage::getTitleFor( 'Code', "$repo/tag/$tag" );
		$linkRenderer = \MediaWiki\MediaWikiServices::getInstance()->getLinkRenderer();
		return $linkRenderer->makeLink( $special, $tag );
	}

	/**
	 * @return string
	 */
	protected function formatDiff() {
		global $wgCodeReviewMaxDiffSize;

		if ( $this->mSkipCache ) {
			// We're purging the cache on purpose, probably
			// because the cached data was corrupt.
			$cache = 'skipcache';
		} else {
			// If data is already cached, we'll take it now;
			// otherwise defer the load to an AJAX request.
			// This lets the page be manipulable even if the
			// SVN connection is slow or uncooperative.
			$cache = 'cached';
		}
		$diff = $this->mRepo->getDiff( $this->mRev->getId(), $cache );

		// If there isn't anything to diff, or if it's too large, don't AJAX load
		if ( is_string( $diff ) && strlen( $diff ) > $wgCodeReviewMaxDiffSize ) {
			return wfMessage( 'code-rev-diff-too-large' )->escaped();
		} elseif ( is_int( $diff )
			&& in_array( $diff, [
				CodeRepository::DIFFRESULT_NothingToCompare, CodeRepository::DIFFRESULT_TooManyPaths
			] )
		) {
			// Some other error condition, no diff required
			return '';
		} elseif ( $diff === CodeRepository::DIFFRESULT_NotInCache ) {
			// Api Enabled || Not cached => Load via JS via API
			return $this->stubDiffLoader();
		}

		// CodeRepository::DIFFRESULT_NoDataReturned still ends up here, and we can't differentiate
		$hilite = new CodeDiffHighlighter();
		return $hilite->render( $diff );
	}

	/**
	 * @return string
	 */
	protected function formatImgDiff() {
		global $wgCodeReviewImgRegex;
		$viewvc = $this->mRepo->getViewVcBase();
		if ( !$viewvc ) {
			return '';
		}
		// Get image diffs
		$imgDiffs = $html = '';
		$modifiedPaths = $this->mRev->getModifiedPaths();
		foreach ( $modifiedPaths as $row ) {
			// Typical image file?
			if ( preg_match( $wgCodeReviewImgRegex, $row->cp_path ) ) {
				$imgDiffs .= 'Index: ' . htmlspecialchars( $row->cp_path ) . "\n";
				$imgDiffs .= '<table border="1px" style="background:white;"><tr>';
				if ( $row->cp_action !== 'A' ) { // old
					// What was done to it?
					$action = $row->cp_action == 'D'
						? 'code-rev-modified-d' : 'code-rev-modified-r';
					// Link to old image
					$imgDiffs .= $this->formatImgCell(
						$viewvc, $row->cp_path, $this->mRev->getPrevious(), $action );
				}
				if ( $row->cp_action !== 'D' ) { // new
					// What was done to it?
					$action = $row->cp_action == 'A'
						? 'code-rev-modified-a' : 'code-rev-modified-m';
					// Link to new image
					$imgDiffs .= $this->formatImgCell(
						$viewvc, $row->cp_path, $this->mRev->getId(), $action );
				}
				$imgDiffs .= "</tr></table>\n";
			}
		}
		if ( $imgDiffs ) {
			$html = '<h2>' . wfMessage( 'code-rev-imagediff' )->escaped() . '</h2>';
			$html .= "<div class='mw-codereview-imgdiff'>$imgDiffs</div>\n";
		}
		return $html;
	}

	/**
	 * @param string $viewvc
	 * @param string $path
	 * @param string $rev
	 * @param string $message
	 * @return string
	 */
	protected function formatImgCell( $viewvc, $path, $rev, $message ) {
		$safePath = wfUrlEncode( $path );
		$url = "{$viewvc}{$safePath}?&pathrev=$rev&revision=$rev";

		$alt = wfMessage( $message )->text();

		return Xml::tags( 'td',
			[],
			Xml::tags( 'a',
				[ 'href' => $url ],
				Xml::element( 'img',
					[
						'src' => $url,
						'alt' => $alt,
						'title' => $alt,
						'border' => '0'
					]
				)
			)
		);
	}

	/**
	 * @return bool|string
	 */
	protected function stubDiffLoader() {
		global $wgOut;
		$encRepo = Xml::encodeJsVar( $this->mRepo->getName() );
		$encRev = Xml::encodeJsVar( $this->mRev->getId() );
		$wgOut->addHTML( Html::inlineScript( ResourceLoader::makeInlineCodeWithModule(
			'ext.codereview.loaddiff',
			"CodeReview.loadDiff($encRepo,$encRev);"
		) ) );
		return wfMessage( 'code-load-diff' )->escaped();
	}

	/**
	 * Format the sign-offs table
	 * @param array $signOffs
	 * @param bool $showButtons Whether the buttons to strike and submit sign-offs should be shown
	 * @return string HTML
	 */
	protected function formatSignoffs( $signOffs, $showButtons ) {
		$this->showButtonsFormatSignoffs = $showButtons;

		$header = '';
		if ( count( $signOffs ) ) {
			if ( $showButtons ) {
				$header = '<th></th>';
			}
			$signoffs = implode( "\n",
				array_map( [ $this, 'formatSignoffInline' ], $signOffs )
			);
			$header .= '<th>' . wfMessage( 'code-signoff-field-user' )->escaped() . '</th>';
			$header .= '<th>' . wfMessage( 'code-signoff-field-flag' )->escaped() . '</th>';
			$header .= '<th>' . wfMessage( 'code-signoff-field-date' )->escaped() . '</th>';
		} else {
			$signoffs = '';
		}
		$buttonrow = $showButtons ? $this->signoffButtons( $signOffs ) : '';
		return "<table border='1' class='wikitable'><tr>$header</tr>$signoffs$buttonrow</table>";
	}

	/**
	 * @param User $user
	 * @return bool|string
	 */
	protected function formatComments( User $user ) {
		$comments = array_map( function ( $comment ) use ( $user ) {
			return $this->formatCommentInline( $comment, $user );
		}, $this->mRev->getComments() );
		$comments = implode( "\n", $comments );
		if ( !$this->mReplyTarget ) {
			$comments .= $this->postCommentForm();
		}
		if ( !$comments ) {
			return false;
		}
		return "<div class='mw-codereview-comments'>$comments</div>";
	}

	/**
	 * @return bool|string
	 */
	protected function formatPropChanges() {
		$changes = implode( "\n",
			array_map( [ $this, 'formatChangeInline' ], $this->mRev->getPropChanges() )
		);
		if ( !$changes ) {
			return false;
		}
		return "<ul class='mw-codereview-changes'>$changes</ul>";
	}

	/**
	 * @param array $references
	 * @param bool $showButtons
	 * @param string $inputName
	 * @return string
	 */
	protected function formatReferences( $references, $showButtons, $inputName ) {
		$this->showButtonsFormatReference = $showButtons;
		$this->referenceInputName = $inputName;
		$refs = implode( "\n",
			array_map( [ $this, 'formatReferenceInline' ], $references )
		);

		$header = '';
		if ( $showButtons ) {
			$header = '<th></th>';
		}
		$header .= '<th>' . wfMessage( 'code-field-id' )->escaped() . '</th>';
		$header .= '<th>' . wfMessage( 'code-field-message' )->escaped() . '</th>';
		$header .= '<th>' . wfMessage( 'code-field-author' )->escaped() . '</th>';
		$header .= '<th>' . wfMessage( 'code-field-timestamp' )->escaped() . '</th>';
		$buttonrow = $showButtons ? $this->referenceButtons( $inputName ) : '';
		return "<table border='1' class='wikitable'><tr>{$header}</tr>{$refs}{$buttonrow}</table>";
	}

	/**
	 * Format a single sign-off row. Helper function for formatSignoffs()
	 * @param CodeSignoff $signoff
	 * @return string HTML
	 */
	protected function formatSignoffInline( $signoff ) {
		global $wgLang;
		$user = Linker::userLink( $signoff->user, $signoff->userText );
		$flag = htmlspecialchars( $signoff->flag );
		$signoffDate = $wgLang->timeanddate( $signoff->timestamp, true );
		$class = "mw-codereview-signoff-flag-$flag";
		if ( $signoff->isStruck() ) {
			$class .= ' mw-codereview-struck';
			$struckDate = $wgLang->timeanddate( $signoff->getTimestampStruck(), true );
			$date = wfMessage( 'code-signoff-struckdate', $signoffDate, $struckDate )->escaped();
		} else {
			$date = htmlspecialchars( $signoffDate );
		}

		$ret = "<tr class='$class'>";
		if ( $this->showButtonsFormatSignoffs ) {
			$checkbox = Html::input( 'wpSignoffs[]', $signoff->getID(), 'checkbox' );
			$ret .= "<td>$checkbox</td>";
		}
		$ret .= "<td>$user</td><td>$flag</td><td>$date</td></tr>";
		return $ret;
	}

	/**
	 * @param CodeComment $comment
	 * @param User $user
	 * @return string
	 */
	protected function formatCommentInline( $comment, User $user ) {
		if ( $comment->id === $this->mReplyTarget ) {
			return $this->formatComment( $comment, $user,
				$this->postCommentForm( $comment->id ) );
		} else {
			return $this->formatComment( $comment, $user );
		}
	}

	/**
	 * @param CodePropChange $change
	 * @return string
	 */
	protected function formatChangeInline( $change ) {
		global $wgLang;
		$revId = $change->rev->getIdString();
		$line = $wgLang->timeanddate( $change->timestamp, true );
		$line .= '&#160;' . Linker::userLink( $change->user, $change->userText );
		$line .= Linker::userToolLinks( $change->user, $change->userText );
		// Uses messages 'code-change-status', 'code-change-tags'
		$line .= '&#160;' . wfMessage( "code-change-{$change->attrib}", $revId )->parse();
		$line .= " <i>[";
		// Items that were changed or set...
		if ( $change->removed ) {
			$line .= '<b>' . wfMessage( 'code-change-removed' )->escaped() . '</b> ';
			// Status changes...
			if ( $change->attrib == 'status' ) {
				// Give grep a chance to find the usages:
				// code-status-new, code-status-fixme, code-status-reverted, code-status-resolved,
				// code-status-ok, code-status-deferred, code-status-old
				$line .= wfMessage( 'code-status-' . $change->removed )->escaped();
				$line .= $change->added ? "&#160;" : ""; // spacing
			// Tag changes
			} elseif ( $change->attrib == 'tags' ) {
				$line .= htmlspecialchars( $change->removed );
				$line .= $change->added ? "&#160;" : ""; // spacing
			}
		}
		// Items that were changed to something else...
		if ( $change->added ) {
			$line .= '<b>' . wfMessage( 'code-change-added' )->escaped() . '</b> ';
			// Status changes...
			if ( $change->attrib == 'status' ) {
				// Give grep a chance to find the usages:
				// code-status-new, code-status-fixme, code-status-reverted, code-status-resolved,
				// code-status-ok, code-status-deferred, code-status-old
				$line .= wfMessage( 'code-status-' . $change->added )->escaped();
			// Tag changes...
			} else {
				$line .= htmlspecialchars( $change->added );
			}
		}
		$line .= "]</i>";
		return "<li>$line</li>";
	}

	/**
	 * @param stdClass $row
	 * @return string
	 */
	protected function formatReferenceInline( $row ) {
		global $wgLang;
		$rev = intval( $row->cr_id );
		$repo = $this->mRepo->getName();
		// Borrow the code revision list css
		$css = 'mw-codereview-status-' . htmlspecialchars( $row->cr_status );
		$date = $wgLang->timeanddate( $row->cr_timestamp, true );
		$title = SpecialPage::getTitleFor( 'Code', "$repo/$rev" );
		$linkRenderer = \MediaWiki\MediaWikiServices::getInstance()->getLinkRenderer();
		$revLink = $linkRenderer->makeLink( $title, $this->mRev->getIdString( $rev ) );
		$summary = $this->messageFragment( $row->cr_message );
		$author = $this->authorLink( $row->cr_author );

		$ret = "<tr class='$css'>";
		if ( $this->showButtonsFormatReference ) {
			$checkbox = Html::input( "wp{$this->referenceInputName}[]", $rev, 'checkbox' );
			$ret .= "<td>$checkbox</td>";
		}
		$ret .= "<td>$revLink</td><td>$summary</td><td>$author</td><td>$date</td></tr>";
		return $ret;
	}

	/**
	 * @param int $commentId
	 * @return Title
	 */
	protected function commentLink( $commentId ) {
		$repo = $this->mRepo->getName();
		$rev = $this->mRev->getId();
		$title = SpecialPage::getTitleFor( 'Code', "$repo/$rev", "c{$commentId}" );
		return $title;
	}

	/**
	 * @return Title
	 */
	protected function revLink() {
		$repo = $this->mRepo->getName();
		$rev = $this->mRev->getId();
		$title = SpecialPage::getTitleFor( 'Code', "$repo/$rev" );
		return $title;
	}

	/**
	 * @param string $text
	 * @param User $user
	 * @return string
	 */
	protected function previewComment( $text, User $user ) {
		$comment = $this->mRev->previewComment( $text, $user );
		return $this->formatComment( $comment, $user );
	}

	/**
	 * @param CodeComment $comment
	 * @param User $user
	 * @param string $replyForm
	 * @return string
	 */
	public function formatComment( $comment, User $user, $replyForm = '' ) {
		global $wgOut, $wgLang;

		$services = MediaWikiServices::getInstance();
		$dir = $services->getContentLanguage()->getDir();

		if ( $comment->id === 0 ) {
			$linkId = 'cpreview';
			$permaLink = '<strong>' .
				wfMessage( 'code-rev-inline-preview' )->escaped() . '</strong> ';
		} else {
			$linkId = 'c' . intval( $comment->id );
			$linkRenderer = $services->getLinkRenderer();
			$permaLink = $linkRenderer->makeLink( $this->commentLink( $comment->id ), '#' );
		}

		return Xml::openElement( 'div',
			[
				'class' => 'mw-codereview-comment',
				'id' => $linkId,
				'style' => $this->commentStyle( $comment ) ] ) .
			'<div class="mw-codereview-comment-meta">' .
			$permaLink .
			wfMessage( 'code-rev-comment-by' )->rawParams(
				Linker::userLink( $comment->user, $comment->userText ) .
					Linker::userToolLinks( $comment->user, $comment->userText )
			)->escaped() .
			' &#160; ' .
			$wgLang->timeanddate( $comment->timestamp, true ) .
			' ' .
			$this->commentReplyLink( $user, $comment->id ) .
			'</div>' .
			'<div class="mw-codereview-comment-text mw-content-' . htmlspecialchars( $dir ) . '">' .
			$wgOut->parseAsContent( $this->codeCommentLinkerWiki->link( $comment->text ) ) .
			'</div>' .
			$replyForm .
			'</div>';
	}

	/**
	 * @param CodeComment $comment
	 * @return string
	 */
	protected function commentStyle( $comment ) {
		global $wgLang;
		$align = $wgLang->alignStart();
		$depth = $comment->threadDepth();
		$margin = ( $depth - 1 ) * 48;
		return "margin-$align: ${margin}px";
	}

	/**
	 * @param User $user
	 * @param int $id
	 * @return string
	 */
	protected function commentReplyLink( User $user, $id ) {
		if ( !$this->canPostComments( $user ) ) {
			return '';
		}
		$repo = $this->mRepo->getName();
		$rev = $this->mRev->getId();
		$self = SpecialPage::getTitleFor( 'Code', "$repo/$rev/reply/$id", "c$id" );
		$linkRenderer = \MediaWiki\MediaWikiServices::getInstance()->getLinkRenderer();
		// @todo FIXME: Hard coded brackets.
		return '[' .
			$linkRenderer->makeLink( $self, wfMessage( 'codereview-reply-link' )->text() ) . ']';
	}

	protected function postCommentForm( $parent = null ) {
		$user = $this->user;

		if ( !$this->canPostComments( $user ) ) {
			return '';
		}

		if ( $this->mPreviewText !== false && $parent === $this->mReplyTarget ) {
			$preview = $this->previewComment( $this->mPreviewText, $user );
			$text = $this->mPreviewText;
		} else {
			$preview = '';
			$text = $this->text;
		}

		return '<div class="mw-codereview-post-comment">' .
			$preview .
			Html::hidden( 'wpEditToken', $user->getEditToken() ) .
			Html::hidden( 'path', $this->mPath ) .
			( $parent ? Html::hidden( 'wpParent', $parent ) : '' ) .
			'<div>' .
			Xml::openElement( 'textarea', [
				'name' => "wpReply{$parent}",
				'id' => "wpReplyTo{$parent}",
				'cols' => 40,
				'rows' => 10 ] ) .
			htmlspecialchars( $text ) .
			'</textarea>' .
			'</div>' .
			'</div>';
	}

	/**
	 * Render the bottom row of the sign-offs table containing the buttons to
	 * strike and submit sign-offs
	 *
	 * @param array $signOffs
	 * @return string HTML
	 */
	protected function signoffButtons( $signOffs ) {
		$userSignOffs = $this->getUserSignoffs( $signOffs );
		$strikeButton = count( $userSignOffs )
			? Xml::submitButton( wfMessage( 'code-signoff-strike' )->text(),
				[ 'name' => 'wpStrikeSignoffs' ] )
			: '';
		$signoffText = wfMessage( 'code-signoff-signoff' )->escaped();
		$signoffButton = Xml::submitButton( wfMessage( 'code-signoff-submit' )->text(),
			[ 'name' => 'wpSignoff' ] );
		$checks = '';

		foreach ( CodeRevision::getPossibleFlags() as $flag ) {
			$checks .= Html::input( 'wpSignoffFlags[]', $flag, 'checkbox',
				[
					'id' => "wpSignoffFlags-$flag",
					'disabled' => isset( $userSignOffs[$flag] ),
				] ) .
				' ' . Xml::label( wfMessage( "code-signoff-flag-$flag" )->text(),
				"wpSignoffFlags-$flag" ) . ' ';
		}
		return "<tr class='mw-codereview-signoffbuttons'><td colspan='4'>$strikeButton " .
			"<div class='mw-codereview-signoffchecks'>$signoffText $checks $signoffButton" .
			"</div></td></tr>";
	}

	/**
	 * Gets all the current signoffs the user has against this revision
	 *
	 * @param array $signOffs
	 * @return array
	 */
	protected function getUserSignoffs( $signOffs ) {
		$ret = [];
		/**
		 * @var $s CodeSignoff
		 */
		foreach ( $signOffs as $s ) {
			if ( $s->userText == $this->user->getName() && !$s->isStruck() ) {
				$ret[$s->flag] = true;
			}
		}
		return $ret;
	}

	/**
	 * Render the bottom row of the follow-up revisions table containing the buttons and
	 * textbox to add and remove follow-up associations
	 * @param string $inputName
	 * @return string HTML
	 */
	protected function referenceButtons( $inputName ) {
		$removeButton = Xml::submitButton( wfMessage( 'code-reference-remove' )->text(),
			[ 'name' => "wpRemove{$inputName}" ] );
		$associateText = wfMessage( 'code-reference-associate' )->escaped();
		$associateButton = Xml::submitButton(
			wfMessage( 'code-reference-associate-submit' )->text(),
			[ 'name' => "wpAdd{$inputName}Submit" ]
		);
		$textbox = Html::input( "wpAdd{$inputName}" );
		return "<tr class='mw-codereview-associatebuttons'><td colspan='5'>$removeButton " .
			"<div class='mw-codereview-associateform'>$associateText $textbox $associateButton" .
			"</div></td></tr>";
	}

	/**
	 * @return string
	 */
	protected function addActionButtons() {
		return '<div id="mw-codereview-comment-buttons">' .
			Xml::submitButton( wfMessage( 'code-rev-submit' )->text(),
				[ 'name' => 'wpSave',
					'accesskey' => wfMessage( 'code-rev-submit-accesskey' )->text() ]
			) . ' ' .
			Xml::submitButton( wfMessage( 'code-rev-submit-next' )->text(),
				[ 'name' => 'wpSaveAndNext',
					'accesskey' => wfMessage( 'code-rev-submit-next-accesskey' )->text() ]
			) . ' ' .
			Xml::submitButton( wfMessage( 'code-rev-next' )->text(),
				[ 'name' => 'wpNext',
					'accesskey' => wfMessage( 'code-rev-next-accesskey' )->text() ]
			) . ' ' .
			Xml::submitButton( wfMessage( 'code-rev-comment-preview' )->text(),
				[ 'name' => 'wpPreview',
					'accesskey' => wfMessage( 'code-rev-comment-preview-accesskey' )->text() ]
			) .
			'</div>';
	}
}
