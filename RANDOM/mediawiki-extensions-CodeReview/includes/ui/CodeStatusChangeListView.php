<?php

/**
 * Special:Code/MediaWiki
 */
class CodeStatusChangeListView extends CodeRevisionListView {
	public function getPager() {
		return new CodeStatusChangeTablePager( $this );
	}

	protected function getRevCount( $dbr ) {
		return -1;
	}
}
