<?php

/*
 * Tests for:
 * - basic HTML generation
 * - outline generation
 * - simple section and ToC item numbering
 */

return [
	'collection' => $this->makeCollection( 'Book title', 'Book subtitle',
		[ [ 'Foo', 'article' ] ] ),
	'pages' => [ 'Foo' => '<html><body>Foo body<h2 id="Section_1">Section 1</h2>Section 1 body</body></html>' ],
	'metadata' => [
		'displaytitle' => [ 'Foo' => '<b>Foo</b>' ],
		'sections' => [
			'Foo' => [
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
	],
	'expectedOutline' => [
		[
			'text' => 'Section 1',
			'type' => 'section',
			'level' => 2,
			'anchor' => 'Section_1',
			'number' => '1',
		],
		[
			'text' => 'Contributors',
			'type' => 'contributors',
			'level' => 0,
			'anchor' => 'mw-book-contributors',
			'number' => '2',
		],
	],
];
