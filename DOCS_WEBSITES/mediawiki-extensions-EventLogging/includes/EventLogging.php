<?php
/**
 * PHP API for logging events.
 *
 * @file
 * @ingroup Extensions
 * @ingroup EventLogging
 *
 * @author Ori Livneh <ori@wikimedia.org>
 */

use MediaWiki\Extension\EventBus\EventBus;
use MediaWiki\Logger\LoggerFactory;
use MediaWiki\MediaWikiServices;
use Psr\Log\LoggerInterface;

class EventLogging {

	/**
	 * Default logger.
	 *
	 * @internal
	 * @return LoggerInterface
	 */
	public static function getLogger(): LoggerInterface {
		return LoggerFactory::getInstance( 'EventLogging' );
	}

	/**
	 * Submit an event according to the given stream's configuration.
	 * @param string $streamName
	 * @param array $event
	 * @param LoggerInterface|null $logger
	 */
	public static function submit(
		string $streamName,
		array $event,
		$logger = null
	): void {
		if ( !ExtensionRegistry::getInstance()->isLoaded( 'EventBus' ) ) {
			self::getLogger()->warning( 'EventBus is not installed' );
			return;
		}

		DeferredUpdates::addCallableUpdate( function () use ( $streamName, $event, $logger ) {
			$services = MediaWikiServices::getInstance();
			$config = $services->getMainConfig();
			$eventLoggingStreamNames = $config->get( 'EventLoggingStreamNames' );
			$logger = $logger ?? self::getLogger();

			if ( $eventLoggingStreamNames === false ) {
				$streamConfigs = false;
			} else {
				$streamConfigs = $services->getService(
					'EventStreamConfig.StreamConfigs'
				)->get( $eventLoggingStreamNames, true );
			}

			if ( $streamConfigs !== false && !array_key_exists( $streamName, $streamConfigs ) ) {
				$logger->warning(
					'Event submitted for unregistered stream name "{streamName}".',
					[ 'streamName' => $streamName ]
				);
				return;
			}
			if ( !isset( $event['$schema'] ) ) {
				$logger->warning(
					'Event data s missing required field "$schema".',
					[ 'event' => $event ]
				);
				return;
			}

			$event = EventLoggingHelper::prepareEvent( $streamName, $event );
			// @phan-suppress-next-line PhanUndeclaredClassMethod
			EventBus::getInstanceForStream( $streamName )->send( [ $event ] );
		} );
	}

	/**
	 * Transfer small data asynchronously using an HTTP POST.
	 * This is meant to match the Navigator.sendBeacon() API.
	 *
	 * @see https://w3c.github.io/beacon/#sec-sendBeacon-method
	 * @param string $url
	 * @param array $data
	 * @return bool
	 * @deprecated use submit with new Event Platform based schemas.
	 */
	public static function sendBeacon( $url, array $data = [] ) {
		$fname = __METHOD__;
		$url = wfExpandUrl( $url, PROTO_INTERNAL );
		DeferredUpdates::addCallableUpdate( static function () use ( $url, $data, $fname ) {
			$options = $data ? [ 'postData' => $data ] : [];
			return MediaWikiServices::getInstance()->getHttpRequestFactory()
				->post( $url, $options, $fname );
		} );

		return true;
	}

	/**
	 * Legacy EventLogging entrypoint.
	 *
	 * NOTE: For forwards compatibility with Event Platform schemas,
	 * we hijack the wgEventLoggingSchemas revision to encode the
	 * $schema URI. If the value for a schema defined in
	 * EventLoggingSchemas is a string, it is assumed
	 * to be an Event Platform $schema URI, not a MW revision id.
	 * In this case, the event will be POSTed to EventGate.
	 *
	 * @param string $schemaName Schema name.
	 * @param int $revId
	 *        revision ID of schema.  $schemasInfo[$schemaName] will override this.
	 * @param array $eventData
	 *        Map of event keys/vals.
	 *        This is the 'event' field, as provided by the caller,
	 *        not an encapsulated real event.
	 * @param int $options This parameter is deprecated and no longer used.
	 * @return bool Whether the event was logged.
	 * @deprecated use submit with new Event Platform based schemas.
	 */
	public static function logEvent( $schemaName, $revId, $eventData, $options = 0 ) {
		$config = MediaWikiServices::getInstance()->getMainConfig();

		$eventLoggingConfig = EventLoggingHooks::getEventLoggingConfig( $config );
		$schemasInfo = $eventLoggingConfig['schemasInfo'];
		$eventLoggingBaseUri = $eventLoggingConfig['baseUrl'];

		// Get the configured revision id or $schema URI
		// to use with events of a particular (legacy metawiki) EventLogging schema.
		// $schemasInfo[$schemaName] overrides passed in $revId.
		$revisionOrSchemaUri = $schemasInfo[$schemaName] ?? $revId ?? -1;

		// Encapsulate and other event meta data to eventData.
		$event = self::encapsulate(
			$schemaName,
			$revisionOrSchemaUri,
			$eventData
		);

		if ( isset( $event['$schema'] ) ) {
			// Assume that if $schema was set by self::encapsulate(), this
			// event should be POSTed to EventGate via EventServiceClient submit()
			self::submit( self::getLegacyStreamName( $schemaName ), $event );
			return true;
		} else {
			// Else this will be sent to the legacy eventlogging backend
			// via 'sendBeacon' by url encoding the json data into a query parameter.
			if ( !$eventLoggingBaseUri ) {
				return false;
			}

			$json = self::serializeEvent( $event );
			$url = $eventLoggingBaseUri . '?' . rawurlencode( $json ) . ';';

			return self::sendBeacon( $url );
		}
	}

	/**
	 *
	 * Converts the encapsulated event from an object to a string.
	 *
	 * @param array $event Encapsulated event
	 * @return string $json
	 */
	public static function serializeEvent( $event ) {
		$eventData = $event['event'];

		if ( count( $eventData ) === 0 ) {
			// Ensure empty events are serialized as '{}' and not '[]'.
			$eventData = (object)$eventData;
		}
		$event['event'] = $eventData;

		// To make the resultant JSON easily extracted from a row of
		// space-separated values, we replace literal spaces with unicode
		// escapes. This is permitted by the JSON specs.
		return str_replace( ' ', '\u0020', FormatJson::encode( $event ) );
	}

	/**
	 * Validates object against JSON Schema.
	 *
	 * @throws JsonSchemaException If the object fails to validate.
	 * @param array $object Object to be validated.
	 * @param array|null $schema Schema to validate against (default: JSON Schema).
	 * @return bool True.
	 */
	public static function schemaValidate( $object, $schema = null ) {
		if ( $schema === null ) {
			// Default to JSON Schema
			$json = file_get_contents( dirname( __DIR__ ) . '/schemas/schemaschema.json' );
			$schema = FormatJson::decode( $json, true );
		}

		// We depart from the JSON Schema specification in disallowing by default
		// additional event fields not mentioned in the schema.
		// See <https://bugzilla.wikimedia.org/show_bug.cgi?id=44454> and
		// <https://tools.ietf.org/html/draft-zyp-json-schema-03#section-5.4>.
		if ( !array_key_exists( 'additionalProperties', $schema ) ) {
			$schema[ 'additionalProperties' ] = false;
		}

		$root = new JsonTreeRef( $object );
		$root->attachSchema( $schema );
		return $root->validate();
	}

	/**
	 * Randomise inclusion based on population size and a session ID.
	 * @param int $populationSize Return true one in this many times. This is 1/samplingRate.
	 * @param string $sessionId Hexadecimal value, only the first 8 characters are used
	 * @return bool True if the event should be included (sampled in), false if not (sampled out)
	 */
	public static function sessionInSample( $populationSize, $sessionId ) {
		$decimal = (int)base_convert( substr( $sessionId, 0, 8 ), 16, 10 );
		return $decimal % $populationSize === 0;
	}

	/**
	 * This encapsulates the event data in a wrapper object with
	 * the default metadata for the current request.
	 *
	 * NOTE: for forwards compatibility with Event Platform schemas,
	 * we hijack the wgEventLoggingSchemas revision to encode the
	 * $schema URI. If the value for a schema defined in
	 * EventLoggingSchemas is a string, it is assumed
	 * to be an Event Platform $schema URI, not a MW revision id.
	 * In this case, the event will be prepared to be POSTed to EventGate.
	 *
	 * @param string $schemaName
	 * @param int|string $revisionOrSchemaUri
	 *        The revision id or a string $schema URI for use with Event Platform.
	 * @param array $eventData un-encapsulated event data
	 * @return array encapsulated event
	 */
	private static function encapsulate( $schemaName, $revisionOrSchemaUri, $eventData ) {
		global $wgDBname;

		$event = [
			'event'            => $eventData,
			'schema'           => $schemaName,
			'wiki'             => $wgDBname,
		];

		if ( isset( $_SERVER[ 'HTTP_HOST' ] ) ) {
			$event['webHost'] = $_SERVER['HTTP_HOST'];
		}

		if ( is_string( $revisionOrSchemaUri ) ) {
			$event['$schema'] = $revisionOrSchemaUri;
			// NOTE: `client_dt` is 'legacy' event time.  `dt` is the preferred event time field
			// and is set in EventServiceClient.
			$event['client_dt'] = wfTimestamp( TS_ISO_8601 );

			// Note: some fields will have defaults set by eventgate-wikimedia.
			// See:
			// - https://gerrit.wikimedia.org/r/plugins/gitiles/eventgate-wikimedia/+/refs/heads/master/eventgate-wikimedia.js#358
			// - https://wikitech.wikimedia.org/wiki/Event_Platform/Schemas/Guidelines#Automatically_populated_fields
		} else {
			$event['revision'] = $revisionOrSchemaUri;
			$event['userAgent'] = $_SERVER[ 'HTTP_USER_AGENT' ] ?? '';
		}

		return $event;
	}

	/**
	 * Prepend "eventlogging_" to the schema name to create a stream name for a migrated legacy
	 * schema.
	 *
	 * @param string $schemaName
	 * @return string
	 */
	private static function getLegacyStreamName( string $schemaName ): string {
		return "eventlogging_$schemaName";
	}

}
