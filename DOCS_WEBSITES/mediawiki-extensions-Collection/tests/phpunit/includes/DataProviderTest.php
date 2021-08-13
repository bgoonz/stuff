<?php

namespace MediaWiki\Extensions\Collection;

use LogicException;
use MediaWikiTestCase;
use Title;
use VirtualRESTServiceClient;

/**
 * @covers \MediaWiki\Extensions\Collection\DataProvider
 */
class DataProviderTest extends MediaWikiTestCase {

	/**
	 * @dataProvider provideFetchPages
	 * @param array $response
	 * @param array $collection
	 * @param array $expectedUrls
	 * @param array $expectedPages
	 */
	public function testFetchPages( $response, $collection, $expectedUrls, $expectedPages ) {
		$client = $this->getMockBuilder( VirtualRESTServiceClient::class )
			->onlyMethods( [ 'runMulti' ] )
			->disableOriginalConstructor()
			->getMock();
		$client->expects( $this->any() )
			->method( 'runMulti' )
			->willReturnCallback( function ( $requests ) use ( $response, $expectedUrls ) {
				$urls = array_map( static function ( $req ) {
					return $req['url'];
				}, $requests );
				$this->assertSame( $expectedUrls, $urls );
				return $response;
			} );

		$dataProvider = new DataProvider( $client );
		$status = $dataProvider->fetchPages( $collection );
		if ( $expectedPages === false ) {
			$this->assertFalse( $status->isOK() );
		} else {
			$this->assertTrue( $status->isOK() );
			$pages = $status->getValue();
			$this->assertSame( $expectedPages, $pages );
		}
	}

	public function provideFetchPages() {
		return [
			'single' => [
				'response' => [ [
									'code' => 200,
									'error' => '',
									'body' => 'Foo body',
								] ],
				'collection' => $this->makeCollection( [ [ 'Foo', 'article', 1, 1 ] ] ),
				'expected urls' => [ '/restbase/local/v1/page/html/Foo/1' ],
				'expected pages' => [ 'Foo' => 'Foo body' ],
			],
			'multiple' => [
				'response' => [
					[
						'code' => 200,
						'error' => '',
						'body' => 'Foo body',
					],
					[
						'code' => 200,
						'error' => '',
						'body' => 'Bar body',
					],
				],
				'collection' => $this->makeCollection( [ [ 'Chapter', 'chapter' ],
					[ 'Foo', 'article', 1, 1 ], [ 'Bar', 'article', 2, 3 ] ] ),
				'expected urls' => [ '/restbase/local/v1/page/html/Foo/1',
					'/restbase/local/v1/page/html/Bar/2' ],
				'expected pages' => [ 'Foo' => 'Foo body', 'Bar' => 'Bar body' ],
			],
			'error' => [
				'response' => [ [
					'code' => 500,
					'error' => 'Woe is me',
					'body' => 'Foo body',
				] ],
				'collection' => $this->makeCollection( [ [ 'Foo', 'article', 1, 1 ] ] ),
				'expected urls' => [ '/restbase/local/v1/page/html/Foo/1' ],
				'expected pages' => false,
			],
		];
	}

	/**
	 * @dataProvider provideFetchMetadata
	 * @param array $dbkeys
	 * @param array $parse
	 * @param array $contributors
	 * @param array $expectedMetadata
	 */
	public function testFetchMetadata( $dbkeys, $parse, $contributors, $expectedMetadata ) {
		$dataProvider = $this->getMockBuilder( DataProvider::class )
			->onlyMethods( [ 'makeActionApiRequest' ] )
			->disableOriginalConstructor()
			->getMock();
		$dataProvider->expects( $this->any() )
			->method( 'makeActionApiRequest' )
			->willReturnCallback( function ( $params ) use ( $parse, $contributors ) {
				if ( isset( $params['meta'] ) && $params['siprop'] === 'rightsinfo' ) {
					return [
						'query' => [
							'rightsinfo' => [
								'url' => '//creativecommons.org/licenses/by-sa/3.0/',
								'text' => 'Creative Commons Attribution-Share Alike 3.0',
							],
						]
					];
				} elseif (
					$params['action'] === 'query' && $params['prop'] === 'contributors|images'
					&& !isset( $params['meta'] ) && !isset( $params['list'] )
				) {
					return [ 'query' => [ 'pages' => $contributors ] ];
				} elseif (
					$params['action'] === 'parse'
					&& isset( $params['page'] ) && isset( $parse[$params['page'] ] )
				) {
					return [ 'parse' => $parse[$params['page']] ];
				} else {
					$this->fail( 'unexpected API call!' );
				}
			} );

		/** @var $dataProvider DataProvider */
		$status = $dataProvider->fetchMetadata( $dbkeys );
		if ( $expectedMetadata === false ) {
			$this->assertFalse( $status->isOK() );
		} else {
			$this->assertTrue( $status->isOK() );
			$metadata = $status->getValue();
			$this->assertSame( $expectedMetadata, $metadata );
		}
	}

	public function provideFetchMetadata() {
		return [
			'single' => [
				'dbkeys' => [ 'Foo' ],
				'parse' => [
					'Foo' => [
						'displaytitle' => '<b>Foo</b>',
						'sections' => [
							[
								'level' => '2',
								'line' => 'Section 1',
								'anchor' => 'Section_1',
							],
							[
								'level' => '2',
								'line' => 'Section 2',
								'anchor' => 'Section_2',
							],
						],
						'modules' => [ 'foo1', 'foo2' ],
						'modulestyles' => [ 'foostyle' ],
						'jsconfigvars' => [ 'x' => 1 ],
					],
				],
				'contributors' => [
					'Foo' => [ 'contributors' => [
						[ 'name' => 'X', 'userid' => 1 ],
						[ 'name' => 'Y', 'userid' => 2 ],
					] ],
				],
				'expectedMetadata' => [
					'displaytitle' => [ 'Foo' => '<b>Foo</b>' ],
					'sections' => [
						'Foo' => [
							[
								'title' => 'Section 1',
								'id' => 'Section_1',
								'level' => 2,
							],
							[
								'title' => 'Section 2',
								'id' => 'Section_2',
								'level' => 2,
							],
						],
					],
					'contributors' => [ 'X' => 1, 'Y' => 2 ],
					'images' => [],
					'license' => [
						'url' => '//creativecommons.org/licenses/by-sa/3.0/',
						'text' => 'Creative Commons Attribution-Share Alike 3.0',
					],
					'modules' => [ 'foo1', 'foo2' ],
					'modulestyles' => [ 'foostyle' ],
					'jsconfigvars' => [ 'x' => 1 ],
				],
			],
			'multiple' => [
				'dbkeys' => [ 'Foo', 'Bar' ],
				'parse' => [
					'Foo' => [
						'displaytitle' => '<i>Foo</i>',
						'sections' => [
							[
								'level' => '2',
								'line' => 'Section 1',
								'anchor' => 'Section_1',
							],
							[
								'level' => '2',
								'line' => 'Section 2',
								'anchor' => 'Section_2',
							],
						],
						'modules' => [ 'foo1', 'foo2' ],
						'modulestyles' => [ 'foostyle' ],
						'jsconfigvars' => [ 'x' => 1 ],
					],
					'Bar' => [
						'displaytitle' => 'Bar',
						'sections' => [
							[
								'level' => '2',
								'line' => 'Section 1',
								'anchor' => 'Section_1',
							],
							[
								'level' => '3',
								'line' => 'Section 1.1',
								'anchor' => 'Section_1.1',
							],
						],
						'modules' => [ 'bar' ],
						'modulestyles' => [ 'barstyle' ],
						'jsconfigvars' => [ 'a' => 1, 'b' => 2 ],
					],
				],
				'contributors' => [
					'Foo' => [ 'contributors' => [
						[ 'name' => 'X', 'userid' => 1 ],
						[ 'name' => 'Y', 'userid' => 2 ],
					] ],
					'Bar' => [ 'contributors' => [
						[ 'name' => 'Z', 'userid' => 3 ],
					] ],
				],
				'expectedMetadata' => [
					'displaytitle' => [ 'Foo' => '<i>Foo</i>', 'Bar' => 'Bar' ],
					'sections' => [
						'Foo' => [
							[
								'title' => 'Section 1',
								'id' => 'Section_1',
								'level' => 2,
							],
							[
								'title' => 'Section 2',
								'id' => 'Section_2',
								'level' => 2,
							],
						],
						'Bar' => [
							[
								'title' => 'Section 1',
								'id' => 'Section_1',
								'level' => 2,
							],
							[
								'title' => 'Section 1.1',
								'id' => 'Section_1.1',
								'level' => 3,
							],
						],
					],
					'contributors' => [ 'X' => 1, 'Y' => 2, 'Z' => 3 ],
					'images' => [],
					'license' => [
						'url' => '//creativecommons.org/licenses/by-sa/3.0/',
						'text' => 'Creative Commons Attribution-Share Alike 3.0',
					],
					'modules' => [ 'foo1', 'foo2', 'bar' ],
					'modulestyles' => [ 'foostyle', 'barstyle' ],
					'jsconfigvars' => [ 'x' => 1, 'a' => 1, 'b' => 2 ],
				],
			],
		];
	}

	/**
	 * @param array $elements Articles/chapters in [ [ name, ...data ], ... ] format.
	 *   ...data is 'chapter'|'article', revision, latest.
	 * @return array
	 */
	private function makeCollection( array $elements ) {
		$collection = [
			'enabled' => true,
			'title' => 'DataProvider doesn\t care about',
			'subtitle' => 'title and subtitle',
			'settings' => [
				'papersize' => 'a4',
				'toc' => 'auto',
				'columns' => '2',
			],
			'items' => [],
		];
		foreach ( $elements as $element ) {
			switch ( $element[1] ) {
				case 'chapter':
					$collection['items'][] = [
						'type' => 'chapter',
						'title' => $element[0],
					];
					break;
				case 'article':
					$collection['items'][] = [
						'type' => 'article',
						'content_type' => 'text/x-wiki',
						'title' => $element[0],
						'revision' => $element[2],
						'latest' => $element[3],
						'timestamp' => time(),
						'url' => Title::newFromText( $element[0] )->getFullURL(),
						'currentVersion' => 1,
					];
					break;
				default:
					throw new LogicException( __METHOD__ . ': invalid type ' . $element[1] );
			}
		}
		return $collection;
	}

}
