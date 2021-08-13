<?php
/**
 * Blogs homepage - blog articles will make it to this page when they receive a
 * certain number of votes and/or unique commentors commenting.
 *
 * In addition to the most popular blog posts, this page will display the
 * newest blog posts, the most commented and most voted blog posts within the
 * past 72 hours.
 *
 * @file
 * @ingroup Extensions
 */

use MediaWiki\MediaWikiServices;

class ArticlesHome extends SpecialPage {

	/**
	 * Constructor -- set up the new special page
	 */
	public function __construct() {
		parent::__construct( 'ArticlesHome' );
	}

	/**
	 * Show the new special page
	 *
	 * @param string $type What kind of articles to show? Default is 'popular'
	 */
	public function execute( $type ) {
		$out = $this->getOutput();

		// Add CSS
		$out->addModuleStyles( 'ext.blogPage.articlesHome' );

		if ( !$type ) {
			$type = 'popular';
		}

		// Get the category names for today and the past two days
		$dates_array = $this->getDatesFromElapsedDays( 2 );
		$date_categories = '';
		foreach ( $dates_array as $key => $value ) {
			if ( $date_categories ) {
				$date_categories .= ',';
			}
			$date_categories .= $key;
		}

		// Determine the page title and set it
		if ( $type == 'popular' ) {
			$name = $this->msg( 'blog-ah-popular-articles' );
			$name_right = $this->msg( 'blog-ah-new-articles' )->escaped();
		} else {
			$name = $this->msg( 'blog-ah-new-articles' );
			$name_right = $this->msg( 'blog-ah-popular-articles' )->escaped();
		}

		$out->setPageTitle( $name );

		$contLang = MediaWikiServices::getInstance()->getContentLanguage();
		$today = $contLang->date( wfTimestampNow() );

		// Start building the HTML output
		$output = '<div class="main-page-left">';
		$output .= '<div class="logged-in-articles">';
		$output .= '<p class="main-page-sub-links"><a href="' .
			htmlspecialchars( SpecialPage::getTitleFor( 'CreateBlogPost' )->getFullURL() ) . '">' .
			$this->msg( 'blog-ah-write-article' )->escaped() . '</a> - <a href="' .
				// original used date( 'F j, Y' ) which returned something like
				// December 5, 2008
				htmlspecialchars( Title::makeTitle( NS_CATEGORY, $today )->getFullURL() ) . '">' .
				$this->msg( 'blog-ah-todays-articles' )->escaped() . '</a> - <a href="' .
				htmlspecialchars( Title::newMainPage()->getFullURL() ) . '">' .
					$this->msg( 'mainpage' )->escaped() . '</a></p>' . "\n\n";

		if ( $type == 'popular' ) {
			$output .= $this->getPopularPosts();
		} else {
			$output .= $this->getNewestPosts();
		}

		$output .= '</div>';
		// @phan-suppress-next-line PhanPluginDuplicateAdjacentStatement
		$output .= '</div>';
		$output .= '<div class="main-page-right">';

		// Side Articles
		$output .= '<div class="side-articles">';
		$output .= '<h2>' . $name_right . '</h2>';

		if ( $type == 'popular' ) {
			$output .= $this->displayNewestPages();
		} else {
			$output .= $this->getPopularPostsForRightSide();
		}

		$output .= '</div>';

		wfDebugLog( 'BlogPage', 'ArticlesHome: date_categories=' . $date_categories );

		// Most Votes
		$output .= '<div class="side-articles">';
		$output .= '<h2>' . $this->msg( 'blog-ah-most-votes' )->escaped() . '</h2>';
		$output .= $this->displayMostVotedPages( $date_categories );
		$output .= '</div>';

		// Most Comments
		$output .= '<div class="side-articles">';
		$output .= '<h2>' . $this->msg( 'blog-ah-what-talking-about' )->escaped() . '</h2>';
		$output .= $this->displayMostCommentedPages( $date_categories );
		$output .= '</div>';

		// @phan-suppress-next-line PhanPluginDuplicateAdjacentStatement
		$output .= '</div>';
		$output .= '<div class="visualClear"></div>';

		$out->addHTML( $output );
	}

	/**
	 * @param int $numberOfDays Get this many days in addition to today
	 * @return array Array containing today and the past $numberOfDays days in
	 *                the wiki's content language
	 */
	public function getDatesFromElapsedDays( $numberOfDays ) {
		$contLang = MediaWikiServices::getInstance()->getContentLanguage();
		$today = $contLang->date( wfTimestampNow() ); // originally date( 'F j, Y', time() )
		$dates = [];
		$dates[$today] = 1; // Gets today's date string
		for ( $x = 1; $x <= $numberOfDays; $x++ ) {
			$timeAgo = time() - ( 60 * 60 * 24 * $x );
			// originally date( 'F j, Y', $timeAgo );
			$dateString = $contLang->date( wfTimestamp( TS_MW, $timeAgo ) );
			$dates[$dateString] = 1;
		}
		return $dates;
	}

	/**
	 * Get the 25 most popular blog posts from the database and then cache them
	 * in memcached for 15 minutes.
	 * The definition of 'popular' is very arbitrary at the moment.
	 *
	 * @return string HTML
	 */
	public function getPopularPosts() {
		// Try cache first
		$services = MediaWikiServices::getInstance();
		$cache = $services->getMainWANObjectCache();
		$key = $cache->makeKey( 'blog', 'popular', 'twentyfive' );
		$data = $cache->get( $key );

		if ( $data != '' ) {
			wfDebugLog( 'BlogPage', 'Got popular posts in ArticlesHome from cache' );
			$popularBlogPosts = $data;
		} else {
			wfDebugLog( 'BlogPage', 'Got popular posts in ArticlesHome from DB' );
			$dbr = wfGetDB( DB_REPLICA );
			// Code sporked from Rob Church's NewestPages extension
			$commentsTable = $dbr->tableName( 'Comments' );
			$voteTable = $dbr->tableName( 'Vote' );
			$res = $dbr->select(
				[ 'page', 'Comments', 'Vote' ],
				[
					'DISTINCT page_id', 'page_namespace', 'page_title',
					'page_is_redirect',
				],
				[
					'page_namespace' => NS_BLOG,
					'page_is_redirect' => 0,
					// If you can figure out how to do this without a subquery,
					// please let me know. Until that...
					"((SELECT COUNT(*) FROM $voteTable WHERE vote_page_id = page_id) >= 5 OR
					(SELECT COUNT(*) FROM $commentsTable WHERE Comment_Page_ID = page_id) >= 5)",
				],
				__METHOD__,
				[
					'ORDER BY' => 'page_id DESC',
					'LIMIT' => 25
				],
				[
					'Comments' => [ 'INNER JOIN', 'page_id = Comment_Page_ID' ],
					'Vote' => [ 'INNER JOIN', 'page_id = vote_page_id' ]
				]
			);

			$popularBlogPosts = [];
			foreach ( $res as $row ) {
				$popularBlogPosts[] = [
					'title' => $row->page_title,
					'ns' => $row->page_namespace,
					'id' => $row->page_id
				];
			}

			// Cache for 15 minutes
			$cache->set( $key, $popularBlogPosts, 60 * 15 );
		}

		$output = '<div class="listpages-container">';
		if ( empty( $popularBlogPosts ) ) {
			$output .= $this->msg( 'blog-ah-no-results' )->escaped();
		} else {
			$repoGroup = $services->getRepoGroup();
			foreach ( $popularBlogPosts as $popularBlogPost ) {
				$titleObj = Title::makeTitle( NS_BLOG, $popularBlogPost['title'] );
				$output .= '<div class="listpages-item">';
				$pageImage = BlogPage::getPageImage( $popularBlogPost['id'] );
				if ( $pageImage ) {
					// Load MediaWiki image object to get thumbnail tag
					$img = $repoGroup->findFile( $pageImage );
					$imgTag = '';
					if ( is_object( $img ) ) {
						$thumb = $img->transform( [ 'width' => 65, 'height' => 0 ] );
						$imgTag = $thumb->toHtml();
					}

					$output .= "<div class=\"listpages-image\">{$imgTag}</div>\n";
				}
				$output .= '<a href="' . htmlspecialchars( $titleObj->getFullURL() ) . '">' .
						htmlspecialchars( $titleObj->getText() ) .
						'</a>
						<div class="listpages-date">';
				$output .= '(' .
					$this->msg(
						'blog-created-ago',
						BlogPage::getTimeAgo(
							// need to strtotime() it because getCreateDate() now
							// returns the raw timestamp from the database; in the past
							// it converted it to UNIX timestamp via the SQL function
							// UNIX_TIMESTAMP but that was no good for our purposes
							strtotime( (string)BlogPage::getCreateDate( $popularBlogPost['id'] ) )
						)
					)->escaped() . ')';
				$output .= "</div>
				<div class=\"listpages-blurb\">\n" .
						BlogPage::getBlurb(
							$popularBlogPost['title'],
							$popularBlogPost['ns'],
							300
						) .
					'</div><!-- .listpages-blurb -->
				<div class="listpages-stats">' . "\n";
				$output .= $this->getIcon( 'vote' ) .
					$this->msg(
						'blog-author-votes',
						BlogPage::getVotesForPage( $popularBlogPost['id'] )
					)->escaped();
				$output .= $this->getIcon( 'comment' ) .
					$this->msg(
						'blog-author-comments',
						BlogPage::getCommentsForPage( $popularBlogPost['id'] )
					)->escaped() . '</div><!-- . listpages-stats -->
				</div><!-- .listpages-item -->
				<div class="visualClear"></div>' . "\n";
			}
		}

		$output .= '</div>' . "\n"; // .listpages-container

		return $output;
	}

	/**
	 * Get the list of the most voted pages within the last 72 hours.
	 *
	 * @param string $dateCategories Last three days (localized), separated
	 *                                by commas
	 * @return string HTML
	 */
	public function displayMostVotedPages( $dateCategories ) {
		// Try cache first
		$cache = MediaWikiServices::getInstance()->getMainWANObjectCache();
		$key = $cache->makeKey( 'blog', 'mostvoted', 'ten' );
		$data = $cache->get( $key );

		if ( $data != '' ) {
			wfDebugLog( 'BlogPage', 'Got most voted posts in ArticlesHome from cache' );
			$votedBlogPosts = $data;
		} else {
			wfDebugLog( 'BlogPage', 'Got most voted posts in ArticlesHome from DB' );
			$dbr = wfGetDB( DB_REPLICA );
			$kaboom = explode( ',', $dateCategories );
			// Without constructing Titles for all the categories, they won't
			// have the underscores and thus the query will never match
			// anything...thankfully getDBkey returns the title with the
			// underscores
			$titleOne = Title::makeTitle( NS_CATEGORY, $kaboom[0] );
			$titleTwo = Title::makeTitle( NS_CATEGORY, $kaboom[1] );
			$titleThree = Title::makeTitle( NS_CATEGORY, $kaboom[2] );
			$res = $dbr->select(
				[ 'page', 'categorylinks', 'Vote' ],
				[ 'DISTINCT page_id', 'page_title', 'page_namespace' ],
				[
					'cl_to' => [
						$titleOne->getDBkey(), $titleTwo->getDBkey(),
						$titleThree->getDBkey()
					],
					'page_namespace' => NS_BLOG,
					'page_id = vote_page_id',
					'vote_date < "' . date( 'Y-m-d H:i:s' ) . '"'
				],
				__METHOD__,
				[ 'LIMIT' => 10 ],
				[
					'categorylinks' => [ 'INNER JOIN', 'cl_from = page_id' ],
					'Vote' => [ 'LEFT JOIN', 'vote_page_id = page_id' ],
				]
			);

			$votedBlogPosts = [];
			foreach ( $res as $row ) {
				$votedBlogPosts[] = [
					'title' => $row->page_title,
					'ns' => $row->page_namespace,
					'id' => $row->page_id
				];
			}

			// Cache for 15 minutes
			$cache->set( $key, $votedBlogPosts, 60 * 15 );
		}

		// Here we output HTML
		$output = '<div class="listpages-container">' . "\n";

		if ( empty( $votedBlogPosts ) ) {
			$output .= $this->msg( 'blog-ah-no-results' )->escaped();
		} else {
			foreach ( $votedBlogPosts as $votedBlogPost ) {
				$titleObj = Title::makeTitle( NS_BLOG, $votedBlogPost['title'] );
				$votes = BlogPage::getVotesForPage( $votedBlogPost['id'] );
				$output .= '<div class="listpages-item">' . "\n";
				$output .= '<div class="listpages-votebox">' . "\n";
				$output .= '<div class="listpages-votebox-number">' .
					$votes . "</div>\n";
				$output .= '<div class="listpages-votebox-text">' .
					$this->msg( 'blog-author-votes' )
					->numParams( $votes )
					->escaped() . "</div>\n"; // .listpages-votebox-text
				$output .= '</div>' . "\n"; // .listpages-votebox
				// @phan-suppress-next-line PhanPluginDuplicateAdjacentStatement
				$output .= '</div>' . "\n"; // .listpages-item
				$output .= '<a href="' . htmlspecialchars( $titleObj->getFullURL() ) . '">' .
					htmlspecialchars( $titleObj->getText() ) . '</a>';
				$output .= '<div class="visualClear"></div>';
			}
		}

		$output .= "</div>\n"; // .listpages-container

		return $output;
	}

	/**
	 * Get the list of the most commented pages within the last 72 hours.
	 *
	 * @param string $dateCategories Last three days (localized), separated
	 *                                by commas
	 * @return string HTML
	 */
	public function displayMostCommentedPages( $dateCategories ) {
		// Try cache first
		$cache = MediaWikiServices::getInstance()->getMainWANObjectCache();
		$key = $cache->makeKey( 'blog', 'mostcommented', 'ten' );
		$data = $cache->get( $key );

		if ( $data != '' ) {
			wfDebugLog( 'BlogPage', 'Got most commented posts in ArticlesHome from cache' );
			$commentedBlogPosts = $data;
		} else {
			wfDebugLog( 'BlogPage', 'Got most commented posts in ArticlesHome from DB' );
			$dbr = wfGetDB( DB_REPLICA );
			$kaboom = explode( ',', $dateCategories );
			// Without constructing Titles for all the categories, they won't
			// have the underscores and thus the query will never match
			// anything...thankfully getDBkey returns the title with the
			// underscores
			$titleOne = Title::makeTitle( NS_CATEGORY, $kaboom[0] );
			$titleTwo = Title::makeTitle( NS_CATEGORY, $kaboom[1] );
			$titleThree = Title::makeTitle( NS_CATEGORY, $kaboom[2] );
			$res = $dbr->select(
				[ 'page', 'categorylinks', 'Comments' ],
				[ 'DISTINCT page_id', 'page_title', 'page_namespace' ],
				[
					'cl_to' => [
						$titleOne->getDBkey(), $titleTwo->getDBkey(),
						$titleThree->getDBkey()
					],
					'page_namespace' => NS_BLOG,
					'page_id = Comment_Page_ID',
					'Comment_Date < "' . date( 'Y-m-d H:i:s' ) . '"'
				],
				__METHOD__,
				[ 'LIMIT' => 10 ],
				[
					'categorylinks' => [ 'INNER JOIN', 'cl_from = page_id' ],
					'Comments' => [ 'LEFT JOIN', 'Comment_Page_ID = page_id' ],
				]
			);

			$commentedBlogPosts = [];
			foreach ( $res as $row ) {
				$commentedBlogPosts[] = [
					'title' => $row->page_title,
					'ns' => $row->page_namespace,
					'id' => $row->page_id
				];
			}

			// Cache for 15 minutes
			$cache->set( $key, $commentedBlogPosts, 60 * 15 );
		}

		$output = '<div class="listpages-container">';

		if ( empty( $commentedBlogPosts ) ) {
			$output .= $this->msg( 'blog-ah-no-results' )->escaped();
		} else {
			foreach ( $commentedBlogPosts as $commentedBlogPost ) {
				$titleObj = Title::makeTitle( NS_BLOG, $commentedBlogPost['title'] );
				$output .= '<div class="listpages-item">
					<div class="listpages-votebox">
						<div class="listpages-commentbox-number">' .
						BlogPage::getCommentsForPage( $commentedBlogPost['id'] ) .
					'</div>
				</div>
				<a href="' . htmlspecialchars( $titleObj->getFullURL() ) . '">' .
					htmlspecialchars( $titleObj->getText() ) .
					'</a>
			</div><!-- .listpages-item -->
			<div class="visualClear"></div>' . "\n";
			}
		}

		$output .= '</div>' . "\n"; // .listpages-container

		return $output;
	}

	/**
	 * Get the list of the ten newest pages in the NS_BLOG namespace.
	 * This is used in the right side of the special page.
	 *
	 * @return string HTML
	 */
	public function displayNewestPages() {
		// Try cache first
		$cache = MediaWikiServices::getInstance()->getMainWANObjectCache();
		$key = $cache->makeKey( 'blog', 'newest', '10' );
		$data = $cache->get( $key );

		if ( $data != '' ) {
			wfDebugLog( 'BlogPage', 'Got new articles in ArticlesHome from cache' );
			$newBlogPosts = $data;
		} else {
			wfDebugLog( 'BlogPage', 'Got new articles in ArticlesHome from DB' );
			$dbr = wfGetDB( DB_REPLICA );
			// Code sporked from Rob Church's NewestPages extension
			$res = $dbr->select(
				'page',
				[
					'page_namespace', 'page_title', 'page_is_redirect',
					'page_id'
				],
				[ 'page_namespace' => NS_BLOG, 'page_is_redirect' => 0 ],
				__METHOD__,
				[ 'ORDER BY' => 'page_id DESC', 'LIMIT' => 10 ]
			);

			$newBlogPosts = [];
			foreach ( $res as $row ) {
				$newBlogPosts[] = [
					'title' => $row->page_title,
					'ns' => $row->page_namespace,
					'id' => $row->page_id
				];
			}

			// Cache for 15 minutes
			$cache->set( $key, $newBlogPosts, 60 * 15 );
		}

		$output = '<div class="listpages-container">' . "\n";
		if ( empty( $newBlogPosts ) ) {
			$output .= $this->msg( 'blog-ah-no-results' )->escaped();
		} else {
			foreach ( $newBlogPosts as $newBlogPost ) {
				$titleObj = Title::makeTitle( NS_BLOG, $newBlogPost['title'] );
				$votes = BlogPage::getVotesForPage( $newBlogPost['id'] );
				$output .= "\t\t\t\t" . '<div class="listpages-item">';
				$output .= '<div class="listpages-votebox">' . "\n";
				$output .= '<div class="listpages-votebox-number">' .
					$votes .
					"</div>\n"; // .listpages-votebox-number
				$output .= '<div class="listpages-votebox-text">' .
					// The # of votes is displayed above in .listpages-votebox-number already
					// So here we really just need the correct localized word for "votes"
					$this->msg( 'blog-user-articles-votes' )
						->numParams( $votes )
						->escaped() .
					"</div>\n"; // .listpages-votebox-text
				$output .= "</div>\n"; // .listpages-votebox
				$output .= '<a href="' . htmlspecialchars( $titleObj->getFullURL() ) . '">' .
						htmlspecialchars( $titleObj->getText() ) .
					'</a>
				</div><!-- .listpages-item -->
				<div class="visualClear"></div>' . "\n";
			}
		}
		$output .= '</div>' . "\n"; // .listpages-container
		return $output;
	}

	/**
	 * Get the 25 newest blog posts from the database and then cache them in
	 * memcached for 15 minutes.
	 *
	 * @return string HTML
	 */
	public function getNewestPosts() {
		// Try cache first
		$cache = MediaWikiServices::getInstance()->getMainWANObjectCache();
		$key = $cache->makeKey( 'blog', 'newest', '25' );
		$data = $cache->get( $key );

		if ( $data != '' ) {
			wfDebugLog( 'BlogPage', 'Got newest posts in ArticlesHome from cache' );
			$newestBlogPosts = $data;
		} else {
			wfDebugLog( 'BlogPage', 'Got newest posts in ArticlesHome from DB' );
			$dbr = wfGetDB( DB_REPLICA );
			// Code sporked from Rob Church's NewestPages extension
			$res = $dbr->select(
				[ 'page' ],
				[
					'page_namespace', 'page_title', 'page_is_redirect',
					'page_id',
				],
				[
					'page_namespace' => NS_BLOG,
					'page_is_redirect' => 0,
				],
				__METHOD__,
				[
					'ORDER BY' => 'page_id DESC',
					'LIMIT' => 25
				]
			);

			$newestBlogPosts = [];
			foreach ( $res as $row ) {
				$newestBlogPosts[] = [
					'title' => $row->page_title,
					'ns' => $row->page_namespace,
					'id' => $row->page_id
				];
			}

			// Cache for 15 minutes
			$cache->set( $key, $newestBlogPosts, 60 * 15 );
		}

		$output = '<div class="listpages-container">';
		if ( empty( $newestBlogPosts ) ) {
			$output .= $this->msg( 'blog-ah-no-results' )->escaped();
		} else {
			$repoGroup = MediaWikiServices::getInstance()->getRepoGroup();
			foreach ( $newestBlogPosts as $newestBlogPost ) {
				$titleObj = Title::makeTitle( NS_BLOG, $newestBlogPost['title'] );
				$output .= '<div class="listpages-item">';
				$pageImage = BlogPage::getPageImage( $newestBlogPost['id'] );
				if ( $pageImage ) {
					// Load MediaWiki image object to get thumbnail tag
					$img = $repoGroup->findFile( $pageImage );
					$imgTag = '';
					if ( is_object( $img ) ) {
						$thumb = $img->transform( [ 'width' => 65, 'height' => 0 ] );
						$imgTag = $thumb->toHtml();
					}

					$output .= "<div class=\"listpages-image\">{$imgTag}</div>\n";
				}
				$output .= '<a href="' . htmlspecialchars( $titleObj->getFullURL() ) . '">' .
						htmlspecialchars( $titleObj->getText() ) .
						'</a>
						<div class="listpages-date">';
				$output .= '(' .
					$this->msg( 'blog-created-ago',
						BlogPage::getTimeAgo(
							// need to strtotime() it because getCreateDate() now
							// returns the raw timestamp from the database; in the past
							// it converted it to UNIX timestamp via the SQL function
							// UNIX_TIMESTAMP but that was no good for our purposes
							strtotime( (string)BlogPage::getCreateDate( $newestBlogPost['id'] ) )
						)
					)->escaped() . ')';
				$output .= "</div>
				<div class=\"listpages-blurb\">\n" .
						BlogPage::getBlurb(
							$newestBlogPost['title'],
							$newestBlogPost['ns'],
							300
						) .
					'</div><!-- .listpages-blurb -->
				<div class="listpages-stats">' . "\n";
				$output .= $this->getIcon( 'vote' ) .
					$this->msg( 'blog-author-votes' )
					->numParams( BlogPage::getVotesForPage( $newestBlogPost['id'] ) )
					->escaped();
				$output .= $this->getIcon( 'comment' ) .
					$this->msg( 'blog-author-comments' )
					->numParams( BlogPage::getCommentsForPage( $newestBlogPost['id'] ) )
					->escaped() . '</div><!-- . listpages-stats -->
				</div><!-- .listpages-item -->
				<div class="visualClear"></div>' . "\n";
			}
		}

		$output .= '</div>' . "\n"; // .listpages-container

		return $output;
	}

	/**
	 * Get the 25 most popular blog posts from the database and then cache them
	 * in memcached for 15 minutes.
	 * The definition of 'popular' is very arbitrary at the moment.
	 *
	 * Fork of the original getPopularPosts() method, the only thing changed
	 * here is the HTML output which was toned down and count changed from 25
	 * to 10.
	 *
	 * @return string HTML
	 */
	public function getPopularPostsForRightSide() {
		// Try cache first
		$cache = MediaWikiServices::getInstance()->getMainWANObjectCache();
		$key = $cache->makeKey( 'blog', 'popular', 'ten' );
		$data = $cache->get( $key );

		if ( $data != '' ) {
			wfDebugLog( 'BlogPage', 'Got popular posts in ArticlesHome from cache' );
			$popularBlogPosts = $data;
		} else {
			wfDebugLog( 'BlogPage', 'Got popular posts in ArticlesHome from DB' );
			$dbr = wfGetDB( DB_REPLICA );
			$commentsTable = $dbr->tableName( 'Comments' );
			$voteTable = $dbr->tableName( 'Vote' );
			// Code sporked from Rob Church's NewestPages extension
			$res = $dbr->select(
				[ 'page', 'Comments', 'Vote' ],
				[
					'DISTINCT page_id', 'page_namespace', 'page_title',
					'page_is_redirect',
				],
				[
					'page_namespace' => NS_BLOG,
					'page_is_redirect' => 0,
					'page_id = Comment_Page_ID',
					'page_id = vote_page_id',
					// If you can figure out how to do this without a subquery,
					// please let me know. Until that...
					"((SELECT COUNT(*) FROM $voteTable WHERE vote_page_id = page_id) >= 5 OR
					(SELECT COUNT(*) FROM $commentsTable WHERE Comment_Page_ID = page_id) >= 5)",
				],
				__METHOD__,
				[
					'ORDER BY' => 'page_id DESC',
					'LIMIT' => 10
				],
				[
					'Comments' => [ 'INNER JOIN', 'page_id = Comment_Page_ID' ],
					'Vote' => [ 'INNER JOIN', 'page_id = vote_page_id' ]
				]
			);

			$popularBlogPosts = [];
			foreach ( $res as $row ) {
				$popularBlogPosts[] = [
					'title' => $row->page_title,
					'ns' => $row->page_namespace,
					'id' => $row->page_id
				];
			}

			// Cache for 15 minutes
			$cache->set( $key, $popularBlogPosts, 60 * 15 );
		}

		$output = '<div class="listpages-container">';
		if ( empty( $popularBlogPosts ) ) {
			$output .= $this->msg( 'blog-ah-no-results' )->escaped();
		} else {
			foreach ( $popularBlogPosts as $popularBlogPost ) {
				$titleObj = Title::makeTitle( NS_BLOG, $popularBlogPost['title'] );
				$votes = BlogPage::getVotesForPage( $popularBlogPost['id'] );
				$output .= '<div class="listpages-item">';
				$output .= '<div class="listpages-votebox">' . "\n";
				$output .= '<div class="listpages-votebox-number">' .
					$votes . "</div>\n";
				$output .= '<div class="listpages-votebox-text">' .
					$this->msg( 'blog-author-votes' )
					->numParams( $votes )
					->escaped() . "</div>\n"; // .listpages-votebox-text
				$output .= '</div>' . "\n"; // .listpages-votebox
				$output .= '<a href="' . htmlspecialchars( $titleObj->getFullURL() ) . '">' .
							htmlspecialchars( $titleObj->getText() ) .
						'</a>
					</div><!-- .listpages-item -->
				<div class="visualClear"></div>' . "\n";
			}
		}

		$output .= '</div>' . "\n"; // .listpages-container

		return $output;
	}

	/**
	 * @param string $icon
	 * @return string
	 */
	private function getIcon( $icon ) {
		$icon = new UserActivityIcon( $icon );

		return $icon->getIconHTML();
	}
}
