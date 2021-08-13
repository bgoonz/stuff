<?php

class SpecialMassRatings extends QueryPage {
	function __construct() {
		parent::__construct( 'MassRatings' );
	}

	function getQueryInfo() {
		$where = [];
		$selectedRatings = [];

		$ratings = RatingData::getAllRatings();

		foreach ( $ratings as $rating ) {
			if ( $this->getRequest()->getVal( $rating->getCodename() ) == 'true' ) {
				$selectedRatings[] = $rating->getCodename();
			}
		}

		if ( $selectedRatings ) {
			$where = [ 'ratings_rating' => $selectedRatings ];
		}

		return [
			'tables' => 'ratings',
			'fields' => [
				'namespace' => 'ratings_namespace',
				'title' => 'ratings_title',
				'value' => 'ratings_rating'
			],
			'conds' => $where
		];
	}

	function getOrderFields() {
		return [ 'ratings_title' ];
	}

	function sortDescending() {
		return false;
	}

	function getPageHeader() {
		$output = '';

		$output .= '<fieldset><legend>' . $this->msg( 'massratings-legend' )->plain();
		$output .= '</legend><form action="" method="get">';

		$ratings = RatingData::getAllRatings();

		foreach ( $ratings as $rating ) {
			$label = $rating->getAboutLink();
			$pic = $rating->getImage();

			$attribs = [];
			if ( $this->getRequest()->getVal( $rating->getCodename() ) == 'true' ) {
				$attribs = [ 'checked' => 'checked' ];
			}

			$input = Html::input( $rating->getCodename(), 'true', 'checkbox', $attribs );
			$input .= $this->msg( 'word-separator' )->parse();
			$output .= $input . $pic . $label . '<br />';
		}

		$output .= '<input type="submit" /></form></fieldset>';

		return $output;
	}

	function formatResult( $skin, $page ) {
		$rating = new Rating( $page->value );

		$pic = $rating->getImage();
		$label = $rating->getAboutLink();

		$title = Title::newFromText( $page->title );

		if ( !$title->isKnown() ) { // remove redlinks from results
			return false;
		}

		$link = $this->getLinkRenderer()->makeLink( $title );

		return $pic . $label . ' - ' . $link;
	}

	/**
	 * Ensure rating parameters in URL are passed if the user does a "next 500" or whatever
	 *
	 * @see QueryPage::linkParameters()
	 * @return array
	 */
	function linkParameters() {
		$params = [];

		$ratings = RatingData::getAllRatings();

		foreach ( $ratings as $rating ) {
			if ( $this->getRequest()->getVal( $rating->getCodename() ) == 'true' ) {
				$params[$rating->getCodename()] = 'true';
			}
		}

		return $params;
	}
}
