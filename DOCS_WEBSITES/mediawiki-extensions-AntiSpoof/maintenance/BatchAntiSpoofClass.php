<?php
/**
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301, USA.
 * http://www.gnu.org/copyleft/gpl.html
 */

use MediaWiki\MediaWikiServices;

$IP = getenv( 'MW_INSTALL_PATH' );
if ( $IP === false ) {
	$IP = __DIR__ . '/../../..';
}
require_once "$IP/maintenance/Maintenance.php";

/**
 * Go through all usernames and calculate and record spoof thingies
 */
class BatchAntiSpoof extends Maintenance {

	public function __construct() {
		parent::__construct();

		$this->requireExtension( 'AntiSpoof' );
		$this->setBatchSize( 1000 );
	}

	/**
	 * @param array $items
	 */
	protected function batchRecord( $items ) {
		SpoofUser::batchRecord( $this->getDB( DB_PRIMARY ), $items );
	}

	/**
	 * @return string
	 */
	protected function getTableName() {
		return 'user';
	}

	/**
	 * @return string
	 */
	protected function getUserColumn() {
		return 'user_name';
	}

	/**
	 * @return string Primary key of the table returned by getTableName()
	 */
	protected function getPrimaryKey() {
		return 'user_id';
	}

	/**
	 * @param string $name
	 * @return SpoofUser
	 */
	protected function makeSpoofUser( $name ) {
		return new SpoofUser( $name );
	}

	/**
	 * Do the actual work. All child classes will need to implement this
	 */
	public function execute() {
		$this->output( "Creating username spoofs...\n" );

		$userCol = $this->getUserColumn();
		$iterator = new BatchRowIterator( $this->getDB( DB_PRIMARY ),
			$this->getTableName(),
			$this->getPrimaryKey(),
			$this->getBatchSize()
		);
		$iterator->setFetchColumns( [ $userCol ] );
		$iterator->setCaller( __METHOD__ );

		$lbFactory = MediaWikiServices::getInstance()->getDBLoadBalancerFactory();

		$n = 0;
		foreach ( $iterator as $batch ) {
			$items = [];
			foreach ( $batch as $row ) {
				$items[] = $this->makeSpoofUser( $row->$userCol );
			}

			$n += count( $items );
			$this->output( "...$n\n" );
			$this->batchRecord( $items );
			$lbFactory->waitForReplication();
		}

		$this->output( "$n user(s) done.\n" );
	}
}
