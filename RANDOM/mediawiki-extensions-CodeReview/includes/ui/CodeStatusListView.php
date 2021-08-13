<?php

/**
 * Special:Code/MediaWiki/status
 */
class CodeStatusListView extends CodeView {
	public function execute() {
		global $wgOut;

		$name = $this->mRepo->getName();
		$states = CodeRevision::getPossibleStates();
		$wgOut->wrapWikiMsg( "== $1 ==", 'code-field-status' );

		$linkRenderer = \MediaWiki\MediaWikiServices::getInstance()->getLinkRenderer();
		$tableRows = '';
		foreach ( $states as $state ) {
			// Give grep a chance to find the usages:
			// code-status-new, code-status-fixme, code-status-reverted, code-status-resolved,
			// code-status-ok, code-status-deferred, code-status-old
			$link = $linkRenderer->makeLink(
				SpecialPage::getTitleFor( 'Code', $name . "/status/$state" ),
				wfMessage( 'code-status-' . $state )->text()
			);
			// Give grep a chance to find the usages:
			// code-status-desc-new, code-status-desc-fixme, code-status-desc-reverted,
			// code-status-desc-resolved, code-status-desc-ok, code-status-desc-deferred,
			// code-status-desc-old
			$tableRows .= "<tr><td class=\"mw-codereview-status-$state\">$link</td>"
				. '<td>' . wfMessage( 'code-status-desc-' . $state )->escaped() . "</td></tr>\n";
		}
		$wgOut->addHTML( '<table class="wikitable">'
			. '<tr><th>' . wfMessage( 'code-field-status' )->escaped() . '</th>'
			. '<th>' . wfMessage( 'code-field-status-description' )->escaped() . '</th></tr>'
			. $tableRows
			. '</table>'
		);
	}
}
