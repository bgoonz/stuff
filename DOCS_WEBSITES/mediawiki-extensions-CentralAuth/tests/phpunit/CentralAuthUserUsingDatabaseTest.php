<?php

/**
 * Setup database tests for centralauth
 * @group CentralAuthDB
 * @group Database
 */
class CentralAuthUserUsingDatabaseTest extends CentralAuthUsingDatabaseTestCase {

	/**
	 * @covers CentralAuthUser::exists
	 * @covers CentralAuthUser::getId
	 * @covers CentralAuthUser::getName
	 * @covers CentralAuthUser::getHomeWiki
	 * @covers CentralAuthUser::isAttached
	 * @covers CentralAuthUser::getRegistration
	 * @covers CentralAuthUser::getStateHash
	 */
	public function testBasicAttrs() {
		$caUser = new CentralAuthUser( 'GlobalUser' );
		$this->assertTrue( $caUser->exists() );
		$this->assertSame( 1001, $caUser->getId() );
		$this->assertSame( 'GlobalUser', $caUser->getName() );
		$this->assertSame( wfWikiID(), $caUser->getHomeWiki() );
		$this->assertTrue( $caUser->isAttached() );
		$this->assertFalse( $caUser->isLocked() );
		$this->assertSame( '20130627183537', $caUser->getRegistration() );
		$this->assertSame(
			CentralAuthUser::HIDDEN_NONE,
			$caUser->getHiddenLevel()
		);
		$this->assertSame(
			'2234d7949459185926a50073d174b673',
			$caUser->getStateHash()
		);
	}

	/**
	 * @covers CentralAuthUser::loadStateNoCache
	 * @covers CentralAuthUser::loadState
	 */
	public function testLoadFromDB() {
		$caUser = new CentralAuthUser( 'GlobalUser' );
		$caUser->loadStateNoCache();
		$this->assertTrue( $caUser->exists() );
		$this->assertSame( 1001, $caUser->getId() );
	}

	/**
	 * @covers CentralAuthUser::listAttached
	 */
	public function testLoadAttached() {
		$caUser = new CentralAuthUser( 'GlobalUser' );
		$this->assertArrayEquals(
			[
				wfWikiID(),
				'enwiki',
				'dewiki',
				'metawiki',
			],
			$caUser->listAttached()
		);
	}

	/**
	 * @covers CentralAuthUser::getAuthToken
	 * @covers CentralAuthUser::resetAuthToken
	 */
	public function testGetAuthToken() {
		$caUserUnattached = CentralAuthUser::newUnattached(
			'UnattachedUser',
			false
		);
		$token = $caUserUnattached->getAuthToken();
		$this->assertSame( 1, preg_match( '/^[0-9a-f]{32}$/', $token ) );
	}

	/**
	 * @covers CentralAuthUser::newFromId
	 */
	public function testNewFromId() {
		$ca = CentralAuthUser::newFromId( 1001 );
		$this->assertSame( 'GlobalUser', $ca->getName() );

		$caBad = CentralAuthUser::newFromId( -1001 );
		$this->assertFalse( $caBad );
	}

	/**
	 * @covers CentralAuthUser::register
	 */
	public function testRegister() {
		$caUserNew = new CentralAuthUser( 'RegTest', CentralAuthUser::READ_LATEST );
		$ok = $caUserNew->register( "R3gT3stP@ssword", "user@localhost" );
		$this->assertTrue( $ok );

		$caUser = new CentralAuthUser( 'RegTest' );
		$this->assertTrue( $caUser->exists() );

		// And duplicate registration doesn't throw an exception (T108541)
		$this->assertFalse( $caUserNew->register( "R3gT3stP@ssword", "user@localhost" ) );
	}

	/**
	 * @covers CentralAuthUser::isLocked
	 */
	public function testLocked() {
		$caUser = new CentralAuthUser( 'GlobalLockedUser' );
		$this->assertTrue( $caUser->exists() );
		$this->assertTrue( $caUser->isLocked() );
	}

	/**
	 * @covers CentralAuthUser::isHidden
	 * @covers CentralAuthUser::isOversighted
	 * @covers CentralAuthUser::getHiddenLevel
	 */
	public function testHidden() {
		$caUser = new CentralAuthUser( 'GlobalSuppressedUser' );
		$this->assertTrue( $caUser->exists() );
		$this->assertTrue( $caUser->isHidden() );
		$this->assertTrue( $caUser->isOversighted() );
		$this->assertSame( CentralAuthUser::HIDDEN_OVERSIGHT, $caUser->getHiddenLevel() );
	}

	/**
	 * @covers CentralAuthUser::storeMigrationData
	 */
	public function testStoreMigrationData() {
		$caUsers = [
			'2001' => 'StoreMigrationDataUser 1',
			'2002' => 'StoreMigrationDataUser 2',
			'2003' => 'StoreMigrationDataUser 3',
		];
		CentralAuthUser::storeMigrationData( 'smdwiki', $caUsers );
		$this->assertSelect(
			'localnames',
			'ln_name',
			[ 'ln_wiki' => 'smdwiki' ],
			[
				[ 'StoreMigrationDataUser 1' ],
				[ 'StoreMigrationDataUser 2' ],
				[ 'StoreMigrationDataUser 3' ],
			]
		);
	}

	/**
	 * @covers CentralAuthUser::adminLock
	 * @covers CentralAuthUser::adminUnlock
	 * @covers CentralAuthUser::adminSetHidden
	 */
	public function testAdminLockAndHide() {
		$caUser = new CentralAuthUser( 'GlobalUser', CentralAuthUser::READ_LATEST );
		$this->assertTrue( $caUser->exists() ); # sanity
		$this->assertFalse( $caUser->isHidden() ); # sanity
		$this->assertFalse( $caUser->isLocked() ); # sanity

		$caUser->adminLock();
		$caUser->adminSetHidden( CentralAuthUser::HIDDEN_LISTS );

		// Check the DB
		$this->assertSelect(
			'globaluser',
			[ 'gu_name', 'gu_locked', 'gu_hidden' ],
			[ 'gu_name' => 'GlobalUser' ],
			[
				[ 'GlobalUser', '1', CentralAuthUser::HIDDEN_LISTS ]
			]
		);

		// Check that the instance was reloaded from the DB
		$this->assertTrue( $caUser->exists() );
		$this->assertTrue( $caUser->isLocked() );
		$this->assertTrue( $caUser->isHidden() );
		// Ignore cache, read from DB for new instance
		$caUser = new CentralAuthUser( 'GlobalUser', CentralAuthUser::READ_LATEST );
		$this->assertTrue( $caUser->exists() );
		$this->assertTrue( $caUser->isLocked() );
		$this->assertTrue( $caUser->isHidden() );

		$caUser->adminUnlock();
		$caUser->adminSetHidden( CentralAuthUser::HIDDEN_NONE );

		// Check that the instance was reloaded from the DB
		$this->assertTrue( $caUser->exists() );
		$this->assertFalse( $caUser->isHidden() );
		$this->assertFalse( $caUser->isLocked() );
		// Ignore cache, read from DB for new instance
		$caUser = new CentralAuthUser( 'GlobalUser', CentralAuthUser::READ_LATEST );
		$this->assertTrue( $caUser->exists() );
		$this->assertFalse( $caUser->isHidden() );
		$this->assertFalse( $caUser->isLocked() );
	}

	/**
	 * @covers CentralAuthUser::attach
	 */
	public function testAttach() {
		$caUser = new CentralAuthUser( 'GlobalUser', CentralAuthUser::READ_LATEST );
		$caUser->attach( 'anotherwiki', 'admin', false );
		$this->assertTrue( $caUser->exists() );
		$this->assertContains( 'anotherwiki', $caUser->listAttached() );
	}

	/**
	 * Setup a fresh set of global users for each test.
	 * Note: MediaWikiTestCase::resetDB() will delete all tables between
	 * test runs, so no explicite tearDown() is needed.
	 */
	protected function setUp(): void {
		parent::setUp();
		$user = new CentralAuthTestUser(
			'GlobalUser',
			'GUP@ssword',
			[ 'gu_id' => '1001' ],
			[
				[ wfWikiID(), 'primary' ],
				[ 'enwiki', 'primary' ],
				[ 'dewiki', 'login' ],
				[ 'metawiki', 'password' ],
			]
		);
		$user->save( $this->db );

		$u = new CentralAuthTestUser(
			'GlobalLockedUser',
			'GLUP@ssword',
			[
				'gu_id' => '1003',
				'gu_locked' => 1,
				'gu_hidden' => CentralAuthUser::HIDDEN_NONE,
				'gu_email' => 'testlocked@localhost',
				'gu_home_db' => 'metawiki',
			],
			[
				[ 'metawiki', 'primary' ],
			]
		);
		$u->save( $this->db );

		$u = new CentralAuthTestUser(
			'GlobalSuppressedUser',
			'GSUP@ssword',
			[
				'gu_id' => '1004',
				'gu_locked' => 1,
				'gu_hidden' => CentralAuthUser::HIDDEN_OVERSIGHT,
				'gu_email' => 'testsuppressed@localhost',
				'gu_home_db' => 'metawiki',
			],
			[
				[ 'metawiki', 'primary' ],
			]
		);
		$u->save( $this->db );
	}

}
