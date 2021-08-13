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

use MediaWiki\Auth\AbstractPreAuthenticationProvider;
use MediaWiki\Auth\AuthenticationRequest;
use MediaWiki\Auth\AuthManager;
use MediaWiki\Permissions\PermissionManager;
use MediaWiki\User\UserIdentity;
use Psr\Log\LoggerInterface;
use Psr\Log\NullLogger;

class AntiSpoofPreAuthenticationProvider extends AbstractPreAuthenticationProvider {
	/** @var bool False effectively disables this provider, but spoofed names will still be logged. */
	protected $antiSpoofAccounts;

	/** @var PermissionManager */
	private $permissionManager;

	/**
	 * @param PermissionManager $permissionManager
	 * @param array $params Options:
	 * - antiSpoofAccounts: (bool) stop spoofed accounts from being created. When false, only log.
	 */
	public function __construct( PermissionManager $permissionManager, array $params = [] ) {
		global $wgAntiSpoofAccounts;

		$params += [ 'antiSpoofAccounts' => $wgAntiSpoofAccounts ];

		$this->antiSpoofAccounts = $params['antiSpoofAccounts'];
		$this->permissionManager = $permissionManager;
	}

	/** @inheritDoc */
	public function getAuthenticationRequests( $action, array $options ) {
		$needed = false;
		switch ( $action ) {
			case AuthManager::ACTION_CREATE:
				$user = User::newFromName( $options['username'] ) ?: new User();
				$needed = $this->antiSpoofAccounts
					&& $this->permissionManager->userHasAnyRight( $user, 'override-antispoof' );
				break;
		}

		return $needed ? [ new AntiSpoofAuthenticationRequest() ] : [];
	}

	/** @inheritDoc */
	public function testForAccountCreation( $user, $creator, array $reqs ) {
		/** @var AntiSpoofAuthenticationRequest $req */
		$req = AuthenticationRequest::getRequestByClass( $reqs, AntiSpoofAuthenticationRequest::class );
		$override = $req && $req->ignoreAntiSpoof && $creator->isAllowed( 'override-antispoof' );

		return $this->testUserInternal( $user, $override, $this->logger );
	}

	/**
	 * @param UserIdentity $user
	 * @param bool $override
	 * @param LoggerInterface $logger
	 * @return StatusValue
	 */
	private function testUserInternal( UserIdentity $user, $override, LoggerInterface $logger ) {
		$spoofUser = $this->getSpoofUser( $user );
		$mode = !$this->antiSpoofAccounts ? 'LOGGING ' : ( $override ? 'OVERRIDE ' : '' );
		$active = $this->antiSpoofAccounts && !$override;

		if ( $spoofUser->isLegal() ) {
			$normalized = $spoofUser->getNormalized();
			$conflicts = $spoofUser->getConflicts();
			if ( empty( $conflicts ) ) {
				$logger->debug( "{mode}PASS new account '{name}' [{normalized}]", [
					'mode' => $mode,
					'name' => $user->getName(),
					'normalized' => $normalized,
				] );
			} else {
				$logger->info( "{mode}CONFLICT new account '{name}' [{normalized}] spoofs {spoofs}", [
					'mode' => $mode,
					'name' => $user->getName(),
					'normalized' => $normalized,
					'spoofs' => $conflicts,
				] );
				if ( $active ) {
					$cnt = count( $conflicts );
					$list = '';
					foreach ( $conflicts as $simUser ) {
						$list .= Html::element( 'li', [],
							wfMessage( 'antispoof-conflict-item', $simUser )->text()
						);
					}
					$list = Html::rawElement( 'ul', [], $list );

					$message = new RawMessage( '$1$2$3', [
						wfMessage( 'antispoof-conflict-top', $user->getName() )->numParams( $cnt ),
						$list,
						wfMessage( 'antispoof-conflict-bottom' )
					] );
					return StatusValue::newFatal( $message );
				}
			}
		} else {
			$error = $spoofUser->getErrorStatus();
			$logger->info( "{mode}ILLEGAL new account '{name}' {error}", [
				'mode' => $mode,
				'name' => $user->getName(),
				'error' => $error->getMessage( false, false, 'en' )->text(),
			] );
			if ( $active ) {
				return StatusValue::newFatal( 'antispoof-name-illegal', $user->getName(),
					$error->getMessage() );
			}
		}
		return StatusValue::newGood();
	}

	/** @inheritDoc */
	public function testUserForCreation( $user, $autocreate, array $options = [] ) {
		$sv = StatusValue::newGood();

		// For "cancreate" checks via the API, test if the current user could
		// create the username.
		if ( $this->antiSpoofAccounts && !$autocreate && empty( $options['creating'] ) &&
			$this->permissionManager->userHasAnyRight( RequestContext::getMain()->getUser(), 'override-antispoof' )
		) {
			$sv->merge( $this->testUserInternal( $user, false, new NullLogger ) );
		}

		return $sv;
	}

	/**
	 * @param UserIdentity $user
	 * @return SpoofUser
	 */
	protected function getSpoofUser( UserIdentity $user ) {
		return new SpoofUser( $user->getName() );
	}
}
