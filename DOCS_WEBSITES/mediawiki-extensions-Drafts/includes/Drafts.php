<?php
/**
 * Utility functions for Drafts extension
 *
 * @file
 * @ingroup Extensions
 */

abstract class Drafts {
	/**
	 * @return int
	 */
	private static function getDraftAgeCutoff() {
		global $egDraftsLifeSpan;
		if ( !$egDraftsLifeSpan ) {
			// Drafts stay forever
			return 0;
		}
		return (int)wfTimestamp( TS_UNIX ) - ( $egDraftsLifeSpan * 60 * 60 * 24 );
	}

	/**
	 * Counts the number of existing drafts for a specific user
	 *
	 * @param Title|null $title Title of article, defaults to all articles
	 * @param int|null $userID ID of user, defaults to current user
	 * @return int Number of drafts which match condition parameters
	 */
	public static function num( $title = null, $userID = null ) {
		// Get database connection
		$dbr = wfGetDB( DB_REPLICA );

		// Builds where clause
		$where = [
			'draft_savetime > ' . $dbr->addQuotes(
				$dbr->timestamp( self::getDraftAgeCutoff() )
			)
		];

		// Checks if a specific title was given
		if ( $title !== null ) {
			// Get page id from title
			$pageId = $title->getArticleID();
			// Checks if page id exists
			if ( $pageId ) {
				// Adds specific page id to conditions
				$where['draft_page'] = $pageId;
			} else {
				// Adds new page information to conditions
				$where['draft_namespace'] = $title->getNamespace();
				$where['draft_title'] = $title->getDBkey();
				// page not created yet
				$where['draft_page'] = 0;
			}
		}

		// Checks if specific user was given
		if ( $userID !== null ) {
			// Adds specific user to condition
			$where['draft_user'] = $userID;
		} else {
			// Adds current user as condition
			$where['draft_user'] = RequestContext::getMain()->getUser()->getId();
		}

		// Get a list of matching drafts
		return $dbr->selectField( 'drafts', 'COUNT(*)', $where, __METHOD__ );
	}

	/**
	 * Removes drafts which have not been modified for a period of time defined
	 * by $egDraftsCleanRatio
	 */
	public static function clean() {
		global $egDraftsCleanRatio;

		// Only perform this action a fraction of the time
		if ( rand( 0, $egDraftsCleanRatio ) == 0 ) {
			// Get database connection
			$dbw = wfGetDB( DB_MASTER );
			// Removes expired drafts from database
			$dbw->delete( 'drafts',
				[
					'draft_savetime < ' .
						$dbw->addQuotes(
							$dbw->timestamp( self::getDraftAgeCutoff() )
						)
				],
				__METHOD__
			);
		}
	}

	/**
	 * Re-titles drafts which point to a particlar article, as a response to the
	 * article being moved.
	 * @param Title $oldTitle
	 * @param Title $newTitle
	 */
	public static function move( $oldTitle, $newTitle ) {
		// Get database connection
		$dbw = wfGetDB( DB_MASTER );
		// Updates title and namespace of drafts upon moving
		$dbw->update(
			'drafts',
			[
				'draft_namespace' => $newTitle->getNamespace(),
				'draft_title' => $newTitle->getDBkey()
			],
			[
				'draft_page' => $newTitle->getArticleID()
			],
			__METHOD__
		);
	}

	/**
	 * Gets a list of existing drafts for a specific user
	 *
	 * @param Title|null $title Title of article, defaults to all articles
	 * @param int|null $userID ID of user, defaults to current user
	 * @return Draft[]|null
	 */
	public static function get( $title = null, $userID = null ) {
		// Removes expired drafts for a more accurate list
		self::clean();

		// Gets database connection
		$dbw = wfGetDB( DB_MASTER );

		// Builds where clause
		$where = [
			'draft_savetime > ' . $dbw->addQuotes(
				$dbw->timestamp( self::getDraftAgeCutoff() )
			)
		];

		// Checks if specific title was given
		if ( $title !== null ) {
			// Get page id from title
			$pageId = $title->getArticleID();
			// Checks if page id exists
			if ( $pageId ) {
				// Adds specific page id to conditions
				$where['draft_page'] = $pageId;
			} else {
				// Adds new page information to conditions
				$where['draft_namespace'] = $title->getNamespace();
				$where['draft_title'] = $title->getDBkey();
			}
		}

		// Checks if a specific user was given
		if ( $userID !== null ) {
			// Adds specific user to conditions
			$where['draft_user'] = $userID;
		} else {
			// Adds current user to conditions
			$where['draft_user'] = RequestContext::getMain()->getUser()->getId();
		}

		// Gets matching drafts from database
		$result = $dbw->select( 'drafts', '*', $where, __METHOD__ );
		$drafts = [];
		if ( $result ) {
			// Creates an array of matching drafts
			foreach ( $result as $row ) {
				// Adds a new draft to the list from the row
				$drafts[] = Draft::newFromRow( $row );
			}
		}

		// Returns array of matching drafts or null if there were none
		return count( $drafts ) ? $drafts : null;
	}

	/**
	 * Outputs a table of existing drafts
	 *
	 * @param Title|null $title Title of article, defaults to all articles
	 * @param int|null $userID ID of user, defaults to current user
	 * @return string HTML to be shown to the user
	 */
	public static function display( $title = null, $userID = null ) {
		global $wgRequest;

		// Gets draftID
		$currentDraft = Draft::newFromID( $wgRequest->getIntOrNull( 'draft' ) );
		// Output HTML for list of drafts
		$drafts = self::get( $title, $userID );
		if ( $drafts !== null ) {
			$html = '';
			$editToken = RequestContext::getMain()->getUser()->getEditToken();

			// Build XML
			$html .= Xml::openElement( 'table',
				[
					'cellpadding' => 5,
					'cellspacing' => 0,
					'width' => '100%',
					'border' => 0,
					'id' => 'drafts-list-table'
				]
			);

			$html .= Xml::openElement( 'tr' );
			$html .= Xml::element( 'th',
				[ 'width' => '75%', 'nowrap' => 'nowrap' ],
				wfMessage( 'drafts-view-article' )->text()
			);
			$html .= Xml::element( 'th',
				null,
				wfMessage( 'drafts-view-saved' )->text()
			);
			$html .= Xml::element( 'th' );
			$html .= Xml::closeElement( 'tr' );
			// Add existing drafts for this page and user
			/**
			 * @var $draft Draft
			 */
			foreach ( $drafts as $draft ) {
				// Get article title text
				$htmlTitle = htmlspecialchars( $draft->getTitle()->getPrefixedText() );
				// Build Article Load link
				$urlLoad = $draft->getTitle()->getFullURL(
					'action=edit&draft=' . urlencode( (string)$draft->getID() )
				);
				// Build discard link
				$urlDiscard = SpecialPage::getTitleFor( 'Drafts' )->getFullURL(
					sprintf( 'discard=%s&token=%s',
						urlencode( (string)$draft->getID() ),
						urlencode( $editToken )
					)
				);
				// If in edit mode, return to editor
				if (
					$wgRequest->getText( 'action' ) == 'edit' ||
					$wgRequest->getText( 'action' ) == 'submit'
				) {
					$urlDiscard .= '&returnto=' . urlencode( 'edit' );
				}
				// Append section to titles and links
				if ( $draft->getSection() !== null ) {
					// Detect section name
					$lines = explode( "\n", $draft->getText() );

					// If there is any content in the section
					if ( count( $lines ) > 0 ) {
						$htmlTitle .= '#' . htmlspecialchars(
							trim( trim( substr( $lines[0], 0, 255 ), '=' ) )
						);
					}
					// Modify article link and title
					$urlLoad .= '&section=' . urlencode( (string)$draft->getSection() );
					$urlDiscard .= '&section=' .
						urlencode( (string)$draft->getSection() );
				}
				// Build XML
				$html .= Xml::openElement( 'tr' );
				$html .= Xml::openElement( 'td' );
				$html .= Xml::tags( 'a',
					[
						'href' => $urlLoad,
						'style' => 'font-weight:' .
							(
								$currentDraft->getID() == $draft->getID() ?
								'bold' : 'normal'
							)
					],
					$htmlTitle
				);
				$html .= Xml::closeElement( 'td' );
				$html .= Xml::element( 'td',
					null,
					MWTimestamp::getInstance( $draft->getSaveTime() )->getHumanTimestamp()
				);
				$html .= Xml::openElement( 'td' );
				$html .= Xml::element( 'a',
					[
						'href' => $urlDiscard,
						'class' => 'mw-discard-draft-link'
					],
					wfMessage( 'drafts-view-discard' )->text()
				);
				$html .= Xml::closeElement( 'td' );
				$html .= Xml::closeElement( 'tr' );
			}
			$html .= Xml::closeElement( 'table' );
			// Return html
			return $html;
		}
		return '';
	}
}
