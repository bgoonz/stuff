<?php
/**
 * Maintenance script to populate the ca_user column in the code_authors table.
 * Somewhat copypasted from repopulateCodePaths.php.
 *
 * @file
 * @ingroup Maintenance
 */
$IP = getenv( 'MW_INSTALL_PATH' );
if ( $IP === false ) {
	$IP = __DIR__ . '/../../..';
}
require_once "$IP/maintenance/Maintenance.php";

class PopulateCaUserColumn extends Maintenance {
	public function __construct() {
		parent::__construct();
		$this->addDescription( 'Populates the code_authors.ca_user column so that Renameuser ' .
			'doesn\'t get confused.' );
		$this->addOption( 'repo', 'The name of the repository. Cannot be all.', true, true );

		$this->requireExtension( 'CodeReview' );
	}

	public function execute() {
		$repoName = $this->getOption( 'repo' );
		if ( !$repoName ) {
			$this->error( 'Need a repository name to do something!', true );
		}

		// Oh come on!
		if ( $repoName == 'all' ) {
			$this->error( "Cannot use the 'all' repo", true );
		}

		$repo = CodeRepository::newFromName( $repoName );
		if ( !$repo ) {
			$this->error( "Repo '{$repoName}' is not a valid repository", true );
		}

		$dbr = wfGetDB( DB_REPLICA );

		$res = $dbr->select(
			'code_authors',
			'ca_user_text',
			[
				'ca_repo_id' => $repo->getId(),
				'ca_user' => 0
			],
			__METHOD__
		);

		$numRows = $dbr->numRows( $res );

		// No results == nothing to do, so bail out
		if ( $numRows == 0 ) {
			$this->error( "Nothing to do here, Captain!\n", true );
		}

		// Show some information to the user so that they're aware that we're
		// actually doing stuff, too, instead of goofing off
		$this->output( "{$numRows} authors with ca_user = 0 in the table...\n" );

		$dbw = wfGetDB( DB_PRIMARY );
		$this->beginTransaction( $dbw, __METHOD__ );

		foreach ( $res as $row ) {
			$userId = User::idFromName( $row->ca_user_text );

			// It's not paranoia if they're out to get you!
			if ( $userId === null ) {
				$this->output(
					"Unable to get the user ID for the user named: {$row->ca_user_text}\n"
				);
				continue;
			}

			$dbw->update(
				'code_authors',
				[ 'ca_user' => $userId ],
				[
					'ca_repo_id' => $repo->getId(),
					'ca_user_text' => $row->ca_user_text
				],
				__METHOD__
			);
		}

		$this->commitTransaction( $dbw, __METHOD__ );

		$this->output( "Done!\n" );
	}
}

$maintClass = PopulateCaUserColumn::class;
require_once RUN_MAINTENANCE_IF_MAIN;
