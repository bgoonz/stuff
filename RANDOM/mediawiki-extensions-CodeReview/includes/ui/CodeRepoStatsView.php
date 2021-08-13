<?php

/**
 * Special:Code/MediaWiki/stats
 */
class CodeRepoStatsView extends CodeView {
	public function execute() {
		global $wgOut, $wgLang;

		// Todo inject instead of accessing the global
		$output = $wgOut;

		$stats = RepoStats::newFromRepo( $this->mRepo );
		$repoName = $this->mRepo->getName();
		$output->wrapWikiMsg( '<h2 id="stats-main">$1</h2>', [ 'code-stats-header', $repoName ] );
		$output->addWikiMsg( 'code-stats-main',
			$wgLang->timeanddate( $stats->time, true ),
			$wgLang->formatNum( $stats->revisions ),
			$repoName,
			$wgLang->formatNum( $stats->authors ),
			$wgLang->time( $stats->time, true ),
			$wgLang->date( $stats->time, true )
		);

		if ( !empty( $stats->states ) ) {
			$output->wrapWikiMsg( '<h3 id="stats-revisions">$1</h3>',
				'code-stats-status-breakdown' );
			$output->addHTML( '<table class="wikitable">'
				. '<tr><th>' . wfMessage( 'code-field-status' )->escaped() . '</th><th>'
				. wfMessage( 'code-stats-count' )->escaped() . '</th></tr>' );
			$linkRenderer = \MediaWiki\MediaWikiServices::getInstance()->getLinkRenderer();
			foreach ( CodeRevision::getPossibleStates() as $state ) {
				$rawCount = $stats->states[$state] ?? 0;
				$count = htmlspecialchars( $wgLang->formatNum( $rawCount ) );
				$link = $linkRenderer->makeLink(
					SpecialPage::getTitleFor( 'Code', $repoName . '/status/' . $state ),
					$this->statusDesc( $state )
				);
				$output->addHTML( "<tr><td>$link</td>"
					. "<td class=\"mw-codereview-status-$state\">$count</td></tr>" );
			}
			$output->addHTML( '</table>' );
		}

		if ( !empty( $stats->fixmes ) ) {
			$this->writeAuthorStatusTable( $output, 'fixme', $stats->fixmes );
		}

		if ( !empty( $stats->new ) ) {
			$this->writeAuthorStatusTable( $output, 'new', $stats->new );
		}

		if ( !empty( $stats->fixmesPerPath ) ) {
			$this->writeStatusPathTable( $output, 'fixme', $stats->fixmesPerPath );
		}

		if ( !empty( $stats->newPerPath ) ) {
			$this->writeStatusPathTable( $output, 'new', $stats->newPerPath );
		}
	}

	/**
	 * @param OutputPage $output
	 * @param string $status
	 * @param array $array
	 */
	private function writeStatusPathTable( $output, $status, $array ) {
		$output->wrapWikiMsg( "<h3 id=\"stats-$status-path\">$1</h3>",
			"code-stats-$status-breakdown-path" );

		foreach ( $array as $path => $news ) {
			$output->wrapWikiMsg( "<h4 id=\"stats-$status-path\">$1</h4>",
				[ "code-stats-$status-path", $path ] );
			$this->writeAuthorTable( $output, $status, $news, [ 'path' => $path ] );
		}
	}

	/**
	 * @param OutputPage $output
	 * @param string $status
	 * @param array $array
	 */
	private function writeAuthorStatusTable( $output, $status, $array ) {
		$output->wrapWikiMsg( "<h3 id=\"stats-{$status}\">$1</h3>",
			"code-stats-{$status}-breakdown" );
		$this->writeAuthorTable( $output, $status, $array );
	}

	/**
	 * @param OutputPage $output
	 * @param string $status
	 * @param array $array
	 * @param array $options
	 */
	private function writeAuthorTable( $output, $status, $array, $options = [] ) {
		global $wgLang;

		$repoName = $this->mRepo->getName();
		$output->addHTML( '<table class="wikitable">'
			. '<tr><th>' . wfMessage( 'code-field-author' )->escaped() . '</th><th>'
			. wfMessage( 'code-stats-count' )->escaped() . '</th></tr>' );
		$title = SpecialPage::getTitleFor( 'Code', $repoName . "/status/{$status}" );

		$linkRenderer = \MediaWiki\MediaWikiServices::getInstance()->getLinkRenderer();
		foreach ( $array as $user => $count ) {
			$count = htmlspecialchars( $wgLang->formatNum( $count ) );
			$link = $linkRenderer->makeLink(
				$title,
				$user,
				[],
				array_merge( $options, [ 'author' => $user ] )
			);
			$output->addHTML( "<tr><td>$link</td>"
				. "<td>$count</td></tr>" );
		}
		$output->addHTML( '</table>' );
	}
}
