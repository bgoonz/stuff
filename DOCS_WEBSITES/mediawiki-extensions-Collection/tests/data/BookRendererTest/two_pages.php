<?php

/*
 * Tests for:
 * - generating page titles when there are multiple pages
 * - consecutive section and ToC item numbering
 */

return [
	'collection' => $this->makeCollection( 'Book title', 'Book subtitle',
		[ [ 'Foo', 'article' ], [ 'Bar', 'article' ] ] ),
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
	'expectedOutline' => [
		[
			'text' => 'Foo',
			'type' => 'article',
			'level' => -1,
			'anchor' => 'mw-book-article-Foo',
			'number' => '1',
		],
		[
			'text' => 'Foo section 1',
			'type' => 'section',
			'level' => 2,
			'anchor' => 'Foo_section_1',
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
			'text' => 'Bar section 1',
			'type' => 'section',
			'level' => 2,
			'anchor' => 'Bar_section_1',
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
