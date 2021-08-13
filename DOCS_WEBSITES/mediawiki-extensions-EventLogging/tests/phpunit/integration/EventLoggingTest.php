<?php

use MediaWiki\Extension\EventBus\EventBus;
use MediaWiki\Extension\EventBus\EventBusFactory;
use MediaWiki\Http\HttpRequestFactory;
use MediaWiki\MediaWikiServices;
use Monolog\Logger;
use Wikimedia\TestingAccessWrapper;
use Wikimedia\Timestamp\ConvertibleTimestamp;

/** @covers EventLogging */
class EventLoggingTest extends MediaWikiIntegrationTestCase {

	private $mockEventBus;
	private $mockEventBusFactory;
	private $mockHttpRequestFactory;
	private $timestamp;
	private $mockLogger;

	/**
	 * This is supposed to be what a user might provide to EventLogging::logEvent
	 * i.e. an un-encapsulated event.  Used in tests as input data.
	 * @var array
	 */
	private $legacyEvent = [
		'field_a' => 'hi',
	];

	/**
	 * Represents a Modern Event Platform event. Like $this->>legacyEvent, but includes a target schema.
	 * @var array
	 */
	private $newEvent = [
		"field_a" => "hi",
		'$schema' => '/test/event/1.0.0'
	];

	/*
	 * HTTP_HOST will be set to this value during the tests if it isn't already set.
	 * @var string
	 */
	private $testHttpHost = 'test.eventlogging.domain';

	/**
	 * If true, HTTP_HOST has been modified and should be reset during tearDown.
	 * @var bool
	 */
	private $modifiedHttpHost = false;

	protected function setUp(): void {
		parent::setUp();

		$this->setMwGlobals( [
			'wgEventLoggingSchemas' => [
				'Migrated' => '/test/event/1.0.0',
				'NotMigrated' => 1337,
			],
			'wgEventLoggingBaseUri' => 'https://test.wikipedia.org/beacon/event',
			'wgServerName' => $this->testHttpHost,
			'wgEventStreams' => [
				[
					'stream' => 'test.event',
					'schema_title' => 'test/event'
				],
				[
					'stream' => 'eventlogging_Migrated',
					'schema_title' => 'analytics/legacy/test/migrated'
				],
			],
			'wgEventLoggingStreamNames' => [
				'test.event',
				'eventlogging_Migrated',
			],
		] );

		// EventLogging uses HTTP_HOST.  If it isn't set for tests, set a dummy,
		// Otherwise use the actual value.
		if ( !isset( $_SERVER['HTTP_HOST'] ) ) {
			$this->modifiedHttpHost = true;
			$_SERVER['HTTP_HOST'] = $this->testHttpHost;
		} else {
			$this->testHttpHost = $_SERVER['HTTP_HOST'];
		}

		$multiClient = MediaWikiServices::getInstance()->getHttpRequestFactory()
			->createMultiClient();
		$this->mockHttpRequestFactory = $this->createMock( HttpRequestFactory::class );
		$this->mockHttpRequestFactory->method( 'createMultiClient' )
			->willReturn( $multiClient );
		$this->setService( 'HttpRequestFactory', function () {
			return $this->mockHttpRequestFactory;
		} );

		$this->mockEventBus = $this->createMock( EventBus::class );
		$this->mockEventBusFactory = $this->createMock( EventBusFactory::class );
		$this->mockEventBusFactory->method( 'getInstanceForStream' )->willReturn(
			$this->mockEventBus );
		$this->setService( 'EventBus.EventBusFactory', function () {
			return $this->mockEventBusFactory;
		} );

		$this->timestamp = TestingAccessWrapper::newFromClass( ConvertibleTimestamp::class );
		$this->mockLogger = $this->createMock( Logger::class );
	}

	protected function tearDown(): void {
		parent::tearDown();

		// IF setHttpHost in setUp, we should unset it in tearDown.
		if ( $this->modifiedHttpHost ) {
			unset( $_SERVER['HTTP_HOST'] );
		}
	}

	public function testSendNewSchemaEvent(): void {
		$this->mockEventBus->expects( $this->once() )
			->method( 'send' )
			->with( $this->callback( function ( $events ) {
				$event = $events[0];
				return (
					$event['$schema'] === '/test/event/1.0.0' &&
					(bool)preg_match( $this->timestamp->regexes['TS_ISO_8601'], $event['dt'] ) &&
					str_ends_with( $event['dt'], 'Z' ) &&
					$event['meta']['stream'] === 'test.event' &&
					$event['meta']['domain'] === $this->testHttpHost &&
					isset( $event['http']['request_headers']['user-agent'] )
				);
			} ) );

		EventLogging::submit( 'test.event', $this->newEvent );
	}

	public function testSendMigratedLegacyEvent(): void {
		$this->mockEventBus->expects( $this->once() )
			->method( 'send' )
			->with( $this->callback( function ( $events ) {
				$event = $events[0];
				return (
					$event['$schema'] === '/test/event/1.0.0' &&
					(bool)preg_match( $this->timestamp->regexes['TS_ISO_8601'], $event['client_dt'] ) &&
					str_ends_with( $event['client_dt'], 'Z' ) &&
					$event['meta']['stream'] === 'eventlogging_Migrated' &&
					$event['meta']['domain'] === $this->testHttpHost &&
					isset( $event['http']['request_headers']['user-agent'] )
				);
			} ) );

		EventLogging::logEvent( 'Migrated', 1337,  $this->legacyEvent );
	}

	public function testSendNonMigratedLegacyEvent(): void {
		$this->mockHttpRequestFactory->expects( $this->once() )
			->method( 'post' )
			->with( $this->callback( static function ( $url ) {
				return (
					is_string( $url ) &&
					str_starts_with( $url, 'https://test.wikipedia.org/beacon/event?' ) &&
					// Test that the base event is in the encoded event.
					// "field_a": "hi" url encodes to this.
					str_contains( $url, "%22field_a%22%3A%22hi%22" )
				);
			} ) );

		EventLogging::logEvent( 'NotMigrated', 1337,  $this->legacyEvent );
	}

	public function testEncapulateEventServiceEvent(): void {
		$result = TestingAccessWrapper::newFromClass( EventLogging::class )->encapsulate(
			'Migrated',
			'/test/event/1.0.0',
			$this->legacyEvent
		);

		$this->assertSame( $result['$schema'], '/test/event/1.0.0' );
		$this->assertRegExp( $this->timestamp->regexes['TS_ISO_8601'], $result['client_dt'] );
		$this->assertStringEndsWith( 'Z', $result['client_dt'] );
		$this->assertSame( $this->testHttpHost, $result['webHost'] );
		$this->assertSame( $result['event']['field_a'],  $this->legacyEvent['field_a'] );
	}

	public function testGetLegacyStreamName(): void {
		$result = TestingAccessWrapper::newFromClass( EventLogging::class )
			->getLegacyStreamName( 'Foo' );
		$this->assertSame( 'eventlogging_Foo', $result );
	}

	public function testFailIfSchemaNotSpecified(): void {
		$this->mockLogger->expects( $this->once() )->method( 'warning' );
		EventLogging::submit( 'test.event', [], $this->mockLogger );
	}

	public function testFailIfStreamNameNotConfigured(): void {
		$this->mockLogger->expects( $this->once() )->method( 'warning' );
		EventLogging::submit(
			'not.configured',
			[ '$schema' => '/test/event/1.0.0' ],
			$this->mockLogger
		);
	}

	public function testDisableStreamConfig(): void {
		$this->setMwGlobals( [ 'wgEventLoggingStreamNames' => false ] );
		$this->mockEventBus->expects( $this->once() )->method( 'send' );
		EventLogging::submit(
			'not.configured',
			[ '$schema' => '/test/event/1.0.0' ],
			$this->mockLogger
		);
	}

}
