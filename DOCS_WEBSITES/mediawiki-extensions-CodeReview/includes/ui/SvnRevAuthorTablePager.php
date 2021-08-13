<?php

class SvnRevAuthorTablePager extends SvnRevTablePager {
	public function __construct( $view, $author ) {
		parent::__construct( $view );
		$this->mAuthor = $author;
	}

	public function getQueryInfo() {
		$info = parent::getQueryInfo();
		$info['conds']['cr_author'] = $this->mAuthor; // fixme: normalize input?
		return $info;
	}

	public function getTitle() {
		$repo = $this->mRepo->getName();
		return SpecialPage::getTitleFor( 'Code', "$repo/author/$this->mAuthor" );
	}
}
