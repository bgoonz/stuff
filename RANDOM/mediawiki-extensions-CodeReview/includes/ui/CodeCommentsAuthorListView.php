<?php

class CodeCommentsAuthorListView extends CodeCommentsListView {
	public function __construct( $repo, $author ) {
		parent::__construct( $repo );
		$this->mAuthor = $author;
	}
}
