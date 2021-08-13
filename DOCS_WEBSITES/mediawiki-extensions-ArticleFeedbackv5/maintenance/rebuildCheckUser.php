<?php
/**
 * ArticleFeedbackv5_RebuildCheckUser class
 *
 * @package    ArticleFeedbackv5
 * @author     Matthias Mullie <mmullie@wikimedia.org>
 */

require_once getenv( 'MW_INSTALL_PATH' ) !== false
	? getenv( 'MW_INSTALL_PATH' ) . '/maintenance/Maintenance.php'
	: __DIR__ . '/../../../maintenance/Maintenance.php';

use MediaWiki\MediaWikiServices;

/**
 * Rebuild AFT's CheckUser entries
 *
 * @package    ArticleFeedbackv5
 */
class ArticleFeedbackv5_RebuildCheckUser extends Maintenance {

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
		$this->addDescription( 'Rebuild checkuser actiontext & logging usernames (based on checkuser data)' );

		$this->requireExtension( 'Article Feedback' );
	}

	/**
	 * Execute the script
	 */
	public function execute() {
		$this->output( "Updating entries\n" );

		$continue = [ 'timestamp' => '00000000000000', 'id' => 0 ];

		while ( $continue !== null ) {
			$continue = $this->refreshBatch( $continue );

			$factory = MediaWikiServices::getInstance()->getDBLoadBalancerFactory();
			$factory->waitForReplication();

			if ( $continue ) {
				$this->output( '--refreshed to entry #' . $continue['id'] . "\n" );
			}
		}

		$this->output( "done. Refreshed " . $this->completeCount . " entries.\n" );
	}

	/**
	 * Refreshes a batch of checkuser
	 *
	 * @param array $continue Pull the next batch starting at this [log_timestamp, log_id]
	 * @return array|null
	 */
	public function refreshBatch( $continue ) {
		$dbw = wfGetDB( DB_PRIMARY );
		$dbr = wfGetDB( DB_REPLICA );

		$commentQuery = CommentStore::getStore()->getJoin( 'log_comment' );
		$actorQuery = ActorMigration::newMigration()->getJoin( 'log_user' );

		$rows = $dbr->select(
			[ 'logging', 'cu_changes' ] + $commentQuery['tables'] + $actorQuery['tables'],
			[
				'log_id',
				'log_type',
				'log_action',
				'log_timestamp',
				'log_namespace',
				'log_title',
				'log_page',
				'log_params',
				'log_deleted',
				'cuc_id',
				'cuc_ip'
			] + $commentQuery['fields'] + $actorQuery['fields'],
			[
				'log_timestamp >= ' . $dbr->addQuotes( $dbr->timestamp( $continue['timestamp'] ) ),
				'log_id > ' . $continue['id'],
				'log_title LIKE "ArticleFeedbackv5/%"',
				'log_namespace' => NS_SPECIAL
			],
			__METHOD__,
			[
				'LIMIT'    => $this->limit,
				'ORDER BY' => [ 'log_timestamp', 'log_id' ],
			],
			[
				'cu_changes' => [
					'INNER JOIN', [
						'log_namespace = cuc_namespace',
						'log_title = cuc_title',
						'log_timestamp = cuc_timestamp',
						'log_user = cuc_user',
						'log_user_text = cuc_user_text'
					]
				]
			] + $commentQuery['joins'] + $actorQuery['joins']
		);

		$continue = null;

		foreach ( $rows as $row ) {
			$continue = [
				'timestamp' => $row->log_timestamp,
				'id' => $row->log_id
			];

			$update = [];

			// fix log entry usernames: anon actions have at times been
			// identified as "Article Feedback V5" rather than as IP
			if ( $row->log_user_text == 'Article Feedback V5'
				&& $row->log_comment != 'Automatic un-hide'
				&& !in_array( $row->log_type, [ 'autohide', 'autoflag' ] )
			) {
				$dbw->update(
					'logging',
					[ 'log_user_text' => $row->cuc_ip ],
					[ 'log_id' => $row->log_id ]
				);

				$update['cuc_user_text'] = $row->cuc_ip;
			}

			// fix bad action texts for AFT: the native formatter getPlainActionText
			// did not support AFT entries too well, leaving it packed with
			// escaped html entities, causing a horrible display
			$formatter = LogFormatter::newFromRow( $row );
			if ( $formatter ) {
				$update['cuc_actiontext'] = $formatter->getPlainActionText();
			}

			// update checkuser entry
			$dbw->update(
				'cu_changes',
				$update,
				[ 'cuc_id' => $row->cuc_id ]
			);

			$this->completeCount++;
		}

		return $continue;
	}
}

$maintClass = "ArticleFeedbackv5_RebuildCheckUser";
require_once RUN_MAINTENANCE_IF_MAIN;
