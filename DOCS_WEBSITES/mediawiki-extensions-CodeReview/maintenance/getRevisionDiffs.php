<?php

use MediaWiki\MediaWikiServices;

$IP = getenv( 'MW_INSTALL_PATH' );
if ( $IP === false ) {
	$IP = __DIR__ . '/../../..';
}
require_once "$IP/maintenance/Maintenance.php";

class GetRevisionDiffs extends Maintenance {
	public function __construct() {
		parent::__construct();
		$this->addDescription( 'Populates the cr_diff column (where possible) for all rows in a repo' );
		$this->addArg( 'repo', 'The name of the repo. Cannot be all.' );

		$this->requireExtension( 'CodeReview' );
	}

	public function execute() {
		$repoName = $this->getArg( 0 );

		if ( $repoName == 'all' ) {
			$this->error( "Cannot use the 'all' repo", true );
		}

		$repo = CodeRepository::newFromName( $repoName );
		if ( !$repo ) {
			$this->error( "Repo '{$repoName}' is not a valid Repository", true );
		}

		$dbr = wfGetDB( DB_REPLICA );
		$lbFactory = MediaWikiServices::getInstance()->getDBLoadBalancerFactory();

		$res = $dbr->select(
			'code_rev',
			'cr_id',
			[ 'cr_repo_id' => $repo->getId(), 'cr_diff IS NULL' ],
			__METHOD__
		);

		$count = 0;
		foreach ( $res as $row ) {
			$id = $row->cr_id;
			try {
				$diff = $repo->getDiff( $row->cr_id, '' );
			} catch ( Exception $mwe ) {
				// Suppress errors
				$this->output( "$id - error {$mwe->getMessage()}\n" );
				continue;
			}
			if ( is_int( $diff ) ) {
				$error = CodeRepository::getDiffErrorMessage( $diff );
				$this->output( "$id - $error\n" );
			} else {
				$this->output( "$id\n" );
			}

			if ( ++$count % 100 == 0 ) {
				$lbFactory->waitForReplication();
			}
		}
		$this->output( "Done!\n" );
	}
}

$maintClass = GetRevisionDiffs::class;
require_once RUN_MAINTENANCE_IF_MAIN;
