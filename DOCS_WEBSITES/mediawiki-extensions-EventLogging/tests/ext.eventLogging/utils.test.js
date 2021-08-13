'use strict';

QUnit.module( 'ext.eventLogging/utils' );

QUnit.test( 'eventInSample()', function ( assert ) {
	assert.strictEqual( mw.eventLog.eventInSample( 0 ), false );
	assert.strictEqual( mw.eventLog.eventInSample( 1 ), true );
	// Test the rest using randomTokenMatch() since we don't
	// want consistency in this case
} );

QUnit.test( 'sessionInSample()', function ( assert ) {
	var mockRandomSession = function () {
		var n;
		// we know this is a multiple of 10
		n = 1000000000;
		return n.toString( 16 );
	};
	this.sandbox.stub( mw.user, 'sessionId', mockRandomSession );

	assert.strictEqual( mw.eventLog.sessionInSample( 1 ), true );
	assert.strictEqual( mw.eventLog.sessionInSample( 7 ), false );
} );

QUnit.test( 'randomTokenMatch()', function ( assert ) {
	var n = 1000000, m = 1000001;

	assert.strictEqual( mw.eventLog.randomTokenMatch( 10, n.toString( 16 ) ), true );
	assert.strictEqual( mw.eventLog.randomTokenMatch( 10, m.toString( 16 ) ), false );
} );

QUnit.test( 'makeLegacyStreamName()', function ( assert ) {
	assert.strictEqual( mw.eventLog.makeLegacyStreamName( 'MySchema' ), 'eventlogging_MySchema' );
} );

QUnit.test( 'addRequestedValues()', function ( assert ) {
	// eslint-disable-next-line camelcase
	var event = mw.eventLog.addRequestedValues( {}, { provide_values: [ 'skin' ] } );
	assert.strictEqual( typeof event.test.skin, 'string' );
} );
