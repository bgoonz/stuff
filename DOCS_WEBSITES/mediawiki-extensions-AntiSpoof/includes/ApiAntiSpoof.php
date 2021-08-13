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

/**
 * API module to check a username against the AntiSpoof normalisation checks
 *
 * @ingroup API
 * @ingroup Extensions
 */
class ApiAntiSpoof extends ApiBase {

	public function execute() {
		$params = $this->extractRequestParams();

		$res = $this->getResult();
		$res->addValue( null, $this->getModuleName(), [ 'username' => $params['username'] ] );

		$spoof = new SpoofUser( $params['username'] );

		if ( $spoof->isLegal() ) {
			$normalized = $spoof->getNormalized();
			$res->addValue( null, $this->getModuleName(), [ 'normalised' => $normalized ] );

			$unfilteredConflicts = $spoof->getConflicts();
			if ( empty( $unfilteredConflicts ) ) {
				$res->addValue( null, $this->getModuleName(), [ 'result' => 'pass' ] );
			} else {
				$hasSuppressed = false;
				$conflicts = [];
				foreach ( $unfilteredConflicts as $conflict ) {
					if ( !User::newFromName( $conflict )->isHidden() ) {
						$conflicts[] = $conflict;
					} else {
						$hasSuppressed = true;
					}
				}

				if ( $hasSuppressed ) {
					$res->addValue( null, $this->getModuleName(), [ 'suppressed' => 'true' ] );
				}

				$res->addValue( null, $this->getModuleName(), [ 'result' => 'conflict' ] );

				$res->setIndexedTagName( $conflicts, 'u' );
				$res->addValue( [ $this->getModuleName() ], 'users', $conflicts );
			}
		} else {
			$errorStatus = $spoof->getErrorStatus();
			$res->addValue( 'antispoof', 'result', 'error' );
			$res->addValue(
				'antispoof',
				'error',
				$errorStatus->getMessage( false, false, $this->getLanguage() )->text()
			);
		}
	}

	/** @inheritDoc */
	public function getAllowedParams() {
		return [
			'username' => [
				ApiBase::PARAM_REQUIRED => true,
			],
		];
	}

	/**
	 * @see ApiBase::getExamplesMessages()
	 * @return array
	 */
	protected function getExamplesMessages() {
		return [
			'action=antispoof&username=Foo'
				=> 'apihelp-antispoof-example-1',
		];
	}
}
