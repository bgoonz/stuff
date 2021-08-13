<?php
/**
 * ArticleFeedbackv5_ArchiveFeedback class
 *
 * @package    ArticleFeedbackv5
 * @author     Matthias Mullie <mmullie@wikimedia.org>
 */

require_once getenv( 'MW_INSTALL_PATH' ) !== false
	? getenv( 'MW_INSTALL_PATH' ) . '/maintenance/Maintenance.php'
	: __DIR__ . '/../../../maintenance/Maintenance.php';

use MediaWiki\MediaWikiServices;

/**
 * Mark old feedback that is not particularly interesting as archived.
 *
 * @package    ArticleFeedbackv5
 */
class ArticleFeedbackv5_ArchiveFeedback extends Maintenance {
	/**
	 * Batch size
	 *
	 * @var int
	 */
	private $limit = 50;

	/**
	 * The number of entries completed
	 *
	 * @var int
	 */
	private $completeCount = 0;

	/**
	 * Constructor
	 */
	public function __construct() {
		parent::__construct();
		$this->addDescription( 'Mark old feedback that is not particularly interesting as archived.' );

		$this->requireExtension( 'Article Feedback' );
	}

	/**
	 * Even though (theoretically) we could use "aft_archive_date >= NOW()" condition
	 * on wiki's with no cache configured, I deliberately did not make that possible.
	 * The problem when using cache is that that the result of that condition changes
	 * outside of our control. As seconds go by and more and more articles are to be
	 * considered archived, no code is executed, so we can't purge/update caches to
	 * reflect the changes.
	 * We'll be using "aft_archive = 1" to determine if feedback is or is not archived.
	 * This script will run periodically and will evaluate all entries to
	 * "aft_archive_date >= NOW()", and set "aft_archive = 1" for those. That way,
	 * it works similar to any other action plus caches will update nicely.
	 */
	public function execute() {
		global $wgArticleFeedbackv5Cluster, $wgArticleFeedbackv5AutoArchiveEnabled;

		if ( !$wgArticleFeedbackv5AutoArchiveEnabled ) {
			$this->output( 'IMPORTANT! Auto-archive is currently disabled. To enable, set $wgArticleFeedbackv5AutoArchiveEnabled = true.' . "\n" );
		} else {
			$this->output( "Marking old feedback as archived.\n" );

			/**
			 * Temporarily create a bogus filter that is more of an aid to use the model's
			 * built-in functions to query for stuff that has not yet been archived but is due.
			 */
			$now = wfTimestampNow();
			ArticleFeedbackv5Model::$lists['archive_scheduled'] = [
				'permissions' => 'aft-noone',
				'conditions' => [ 'aft_archive = 0', "aft_archive_date <= '$now'" ],
			];

			$backend = ArticleFeedbackv5Model::getBackend();
			while ( true ) {
				$break = true;
				$feedback = null;

				$list = $backend->getList( 'archive_scheduled', null, null, $this->limit, 'age', 'ASC' );

				foreach ( $list as $row ) {
					$feedback = ArticleFeedbackv5Model::loadFromRow( $row );

					$timestamp = wfTimestamp( TS_UNIX, $feedback->aft_timestamp );
					$archiveDate = wfTimestamp( TS_UNIX, $feedback->aft_archive_date );
					$days = round( ( $archiveDate - $timestamp ) / ( 60 * 60 * 24 ) );
					$note = wfMessage( 'articlefeedbackv5-activity-note-archive', $days )->escaped();

					$flagger = new ArticleFeedbackv5Flagging( null, $feedback->aft_id, $feedback->aft_page );
					$success = $flagger->run( 'archive', $note, false, 'job' );

					if ( $success ) {
						$this->completeCount++;
					} else {
						// if we could not flag, unmark as archive_schedule
						$feedback->aft_archive_date = null;
						$feedback->update( false );
					}

					$break = false;
				}

				if ( $feedback ) {
					$this->output( "--moved to entry #$feedback->aft_id\n" );
				}

				$factory = MediaWikiServices::getInstance()->getDBLoadBalancerFactory();
				$factory->waitForReplication( [
					'ifWritesSince' => false,
					'domain' => false,
					'cluster' => $wgArticleFeedbackv5Cluster
				] );

				if ( $break ) {
					break;
				}
			}

			$this->output( "Done. Marked " . $this->completeCount . " entries as archived.\n" );
		}
	}
}

$maintClass = "ArticleFeedbackv5_ArchiveFeedback";
require_once RUN_MAINTENANCE_IF_MAIN;
