<?php

class SpecialChangeRating extends SpecialPage {
	public function __construct() {
		parent::__construct( 'ChangeRating', 'change-rating' );
	}

	public function execute( $page ) {
		global $wgARENamespaces;

		$this->checkPermissions();
		$this->checkReadOnly();
		$this->setHeaders();

		$out = $this->getOutput();
		$request = $this->getRequest();
		$title = Title::newFromText( $page );

		if ( $title === null ) {
			$out->addWikiMsg( 'changerating-missing-parameter' );
		} elseif ( !$title->exists() ) {
			$out->addWikiMsg( 'changerating-no-such-page', $page );
		} else {
			$namespaces = $wgARENamespaces ?? MWNamespace::getContentNamespaces();
			if ( !in_array( $title->getNamespace(), $namespaces ) ) {
				$out->addWikiMsg( 'are-disallowed' );
				return;
			}

			$out->addWikiMsg( 'changerating-back', $title->getFullText() );

			$dbr = wfGetDB( DB_REPLICA );

			$ratingto = $request->getVal( 'ratingTo' );

			if ( $ratingto !== null ) {
				$ratingto = substr( $ratingto, 0, 2 );

				$res = $dbr->selectField(
					'ratings',
					'ratings_rating',
					[
						'ratings_title' => $title->getDBkey(),
						'ratings_namespace' => $title->getNamespace()
					],
					__METHOD__
				);
				$oldrating = new Rating( $res );

				$dbw = wfGetDB( DB_MASTER );

				$res = $dbw->update(
					'ratings',
					[ 'ratings_rating' => $ratingto ],
					[
						'ratings_title' => $title->getDBkey(),
						'ratings_namespace' => $title->getNamespace()
					],
					__METHOD__
				);

				$reason = $request->getVal( 'reason' );
				$out->addWikiMsg( 'changerating-success' );

				$rating = new Rating( $ratingto );

				$logEntry = new ManualLogEntry( 'ratings', 'change' );
				$logEntry->setPerformer( $this->getUser() );
				$logEntry->setTarget( $title );
				$logEntry->setParameters( [
					'4::newrating' => $rating->getName(),
					'5::oldrating' => $oldrating->getName()
				] );
				if ( $reason !== null ) {
					$logEntry->setComment( $reason );
				}

				$logId = $logEntry->insert();
				$logEntry->publish( $logId );
			}

			$output = $this->msg( 'changerating-intro-text', $title->getFullText() )->parseAsBlock()
				. '<form name="change-rating" action="" method="get">';

			$currentRating = $dbr->selectField(
				'ratings',
				'ratings_rating',
				[
					'ratings_title' => $title->getDBkey(),
					'ratings_namespace' => $title->getNamespace()
				],
				__METHOD__
			);

			$ratings = RatingData::getAllRatings();

			foreach ( $ratings as $rating ) {
				if ( $rating->getCodename() == $currentRating ) {
					$attribs = [ 'checked' => 'checked' ];
				} else {
					$attribs = [];
				}

				$output .= Html::input( 'ratingTo', $rating->getCodename(), 'radio', $attribs );
				$output .= $this->msg( 'word-separator' )->parse();

				$output .= $rating->getImage();
				$output .= $rating->getAboutLink();

				$output .= '<br />';
			}

			$output .= $this->msg( 'changerating-reason' )->escaped() .
				' <input type="text" name="reason" size="50" /><br />' .
				Html::input( 'wpSubmit', $this->msg( 'changerating-submit' )->plain(), 'submit' ) .
				'</form>';

			$loglist = new LogEventsList( $this->getContext() );
			$pager = new LogPager(
				$loglist,
				'ratings',
				'',
				$title
			);

			$log = $pager->getBody();
			if ( $log ) {
				$output .= $this->msg( 'changerating-log-text', $page )->parseAsBlock() . $log;
			} else {
				$output .= $this->msg( 'changerating-nolog-text', $page )->parseAsBlock() . $log;
			}

			$out->addHTML( $output );
		}
	}
}
