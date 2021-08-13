<?php

namespace MediaWiki\Extensions\Collection;

use MediaWikiCoversValidator;
use SpecialCollection;

/**
 * @covers SpecialCollection
 */
class SpecialCollectionTest extends \PHPUnit\Framework\TestCase {
	use MediaWikiCoversValidator;

	public function provideMoveItemInCollection() {
		return [
			// Cannot swap anything in a null object
			[
				[],
				0, 1,
				false
			],
			// Can swap something where two valid indexes given
			[
				[ 'items' => [ 'A', 'B', 'C' ] ],
				0, 1,
				[ 'items' => [ 'B', 'A', 'C' ] ],
			],
			// Although pointless swapping a number with itself is possible
			[
				[ 'items' => [ 'A', 'B', 'C' ] ],
				0, 0,
				[ 'items' => [ 'A', 'B', 'C' ] ],
			],
			// Cannot swap if the number out of range
			[
				[ 'items' => [ 'A', 'B', 'C' ] ],
				0, 5,
				false,
			],
			// object without items
			[
				[],
				0, 5,
				false,
			],
		];
	}

	/**
	 * @dataProvider provideMoveItemInCollection
	 */
	public function testMoveItemInCollection( array $collection, $index, $delta, $expectedResult ) {
		$this->assertSame(
			SpecialCollection::moveItemInCollection( $collection, $index, $delta ),
			$expectedResult
		);
	}
}
