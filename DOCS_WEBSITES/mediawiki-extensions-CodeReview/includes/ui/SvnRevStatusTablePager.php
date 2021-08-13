<?php

class SvnRevStatusTablePager extends SvnRevTablePager {
	public function __construct( $view, $status ) {
		parent::__construct( $view );
		$this->mStatus = $status;
	}

	public function getQueryInfo() {
		$info = parent::getQueryInfo();
		$info['conds']['cr_status'] = $this->mStatus; // FIXME: normalize input?
		return $info;
	}

	public function getTitle() {
		$repo = $this->mRepo->getName();
		return SpecialPage::getTitleFor( 'Code', "$repo/status/$this->mStatus" );
	}
}
