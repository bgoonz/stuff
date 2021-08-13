<?php

/**
 * @covers SpoofUser
 * @group Database
 */
class SpoofUserTest extends MediaWikiTestCase {

	/** @inheritDoc */
	protected $tablesUsed = [ 'user', 'spoofuser' ];

	/** @var string[] */
	private static $usernames = [
		'UserFoo',
		'UserF00',
		'FooBaz',
		'FOOBAZ',
		'F00BAZ',
		'BazFoo',
		'BAZFOO',
		'BazF00',
		'ILIKECAPSLOCKS',
	];

	public function setUp(): void {
		parent::setUp();

		// Put some stuff in the database
		foreach ( self::$usernames as $user ) {
			$s = new SpoofUser( $user );
			$s->record();
			$user = User::newFromName( $user );
			$user->addToDatabase();
		}

		$s = new SpoofUser( 'NotInTheUserTable' );
		$s->record();
	}

	/**
	 * @covers SpoofUser::record
	 */
	public function testRecord() {
		$user = User::newFromName( 'SomeUsername' );
		$user->addToDatabase();
		$s = new SpoofUser( 'SomeUsername' );
		$this->assertTrue( $s->record() );
		// Check that it made it into the database
		$this->assertArrayEquals( [ 'SomeUsername' ], $s->getConflicts() );
	}

	/**
	 * @covers SpoofUser::getConflicts
	 * @dataProvider provideGetConflicts
	 */
	public function testGetConflicts( $user, $conflicts ) {
		$s = new SpoofUser( $user );
		$this->assertArrayEquals( $conflicts, $s->getConflicts() );
	}

	public static function provideGetConflicts() {
		return [
			[ 'UserFoo', [ 'UserF00', 'UserFoo' ] ],
			[ 'FooBaz', [ 'F00BAZ', 'FOOBAZ', 'FooBaz' ] ],
			[ 'ILIKECAPSLOCKS', [ 'ILIKECAPSLOCKS' ] ],
			[ 'NotInTheUserTable', [] ],
			[ 'UsErFoO', [ 'UserF00', 'UserFoo' ] ],
		];
	}

	/**
	 * @covers SpoofUser::update
	 */
	public function testUpdate() {
		$user = User::newFromName( 'MyNewUserName' );
		$user->addToDatabase();
		$s = new SpoofUser( 'MyNewUserName' );
		$s->update( 'BAZFOO' );
		$this->assertArrayEquals( [ 'MyNewUserName' ], $s->getConflicts() );
		$foobaz = new SpoofUser( 'BAZFOO' );
		$this->assertArrayEquals( [ 'BazF00', 'BazFoo' ], $foobaz->getConflicts() );
	}
}
