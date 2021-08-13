<?php

class CreditsSourceAction extends FormlessAction {
	/**
	 * @return string
	 */
	public function getName() {
		return 'credits';
	}

	/**
	 * @return string
	 */
	protected function getDescription() {
		return $this->msg( 'creditssource-creditpage' )->escaped();
	}

	/**
	 * @return string
	 */
	public function onView() {
		if ( $this->getWikiPage()->getID() == 0 ) {
			$content = $this->msg( 'nocredits' )->parse();
		} else {
			global $wgMaxCredits, $wgShowCreditsIfMax;
			$content = $this->getCredits(
				$wgMaxCredits, $wgShowCreditsIfMax
			);
		}

		return Html::rawElement( 'div', [ 'id' => 'mw-credits' ], $content );
	}

	/**
	 * @param int $maxCredits The max amount of credits to display
	 * @param bool $showCreditsIfMax Credit only the top authors if there are too many
	 * @return string
	 */
	public function getCredits( $maxCredits, $showCreditsIfMax = true ) {
		$maxCredits = $showCreditsIfMax ? $maxCredits : 9999999;

		$return = '';
		$pageId = $this->getTitle()->getArticleID();
		$sourceWorks = SimpleSourceWork::newFromPageId( $pageId, $maxCredits );
		$lang = $this->getLanguage();
		$user = $this->getUser();

		foreach ( $sourceWorks as $source ) {
			// This is safe, since we don't allow writing to the swsite tables. If that
			// changes in the future, mSiteShortName will need to be escaped here.
			$return .= wfMessage( 'creditssource-credits' )->params(
				// source link (absolute) url + title
				$source->mUri,
				$source->mTitle,
				// site link (absolute) url + title
				$source->mSiteUri,
				$source->mSiteName,
				// history link internal (relative) url
				$this->getTitle()->getLocalURL( [ 'action' => 'history' ] ),

				$source->mSiteShortName,
				$lang->userTimeAndDate( $source->mTs, $user ),
				$lang->userDate( $source->mTs, $user ),
				$lang->userTime( $source->mTs, $user )
			)->parse();
		}

		return $return;
	}
}
