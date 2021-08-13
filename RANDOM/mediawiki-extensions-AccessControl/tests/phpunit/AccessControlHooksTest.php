<?php

namespace AccessControl\Tests;

use AccessControlHooks;
use User;
use Wikimedia\TestingAccessWrapper;

/**
 * @covers \AccessControlHooks
 *
 * @group Database
 *
 * @license GPL-2.0-or-later
 */
class AccessControlHooksTest extends \MediaWikiIntegrationTestCase {

	protected function setUp(): void {
		parent::setUp();
		$this->insertPage( __CLASS__, '<accesscontrol>*A</accesscontrol>' );
	}

	/**
	 * @dataProvider provideGetUsersFromPages
	 */
	public function testGetUsersFromPages( string $wikitext, array $expected ) {
		$pageName = __METHOD__;
		if ( $wikitext ) {
			$this->insertPage( $pageName, $wikitext );
		}
		$result = AccessControlHooks::getUsersFromPages( $pageName );
		$this->assertSame( $expected, $result );
	}

	public function provideGetUsersFromPages() {
		return [
			'empty' => [ '', [] ],
			'not a list' => [ 'A', [] ],

			'non-asterisk lines are ignored' => [
				"Comment\n#A\n*B",
				[ 'B' => 'edit' ]
			],
			'trailing spaces are ignored' => [
				" *A\n *B",
				[ 'A' => 'edit', 'B' => 'edit' ]
			],
			'position of the (ro) does not matter' => [
				"*A(ro)\n*(ro)B",
				[ 'A' => 'read', 'B' => 'read' ]
			],

			'uppercase (RO) is meaningless' => [
				'*A(RO)',
				[ 'A(RO)' => 'edit' ]
			],
			'multiple asterisk, (ro), and whitespace' => [
				'** (ro) * A*(ro)B (ro) ',
				[ 'AB' => 'read' ]
			],
			'asterisk in (ro)' => [
				'* A (r*o)',
				[ 'A (ro)' => 'edit' ]
			],
		];
	}

	/**
	 * @dataProvider provideFromTemplates
	 */
	public function testFromTemplates( string $wikitext, $expected ) {
		$anonymous = new User();
		/** @var AccessControlHooks $instance */
		$instance = TestingAccessWrapper::newFromClass( AccessControlHooks::class );
		$result = $instance->fromTemplates( $wikitext, $anonymous );
		$this->assertSame( $expected, $result );
	}

	public function provideFromTemplates() {
		return [
			'empty' => [ '', null ],
			'empty parameter' => [ '{{{1|}}}', null ],
			'not a template' => [ '{{|}}', null ],
			// TODO: Many more test cases are missing here
		];
	}

	/**
	 * @dataProvider provideAllRightTags
	 */
	public function testAllRightTags( string $wikitext, $expected ) {
		$anonymous = new User();
		/** @var AccessControlHooks $instance */
		$instance = TestingAccessWrapper::newFromClass( AccessControlHooks::class );
		$result = $instance->allRightTags( $wikitext, $anonymous );
		$this->assertSame( $expected, $result );
	}

	public function provideAllRightTags() {
		// Will use the same target page for all test cases with redirects
		$redirectTarget = __CLASS__;
		$redirectedResult = [ 'groups' => '*A', 'end' => 33 ];

		return [
			'empty' => [ '', false ],
			'unclosed tag' => [ '<accesscontrol>', null ],
			'incomplete redirect' => [ "#redirect [[$redirectTarget]", false ],

			'redirect' => [
				" #redirect [[$redirectTarget]]",
				$redirectedResult
			],
			'labeled redirect and tag' => [
				"#redirect [[ $redirectTarget | label ]]\n<accesscontrol>*C</accesscontrol>",
				$redirectedResult
			],
			'uppercase keyword' => [
				"#REDIRECT [[$redirectTarget]]",
				$redirectedResult
			],
			'keyword can be longer' => [
				"#redirecting to [[$redirectTarget]]",
				$redirectedResult
			],
			// FIXME: This is most certainly a bug
			'redirect keyword is not validated at all' => [
				"#CAN BE ANYTHING! [[$redirectTarget]]",
				$redirectedResult
			],

			'empty tag' => [
				'<accesscontrol></accesscontrol>',
				[
					'end' => 31,
				]
			],
			'non-empty tag' => [
				'<accesscontrol>*B</accesscontrol>',
				[
					'groups' => '*B',
					'end' => 33,
				]
			],
			// TODO: Many more test cases are missing here
		];
	}

}
