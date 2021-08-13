<?php

class CodeRevisionTagView extends CodeRevisionListView {
	public function __construct( $repo, $tag ) {
		$this->mTag = $tag;

		if ( $this->mTag ) {
			$this->filters[] = wfMessage( 'code-revfilter-ct_tag', $this->mTag )->text();
		}
		parent::__construct( $repo );
	}

	public function getPager() {
		return new SvnRevTagTablePager( $this, $this->mTag );
	}
}
