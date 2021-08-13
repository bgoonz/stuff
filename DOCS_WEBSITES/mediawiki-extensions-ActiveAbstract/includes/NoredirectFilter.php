<?php

class NoredirectFilter extends DumpFilter {
	/**
	 * @param stdClass $page
	 * @return bool
	 */
	protected function pass( $page ) {
		return !$page->page_is_redirect;
	}
}
