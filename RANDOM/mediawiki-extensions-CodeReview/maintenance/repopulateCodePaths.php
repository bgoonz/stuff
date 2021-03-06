<?php
$IP = getenv( 'MW_INSTALL_PATH' );
if ( $IP === false ) {
	$IP = __DIR__ . '/../../..';
}
require_once "$IP/maintenance/Maintenance.php";

class RepopulateCodePaths extends Maintenance {
	public function __construct() {
		parent::__construct();
		$this->addDescription( 'Rebuilds all code paths to support more efficient searching' );
		$this->addArg( 'repo', 'The name of the repo. Cannot be all.' );
		$this->addArg( 'revisions', 'The revisions to set status for. Format: start:end' );

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

		$revisions = $this->getArg( 1 );
		if ( strpos( $revisions, ':' ) !== false ) {
			$revisionVals = explode( ':', $revisions, 2 );
		} else {
			$this->error( "Invalid revision range", true );
		}

		$start = intval( $revisionVals[0] );
		$end = intval( $revisionVals[1] );

		$revisions = range( $start, $end );

		$dbr = wfGetDB( DB_REPLICA );

		$res = $dbr->select(
			'code_paths',
			'*',
			[ 'cp_rev_id' => $revisions, 'cp_repo_id' => $repo->getId() ],
			__METHOD__
		);

		$dbw = wfGetDB( DB_PRIMARY );
		$this->beginTransaction( $dbw, __METHOD__ );

		foreach ( $res as $row ) {
			$fragments = CodeRevision::getPathFragments(
				[ [ 'path' => $row->cp_path, 'action' => $row->cp_action ] ]
			);

			CodeRevision::insertPaths( $dbw, $fragments, $repo->getId(), $row->cp_rev_id );

			$this->output( "r{$row->cp_rev_id}, path: " . $row->cp_path . " Fragments: " .
				count( $fragments ) . "\n" );
		}

		$this->commitTransaction( $dbw, __METHOD__ );

		$this->output( "Done!\n" );
	}
}

$maintClass = RepopulateCodePaths::class;
require_once RUN_MAINTENANCE_IF_MAIN;
