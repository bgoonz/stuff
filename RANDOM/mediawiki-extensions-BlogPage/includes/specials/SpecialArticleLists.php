<?php
/**
 * A special page that displays the 25 most recent blog posts.
 *
 * @file
 * @ingroup Extensions
 */

use MediaWiki\MediaWikiServices;

class ArticleLists extends IncludableSpecialPage {

	/**
	 * Constructor -- set up the new special page
	 */
	public function __construct() {
		parent::__construct( 'ArticleLists' );
	}

	/**
	 * Show the new special page
	 *
	 * @param string|null $limit Show this many entries (LIMIT for SQL)
	 */
	public function execute( $limit ) {
		$out = $this->getOutput();
		$out->setPageTitle( $this->msg( 'blog-ah-new-articles' ) );

		if ( empty( $limit ) ) {
			$limit = 25;
		} else {
			$limit = intval( $limit );
		}

		// Add some CSS for ListPages
		// @todo FIXME: this should be loaded when including the special page,
		// too, but if ( $this->including() ) does nothing, prolly because of
		// the parser cache
		$out->addModuleStyles( 'ext.blogPage.articlesHome' );

		$output = '<div class="left-articles">';
		if ( !$this->including() ) {
			$descMsg = $this->msg( 'blog-ah-new-articles-summary' );
			if ( !$descMsg->isDisabled() ) {
				$output .= Xml::tags( 'div', [
					'class' => 'mw-specialpage-summary'
				], $descMsg->parse() );
			}
		}

		// Try cache first
		$cache = MediaWikiServices::getInstance()->getMainWANObjectCache();
		$key = $cache->makeKey( 'blog', 'newest', (string)$limit );
		$data = $cache->get( $key );

		if ( $data != '' ) {
			wfDebugLog( 'BlogPage', 'Got new articles in ArticleLists from cache' );
			$newBlogPosts = $data;
		} else {
			wfDebugLog( 'BlogPage', 'Got new articles in ArticleLists from DB' );
			$dbr = wfGetDB( DB_REPLICA );
			// Code sporked from Rob Church's NewestPages extension
			// You rock, dude!
			$res = $dbr->select(
				'page',
				[
					'page_namespace', 'page_title', 'page_is_redirect',
					'page_id'
				],
				[ 'page_namespace' => NS_BLOG, 'page_is_redirect' => 0 ],
				__METHOD__,
				[ 'ORDER BY' => 'page_id DESC', 'LIMIT' => $limit ]
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

		$output .= '<div class="listpages-container">' . "\n";
		if ( empty( $newBlogPosts ) ) {
			$output .= $this->msg( 'blog-ah-no-results' )->escaped();
		} else {
			$repoGroup = MediaWikiServices::getInstance()->getRepoGroup();
			foreach ( $newBlogPosts as $newBlogPost ) {
				$titleObj = Title::makeTitle( NS_BLOG, $newBlogPost['title'] );
				$output .= "\t\t\t\t" . '<div class="listpages-item">';
				$pageImage = BlogPage::getPageImage( $newBlogPost['id'] );
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
						"</a>
						<div class=\"listpages-blurb\">\n" .
						BlogPage::getBlurb(
							$newBlogPost['title'],
							$newBlogPost['ns'],
							300
						) .
					'</div><!-- .listpages-blurb -->
				<div class="listpages-stats">' . "\n";
				$output .= $this->getIcon( 'vote' ) .
					$this->msg(
						'blog-author-votes',
						BlogPage::getVotesForPage( $newBlogPost['id'] )
					)->escaped();
				$output .= $this->getIcon( 'comment' ) .
					$this->msg(
						'blog-author-comments',
						BlogPage::getCommentsForPage( $newBlogPost['id'] )
					)->escaped() . '</div><!-- . listpages-stats -->
				</div><!-- .listpages-item -->
				<div class="visualClear"></div>' . "\n";
			}
		}
		$output .= '</div>' . "\n"; // .listpages-container
		// @phan-suppress-next-line PhanPluginDuplicateAdjacentStatement
		$output .= '</div>' . "\n"; // .left-articles

		$out->addHTML( $output );
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
