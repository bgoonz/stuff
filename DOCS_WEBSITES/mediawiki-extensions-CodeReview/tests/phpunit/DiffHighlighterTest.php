<?php

/**
 * @group CodeReview
 * @covers CodeDiffHighlighter
 */
class CodeDiffHighlighterTest extends MediaWikiTestCase {
	public function testParseChunksFromWindowsDiff() {
		try {
			CodeDiffHighlighter::parseChunkDelimiter(
				"@@ -1,3 +1,4 @@\r\n"
			);
			$this->assertTrue( true, 'Managed to parse a chunk with \r\n' );
		} catch ( Exception $e ) {
			$this->fail( "parseChunkDelimiter() could not parse a chunk finishing with '\\r\\n'" .
				" This is happening on Windows" );
		}
	}

	public function testParseChunksFromUnixDiff() {
		try {
			CodeDiffHighlighter::parseChunkDelimiter(
				"@@ -1,3 +1,4 @@\n"
			);
			$this->assertTrue( true, 'Managed to parse a chunk with \n' );
		} catch ( Exception $e ) {
			$this->fail( "parseChunkDelimiter() could not parse a chunk finishing with '\\n'" .
				" This is happening on Unix systems" );
		}
	}

	/**
	 * @dataProvider provideUnifiedDiffChunksDelimiters
	 */
	public function testParseChunkDelimiters( $expected, $delimiter ) {
		$this->assertEquals(
			$expected,
			CodeDiffHighlighter::parseChunkDelimiter( $delimiter )
		);
	}

	public function provideUnifiedDiffChunksDelimiters() {
		return [ /* expected array, chunk delimiter */
			[
				[ 1, 3, 1, 4 ],
				'@@ -1,3 +1,4 @@'
			],
			[
				[ 76, 17, 76, 21 ],
				'@@ -76,17 +76,21 @@'
			],
			[
				[ 1, 63, 0, 0 ],
				'@@ -1,63 +0,0 @@'
			],
			[
				# File deletion? Second param is a default value for s
				[ 1, 1, 0, 0 ],
				'@@ -1 +0,0 @@'
			],
			[
				# File addition? Last param is a default value for s
				[ 0, 0, 1, 1 ],
				'@@ -0,0 +1 @@'
			],
			[
				[ 1, 1, 1, 1 ],
				'@@ -1 +1 @@'
			],

			# Some chunks which probably are non sense but yet must be
			# considered valid by our chunk parsing code.
			[
				[ 25, 1, 26, 1 ],
				'@@ -25 +26 @@'
			],
			[
				[ 31, 32, 33, 1 ],
				'@@ -31,32 +33 @@'
			],
			[
				[ 41, 1, 42, 43 ],
				'@@ -41 +42,43 @@'
				# note how this has the answer to the ultimate question of
				# life, the universe and everything. Useful to hitchhikers.
			],
		];
	}
}
