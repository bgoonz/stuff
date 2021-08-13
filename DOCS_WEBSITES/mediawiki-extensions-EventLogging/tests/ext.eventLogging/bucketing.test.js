/* eslint-env qunit */
'use strict';

QUnit.module( 'ext.eventLogging/bucketing' );

// eslint-disable-next-line no-jquery/no-each-util
$.each( {
	'getUserEditCountBucket() - anonymous': {
		editCount: null,
		expected: null
	},
	'getUserEditCountBucket() - 0': {
		editCount: 0,
		expected: '0 edits'
	},
	'getUserEditCountBucket() - 3': {
		editCount: 3,
		expected: '1-4 edits'
	},
	'getUserEditCountBucket() - 99999': {
		editCount: 99999,
		expected: '1000+ edits'
	}
}, function ( name, params ) {
	QUnit.test( name, function ( assert ) {
		assert.strictEqual(
			mw.eventLog.getUserEditCountBucket( params.editCount ),
			params.expected
		);
	} );
} );
