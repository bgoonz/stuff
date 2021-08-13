<?php

/**
 * Main UI entry point. This calls the appropriate CodeView subclass and runs it
 */
class SpecialCode extends SpecialPage {
	public function __construct() {
		parent::__construct( 'Code', 'codereview-use' );
	}

	/**
	 * Return an array of subpages that this special page will accept.
	 *
	 * @return string[] subpages
	 */
	public function getSubpagesForPrefixSearch() {
		$repos = CodeRepository::getRepoList();
		if ( count( $repos ) ) {
			$retVal = [];
			foreach ( $repos as $repo ) {
				$retVal[] = $repo->getName();
			}
			sort( $retVal );
			return $retVal;
		}
		return [];
	}

	/**
	 * @param string $subpage
	 */
	public function execute( $subpage ) {
		global $wgUseSiteCss;

		$this->checkPermissions();

		$this->setHeaders();
		// Base styles used for all code review UI actions.
		$out = $this->getOutput();
		$out->addModules( 'ext.codereview' );
		$out->addModules( 'ext.codereview.tooltips' );
		$out->addModuleStyles( 'ext.codereview.styles' );

		// Load [[MediaWiki:CodeReview.css]] (bug #16049) if site CSS is enabled
		if ( $wgUseSiteCss ) {
			$out->addModuleStyles( 'ext.codereview.local' );
		}

		$view = $this->getViewFrom( $subpage );
		if ( $view ) {
			$view->execute();
		} else {
			$out->addWikiMsg( 'nosuchactiontext' );
			$out->returnToMain( null, $this->getPageTitle() );
			return;
		}

		// Add subtitle for easy navigation
		if ( $view instanceof CodeView ) {
			$repo = $view->getRepo();

			if ( $repo ) {
				$out->setSubtitle(
					$this->msg(
						'codereview-subtitle',
						CodeRepoListView::getNavItem( $repo, $this->getUser() )
					)->parseAsBlock()
				);
			}
		}
	}

	/**
	 * Get a view object from a sub page path.
	 * @param string $subpage
	 * @return CodeView|CodeRepoListView|null - Null if no valid action could be found
	 */
	private function getViewFrom( $subpage ) {
		// Defines the classes to use for each view type.
		// The first class name is used if no additional parameters are provided.
		// The second, if defined, is used if there is an additional parameter. If
		// there is no second class defined, then the first class is used in both
		// cases.
		static $paramClasses
			= [
				'tag' => [ 'CodeTagListView', 'CodeRevisionTagView' ],
				'author' => [ 'CodeAuthorListView', 'CodeRevisionAuthorView' ],
				'status' => [ 'CodeStatusListView', 'CodeRevisionStatusView' ],
				'comments' => [ 'CodeCommentsListView' ],
				'statuschanges' => [ 'CodeStatusChangeListView' ],
				'releasenotes' => [ 'CodeReleaseNotes' ],
				'stats' => [ 'CodeRepoStatsView' ],
			];

		$request = $this->getRequest();
		# Remove stray slashes
		$subpage = preg_replace( '/\/$/', '', $subpage );
		if ( $subpage == '' ) {
			$view = new CodeRepoListView();
		} else {
			$params = explode( '/', $subpage );

			$repo = CodeRepository::newFromName( $params[0] );
			// If a repository was specified, but it does not exist, redirect to the
			// repository list with an appropriate message.
			if ( !$repo ) {
				$view = new CodeRepoListView();
				$this->getOutput()->addWikiMsg( 'code-repo-not-found', wfEscapeWikiText( $params[0] ) );
				return $view;
			}

			$user = $this->getUser();

			switch ( count( $params ) ) {
			case 1:
				$view = new CodeRevisionListView( $repo );
				break;
			case 2:		// drop through...
			case 3:
				if ( isset( $paramClasses[$params[1]] ) ) {
					$row = $paramClasses[$params[1]];
					if ( isset( $params[2] ) && isset( $row[1] ) ) {
						$view = new $row[1]( $repo, $params[2] );
					} else {
						$view = new $row[0]( $repo );
					}
				} elseif ( $request->wasPosted() && !$request->getCheck( 'wpPreview' ) ) {
					# This is not really a view, but we return it nonetheless.
					# Add any tags, Set status, Adds comments
					$view = new CodeRevisionCommitter( $repo, $user, $params[1] );
				} elseif ( empty( $params[1] ) ) {
					$view = new CodeRevisionListView( $repo );
				} else {
					$view = new CodeRevisionView( $repo, $params[1], $user );
				}
				break;
			case 4:
				if ( $params[1] === 'author' && $params[3] === 'link' ) {
					$view = new CodeRevisionAuthorLink( $repo, $params[2], $this->getUser() );
					break;
				} elseif ( $params[1] === 'comments' ) {
					$view = new CodeCommentsAuthorListView( $repo, $params[3] );
					break;
				} elseif ( $params[1] === 'statuschanges' ) {
					$view = new CodeStatusChangeAuthorListView( $repo, $params[3] );
					break;
				}
				// @todo FIXME: Fall through or not?
			default:
				if ( $params[2] == 'reply' ) {
					$view = new CodeRevisionView( $repo, $params[1], $user, $params[3] );
					break;
				}
				return null;
			}
		}
		return $view;
	}

	protected function getGroupName() {
		return 'developer';
	}

	/**
	 * Only list me on Special:SpecialPages when configured.
	 * @return bool
	 */
	public function isListed() {
		return $this->getConfig()->get( 'CodeReviewListSpecialPage' );
	}
}
