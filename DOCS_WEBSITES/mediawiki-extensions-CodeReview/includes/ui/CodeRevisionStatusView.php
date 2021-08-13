<?php

class CodeRevisionStatusView extends CodeRevisionListView {
	public function __construct( $repo, $status ) {
		parent::__construct( $repo );
		$this->mStatus = $status;
	}

	public function getPager() {
		return new SvnRevStatusTablePager( $this, $this->mStatus );
	}
}
