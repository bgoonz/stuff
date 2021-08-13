<?php
/**
 * ArticleFeedbackv5_LoggingUpdate class
 *
 * @package    ArticleFeedbackv5
 * @author     Matthias Mullie <mmullie@wikimedia.org>
 */

require_once getenv( 'MW_INSTALL_PATH' ) !== false
	? getenv( 'MW_INSTALL_PATH' ) . '/maintenance/Maintenance.php'
	: __DIR__ . '/../../../maintenance/Maintenance.php';

use MediaWiki\MediaWikiServices;

/**
 * Refresh the filter counts
 *
 * @package    ArticleFeedbackv5
 */
class ArticleFeedbackv5_LoggingUpdate extends Maintenance {

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
		$this->addDescription( 'Rebuild existing logging.log_params data to form a serialized array with feedback id & page id' );

		$this->requireExtension( 'Article Feedback' );
	}

	/**
	 * Execute the script
	 */
	public function execute() {
		$this->output( "Updating log entries\n" );

		$continue = 0;

		while ( $continue !== null ) {
			$continue = $this->refreshBatch( $continue );

			$factory = MediaWikiServices::getInstance()->getDBLoadBalancerFactory();
			$factory->waitForReplication();

			if ( $continue ) {
				$this->output( "--refreshed to entry #$continue\n" );
			}
		}

		$this->output( "done. Refreshed " . $this->completeCount . " log entries.\n" );
	}

	/**
	 * Refreshes a batch of logging entries
	 *
	 * @param int $continue the pull the next batch starting at this log_id
	 * @return int|null
	 */
	public function refreshBatch( $continue ) {
		$dbw = wfGetDB( DB_PRIMARY );
		$dbr = wfGetDB( DB_REPLICA );

		$rows = $dbr->select(
			[ 'logging', 'page' ],
			[
				'log_id',
				'feedback_id' => 'SUBSTRING_INDEX(log_title, "/", -1)',
				'page_id',
				'log_action',
				'log_params'
			],
			[
				"log_id > $continue",
				'log_title LIKE "ArticleFeedbackv5/%"',
				'log_namespace' => NS_SPECIAL
			],
			__METHOD__,
			[
				'LIMIT'    => $this->limit,
				'ORDER BY' => 'log_id',
			],
			[
				'page' => [
					'INNER JOIN', [
						'page_namespace = 0', // this maintenance only supports NS_MAIN
						'page_title = SUBSTRING_INDEX(REPLACE(log_title, "ArticleFeedbackv5/", ""), "/", 1)'
					]
				]
			]
		);

		$continue = null;

		foreach ( $rows as $row ) {
			$continue = $row->log_id;

			// build params
			$params = @unserialize( $row->log_params );
			if ( !$params ) {
				$params = [];
			}
			$params['source'] = isset( $params['source'] ) ? $params['source'] : 'unknown';
			$params['feedbackId'] = (int)$row->feedback_id;
			$params['pageId'] = (int)$row->page_id;

			// fix log type
			switch ( $row->log_action ) {
				case 'hidden':
					$action = 'hide';
					break;
				case 'unhidden':
					$action = 'unhide';
					break;
				default:
					$action = $row->log_action;
					break;
			}

			// update log entry
			$dbw->update(
				'logging',
				[
					'log_action' => $action,
					'log_params' => serialize( $params )
				],
				[ 'log_id' => $row->log_id ]
			);

			$this->completeCount++;
		}

		return $continue;
	}
}

$maintClass = "ArticleFeedbackv5_LoggingUpdate";
require_once RUN_MAINTENANCE_IF_MAIN;
