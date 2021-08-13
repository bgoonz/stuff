'use strict';

QUnit.module( 'ext.eventLogging/log', QUnit.newMwEnvironment( {
	setup: function () {
		this.suppressWarnings();
		mw.eventLog.setOptionsForTest( {
			baseUrl: '#',
			schemasInfo: {
				earthquake: 123,
				// eruption events will be prepared for POSTing to EventGate.
				eruption: '/analytics/legacy/eruption/1.0.0'
			}
		} );
	},
	teardown: function () {
		this.restoreWarnings();
	}
} ) );

QUnit.test( 'logEvent()', function ( assert ) {
	var eventData = {
		epicenter: 'Valdivia',
		magnitude: 9.5
	};

	return mw.eventLog.logEvent( 'earthquake', eventData ).then( function ( e ) {
		assert.deepEqual( e.event, eventData, 'logEvent promise resolves with event' );
		assert.strictEqual( e.revision, 123, 'logEvent gets the revision id from config' );
	} );
} );

QUnit.test( 'logEvent() via submit()', function ( assert ) {
	var eventData = {
		volcano: 'Nyiragongo',
		Explosivity: 1
	};

	return mw.eventLog.logEvent( 'eruption', eventData ).then( function ( e ) {
		var expectedEventData = {
			volcano: 'Nyiragongo',
			Explosivity: 1
		};

		assert.deepEqual(
			e.event,
			expectedEventData,
			'logEvent promise resolves with event prepared for EventGate'
		);

		assert.strictEqual(
			e.$schema,
			'/analytics/legacy/eruption/1.0.0',
			'logEvent builds the $schema url from revision in config'
		);

		assert.ok( e.meta, 'meta field should be set' );
		assert.notOk( e.dt, 'dt should not be set' );
		assert.ok( e.client_dt, 'client_dt should be set' );
		assert.strictEqual( e.meta.domain, e.webHost, 'meta.domain should match webHost field' );
		assert.strictEqual( e.revision, undefined, 'revision field should be unset' );
	} );
} );

// eslint-disable-next-line no-jquery/no-each-util
$.each( {
	'checkUrlSize() - URL size is ok': {
		size: mw.eventLog.maxUrlSize,
		expected: undefined
	},
	'checkUrlSize() - URL size is not ok': {
		size: mw.eventLog.maxUrlSize + 1,
		expected: 'Url exceeds maximum length'
	}
}, function ( name, params ) {
	QUnit.test( name, function ( assert ) {
		var url = new Array( params.size + 1 ).join( 'x' ),
			result = mw.eventLog.checkUrlSize( 'earthquake', url );
		assert.deepEqual( result, params.expected, name );
	} );
} );

QUnit.test( 'logEvent() - reject large event data', function ( assert ) {
	var event = {
		epicenter: 'Valdivia',
		magnitude: 9.5,
		article: new Array( mw.eventLog.maxUrlSize + 1 ).join( 'x' )
	};

	mw.eventLog.logEvent( 'earthquake', event )
		.done( function () {
			assert.ok( false, 'Expected an error' );
		} )
		.fail( function ( e, error ) {
			assert.deepEqual( error, 'Url exceeds maximum length',
				'logEvent promise resolves with error' );
		} )
		.always( assert.async() );
} );
