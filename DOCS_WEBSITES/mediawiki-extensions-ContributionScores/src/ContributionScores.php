<?php
/** \file
 * \brief Contains code for the ContributionScores Class (extends SpecialPage).
 */

/// Special page class for the Contribution Scores extension
/**
 * Special page that generates a list of wiki contributors based
 * on edit diversity (unique pages edited) and edit volume (total
 * number of edits.
 *
 * @ingroup Extensions
 * @author Tim Laqua <t.laqua@gmail.com>
 */
class ContributionScores extends IncludableSpecialPage {
	const CONTRIBUTIONSCORES_MAXINCLUDELIMIT = 50;

	public function __construct() {
		parent::__construct( 'ContributionScores' );
	}

	public static function onParserFirstCallInit( Parser $parser ) {
		$parser->setFunctionHook( 'cscore', [ self::class, 'efContributionScoresRender' ] );
	}

	public static function efContributionScoresRender( $parser, $usertext, $metric = 'score' ) {
		global $wgContribScoreDisableCache;

		if ( $wgContribScoreDisableCache ) {
			$parser->getOutput()->updateCacheExpiry( 0 );
		}

		$user = User::newFromName( $usertext );
		$dbr = wfGetDB( DB_REPLICA );

		if ( $user instanceof User && $user->isRegistered() ) {
			global $wgLang;

			$revWhere = ActorMigration::newMigration()->getWhere( $dbr, 'rev_user', $user );
			if ( $metric == 'score' ) {
				$res = $dbr->select(
					[ 'revision' ] + $revWhere['tables'],
					'COUNT(DISTINCT rev_page)+SQRT(COUNT(rev_id)-COUNT(DISTINCT rev_page))*2 AS wiki_rank',
					$revWhere['conds'],
					__METHOD__,
					[],
					$revWhere['joins']
				);
				$row = $dbr->fetchObject( $res );
				$output = $wgLang->formatNum( round( $row->wiki_rank, 0 ) );
			} elseif ( $metric == 'changes' ) {
				$res = $dbr->select(
					[ 'revision' ] + $revWhere['tables'],
					'COUNT(rev_id) AS rev_count',
					$revWhere['conds'],
					__METHOD__,
					[],
					$revWhere['joins']
				);
				$row = $dbr->fetchObject( $res );
				$output = $wgLang->formatNum( $row->rev_count );
			} elseif ( $metric == 'pages' ) {
				$res = $dbr->select(
					[ 'revision' ] + $revWhere['tables'],
					'COUNT(DISTINCT rev_page) AS page_count',
					$revWhere['conds'],
					__METHOD__,
					[],
					$revWhere['joins']
				);
				$row = $dbr->fetchObject( $res );
				$output = $wgLang->formatNum( $row->page_count );
			} else {
				$output = wfMessage( 'contributionscores-invalidmetric' )->text();
			}
		} else {
			$output = wfMessage( 'contributionscores-invalidusername' )->text();
		}
		return $parser->insertStripItem( $output, $parser->mStripState );
	}

	/// Generates a "Contribution Scores" table for a given LIMIT and date range

	/**
	 * Function generates Contribution Scores tables in HTML format (not wikiText)
	 *
	 * @param int $days Days in the past to run report for
	 * @param int $limit Maximum number of users to return (default 50)
	 * @param string|null $title The title of the table
	 * @param array $options array of options (default none; nosort/notools)
	 * @return string Html Table representing the requested Contribution Scores.
	 */
	function genContributionScoreTable( $days, $limit, $title = null, $options = 'none' ) {
		global $wgContribScoreIgnoreBots, $wgContribScoreIgnoreBlockedUsers, $wgContribScoresUseRealName;

		$opts = explode( ',', strtolower( $options ) );

		$dbr = wfGetDB( DB_REPLICA );

		$revQuery = ActorMigration::newMigration()->getJoin( 'rev_user' );
		$revQuery['tables'] = array_merge( [ 'revision' ], $revQuery['tables'] );

		$revUser = $revQuery['fields']['rev_user'];

		$sqlWhere = [];

		if ( $days > 0 ) {
			$date = time() - ( 60 * 60 * 24 * $days );
			$sqlWhere[] = 'rev_timestamp > ' . $dbr->addQuotes( $dbr->timestamp( $date ) );
		}

		if ( $wgContribScoreIgnoreBlockedUsers ) {
			$sqlWhere[] = "{$revUser} NOT IN " .
				$dbr->buildSelectSubquery( 'ipblocks', 'ipb_user', 'ipb_user <> 0', __METHOD__ );
		}

		if ( $wgContribScoreIgnoreBots ) {
			$sqlWhere[] = "{$revUser} NOT IN " .
				$dbr->buildSelectSubquery( 'user_groups', 'ug_user', [
					'ug_group' => 'bot',
					'ug_expiry IS NULL OR ug_expiry >= ' . $dbr->addQuotes( $dbr->timestamp() )
				], __METHOD__ );
		}

		if ( $dbr->unionSupportsOrderAndLimit() ) {
			$order = [
				'GROUP BY' => 'rev_user',
				'ORDER BY' => 'page_count DESC',
				'LIMIT' => $limit
			];
		} else {
			$order = [ 'GROUP BY' => 'rev_user' ];
		}

		$sqlMostPages = $dbr->selectSQLText(
			$revQuery['tables'],
			[
				'rev_user'   => $revUser,
				'page_count' => 'COUNT(DISTINCT rev_page)',
				'rev_count'  => 'COUNT(rev_id)',
			],
			$sqlWhere,
			__METHOD__,
			$order,
			$revQuery['joins']
		);

		if ( $dbr->unionSupportsOrderAndLimit() ) {
			$order['ORDER BY'] = 'rev_count DESC';
		}

		$sqlMostRevs = $dbr->selectSQLText(
			$revQuery['tables'],
			[
				'rev_user' => $revUser,
				'page_count' => 'COUNT(DISTINCT rev_page)',
				'rev_count' => 'COUNT(rev_id)',
			],
			$sqlWhere,
			__METHOD__,
			$order,
			$revQuery['joins']
		);

		$sqlMostPagesOrRevs = $dbr->unionQueries( [ $sqlMostPages, $sqlMostRevs ], false );
		$res = $dbr->select(
			[
				'u' => 'user',
				's' => new Wikimedia\Rdbms\Subquery( $sqlMostPagesOrRevs ),
			],
			[
				'user_id',
				'user_name',
				'user_real_name',
				'page_count',
				'rev_count',
				'wiki_rank' => 'page_count+SQRT(rev_count-page_count)*2',
			],
			[],
			__METHOD__,
			[
				'ORDER BY' => 'wiki_rank DESC',
				'GROUP BY' => 'user_name',
				'LIMIT' => $limit,
			],
			[
				's' => [
					'JOIN',
					'user_id=rev_user'
				]
			]
		);

		$sortable = in_array( 'nosort', $opts ) ? '' : ' sortable';

		$output = "<table class=\"wikitable contributionscores plainlinks{$sortable}\" >\n" .
			"<tr class='header'>\n" .
			Html::element( 'th', [], $this->msg( 'contributionscores-rank' )->text() ) .
			Html::element( 'th', [], $this->msg( 'contributionscores-score' )->text() ) .
			Html::element( 'th', [], $this->msg( 'contributionscores-pages' )->text() ) .
			Html::element( 'th', [], $this->msg( 'contributionscores-changes' )->text() ) .
			Html::element( 'th', [], $this->msg( 'contributionscores-username' )->text() );

		$altrow = '';
		$user_rank = 1;

		$lang = $this->getLanguage();
		foreach ( $res as $row ) {
			// Use real name if option used and real name present.
			if ( $wgContribScoresUseRealName && $row->user_real_name !== '' ) {
				$userLink = Linker::userLink(
					$row->user_id,
					$row->user_name,
					$row->user_real_name
				);
			} else {
				$userLink = Linker::userLink(
					$row->user_id,
					$row->user_name
				);
			}

			$output .= Html::closeElement( 'tr' );
			$output .= "<tr class='{$altrow}'>\n" .
				"<td class='content' style='padding-right:10px;text-align:right;'>" .
				$lang->formatNum( $user_rank ) .
				"\n</td><td class='content' style='padding-right:10px;text-align:right;'>" .
				$lang->formatNum( round( $row->wiki_rank, 0 ) ) .
				"\n</td><td class='content' style='padding-right:10px;text-align:right;'>" .
				$lang->formatNum( $row->page_count ) .
				"\n</td><td class='content' style='padding-right:10px;text-align:right;'>" .
				$lang->formatNum( $row->rev_count ) .
				"\n</td><td class='content'>" .
				$userLink;

			# Option to not display user tools
			if ( !in_array( 'notools', $opts ) ) {
				$output .= Linker::userToolLinks( $row->user_id, $row->user_name );
			}

			$output .= Html::closeElement( 'td' ) . "\n";

			if ( $altrow == '' && empty( $sortable ) ) {
				$altrow = 'odd ';
			} else {
				$altrow = '';
			}

			$user_rank++;
		}
		$output .= Html::closeElement( 'tr' );
		$output .= Html::closeElement( 'table' );

		$dbr->freeResult( $res );

		if ( !empty( $title ) ) {
			$output = Html::rawElement( 'table',
				[
					'style' => 'border-spacing: 0; padding: 0',
					'class' => 'contributionscores-wrapper',
					'lang' => htmlspecialchars( $lang->getCode() ),
					'dir' => $lang->getDir()
				],
				"\n" .
				"<tr>\n" .
				"<td style='padding: 0px;'>{$title}</td>\n" .
				"</tr>\n" .
				"<tr>\n" .
				"<td style='padding: 0px;'>{$output}</td>\n" .
				"</tr>\n"
			);
		}

		return $output;
	}

	function execute( $par ) {
		$this->setHeaders();

		if ( $this->including() ) {
			$this->showInclude( $par );
		} else {
			$this->showPage();
		}

		return true;
	}

	/**
	 * Called when being included on a normal wiki page.
	 * Cache is disabled so it can depend on the user language.
	 * @param string|null $par A subpage give to the special page
	 */
	function showInclude( $par ) {
		$days = null;
		$limit = null;
		$options = 'none';

		if ( !empty( $par ) ) {
			$params = explode( '/', $par );

			$limit = intval( $params[0] );

			if ( isset( $params[1] ) ) {
				$days = intval( $params[1] );
			}

			if ( isset( $params[2] ) ) {
				$options = $params[2];
			}
		}

		if ( empty( $limit ) || $limit < 1 || $limit > self::CONTRIBUTIONSCORES_MAXINCLUDELIMIT ) {
			$limit = 10;
		}
		if ( $days === null || $days < 0 ) {
			$days = 7;
		}

		if ( $days > 0 ) {
			$reportTitle = $this->msg( 'contributionscores-days' )->numParams( $days )->text();
		} else {
			$reportTitle = $this->msg( 'contributionscores-allrevisions' )->text();
		}
		$reportTitle .= ' ' . $this->msg( 'contributionscores-top' )->numParams( $limit )->text();
		$title = Xml::element( 'h4',
				[ 'class' => 'contributionscores-title' ],
				$reportTitle
			) . "\n";
		$this->getOutput()->addHTML( $this->genContributionScoreTable(
			$days,
			$limit,
			$title,
			$options
		) );
	}

	/**
	 * Show the special page
	 */
	function showPage() {
		global $wgContribScoreReports;

		if ( !is_array( $wgContribScoreReports ) ) {
			$wgContribScoreReports = [
				[ 7, 50 ],
				[ 30, 50 ],
				[ 0, 50 ]
			];
		}

		$out = $this->getOutput();
		$out->addWikiMsg( 'contributionscores-info' );

		foreach ( $wgContribScoreReports as $scoreReport ) {
			list( $days, $revs ) = $scoreReport;
			if ( $days > 0 ) {
				$reportTitle = $this->msg( 'contributionscores-days' )->numParams( $days )->text();
			} else {
				$reportTitle = $this->msg( 'contributionscores-allrevisions' )->text();
			}
			$reportTitle .= ' ' . $this->msg( 'contributionscores-top' )->numParams( $revs )->text();
			$title = Xml::element( 'h2',
					[ 'class' => 'contributionscores-title' ],
					$reportTitle
				) . "\n";
			$out->addHTML( $title );
			$out->addHTML( $this->genContributionScoreTable( $days, $revs ) );
		}
	}

	/**
	 * @inheritDoc
	 */
	protected function getGroupName() {
		return 'wiki';
	}
}
