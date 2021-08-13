<?php
/**
 * SpecialArticleFeedbackv5Watchlist class
 *
 * @package    ArticleFeedback
 * @subpackage Special
 * @author     Matthias Mullie <mmullie@wikimedia.org>
 */

/**
 * This is the Special page the shows the feedback dashboard for pages on one's watchlist
 *
 * @package    ArticleFeedback
 * @subpackage Special
 */
class SpecialArticleFeedbackv5Watchlist extends SpecialArticleFeedbackv5 {

	/**
	 * The user we're operating on (null for no watchlist)
	 *
	 * @var User
	 */
	protected $user;

	/**
	 * Constructor
	 * @param string $name
	 * @param string $restriction
	 * @param bool $listed
	 * @param bool $function
	 * @param string $file
	 * @param bool $includable
	 */
	public function __construct(
		$name = 'ArticleFeedbackv5Watchlist', $restriction = '', $listed = true,
		$function = false, $file = 'default', $includable = false
	) {
		parent::__construct( $name, $restriction, $listed, $function, $file, $includable );
	}

	/**
	 * Executes the special page
	 *
	 * @param string|null $param the parameter passed in the url
	 */
	public function execute( $param ) {
		global $wgArticleFeedbackv5Watchlist;

		$user = $this->getUser();
		$out = $this->getOutput();

		// if watchlist not enabled or anon user is visiting, redirect to central feedback page
		if ( !$wgArticleFeedbackv5Watchlist || $user->isAnon() ) {
			$out->redirect( SpecialPage::getTitleFor( 'ArticleFeedbackv5' )->getFullUrl() );
		}

		parent::execute( $param );

		$out->setPageTitle( $this->msg( 'articlefeedbackv5-special-watchlist-pagetitle' )->escaped() );
	}

	/**
	 * @return DataModelList
	 */
	protected function fetchData() {
		return ArticleFeedbackv5Model::getWatchlistList(
			$this->startingFilter,
			$this->getUser(),
			$this->getUser(),
			$this->startingOffset,
			$this->startingSort,
			$this->startingSortDirection
		);
	}

	/**
	 * Display the feedback page's summary information in header
	 *
	 * @return string
	 */
	protected function buildSummary() {
		$user = $this->getUser();

		// Showing {count} posts
		return Html::rawElement(
				'div',
				[ 'id' => 'articleFeedbackv5-special-watchlist-showing-wrap' ],
				$this->msg( 'articlefeedbackv5-special-watchlist-showing',
					$user->getUserPage()->getFullText(),
					$user->getName()
				)->parse()
			) .
			Html::rawElement(
				'span',
				[ 'id' => 'articlefeedbackv5-special-central-watchlist-link' ],
				$this->msg( 'articlefeedbackv5-special-watchlist-central-link',
					SpecialPage::getTitleFor( 'ArticleFeedbackv5' )->getFullText()
				)->parse()
			);
	}

	/**
	 * Outputs the page filter controls
	 *
	 * Showing: [filters...]
	 * @return string
	 */
	protected function buildFilters() {
		// filter to be displayed as link
		$filterLabels = [];
		foreach ( [ 'featured', 'unreviewed' ] as $filter ) {
			// Give grep a chance to find the usages:
			// articlefeedbackv5-special-filter-featured, articlefeedbackv5-special-filter-unreviewed
			$filterLabels[$filter] =
				Html::rawElement(
					'a',
					[
						'href' => '#',
						'id' => "articleFeedbackv5-special-filter-$filter",
						'class' => 'articleFeedbackv5-filter-link' . ( $this->startingFilter == $filter ? ' filter-active' : '' )
					],
					$this->msg( "articlefeedbackv5-special-filter-$filter-watchlist" )->escaped()
				);
		}

		// filters to be displayed in dropdown (only for editors)
		$filterSelectHtml = '';
		if ( $this->isAllowed( 'aft-editor' ) ) {
			$opts = [];

			// Give grep a chance to find the usages:
			// articlefeedbackv5-special-filter-featured-watchlist, articlefeedbackv5-special-filter-unreviewed-watchlist,
			// articlefeedbackv5-special-filter-helpful-watchlist, articlefeedbackv5-special-filter-unhelpful-watchlist,
			// articlefeedbackv5-special-filter-flagged-watchlist, articlefeedbackv5-special-filter-useful-watchlist,
			// articlefeedbackv5-special-filter-resolved-watchlist, articlefeedbackv5-special-filter-noaction-watchlist,
			// articlefeedbackv5-special-filter-inappropriate-watchlist, articlefeedbackv5-special-filter-archived-watchlist,
			// articlefeedbackv5-special-filter-allcomment-watchlist, articlefeedbackv5-special-filter-hidden-watchlist,
			// articlefeedbackv5-special-filter-requested-watchlist, articlefeedbackv5-special-filter-declined-watchlist,
			// articlefeedbackv5-special-filter-oversighted-watchlist, articlefeedbackv5-special-filter-all-watchlist
			foreach ( $this->filters as $filter ) {
				if ( isset( $filterLabels[$filter] ) ) {
					continue;
				}

				$key = $this->msg( "articlefeedbackv5-special-filter-$filter-watchlist" )->text();
				$opts[(string)$key] = $filter;
			}

			if ( count( $opts ) > 0 ) {
				// Put the "more filters" option at the beginning of the opts array
				$opts = [ $this->msg( 'articlefeedbackv5-special-filter-select-more' )->text() => '' ] + $opts;

				$filterSelect = new XmlSelect( false, 'articleFeedbackv5-filter-select' );
				$filterSelect->setDefault( $this->startingFilter );
				$filterSelect->addOptions( $opts );
				$filterSelectHtml = $filterSelect->getHTML();
			}
		}

		return Html::rawElement(
				'div',
				[ 'id' => 'articleFeedbackv5-filter' ],
				implode( ' ', $filterLabels ) .
					Html::rawElement(
						'div',
						[ 'id' => 'articleFeedbackv5-select-wrapper' ],
						$filterSelectHtml
					)
			);
	}
}
