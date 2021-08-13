/*!
 * @author Ori Livneh <ori@wikimedia.org>
 */
'use strict';

// Expose publicly
mw.eventLog = require( './core.js' );
mw.eventLog.Schema = require( './Schema.js' );

/**
 * Convert the first letter of a string to uppercase.
 *
 * @ignore
 * @private
 * @param {string} word
 * @return {string}
 */
function titleCase( word ) {
	return word[ 0 ].toUpperCase() + word.slice( 1 );
}

/**
 * mw.track handler for EventLogging events.
 *
 * @ignore
 * @private
 * @param {string} topic Topic name ('event.*').
 * @param {Object} event
 */
function handleTrackedEvent( topic, event ) {
	var schema = titleCase( topic.slice( topic.indexOf( '.' ) + 1 ) );

	mw.eventLog.logEvent( schema, event );
}

/**
 * Subscribe to any 'event'-namespaced topics from mw.track, for example:
 *
 *   `mw.track( 'event.YourSchema', eventData )`
 *
 * Because subscribers to mw#track receive the full backlog of events
 * matching the subscription, event processing can be safely deferred
 * until the window's load event has fired. This keeps the impact of
 * analytic instrumentation on page load times to a minimum.
 *
 * @private
 * @ignore
 */
function init() {
	mw.trackSubscribe( 'event.', handleTrackedEvent );
}

// It's possible for this code to run after the "load" event has already fired.
if ( document.readyState === 'complete' ) {
	mw.requestIdleCallback( init );
} else {
	// Avoid the logging of duplicate events (T170018).
	//
	// The load event must only fire once. However, Firefox 51 introduced a
	// bug that causes the event to fire again when returning from the
	// "Back-Forward cache" (BFCache) under certain circumstances (see
	// https://bugzilla.mozilla.org/show_bug.cgi?id=1379762).
	$( window ).one( 'load', init );
}
