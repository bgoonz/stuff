<?php

class CodeRevisionAuthorView extends CodeRevisionListView {
	public function __construct( $repo, $author ) {
		parent::__construct( $repo );
		$this->mAuthor = $author;
		$this->mUser = $this->mRepo->authorWikiUser( $author );
	}

	public function getPager() {
		return new SvnRevAuthorTablePager( $this, $this->mAuthor );
	}

	public function linkStatus() {
		if ( !$this->mUser ) {
			return wfMessage( 'code-author-orphan' )->rawParams( $this->authorLink( $this->mAuthor ) )
				->escaped();
		}

		return wfMessage( 'code-author-haslink' )
			->rawParams( Linker::userLink( $this->mUser->getId(), $this->mUser->getName() ) .
			Linker::userToolLinks(
				$this->mUser->getId(),
				$this->mUser->getName(),
				false, /* default for redContribsWhenNoEdits */
				Linker::TOOL_LINKS_EMAIL /* Add "send email" link */
			) )->escaped();
	}

	public function execute() {
		global $wgOut;

		$linkInfo = $this->linkStatus();

		$linkRenderer = \MediaWiki\MediaWikiServices::getInstance()->getLinkRenderer();
		// Give grep a chance to find the usages:
		// code-author-link, code-author-unlink
		if ( RequestContext::getMain()->getUser()->isAllowed( 'codereview-link-user' ) ) {
			$repo = $this->mRepo->getName();
			$page = SpecialPage::getTitleFor( 'Code', "$repo/author/$this->mAuthor/link" );
			$linkInfo .= ' (' . $linkRenderer->makeLink( $page,
				wfMessage( 'code-author-' . ( $this->mUser ? 'un' : '' ) . 'link' )->text() ) . ')';
		}

		$repoLink = $linkRenderer->makeLink(
			SpecialPage::getTitleFor( 'Code', $this->mRepo->getName() ),
			$this->mRepo->getName()
		);
		$fields = [
			'code-rev-repo' => $repoLink,
			'code-rev-author' => $this->mAuthor,
		];

		$wgOut->addHTML( $this->formatMetaData( $fields ) . $linkInfo );

		parent::execute();
	}
}
