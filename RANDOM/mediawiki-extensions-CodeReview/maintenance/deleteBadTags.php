<?php

$IP = getenv( 'MW_INSTALL_PATH' );
if ( $IP === false ) {
	$IP = __DIR__ . '/../../..';
}
require_once "$IP/maintenance/Maintenance.php";

class DeleteBadTags extends Maintenance {
	public function __construct() {
		parent::__construct();
		$this->addDescription( 'Delete empty Code Review tags' );
		$this->addOption( 'dry-run', 'Don\'t actually delete bad tags, just compile statistics.' );
		$this->requireExtension( 'CodeReview' );
	}

	public function execute() {
		$dbw = wfGetDB( DB_PRIMARY );
		$dbw->begin( __METHOD__ );
		$dbw->delete( 'code_tags', [ 'ct_tag' => '' ], __METHOD__ );
		$count = $dbw->affectedRows();

		$this->output( "Deleting empty tags...\n" );
		if ( !$this->getOption( 'dry-run' ) ) {
			$dbw->commit( __METHOD__ );
			$this->output( "$count bad tags deleted. Done!\n" );
		} else {
			$dbw->rollback( __METHOD__ );
			$this->output( "$count bad tags. Not committed!\n" );
		}
	}
}

$maintClass = DeleteBadTags::class;
require_once RUN_MAINTENANCE_IF_MAIN;
