<?php

namespace ArticleCreationWorkflow\Tests;

use ArticleCreationWorkflow\Hooks;
use MediaWikiTestCase;
use Title;
use User;

/**
 * @group ArticleCreationWorkflow
 */
class HooksTest extends MediaWikiTestCase {
	/**
	 * @dataProvider provideOnTitleQuickPermissions
	 *
	 * @covers \ArticleCreationWorkflow\Hooks::onTitleQuickPermissions()
	 *
	 * @param User $user
	 * @param Title $title
	 * @param string $action
	 * @param array $expected
	 */
	public function testOnTitleQuickPermissions( User $user, Title $title, $action, $expected ) {
		$errors = [];
		$this->callOnTitleQuickPermissions( $user, $title, $action, $expected, $errors );
		self::assertEquals( $expected, $errors );

		$errors = [ [ 'do not touch this' ] ];
		$this->callOnTitleQuickPermissions( $user, $title, $action, $expected, $errors );
		self::assertEquals( array_merge( [ [ 'do not touch this' ] ], $expected ), $errors );
	}

	private function callOnTitleQuickPermissions( User $user,
		Title $title,
		$action,
		$expected,
		array &$errors
	) {
		$ret = Hooks::onTitleQuickPermissions( $title, $user, $action, $errors );
		self::assertEquals( !$expected, $ret,
			'onTitleQuickPermissions() should return false on permission errors, true otherwise'
		);
	}

	public function provideOnTitleQuickPermissions() {
		$mainspace = Title::newFromText( 'Mainspace page' );
		$nonMainspace = Title::newFromText( 'MediaWiki:Non-mainspace page' );

		$anon = $this->makeUser( true, false );
		$anonAcwDisabled = $this->makeUser( true, true );
		$newbie = $this->makeUser( false, false );
		$autoconfirmed = $this->makeUser( false, true );

		return [
			[ $anon, $mainspace, 'read', [] ],
			[ $anon, $nonMainspace, 'read', [] ],
			[ $anon, $mainspace, 'create', [ [ 'nocreatetext' ] ] ],
			[ $anon, $nonMainspace, 'create', [] ],

			[ $anonAcwDisabled, $mainspace, 'read', [] ],
			[ $anonAcwDisabled, $nonMainspace, 'read', [] ],
			[ $anonAcwDisabled, $mainspace, 'create', [] ],
			[ $anonAcwDisabled, $nonMainspace, 'create', [] ],

			[ $newbie, $mainspace, 'read', [] ],
			[ $newbie, $nonMainspace, 'read', [] ],
			[ $newbie, $mainspace, 'create', [ [ 'nocreate-loggedin' ] ] ],
			[ $newbie, $nonMainspace, 'create', [] ],

			[ $autoconfirmed, $mainspace, 'read', [] ],
			[ $autoconfirmed, $nonMainspace, 'read', [] ],
			[ $autoconfirmed, $mainspace, 'create', [] ],
			[ $autoconfirmed, $nonMainspace, 'create', [] ],
		];
	}

	private function makeUser( $anon, $canCreate ) {
		$user = $this->createMock( User::class );

		$user->method( 'isAnon' )
			->willReturn( $anon );

		$user->method( 'isAllowed' )
			->with( 'createpagemainns' )
			->willReturn( $canCreate );

		return $user;
	}
}
