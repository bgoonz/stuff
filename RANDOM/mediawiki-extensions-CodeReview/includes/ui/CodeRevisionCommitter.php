<?php

class CodeRevisionCommitter extends CodeRevisionView {
	public function execute() {
		global $wgRequest, $wgOut;

		$user = $this->user;
		if ( !$user->matchEditToken( $wgRequest->getVal( 'wpEditToken' ) ) ) {
			$wgOut->addHTML( '<strong>' . wfMessage( 'sessionfailure' )->escaped() . '</strong>' );
			parent::execute();
			return;
		}
		if ( !$this->mRev ) {
			parent::execute();
			return;
		}

		$commentId = $this->revisionUpdate(
			$this->mStatus,
			$this->mAddTags,
			$this->mRemoveTags,
			$this->mSignoffFlags,
			$this->mStrikeSignoffs,
			$this->mAddReferences,
			$this->mRemoveReferences,
			$this->text,
			$wgRequest->getIntOrNull( 'wpParent' ),
			$this->mAddReferenced,
			$this->mRemoveReferenced,
			$user
		);

		$redirTarget = null;

		// For comments, take us back to the rev page focused on the new comment
		if ( $commentId !== 0 && !$this->jumpToNext ) {
			$redirTarget = $this->commentLink( $commentId );
		}

		// Return to rev page
		if ( !$redirTarget ) {
			// Was "next" (or "save & next") clicked?
			if ( $this->jumpToNext ) {
				$next = $this->mRev->getNextUnresolved( $this->mPath );
				if ( $next ) {
					$redirTarget = SpecialPage::getTitleFor( 'Code', $this->mRepo->getName() . '/' . $next );
				} else {
					$redirTarget = SpecialPage::getTitleFor( 'Code', $this->mRepo->getName() );
				}
			} else {
				# $redirTarget already set for comments
				$redirTarget = $this->revLink();
			}
		}
		$wgOut->redirect( $redirTarget->getFullUrl( [ 'path' => $this->mPath ] ) );
	}

	/**
	 * Does the revision database update
	 *
	 * @param string $status Status to set the revision to
	 * @param array $addTags Tags to add to the revision
	 * @param array $removeTags Tags to remove from the Revision
	 * @param array $addSignoffs Sign-off flags to add
	 * @param array $strikeSignoffs Sign-off IDs to strike
	 * @param array $addReferences Revision IDs to add reference from
	 * @param array $removeReferences Revision IDs to remove references from
	 * @param string $commentText Comment to add to the revision
	 * @param null|int $parent What the parent comment is (if a subcomment)
	 * @param array $addReferenced
	 * @param array $removeReferenced
	 * @param User $user
	 * @return int Comment ID if added, else 0
	 */
	public function revisionUpdate( $status, $addTags, $removeTags, $addSignoffs, $strikeSignoffs,
						$addReferences, $removeReferences, $commentText,
						$parent, $addReferenced, $removeReferenced,
						User $user
					) {
		if ( !$this->mRev ) {
			return false;
		}

		$dbw = wfGetDB( DB_PRIMARY );
		$dbw->startAtomic( __METHOD__ );

		// Change the status if allowed
		$statusChanged = false;
		if ( $this->mRev->isValidStatus( $status ) &&
			$this->validPost( 'codereview-set-status', $user )
		) {
			$statusChanged = $this->mRev->setStatus( $status, $user );
		}
		$validAddTags = $validRemoveTags = [];
		if ( count( $addTags ) && $this->validPost( 'codereview-add-tag', $user ) ) {
			$validAddTags = $addTags;
		}
		if ( count( $removeTags ) && $this->validPost( 'codereview-remove-tag', $user ) ) {
			$validRemoveTags = $removeTags;
		}
		// If allowed to change any tags, then do so
		if ( count( $validAddTags ) || count( $validRemoveTags ) ) {
			$this->mRev->changeTags( $validAddTags, $validRemoveTags, $user );
		}
		// Add any signoffs
		if ( count( $addSignoffs ) && $this->validPost( 'codereview-signoff', $user ) ) {
			$this->mRev->addSignoff( $user, $addSignoffs );
		}
		// Strike any signoffs
		if ( count( $strikeSignoffs ) && $this->validPost( 'codereview-signoff', $user ) ) {
			$this->mRev->strikeSignoffs( $user, $strikeSignoffs );
		}
		// Add reference if requested
		if ( count( $addReferences ) && $this->validPost( 'codereview-associate', $user ) ) {
			$this->mRev->addReferencesFrom( $addReferences );
		}
		// Remove references if requested
		if ( count( $removeReferences ) &&
			$this->validPost( 'codereview-associate', $user )
		) {
			$this->mRev->removeReferencesFrom( $removeReferences );
		}
		// Add reference if requested
		if ( count( $addReferenced ) && $this->validPost( 'codereview-associate', $user ) ) {
			$this->mRev->addReferencesTo( $addReferenced );
		}
		// Remove references if requested
		if ( count( $removeReferenced ) && $this->validPost( 'codereview-associate', $user ) ) {
			$this->mRev->removeReferencesTo( $removeReferenced );
		}

		// Add any comments
		$commentAdded = false;
		$commentId = 0;
		if ( strlen( $commentText ) && $this->validPost( 'codereview-post-comment', $user ) ) {
			// $isPreview = $wgRequest->getCheck( 'wpPreview' );
			$commentId = $this->mRev->saveComment( $commentText, $user, $parent );

			$commentAdded = ( $commentId !== 0 );
		}

		$dbw->endAtomic( __METHOD__ );

		if ( $statusChanged || $commentAdded ) {
			$url = $this->mRev->getCanonicalUrl( $commentId );
			if ( $statusChanged && $commentAdded ) {
				$this->mRev->emailNotifyUsersOfChanges(
					$user,
					'codereview-email-subj4',
					'codereview-email-body4',
					$user->getName(),
					$this->mRev->getIdStringUnique(),
					$this->mRev->getOldStatus(),
					$this->mRev->getStatus(),
					$url,
					$this->text,
					$this->mRev->getMessage()
				);
			} elseif ( $statusChanged ) {
				$this->mRev->emailNotifyUsersOfChanges(
					$user,
					'codereview-email-subj3',
					'codereview-email-body3',
					$user->getName(),
					$this->mRev->getIdStringUnique(),
					$this->mRev->getOldStatus(),
					$this->mRev->getStatus(),
					$url,
					$this->mRev->getMessage()
				);
			} elseif ( $commentAdded ) {
				$this->mRev->emailNotifyUsersOfChanges(
					$user,
					'codereview-email-subj',
					'codereview-email-body',
					$user->getName(),
					$url,
					$this->mRev->getIdStringUnique(),
					$this->text,
					$this->mRev->getMessage()
				);
			}
		}

		return $commentId;
	}
}
