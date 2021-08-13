'use strict';

QUnit.module( 'ext.eventLogging/stream', {
	beforeEach: function () {
		this.clock = this.sandbox.useFakeTimers();
	}
} );

QUnit.test( 'submit() - warn for event without schema', function ( assert ) {
	var seen = [];
	this.sandbox.stub( mw.eventLog, 'enqueue' );
	this.sandbox.stub( mw.log, 'warn', function () {
		seen.push( 'warn' );
	} );

	mw.eventLog.setOptionsForTest( {
		streamConfigs: {
			'test.stream': { some: 'config' }
		}
	} );
	mw.eventLog.submit( 'test.stream', {} );
	assert.deepEqual( [ 'warn' ], seen );
	assert.strictEqual( mw.eventLog.enqueue.callCount, 0, 'enqueue() calls' );
} );

QUnit.test( 'submit() - produce an event correctly', function ( assert ) {
	var t1, jsonString, data;
	this.sandbox.stub( mw.eventLog, 'enqueue', function ( callback ) {
		// Stub BackgroundQueue, regardless of intervalSecs config.
		callback();
	} );
	this.sandbox.stub( mw.log, 'warn' );
	this.sandbox.stub( navigator, 'sendBeacon' );

	this.clock.tick( 1000 );
	t1 = new Date().toISOString();
	mw.eventLog.setOptionsForTest( {
		serviceUri: 'testUri',
		streamConfigs: {
			'test.stream': { some: 'config' }
		}
	} );
	mw.eventLog.submit( 'test.stream', { $schema: 'test/schema' } );
	this.clock.tick( 1000 );

	assert.strictEqual( mw.log.warn.callCount, 0, 'warn() calls' );
	assert.strictEqual( navigator.sendBeacon.callCount, 1, 'sendBeacon() calls' );
	jsonString = navigator.sendBeacon.args[ 0 ][ 1 ];
	data = JSON.parse( jsonString );
	assert.strictEqual( data.dt, t1, 'client-side dt is valid' );
	assert.strictEqual( data.meta.stream, 'test.stream', 'stream is valid' );
} );

QUnit.test( 'streamConfig() - disallow modification', function ( assert ) {
	mw.eventLog.setOptionsForTest( {
		streamConfigs: {
			'test.stream': { field: 'expectedValue' }
		}
	} );
	mw.eventLog.streamConfig( 'test.stream' ).field = 'otherValue';
	assert.strictEqual( mw.eventLog.streamConfig( 'test.stream' ).field, 'expectedValue' );
} );

QUnit.test( 'streamInSample() - valid and invalid stream configs', function ( assert ) {
	var conf = {
		emptyConfig: {},
		nonemptyConfigNoSample: {
			some: 'value'
		},
		zeroRateValidUnit: {
			sample: {
				rate: 0.0,
				unit: 'session'
			}
		},
		validRateInvalidUnit: {
			sample: {
				rate: 0.5,
				unit: 'coelacanth'
			}
		},
		validRateMissingUnit: {
			sample: {
				rate: 0.5
			}
		},
		tooHighRateValidUnit: {
			sample: {
				rate: 5,
				unit: 'session'
			}
		},
		tooHighRateInvalidUnit: {
			sample: {
				rate: 5,
				unit: 'coelacanth'
			}
		},
		tooHighRateMissingUnit: {
			sample: {
				rate: 5
			}
		},
		tooLowRateValidUnit: {
			sample: {
				rate: -5,
				unit: 'session'
			}
		},
		tooLowRateInvalidUnit: {
			sample: {
				rate: -5,
				unit: 'coelacanth'
			}
		},
		tooLowRateMissingUnit: {
			sample: {
				rate: -5
			}
		},
		missingRateValidUnit: {
			sample: {
				unit: 'session'
			}
		},
		missingRateInvalidUnit: {
			sample: {
				unit: 'coelacanth'
			}
		},
		missingRateMissingUnit: {
			sample: {}
		}
	};

	assert.strictEqual( mw.eventLog.streamInSample( conf.nonExistentStream ), false );
	assert.strictEqual( mw.eventLog.streamInSample( conf.emptyConfig ), true );
	assert.strictEqual( mw.eventLog.streamInSample( conf.nonemptyConfigNoSample ), true );
	assert.strictEqual( mw.eventLog.streamInSample( conf.zeroRateValidUnit ), false );

	assert.strictEqual( mw.eventLog.streamInSample( conf.validRateInvalidUnit ), false );
	assert.strictEqual( mw.eventLog.streamInSample( conf.validRateMissingUnit ), false );

	assert.strictEqual( mw.eventLog.streamInSample( conf.tooHighRateValidUnit ), false );
	assert.strictEqual( mw.eventLog.streamInSample( conf.tooHighRateInvalidUnit ), false );
	assert.strictEqual( mw.eventLog.streamInSample( conf.tooHighRateMissingUnit ), false );

	assert.strictEqual( mw.eventLog.streamInSample( conf.tooLowRateValidUnit ), false );
	assert.strictEqual( mw.eventLog.streamInSample( conf.tooLowRateInvalidUnit ), false );
	assert.strictEqual( mw.eventLog.streamInSample( conf.tooLowRateMissingUnit ), false );

	assert.strictEqual( mw.eventLog.streamInSample( conf.missingRateValidUnit ), false );
	assert.strictEqual( mw.eventLog.streamInSample( conf.missingRateInvalidUnit ), false );
	assert.strictEqual( mw.eventLog.streamInSample( conf.missingRateMissingUnit ), false );
} );

QUnit.test( 'streamInSample() - session sampling is deterministic', function ( assert ) {
	var conf, x0, i;

	conf = {
		sample: {
			rate: 0.5,
			unit: 'session'
		}
	};

	x0 = mw.eventLog.streamInSample( conf );

	for ( i = 0; i < 5; i++ ) {
		assert.strictEqual( x0, mw.eventLog.streamInSample( conf ) );
	}
} );

QUnit.test( 'streamInSample() - pageview sampling is deterministic', function ( assert ) {
	var conf, x0, i;

	conf = {
		sample: {
			rate: 0.5,
			unit: 'pageview'
		}
	};

	x0 = mw.eventLog.streamInSample( conf );

	for ( i = 0; i < 5; i++ ) {
		assert.strictEqual( x0, mw.eventLog.streamInSample( conf ) );
	}
} );

QUnit.test( 'streamInSample() - session sampling resets', function ( assert ) {
	var conf, tot = 0, i;

	conf = {
		sample: {
			rate: 0.5,
			unit: 'session'
		}
	};

	for ( i = 0; i < 20; i++ ) {
		tot += mw.eventLog.streamInSample( conf );
		mw.eventLog.id.resetSessionId();
	}

	assert.notEqual( tot, 20 );
	assert.notEqual( tot, 0 );
} );

QUnit.test( 'streamInSample() - pageview sampling resets', function ( assert ) {
	var conf, tot = 0, i;

	conf = {
		sample: {
			rate: 0.5,
			unit: 'pageview'
		}
	};

	for ( i = 0; i < 20; i++ ) {
		tot += mw.eventLog.streamInSample( conf );
		mw.eventLog.id.resetPageviewId();
	}

	assert.notEqual( tot, 20 );
	assert.notEqual( tot, 0 );
} );

QUnit.test( 'id.normalizeId() - id normalizes to a number in [0,1]', function ( assert ) {
	var id = mw.eventLog.id.normalizeId( mw.eventLog.id.generateId() );

	assert.strictEqual( ( id >= 0 && id <= 1 ), true );
} );
