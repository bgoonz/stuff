'use strict';

QUnit.module( 'ext.eventLogging/BackgroundQueue', {
	beforeEach: function () {
		this.clock = this.sandbox.useFakeTimers();
	}
} );

QUnit.test( 'add()', function ( assert ) {
	var q = new mw.eventLog.BackgroundQueue( 1 / 1000 ),
		seen = [];
	q.add( function () {
		seen.push( 'x' );
	} );
	assert.deepEqual( [], seen );
	assert.strictEqual( typeof q.getTimer(), 'number' );
	assert.strictEqual( q.getCallbacks().length, 1 );

	this.clock.tick( 1 );
	assert.deepEqual( [ 'x' ], seen );
	assert.strictEqual( q.getTimer(), null );
	assert.strictEqual( q.getCallbacks().length, 0 );
} );
