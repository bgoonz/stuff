<?php

/*
 * Tests for:
 * - chapter HTML + outline items
 * - pushing h2 down (in HTML and section data) when there are chapter + article items on top
 */

return [
	'collection' => $this->makeCollection( 'Book title', 'Book subtitle',
		[ [ 'Chapter 1', 'chapter' ], [ 'Foo', 'article' ],
			[ 'Chapter 2', 'chapter' ], [ 'Bar', 'article' ] ] ),
	'pages' => [
		'Foo' => '<html><body>Foo body<h2 id="Foo_section_1">Foo section 1</h2>Section 1 body</body></html>',
		'Bar' => '<html><body>Bar body<h2 id="Bar_section_1">Bar section 1</h2>Section 1 body</body></html>',
	],
	'metadata' => [
		'displaytitle' => [ 'Foo' => 'Foo', 'Bar' => 'Bar' ],
		'sections' => [
			'Foo' => [
				[
					'title' => 'Foo section 1',
					'id' => 'Foo_section_1',
					'level' => 2,
				],
			],
			'Bar' => [
				[
					'title' => 'Bar section 1',
					'id' => 'Bar_section_1',
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
				'title' => 'Foo section 1',
				'id' => 'Foo_section_1',
				'level' => 3,
			],
		],
		'Bar' => [
			[
				'title' => 'Bar section 1',
				'id' => 'Bar_section_1',
				'level' => 3,
			],
		],
	],
	'expectedOutline' => [
		[
			'text' => 'Chapter 1',
			'type' => 'chapter',
			'level' => -2,
			'anchor' => 'mw-book-chapter-Chapter_1',
			'number' => '1',
		],
		[
			'text' => 'Foo',
			'type' => 'article',
			'level' => -1,
			'anchor' => 'mw-book-article-Foo',
			'number' => '1.1',
		],
		[
			'text' => 'Foo section 1',
			'type' => 'section',
			'level' => 3,
			'anchor' => 'Foo_section_1',
			'number' => '1.1.1',
		],
		[
			'text' => 'Chapter 2',
			'type' => 'chapter',
			'level' => -2,
			'anchor' => 'mw-book-chapter-Chapter_2',
			'number' => '2',
		],
		[
			'text' => 'Bar',
			'type' => 'article',
			'level' => -1,
			'anchor' => 'mw-book-article-Bar',
			'number' => '2.1',
		],
		[
			'text' => 'Bar section 1',
			'type' => 'section',
			'level' => 3,
			'anchor' => 'Bar_section_1',
			'number' => '2.1.1',
		],
		[
			'text' => 'Contributors',
			'type' => 'contributors',
			'level' => -2,
			'anchor' => 'mw-book-contributors',
			'number' => '3',
		],
	],
];
