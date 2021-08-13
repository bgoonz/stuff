<?php

class CodeStatusChangeAuthorListView extends CodeStatusChangeListView {

	public function __construct( $repo, $author ) {
		parent::__construct( $repo );

		$this->mAuthor = $author;
	}
}
