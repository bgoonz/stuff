/*!
 * EventLogging client
 * @author Ori Livneh <ori@wikimedia.org>
 */
'use strict';

var core, debugMode,
	// config contains:
	// - baseUrl: corresponds to the $wgEventLoggingBaseUri configuration in PHP.
	//            If set to false (default), then events will not be logged.
	// - schemasInfo: Object mapping schema names to revision IDs or $schema URIs
	// - streamConfigs: Object mapping stream name to stream config (sampling rate, etc.)
	config = require( './data.json' ),
	BackgroundQueue = require( './BackgroundQueue.js' ),
	queue = ( new BackgroundQueue( config.queueLingerSeconds ) );

// Support both 1 or "1" (T54542)
debugMode = Number( mw.user.options.get( 'eventlogging-display-web' ) ) === 1;

/**
 * Construct the streamName for a legacy EventLogging Schema.
 *
 * Legacy EventLogging Schemas are single use and have only one associated stream.
 *
 * @ignore
 * @private
 * @param  {string} schemaName
 * @return {string}
 */
function makeLegacyStreamName( schemaName ) {
	return 'eventlogging_' + schemaName;
}

/**
 * Client-side EventLogging API, including pub/sub subscriber functionality.
 *
 * The main API is `mw.eventLog.logEvent`.  This is set up as a listener for
 * `event`-namespace topics in `mw.track`. Sampling utility methods are available
 * in two flavors.  Other methods represent internal functionality, exposed only
 * to ease debugging code and writing tests.
 *
 * @class mw.eventLog
 * @singleton
 */
core = {

	/**
	 * Maximum length in chars that a beacon URL can have.
	 *
	 * Relevant:
	 * - Length that browsers support (http://stackoverflow.com/a/417184/319266)
	 * - Length that proxies support (e.g. Varnish)
	 * - varnishlog (shm_reclen)
	 * - varnishkafka
	 *
	 * @private
	 * @property {number} maxUrlSize
	 */
	maxUrlSize: 2000,

	/**
	 * Get the configured revision id or $schema URI
	 * to use with events of a particular (legacy metawiki) EventLogging schema.
	 *
	 * @private
	 * @param {string} schemaName Canonical schema name.
	 * @return {number|string}
	 *         The revision id configured for this schema by instrumentation,
	 *         or a string $schema URI for use with Event Platform.
	 */
	getRevisionOrSchemaUri: function ( schemaName ) {
		return config.schemasInfo[ schemaName ] || -1;
	},

	/**
	 * Prepare an event for dispatch.
	 *
	 * This encapsulates the event data in a wrapper object with
	 * the default metadata for the current web page.
	 *
	 * NOTE: for forwards compatibility with Event Platform schemas,
	 * we hijack the wgEventLoggingSchemas revision to encode the
	 * $schema URI. If the value for a schema defined in
	 * EventLoggingSchemas is a string, it is assumed
	 * to be an Event Platform $schema URI, not a MW revision id.
	 * In this case, the event will be prepared to be POSTed to EventGate.
	 *
	 * @private
	 * @param {string} schemaName Canonical schema name.
	 * @param {Object} eventData Event data.
	 * @return {Object} Encapsulated event.
	 */
	prepare: function ( schemaName, eventData ) {
		// Wrap eventData in EventLogging's EventCapsule.
		var
			event = {
				event: eventData,
				schema: schemaName,
				webHost: mw.config.get( 'wgServerName' ),
				wiki: mw.config.get( 'wgDBname' )
			},
			revisionOrSchemaUri = core.getRevisionOrSchemaUri( schemaName );

		// Forward compatibility with Event Platform schemas and EventGate.
		// If the wgEventLoggingSchemas entry for this schemaName is a string,
		// assume it is the Event Platform relative $schema URI and that
		// we want this event POSTed to EventGate.
		// Make the event data forward compatible.
		if ( typeof revisionOrSchemaUri === 'string' ) {
			event.$schema = revisionOrSchemaUri;
			// eslint-disable-next-line
			event.client_dt = new Date().toISOString();
			// Note: some fields will have defaults set by eventgate-wikimedia.
			// See:
			// - https://gerrit.wikimedia.org/r/plugins/gitiles/eventgate-wikimedia/+/refs/heads/master/eventgate-wikimedia.js#358
			// - https://wikitech.wikimedia.org/wiki/Event_Platform/Schemas/Guidelines#Automatically_populated_fields
		} else {
			// Deprecated:
			// Assume revisionOrSchemaUri is the MW revision id for this
			// EventLogging schema.
			event.revision = revisionOrSchemaUri;
		}

		return event;
	},

	/**
	 * Construct the EventLogging URI based on the base URI and the
	 * encoded and stringified data.
	 *
	 * @private
	 * @param {Object} data Payload to send.
	 * @return {string|boolean} The URI to log the event.
	 */
	makeBeaconUrl: function ( data ) {
		var queryString = encodeURIComponent( JSON.stringify( data ) );
		return config.baseUrl + '?' + queryString + ';';
	},

	/**
	 * Check whether a beacon url is short enough.
	 *
	 * @private
	 * @param {string} schemaName Canonical schema name.
	 * @param {string} url Beacon url.
	 * @return {string|undefined} The error message in case of error.
	 */
	checkUrlSize: function ( schemaName, url ) {
		var message;
		if ( url.length > core.maxUrlSize ) {
			message = 'Url exceeds maximum length';
			core.logFailure( schemaName, 'urlSize' );
			mw.track( 'eventlogging.error', mw.format( '[$1] $2', schemaName, message ) );
			return message;
		}
	},

	/**
	 * Make a 'fire and forget' HTTP request to a specified URL with the given payload data.
	 *
	 * If data is undefined, a detached image element wil be created for
	 * browsers without `navigator.sendBeacon`.  This cannot be done if data is provided,
	 * as a payload cannot be sent using this mechanism.  I.e. this img fallback will
	 * only be used for 'legacy' events that are sent via a URL query params rather than
	 * a POST JSON body.
	 * See also T273374 and T86680.
	 *
	 * If navigator.sendBeacon does not exist (and img fallback cannot be used)
	 * or throws an exception, this will be a no-op.
	 *
	 * @param {string} url URL to request from the server.
	 * @param {string} data to POST to server.
	 */
	sendBeacon: function ( url, data ) {
		if ( navigator.sendBeacon ) {
			try {
				navigator.sendBeacon( url, data );
			} catch ( e ) {}
		} else if ( !data ) {
			document.createElement( 'img' ).src = url;
		}
	},

	/**
	 * Add a pending callback to be flushed at a later time by the background queue
	 *
	 * @param {Function} callback to enqueue and run when the queue is processed
	 * @return undefined
	 */
	enqueue: queue.add,

	/**
	 * Construct and transmit to a remote server a record of some event
	 * having occurred. Events are represented as JavaScript objects that
	 * conform to a JSON Schema. The schema describes the properties the
	 * event object may (or must) contain and their type. This method
	 * represents the public client-side API of EventLogging.
	 *
	 * @param {string} schemaName Canonical schema name.
	 * @param {Object} eventData Event object.
	 * @return {jQuery.Promise} jQuery Promise object for the logging call.
	 */
	logEvent: function ( schemaName, eventData ) {
		var url,
			sizeError,
			event = core.prepare( schemaName, eventData ),
			deferred = $.Deferred();

		// Assume that if $schema was set by core.prepare(), this
		// event should be POSTed to EventGate.
		if ( event.$schema ) {
			core.submit( makeLegacyStreamName( schemaName ), event );
			deferred.resolveWith( event, [ event ] );
		} else {
			url = core.makeBeaconUrl( event );
			sizeError = core.checkUrlSize( schemaName, url );

			if ( !sizeError ) {
				if ( config.baseUrl || debugMode ) {
					core.enqueue( function () {
						core.sendBeacon( url );
					} );
				}
				if ( debugMode ) {
					mw.track( 'eventlogging.debug', event );
				}
				// TODO: deprecate the signature of this method by returning a meaningless
				// promise and moving the sizeError checking into debug mode
				deferred.resolveWith( event, [ event ] );
			} else {
				deferred.rejectWith( event, [ event, sizeError ] );
			}
		}
		return deferred.promise();
	},

	/**
	 * Increment the error count in statsd for this schema.
	 *
	 * Should be called instead of logEvent in case of an error.
	 *
	 * @param {string} schemaName
	 * @param {string} errorCode
	 */
	logFailure: function ( schemaName, errorCode ) {
		// Record this failure as a simple counter. By default "counter.*" goes nowhere.
		// The WikimediaEvents extension sends it to statsd.
		mw.track( 'counter.eventlogging.client_errors.' + schemaName + '.' + errorCode );
	},

	/**
	 * Randomise inclusion based on population size and random token.
	 *
	 * Use #eventInSample or #sessionInSample instead.
	 *
	 * Note that token is coerced into 32 bits before calculating its mod  with
	 * the population size, while this does not make possible to sample in a rate below
	 * 1/2^32 and our token space is 2^80 this in practice is not a problem
	 * as schemas that are sampled sparsely are so  with ratios like 1/10,000
	 * so our "sampling space" is in practice quite smaller than  the token
	 * "random space"
	 *
	 * @private
	 * @param {number} populationSize One in how many should return true.
	 * @param {string} [explicitToken] at least 32 bit integer in HEX format
	 * @return {boolean}
	 */
	randomTokenMatch: function ( populationSize, explicitToken ) {
		var token = explicitToken || mw.user.generateRandomSessionId(),
			rand = parseInt( token.slice( 0, 8 ), 16 );
		return rand % populationSize === 0;
	},

	/**
	 * Determine whether the current sessionId is sampled given a sampling ratio.
	 * This method is deterministic given same sampling rate and sessionId,
	 * so sampling is sticky given a session and a sampling rate
	 *
	 * @param {number} populationSize One in how many should be included.
	 *  0 means nobody, 1 is 100%, 2 is 50%, etc.
	 * @return {boolean}
	 */
	sessionInSample: function ( populationSize ) {
		// Use the same unique random identifier within the same  session
		// to allow correlation between multiple events.
		return this.randomTokenMatch( populationSize, mw.user.sessionId() );
	},

	/**
	 * @deprecated Use #eventInSample
	 * @param {number} populationSize
	 * @return {boolean}
	 */
	inSample: function ( populationSize ) {
		return this.eventInSample( populationSize );
	},

	/**
	 * Determine whether the current event is sampled given a sampling ratio
	 * per pageview
	 *
	 * @param {number} populationSize One in how many should be included.
	 *  0 means nobody, 1 is 100%, 2 is 50%, etc.
	 * @return {boolean}
	 */
	eventInSample: function ( populationSize ) {
		// Use the same unique random identifier within the same page load
		// to allow correlation between multiple events.
		return this.randomTokenMatch( populationSize, mw.user.getPageviewToken() );
	}
};

// ////////////////////////////////////////////////////////////////////
// MEP Upgrade Zone
//
// As we upgrade EventLogging to use MEP components, we will refactor
// code from above to here. https://phabricator.wikimedia.org/T238544
// ////////////////////////////////////////////////////////////////////

/**
 * Submit an event according to the given stream's configuration.
 * If DNT is enabled, this method does nothing.
 *
 * @param {string} streamName name of the stream to send eventData to
 * @param {Object} eventData data to send to streamName
 */
core.submit = function ( streamName, eventData ) {
	//
	// NOTE
	// If stream configuration is disabled (config.streamConfigs === false),
	// then core.streamConfig will return an empty object {},
	// i.e. a truthy value, for all stream names.
	//
	// FIXME
	// The convention that disabling stream configuration results
	// in enabling any caller to send any event, with no sampling,
	// etc., is correct in the sense of the boolean logic, but
	// counter-intuitive and likely hard to keep correct as more
	// behavior is added. We should revisit.
	var streamConfig = core.streamConfig( streamName );

	if ( !streamConfig ) {
		//
		// If stream configurations are enabled but no
		// stream configuration has been loaded for streamName
		// (and we are not in debugMode), we assume the client
		// is misconfigured. Rather than produce potentially
		// inconsistent data, the event submission does not
		// proceed.
		//
		// FIXME
		// See comment above; this should be made less
		// confusing.
		return;
	}

	// If stream is not in sample, do not log the event.
	if ( !core.streamInSample( streamConfig ) ) {
		return;
	}

	if ( !eventData || !eventData.$schema ) {
		//
		// If the caller has not provided a $schema field
		// in eventData, the event submission does not
		// proceed.
		//
		// The $schema field represents the (versioned)
		// schema which the caller expects eventData
		// will validate against (once the appropriate
		// additions have been made by this client).
		//
		mw.log.warn(
			'submit( ' + streamName + ', eventData ) called with eventData ' +
			'missing required field "$schema". No event will issue.'
		);
		return;
	}

	eventData.meta = eventData.meta || {};
	eventData.meta.stream = streamName;
	eventData.meta.domain = mw.config.get( 'wgServerName' );
	//
	// The 'dt' field is reserved for the internal use of this library,
	// and should not be set by any other caller.
	//
	// (1) 'dt' is a client-side timestamp for new events
	//      and a server-side timestamp for legacy events.
	// (2) 'dt' will be provided by EventGate if omitted here,
	//      so it should be omitted for legacy events (and
	//      deleted if present).
	//
	// We detect legacy events by looking for the 'client_dt' field
	// set in the .produce() method (see above).
	//
	if ( eventData.client_dt ) {
		delete eventData.dt;
	} else {
		eventData.dt = new Date().toISOString();
	}

	// FIXME: This is a demo implementation. Use at your own risk.
	core.addRequestedValues( eventData, streamConfig );

	// This will use a MediaWiki notification in the browser to display the event data.
	if ( debugMode ) {
		mw.track(
			'eventlogging.eventSubmitDebug',
			{ streamName: streamName, eventData: eventData }
		);
	}

	//
	// Send the processed event to be produced.
	//
	if ( config.serviceUri ) {
		core.enqueue( function () {
			core.sendBeacon(
				config.serviceUri,
				JSON.stringify( eventData )
			);
		} );
	}
};

core.storage = {
	get: function ( name ) {
		mw.cookie.get( 'el-' + name );
	},
	set: function ( name, value ) {
		mw.cookie.set( 'el-' + name, value );
	},
	unset: function ( name ) {
		mw.cookie.set( 'el-' + name, null );
	}
};

core.id = ( function () {
	var
		UINT32_MAX = 4294967295, // (2^32) - 1
		pageviewId = null,
		sessionId = null;

	// Provided by the sessionTick instrument in WikimediaEvents.
	mw.trackSubscribe( 'sessionReset', function () {
		core.id.resetSessionId();
	} );

	return {
		resetPageviewId: function () {
			pageviewId = null;
		},

		resetSessionId: function () {
			sessionId = null;
			core.storage.unset( 'sessionId' );
		},

		generateId: function () {
			return mw.user.generateRandomSessionId();
		},

		normalizeId: function ( id ) {
			return parseInt( id.slice( 0, 8 ), 16 ) / UINT32_MAX;
		},

		getPageviewId: function () {
			if ( !pageviewId ) {
				pageviewId = core.id.generateId();
			}
			return pageviewId;
		},

		getSessionId: function () {
			if ( !sessionId ) {
				//
				// If there is no runtime value for SESSION_ID,
				// try to load a value from persistent store.
				//
				sessionId = core.storage.get( 'sessionId' );

				if ( !sessionId ) {
					//
					// If there is no value in the persistent store,
					// generate a new value for SESSION_ID, and write
					// the update to the persistent store.
					//
					sessionId = core.id.generateId();
					core.storage.set( 'sessionId', sessionId );
				}
			}
			return sessionId;
		}
	};
}() );

/**
 * Determine whether a stream is in-sample or out-sample.
 *
 * @private
 * @param {Object} streamConfig stream configuration
 * @return {boolean} true if in-sample, false if out-sample.
 */
core.streamInSample = function ( streamConfig ) {
	var id;

	if ( debugMode ) {
		// If a user is in debug mode, they are in-sample.
		// FIXME: Is this always what we want?
		return true;
	}

	if ( !streamConfig ) {
		// If a stream is not defined, it is not in sample.
		return false;
	}

	if ( !streamConfig.sample ) {
		// If the stream does not specify sampling, it is in-sample.
		return true;
	}

	if (
		( !streamConfig.sample.rate || !streamConfig.sample.unit ) ||
		( streamConfig.sample.rate < 0 || streamConfig.sample.rate > 1 )
	) {
		// If the stream does specify sampling, but it is malformed,
		// it is not in-sample.
		return false;
	}

	switch ( streamConfig.sample.unit ) {
		case 'pageview':
			id = core.id.getPageviewId();
			break;
		case 'session':
			id = core.id.getSessionId();
			break;
		default:
			return false;
	}

	id = core.id.normalizeId( id );

	return ( id < streamConfig.sample.rate );
};

/**
 * Return the configuration object of the given stream name.
 *
 * Modifications to the returned object will not change the actual
 * configuration. If there's no configuration for the passed stream,
 * undefined is returned.
 *
 * @private
 * @param {string} streamName name of the stream to return config for
 * @return {Object|null} Stream configuration for the given streamName, or
 *  undefined if the given stream was not enabled (or not loaded).
 */
core.streamConfig = function ( streamName ) {
	// If streamConfigs are false, then
	// stream config usage is not enabled.
	// Always return an empty object.
	// FIXME: naming
	if ( config.streamConfigs === false ) {
		return {};
	}

	if ( !config.streamConfigs[ streamName ] ) {
		// In case no config has been assigned to the given streamName,
		// return undefined, so that the developer can discern between
		// a stream that is not configured, and a stream with config = {}.
		return undefined;
	}
	return $.extend( true, {}, config.streamConfigs[ streamName ] );
};

/**
 * Add client-provided supplemental values as requested in the stream configuration.
 *
 * For now, as a proof of concept, this function will add requested values to a top-level
 * `test` field. If the event data object already contains a corresponding value for a
 * requested value, it will *not* be overwritten.
 *
 * @param {Object} eventData
 * @param {Object} streamConfig
 * @return {Object} event data
 */
core.addRequestedValues = function ( eventData, streamConfig ) {
	var i,
		requestedValue,
		requestedValues = streamConfig.provide_values;

	if ( !Array.isArray( requestedValues ) ) {
		return eventData;
	}
	eventData.test = eventData.test || {};
	if ( !( eventData.test === Object( eventData.test ) ) ) {
		// eventData.test exists but is not an Object; abort
		// TODO: This check should not be needed in the final implementation
		return eventData;
	}
	for ( i = 0; i < requestedValues.length; i++ ) {
		requestedValue = requestedValues[ i ];
		if ( {}.hasOwnProperty.call( eventData.test, requestedValue ) ) {
			continue;
		}
		switch ( requestedValue ) {
			case 'skin':
				eventData.test.skin = mw.config.get( 'skin' );
				break;
			default:
				mw.log.warn( 'EventLogging: Ignoring unknown requested value \'' +
					requestedValue + '\'' );
				break;
		}
	}
	return eventData;
};

/**
 * Provide the user's edit count as a low-granularity bucket name
 *
 * TODO: This should be transparently injected using the
 * addRequestedValues mechanism, when it's mature.
 *
 * @param {number|null} editCount User edit count, or null for anonymous performers.
 * @return {string|null} `null` for anonymous performers.
 *
 * Do not use this value in conjunction with other edit count
 * bucketing, or you will deanonymize users to some degree.
 */
function getUserEditCountBucket( editCount ) {
	if ( editCount === null ) {
		return null;
	}
	if ( editCount === 0 ) {
		return '0 edits';
	}
	if ( editCount < 5 ) {
		return '1-4 edits';
	}
	if ( editCount < 100 ) {
		return '5-99 edits';
	}
	if ( editCount < 1000 ) {
		return '100-999 edits';
	}
	return '1000+ edits';
}
mw.config.set(
	'wgUserEditCountBucket',
	getUserEditCountBucket( mw.config.get( 'wgUserEditCount' ) )
);

// Not allowed outside unit tests
if ( window.QUnit ) {
	core.setOptionsForTest = function ( opts ) {
		var oldConfig = config;
		config = $.extend( {}, config, opts );
		return oldConfig;
	};
	core.BackgroundQueue = BackgroundQueue;
	core.streamConfigs = config.streamConfigs;
	core.makeLegacyStreamName = makeLegacyStreamName;
	core.getUserEditCountBucket = getUserEditCountBucket;
}

module.exports = core;
