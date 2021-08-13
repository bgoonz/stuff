<?php
use MediaWiki\MediaWikiServices;

/**
 * Class for showing the list of repositories, if none was specified
 */
class CodeRepoListView {
	public function execute() {
		global $wgOut;
		$repos = CodeRepository::getRepoList();
		$user = RequestContext::getMain()->getUser();
		$services = MediaWikiServices::getInstance();
		$groupPermissionsLookup = $services->getGroupPermissionsLookup();
		if ( !count( $repos ) ) {
			$wgOut->addWikiMsg( 'code-no-repo' );

			if ( $user->isAllowed( 'repoadmin' ) ) {
				$wgOut->addWikiMsg( 'code-create-repo' );
			} else {
				$wgOut->addWikiMsg( 'code-need-repoadmin-rights' );

				if ( !count( $groupPermissionsLookup->getGroupsWithPermission( 'repoadmin' ) ) ) {
					$wgOut->addWikiMsg( 'code-need-group-with-rights' );
				}
			}
			return;
		}
		$text = '';
		foreach ( $repos as $repo ) {
			$text .= '* ' . self::getNavItem( $repo, $user ) . "\n";
		}
		$wgOut->addWikiTextAsInterface( $text );
	}

	/**
	 * @param CodeRepository $repo
	 * @param User $user
	 * @return string
	 */
	public static function getNavItem( $repo, User $user ) {
		global $wgLang;
		$name = $repo->getName();

		$code = SpecialPage::getTitleFor( 'Code', $name );
		$links[] = "[[$code/comments|" . wfMessage( 'code-notes' )->escaped() . ']]';
		$links[] = "[[$code/statuschanges|" . wfMessage( 'code-statuschanges' )->escaped() . ']]';
		if ( $user->getId() ) {
			$author = $repo->wikiUserAuthor( $user->getName() );
			if ( $author !== false ) {
				$links[] = "[[$code/author/$author|" . wfMessage( 'code-mycommits' )->escaped() . ']]';
			}
		}

		if ( $user->isAllowed( 'codereview-post-comment' ) ) {
			$userName = $user->getName();
			$links[] = "[[$code/comments/author/$userName|" . wfMessage( 'code-mycomments' )->escaped() .
				']]';
		}

		$links[] = "[[$code/tag|" . wfMessage( 'code-tags' )->escaped() . ']]';
		$links[] = "[[$code/author|" . wfMessage( 'code-authors' )->escaped() . ']]';
		$links[] = "[[$code/status|" . wfMessage( 'code-status' )->escaped() . ']]';
		$links[] = "[[$code/releasenotes|" . wfMessage( 'code-releasenotes' )->escaped() . ']]';
		$links[] = "[[$code/stats|" . wfMessage( 'code-stats' )->escaped() . ']]';
		if ( $user->isAllowed( 'repoadmin' ) ) {
			$links[] = "[[Special:RepoAdmin/$name|" . wfMessage( 'repoadmin-nav' )->escaped() . ']]';
		}
		$text = "'''[[$code|$name]]''' " .
			wfMessage( 'parentheses', $wgLang->pipeList( $links ) )->text();
		return $text;
	}
}
