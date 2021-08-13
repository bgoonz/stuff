<?php

use MediaWiki\Auth\AbstractPreAuthenticationProvider;
use MediaWiki\Auth\AuthManager;
use MediaWiki\MediaWikiServices;
use MediaWiki\Tests\Unit\Auth\AuthenticationProviderTestTrait;

/**
 * @covers AntiSpoofPreAuthenticationProvider
 * @group Database
 */
class AntiSpoofPreAuthenticationProviderTest extends MediaWikiIntegrationTestCase {
	use AuthenticationProviderTestTrait;

	/**
	 * @dataProvider provideGetAuthenticationRequests
	 */
	public function testGetAuthenticationRequests( $action, $params, $username, $expectedReqs ) {
		$this->setMwGlobals( 'wgAntiSpoofAccounts', false );
		$provider = new AntiSpoofPreAuthenticationProvider(
			MediaWikiServices::getInstance()->getPermissionManager(),
			$params
		);
		$this->initProvider( $provider, null, null, $this->getServiceContainer()->getAuthManager() );
		$reqs = $provider->getAuthenticationRequests( $action, [ 'username' => $username ] );
		$this->assertEquals( $expectedReqs, $reqs );
	}

	public function provideGetAuthenticationRequests() {
		return [
			[ AuthManager::ACTION_LOGIN, [], null, [] ],
			[ AuthManager::ACTION_CREATE, [],  null, [] ],
			[ AuthManager::ACTION_CREATE, [ 'antiSpoofAccounts' => true ],  null, [] ],
			[ AuthManager::ACTION_CREATE, [], 'UTSysop', [] ],
			[ AuthManager::ACTION_CREATE, [ 'antiSpoofAccounts' => true ], 'UTSysop',
				[ new AntiSpoofAuthenticationRequest() ] ],
			[ AuthManager::ACTION_CHANGE, [], null, [] ],
			[ AuthManager::ACTION_REMOVE, [], null, [] ],
		];
	}

	/**
	 * @dataProvider provideTestForAccountCreation
	 */
	public function testTestForAccountCreation(
		$enabled, $isLegal, $conflicts, $creator, $reqs, $error
	) {
		$provider = $this->getMockBuilder( AntiSpoofPreAuthenticationProvider::class )
			->setConstructorArgs( [
				MediaWikiServices::getInstance()->getPermissionManager(),
				[ 'antiSpoofAccounts' => $enabled ]
			] )
			->onlyMethods( [ 'getSpoofUser' ] )->getMock();
		$spoofUser = $this->getMockBuilder( SpoofUser::class )
			->disableOriginalConstructor()->getMock();
		$provider->expects( $this->any() )->method( 'getSpoofUser' )->willReturn( $spoofUser );
		/** @var $provider AbstractPreAuthenticationProvider */
		$this->initProvider( $provider, null, null, $this->getServiceContainer()->getAuthManager() );

		$spoofUser->expects( $this->any() )->method( 'isLegal' )->willReturn( $isLegal );
		$spoofUser->expects( $this->any() )->method( 'getErrorStatus' )
			->willReturn( Status::newFatal( 'unittest' ) );
		$spoofUser->expects( $this->any() )->method( 'getConflicts' )->willReturn( $conflicts );

		/** @var StatusValue $status */
		$status = $provider->testForAccountCreation( new User(), $creator, $reqs );

		if ( $error ) {
			$this->assertFalse( $status->isGood() );
			$this->assertEquals( $error, Status::wrap( $status )->getMessage()->getKey() );
		} else {
			$this->assertTrue( $status->isGood() );
		}
	}

	public function provideTestForAccountCreation() {
		$user = new User();
		$sysop = User::newFromName( 'UTSysop' );
		$noSkip = new AntiSpoofAuthenticationRequest();
		$skip = new AntiSpoofAuthenticationRequest();
		$skip->ignoreAntiSpoof = true;

		return [
			// enabled, isLegal, conflicts,  creator, reqs, error
			'no spoofing' => [ true, true, [], $user, [], null ],
			'illegal' => [ true, false, [], $user, [], 'antispoof-name-illegal' ],
			'illegal, inactve' => [ false, false, [], $user, [], null ],
			'illegal, sysop w/o skipping' => [ true, false, [], $sysop, [],
				'antispoof-name-illegal' ],
			'illegal, sysop w/o skipping #2' => [ true, false, [], $sysop, [ $noSkip ],
				'antispoof-name-illegal' ],
			'illegal, sysop skipping' => [ true, false, [], $sysop, [ $skip ], null ],
			// this should never happen but is good for layered defense
			'fake skipping' => [ true, false, [], $user, [ $skip ], 'antispoof-name-illegal' ],
			'conflicts' => [ true, true, [ 'x' ], $user, [], '$1$2$3' ],
			'conflicts w/ skipping' => [ true, true, [ 'x' ], $sysop, [ $skip ], null ],
			'conflicts w/ fake skipping' => [ true, true, [ 'x' ], $user, [ $skip ], '$1$2$3' ],
			'illegal takes priority' => [ true, false, [ 'x' ], $user, [], 'antispoof-name-illegal' ],
		];
	}
}
