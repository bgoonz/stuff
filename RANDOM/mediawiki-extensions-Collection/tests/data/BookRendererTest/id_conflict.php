<?php

/*
 * Tests for an ID conflict between two articles.
 */

return [
	'collection' => $this->makeCollection( 'Book title', 'Book subtitle',
		[ [ 'Foo', 'article' ], [ 'Bar', 'article' ] ] ),
	'pages' => [
		'Foo' => '<html><body>Foo body<h2 id="Section_1">Section 1</h2>Section 1 body</body></html>',
		'Bar' => '<html><body>Bar body<h2 id="Section_1">Section 1</h2>Section 1 body</body></html>',
	],
	'metadata' => [
		'displaytitle' => [ 'Foo' => 'Foo', 'Bar' => 'Bar' ],
		'sections' => [
			'Foo' => [
				[
					'title' => 'Section 1',
					'id' => 'Section_1',
					'level' => 2,
				],
			],
			'Bar' => [
				[
					'title' => 'Section 1',
					'id' => 'Section_1',
					'level' => 2,
				],
			],
		],
		'contributors' => [ 'X' => 1 ],
		'modules' => [ 'foo' ],
		'modulestyles' => [ 'foostyle' ],
		'jsconfigvars' => [ 'x' => 1 ],
	],
	'expectedHtml' => [ /* will be filled in */ ],
	'expectedSections' => [
		'Foo' => [
			[
				'title' => 'Section 1',
				'id' => 'Section_1',
				'level' => 2,
			],
		],
		'Bar' => [
			[
				'title' => 'Section 1',
				'id' => 'Section_1_2',
				'level' => 2,
			],
		],
	],
	'expectedOutline' => [
		[
			'text' => 'Foo',
			'type' => 'article',
			'level' => -1,
			'anchor' => 'mw-book-article-Foo',
			'number' => '1',
		],
		[
			'text' => 'Section 1',
			'type' => 'section',
			'level' => 2,
			'anchor' => 'Section_1',
			'number' => '1.1',
		],
		[
			'text' => 'Bar',
			'type' => 'article',
			'level' => -1,
			'anchor' => 'mw-book-article-Bar',
			'number' => '2',
		],
		[
			'text' => 'Section 1',
			'type' => 'section',
			'level' => 2,
			'anchor' => 'Section_1_2',
			'number' => '2.1',
		],
		[
			'text' => 'Contributors',
			'type' => 'contributors',
			'level' => -1,
			'anchor' => 'mw-book-contributors',
			'number' => '3',
		],
	],
];
