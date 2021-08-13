<?php

/**
 * @covers UserBucketProvider
 */
class UserBucketProviderTest extends MediaWikiUnitTestCase {

	public function userProvider() {
		return [
			[ null, null ],
			[ 0, '0 edits' ],
			[ 4, '1-4 edits' ],
			[ 1000, '1000+ edits' ],
		];
	}

	/**
	 * @dataProvider userProvider
	 */
	public function testGetUserEditCountBucket( ?int $editCount, ?string $expectedBucket ) {
		$user = $this->createMock( User::class );
		$user->method( 'getEditCount' )
			->willReturn( $editCount );

		$result = UserBucketProvider::getUserEditCountBucket( $user );

		$this->assertSame( $expectedBucket, $result );
	}

}
