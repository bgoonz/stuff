<?php

/*
 * Tests for pushing a complex tree of sections down.
 */

return [
	'collection' => $this->makeCollection( 'Book title', 'Book subtitle',
		[ [ 'Foo', 'article' ] ] ),
	// phpcs:ignore Generic.Files.LineLength
	'pages' => [ 'Foo' => '<html><body>Foo body<h1 id="Section_1">Section 1</h1><h2 id="Section_1.1">Section 1.1</h2><h3 id="Section_1.1.1">Section 1.1.1</h3><h4 id="Section_1.1.1.1">Section 1.1.1.1</h4><h5 id="Section_1.1.1.1.1">Section 1.1.1.1.1</h5><h6 id="Section_1.1.1.1.1.1">Section 1.1.1.1.1.1</h6><h3 id="Section_1.1.2">Section 1.1.2</h3></body></html>' ],
	'metadata' => [
		'displaytitle' => [ 'Foo' => 'Foo' ],
		'sections' => [
			'Foo' => [
				[
					'title' => 'Section 1',
					'id' => 'Section_1',
					'level' => 1,
				],
				[
					'title' => 'Section 1.1',
					'id' => 'Section_1.1',
					'level' => 2,
				],
				[
					'title' => 'Section 1.1.1',
					'id' => 'Section_1.1.1',
					'level' => 3,
				],
				[
					'title' => 'Section 1.1.1.1',
					'id' => 'Section_1.1.1.1',
					'level' => 4,
				],
				[
					'title' => 'Section 1.1.1.1.1',
					'id' => 'Section_1.1.1.1.1',
					'level' => 5,
				],
				[
					'title' => 'Section 1.1.1.1.1.1',
					'id' => 'Section_1.1.1.1.1.1',
					'level' => 6,
				],
				[
					'title' => 'Section 1.1.2',
					'id' => 'Section_1.1.2',
					'level' => 3,
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
			[
				'title' => 'Section 1.1',
				'id' => 'Section_1.1',
				'level' => 3,
			],
			[
				'title' => 'Section 1.1.1',
				'id' => 'Section_1.1.1',
				'level' => 4,
			],
			[
				'title' => 'Section 1.1.1.1',
				'id' => 'Section_1.1.1.1',
				'level' => 5,
			],
			[
				'title' => 'Section 1.1.1.1.1',
				'id' => 'Section_1.1.1.1.1',
				'level' => 6,
			],
			[
				'title' => 'Section 1.1.1.1.1.1',
				'id' => 'Section_1.1.1.1.1.1',
				'level' => 6,
			],
			[
				'title' => 'Section 1.1.2',
				'id' => 'Section_1.1.2',
				'level' => 4,
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
			'text' => 'Section 1.1',
			'type' => 'section',
			'level' => 3,
			'anchor' => 'Section_1.1',
			'number' => '1.1',
		],
		[
			'text' => 'Section 1.1.1',
			'type' => 'section',
			'level' => 4,
			'anchor' => 'Section_1.1.1',
			'number' => '1.1.1',
		],
		[
			'text' => 'Section 1.1.1.1',
			'type' => 'section',
			'level' => 5,
			'anchor' => 'Section_1.1.1.1',
			'number' => '1.1.1.1',
		],
		[
			'text' => 'Section 1.1.1.1.1',
			'type' => 'section',
			'level' => 6,
			'anchor' => 'Section_1.1.1.1.1',
			'number' => '1.1.1.1.1',
		],
		[
			'text' => 'Section 1.1.1.1.1.1',
			'type' => 'section',
			'level' => 6,
			'anchor' => 'Section_1.1.1.1.1.1',
			'number' => '1.1.1.1.2',
		],
		[
			'text' => 'Section 1.1.2',
			'type' => 'section',
			'level' => 4,
			'anchor' => 'Section_1.1.2',
			'number' => '1.1.2',
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
