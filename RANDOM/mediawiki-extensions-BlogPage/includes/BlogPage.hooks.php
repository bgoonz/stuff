<?php

use MediaWiki\MediaWikiServices;

/**
 * All BlogPage's hooked functions. These were previously scattered all over
 * the place in various files.
 *
 * @file
 */
class BlogPageHooks {

	/**
	 * Register hooks depending on version
	 */
	public static function registerExtension() {
		global $wgHooks;
		if ( class_exists( MediaWiki\HookContainer\HookContainer::class ) ) {
			// MW 1.35+
			$wgHooks['PageSaveComplete'][] = 'BlogPageHooks::updateCreatedOpinionsCount';
		} else {
			$wgHooks['PageContentSaveComplete'][] = 'BlogPageHooks::updateCreatedOpinionsCount';
			$wgHooks['PageContentSave'][] = 'BlogPageHooks::updateCreatedOpinionsCount';
		}
	}

	/**
	 * Calls BlogPage instead of standard Article for pages in the NS_BLOG
	 * namespace.
	 *
	 * @param Title &$title
	 * @param Article|BlogPage &$article Instance of Article that we convert into a BlogPage
	 * @param RequestContext $context
	 */
	public static function blogFromTitle( Title &$title, &$article, $context ) {
		if ( $title->getNamespace() == NS_BLOG ) {

			$out = $context->getOutput();

			$out->enableClientCache( false );

			// Add CSS
			$out->addModuleStyles( 'ext.blogPage' );

			$article = new BlogPage( $title );
		}
	}

	/**
	 * Checks that the user is logged is, is not blocked via Special:Block and has
	 * the 'edit' user right when they're trying to edit a page in the NS_BLOG NS.
	 *
	 * @param EditPage $editPage
	 * @return bool True if the user should be allowed to continue, else false
	 */
	public static function allowShowEditBlogPage( $editPage ) {
		$context = $editPage->getContext();
		$output = $context->getOutput();
		$user = $context->getUser();

		if ( $editPage->getTitle()->getNamespace() == NS_BLOG ) {
			if ( $user->isAnon() ) { // anons can't edit blog pages
				$output->setPageTitle( $output->msg( 'error' ) );
				if ( !$editPage->getTitle()->exists() ) {
					$output->addWikiMsg( 'blog-login' );
				} else {
					$output->addWikiMsg( 'blog-login-edit' );
				}
				$output->addReturnTo( $editPage->getTitle() );
				return false;
			}

			if ( !$user->isAllowed( 'edit' ) || $user->isBlocked() ) {
				$output->setPageTitle( $output->msg( 'error' ) );
				$output->addWikiMsg( 'blog-permission-required' );
				$output->addReturnTo( $editPage->getTitle() );
				return false;
			}
		}

		return true;
	}

	/**
	 * This function was originally in the UserStats directory, in the file
	 * CreatedOpinionsCount.php.
	 * This function here updates the stats_opinions_created column in the
	 * user_stats table every time the user creates a new blog post.
	 *
	 * This is hooked into two separate hooks (todo: find out why), PageContentSave
	 * and PageContentSaveComplete. Their arguments are mostly the same and both
	 * have $wikiPage as the first argument.
	 *
	 * @param WikiPage &$wikiPage WikiPage object representing the page that was/is
	 *                         (being) saved
	 * @param User &$user The User (object) saving the article
	 * @return bool
	 */
	public static function updateCreatedOpinionsCount( &$wikiPage, &$user ) {
		$at = $wikiPage->getTitle();
		$aid = $at->getArticleID();

		// Shortcut, in order not to perform stupid queries (cl_from = 0...)
		if ( $aid == 0 ) {
			return true;
		}

		// Not a blog? Shoo, then!
		if ( !$at->inNamespace( NS_BLOG ) ) {
			return true;
		}

		// Sucks to be an anon since social stats aren't stored for anons
		if ( $user->isAnon() ) {
			return true;
		}

		// Get all the categories the page is in
		$dbr = wfGetDB( DB_REPLICA );
		$res = $dbr->select(
			'categorylinks',
			'cl_to',
			[ 'cl_from' => $aid ],
			__METHOD__
		);

		$user_name = $user->getName();
		$context = RequestContext::getMain();

		foreach ( $res as $row ) {
			$ctg = Title::makeTitle( NS_CATEGORY, $row->cl_to );
			$ctgname = $ctg->getText();
			$userBlogCat = wfMessage( 'blog-by-user-category' )->inContentLanguage()->text(); // e.g. "Articles by User $1"
			$userBlogCatPrefix = str_replace( '$1', '', $userBlogCat ); // e.g. "Articles by User " [sic!]

			// Need to strip out $1 and leading/trailing space(s) from it from
			// the i18n msg to check if this is a blog category
			if ( strpos( $ctgname, $userBlogCatPrefix ) !== false ) {
				// Copied from UserStatsTrack::updateCreatedOpinionsCount()
				$dbw = wfGetDB( DB_MASTER );

				$opinions = $dbw->select(
					[ 'page', 'categorylinks' ],
					[ 'COUNT(*) AS CreatedOpinions' ],
					[
						'cl_to' => $ctg->getDBkey(),
						'page_namespace' => NS_BLOG // paranoia
					],
					__METHOD__,
					[],
					[
						'categorylinks' => [ 'INNER JOIN', 'page_id = cl_from' ]
					]
				);

				// Please die in a fire, PHP.
				// selectField() would be ideal above but it returns
				// insane results (over 300 when the real count is
				// barely 10) so we have to fuck around with a
				// foreach() loop that we don't even need in theory
				// just because PHP is...PHP.
				$opinionsCreated = 0;
				foreach ( $opinions as $opinion ) {
					$opinionsCreated = $opinion->CreatedOpinions;
				}

				if ( $opinionsCreated > 0 ) {
					// Figure out the name of the user we're dealing with from the category name
					// (e.g. "Articles by user Foo" --> $userFromCategoryName = 'Foo';) and update
					// _their_ statistics accordingly + purge caches ($user is the user object for
					// the person who made the edit; they _can_ be the same but usually aren't!)
					$userFromCategoryName = User::newFromName( str_replace( $userBlogCatPrefix, '', $ctgname ) );
					if ( !$userFromCategoryName || !$userFromCategoryName instanceof User ) {
						continue;
					}

					$res = $dbw->update(
						'user_stats',
						[ 'stats_opinions_created' => $opinionsCreated ],
						[ 'stats_actor' => $userFromCategoryName->getActorId() ],
						__METHOD__
					);

					$stats = new UserStatsTrack( $userFromCategoryName->getId(), $userFromCategoryName->getName() );
					$stats->clearCache();
				}
			}
		}

		return true;
	}

	/**
	 * Show a list of this user's blog articles in their user profile page.
	 *
	 * @param UserProfilePage $userProfile
	 */
	public static function getArticles( $userProfile ) {
		global $wgUserProfileDisplay;

		if ( !$wgUserProfileDisplay['articles'] ) {
			return;
		}

		$user_name = $userProfile->profileOwner->getName();
		$output = '';
		$context = $userProfile->getContext();

		// Try cache first
		$cache = MediaWikiServices::getInstance()->getMainWANObjectCache();
		$key = $cache->makeKey( 'user', 'profile', 'articles', $userProfile->profileOwner->getId() );
		$data = $cache->get( $key );
		$articles = [];

		if ( $data != '' ) {
			wfDebugLog(
				'BlogPage',
				"Got UserProfile articles for user {$user_name} from cache\n"
			);
			$articles = $data;
		} else {
			wfDebugLog(
				'BlogPage',
				"Got UserProfile articles for user {$user_name} from DB\n"
			);
			$categoryTitle = Title::newFromText(
				$context->msg(
					'blog-by-user-category',
					$user_name
				)->inContentLanguage()->text()
			);

			$dbr = wfGetDB( DB_REPLICA );
			/**
			 * I changed the original query a bit, since it wasn't returning
			 * what it should've.
			 * I added the DISTINCT to prevent one page being listed five times
			 * and added the page_namespace to the WHERE clause to get only
			 * blog pages and the cl_from = page_id to the WHERE clause so that
			 * the cl_to stuff actually, y'know, works :)
			 */
			$res = $dbr->select(
				[ 'page', 'categorylinks' ],
				[ 'DISTINCT page_id', 'page_title', 'page_namespace' ],
				/* WHERE */[
					'cl_from = page_id',
					'cl_to' => [ $categoryTitle->getDBkey() ],
					'page_namespace' => NS_BLOG
				],
				__METHOD__,
				[ 'ORDER BY' => 'page_id DESC', 'LIMIT' => 5 ]
			);

			foreach ( $res as $row ) {
				$articles[] = [
					'page_title' => $row->page_title,
					'page_namespace' => $row->page_namespace,
					'page_id' => $row->page_id
				];
			}

			$cache->set( $key, $articles, 60 );
		}

		// Load opinion count via user stats;
		$stats = new UserStats( $userProfile->profileOwner->getId(), $user_name );
		$stats_data = $stats->getUserStats();
		$articleCount = $stats_data['opinions_created'];

		$articleLink = Title::makeTitle(
			NS_CATEGORY,
			$context->msg(
				'blog-by-user-category',
				$user_name
			)->inContentLanguage()->text()
		);

		if ( count( $articles ) > 0 ) {
			$output .= '<div class="user-section-heading">
				<div class="user-section-title">' .
					$context->msg( 'blog-user-articles-title' )->escaped() .
				'</div>
				<div class="user-section-actions">
					<div class="action-right">';
			if ( $articleCount > 5 ) {
				$output .= '<a href="' . htmlspecialchars( $articleLink->getFullURL() ) .
					'" rel="nofollow">' . $context->msg( 'user-view-all' )->escaped() . '</a>';
			}
			$output .= '</div>
					<div class="action-left">' .
					$context->msg( 'user-count-separator' )
						// count( $articles ) == amount of entries displayed on the user profile
						// page, 5 or less; $articleCount == total amount of blogs (co)authored by
						// the user, can be well over 5 (obviously!) for a profilic author; pulled
						// from the infamous opinions_created (user_stats.stats_opinions_created
						// column in the DB) just a bit earlier in this method
						->numParams( count( $articles ), $articleCount )
						->escaped() . '</div>
					<div class="visualClear"></div>
				</div>
			</div>
			<div class="visualClear"></div>
			<div class="user-articles-container">';

			$x = 1;

			foreach ( $articles as $article ) {
				$articleTitle = Title::makeTitle(
					$article['page_namespace'],
					$article['page_title']
				);
				$voteCount = BlogPage::getVotesForPage( $article['page_id'] );
				$commentCount = BlogPage::getCommentsForPage( $article['page_id'] );

				if ( $x == 1 ) {
					$divClass = 'article-item-top';
				} else {
					$divClass = 'article-item';
				}
				$output .= '<div class="' . $divClass . "\">
					<div class=\"number-of-votes\">
						<div class=\"vote-number\">{$voteCount}</div>
						<div class=\"vote-text\">" .
							// The # of votes is displayed above in .vote-number already
							// So here we really just need the correct localized word for "votes"
							$context->msg( 'blog-user-articles-votes' )
								->numParams( $voteCount )
								->escaped() .
						'</div>
					</div>
					<div class="article-title">
						<a href="' . htmlspecialchars( $articleTitle->getFullURL() ) .
							'">' . htmlspecialchars( $articleTitle->getText() ) . '</a>
						<span class="item-small">' .
							$context->msg( 'blog-user-article-comment' )
								->numParams( $commentCount )
								->escaped() . '</span>
					</div>
					<div class="visualClear"></div>
				</div>';

				$x++;
			}

			$output .= '</div>';
		}

		$context->getOutput()->addHTML( $output );
	}

}
