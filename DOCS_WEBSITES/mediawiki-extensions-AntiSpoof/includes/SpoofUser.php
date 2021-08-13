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

use Wikimedia\Rdbms\IDatabase;

class SpoofUser {
	/** @var bool */
	private $legal;

	/** @var string */
	private $name;

	/** @var string|null */
	private $normalized;

	/** @var null|Status */
	private $error;

	/**
	 * @param string $name
	 */
	public function __construct( $name ) {
		$this->name = strval( $name );
		$status = AntiSpoof::checkUnicodeStringStatus( $this->name );
		$this->legal = $status->isOK();
		if ( $this->legal ) {
			$this->normalized = $status->getValue();
			$this->error = null;
		} else {
			$this->normalized = null;
			$this->error = $status;
		}
	}

	/**
	 * Does the username pass Unicode legality and script-mixing checks?
	 * @return bool
	 */
	public function isLegal() {
		return $this->legal;
	}

	/**
	 * Describe the error.
	 * @return null|Status
	 * @since 1.32
	 */
	public function getErrorStatus() {
		return $this->error;
	}

	/**
	 * Get the normalized key form
	 * @return string|null
	 */
	public function getNormalized() {
		return $this->normalized;
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
	 * Does the username pass Unicode legality and script-mixing checks?
	 *
	 * @return array empty if no conflict, or array containing conflicting usernames
	 */
	public function getConflicts() {
		$dbr = $this->getDBReplica();

		// Join against the user table to ensure that we skip stray
		// entries left after an account is renamed or otherwise munged.
		$spoofedUsers = $dbr->select(
			[ 'spoofuser', $this->getTableName() ],
			[ 'su_name' ], // Same thing due to the join. Saves extra variableness
			[
				'su_normalized' => $this->normalized,
				'su_name = ' . $this->getUserColumn(),
			],
			__METHOD__,
			[
				'LIMIT' => 5
			] );

		$spoofs = [];
		foreach ( $spoofedUsers as $row ) {
			array_push( $spoofs, $row->su_name );
		}
		return $spoofs;
	}

	/**
	 * Record the username's normalized form into the database
	 * for later comparison of future names...
	 * @return bool
	 */
	public function record() {
		return self::batchRecord( $this->getDBMaster(), [ $this ] );
	}

	/**
	 * @return array
	 */
	private function insertFields() {
		return [
			'su_name'       => $this->name,
			'su_normalized' => $this->normalized,
			'su_legal'      => $this->legal ? 1 : 0,
			'su_error'      => $this->error ? $this->error->getMessage()->text() : null,
		];
	}

	/**
	 * Insert a batch of spoof normalization records into the database.
	 * @param IDatabase $dbw
	 * @param SpoofUser[] $items
	 * @return bool
	 */
	public static function batchRecord( IDatabase $dbw, $items ) {
		if ( !count( $items ) ) {
			return false;
		}
		$fields = [];
		/**
		 * @var $item SpoofUser
		 */
		foreach ( $items as $item ) {
			$fields[] = $item->insertFields();
		}
		$dbw->replace(
			'spoofuser',
			'su_name',
			$fields,
			__METHOD__
		);
		return true;
	}

	/**
	 * @param string $oldName
	 */
	public function update( $oldName ) {
		$method = __METHOD__;
		$dbw = $this->getDBMaster();
		// Avoid user rename triggered deadlocks
		$dbw->onTransactionPreCommitOrIdle(
			function () use ( $dbw, $method, $oldName ) {
				if ( $this->record() ) {
					$dbw->delete(
						'spoofuser',
						[ 'su_name' => $oldName ],
						$method
					);
				}
			},
			$method
		);
	}

	/**
	 * Remove a user from the spoofuser table
	 */
	public function remove() {
		$this->getDBMaster()->delete(
			'spoofuser',
			[ 'su_name' => $this->name ],
			__METHOD__
		);
	}

	/**
	 * @return IDatabase
	 */
	protected function getDBReplica() {
		return wfGetDB( DB_REPLICA );
	}

	/**
	 * @return IDatabase
	 */
	protected function getDBMaster() {
		return wfGetDB( DB_PRIMARY );
	}
}
