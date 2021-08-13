<?php

use MediaWiki\MediaWikiServices;
use Wikimedia\TestingAccessWrapper;
use Wikimedia\Timestamp\ConvertibleTimestamp;

/** @covers EventLoggingHelper */
class EventLoggingHelperTest extends MediaWikiIntegrationTestCase {

	public function testPrepareModernEvent(): void {
		$preparedEvent = EventLoggingHelper::prepareEvent(
			'test.event',
			[
				'$schema' => '/test/event/1.0.0',
				'field_a' => 'A'
			],
			[ 'extra_default' => 'B' ]
		);

		$this->assertArrayHasKey( 'meta', $preparedEvent );
		$this->assertSame( 'test.event', $preparedEvent['meta']['stream'] );
		$ts = TestingAccessWrapper::newFromClass( ConvertibleTimestamp::class );
		$this->assertRegExp( $ts->regexes['TS_ISO_8601'], $preparedEvent['dt'] );
		$this->assertStringEndsWith( 'Z', $preparedEvent['dt'] );
		$this->assertSame( 'B', $preparedEvent['extra_default'] );
	}

	public function testPrepareModernEventSubmittedWithDt(): void {
		$preparedEvent = EventLoggingHelper::prepareEvent(
			'test.event',
			[
				'$schema' => '/test/event/1.0.0',
				'field_a' => 'A',
				'dt' => '2021-03-15T00:00:01Z',
			],
			[ 'extra_default' => 'B' ]
		);

		$this->assertArrayHasKey( 'meta', $preparedEvent );
		$this->assertSame( 'test.event', $preparedEvent['meta']['stream'] );
		$this->assertNotSame( '2021-03-15T00:00:01Z', $preparedEvent['dt'] ); // should be overwritten
		$ts = TestingAccessWrapper::newFromClass( ConvertibleTimestamp::class );
		$this->assertRegExp( $ts->regexes['TS_ISO_8601'], $preparedEvent['dt'] );
		$this->assertStringEndsWith( 'Z', $preparedEvent['dt'] );
		$this->assertSame( 'B', $preparedEvent['extra_default'] );
	}

	public function testPrepareMigratedLegacyEvent(): void {
		$preparedEvent = EventLoggingHelper::prepareEvent(
			'test.event.legacy',
			[
				'$schema' => '/test/event/legacy/1.0.0',
				'field_a' => 'A',
				'client_dt' => '2021-03-15T00:00:01Z',
			],
			[ 'extra_default' => 'B' ]
		);

		$this->assertArrayHasKey( 'meta', $preparedEvent );
		$this->assertArrayNotHasKey( 'dt', $preparedEvent );
		$this->assertSame( 'test.event.legacy', $preparedEvent['meta']['stream'] );
		$this->assertSame( '2021-03-15T00:00:01Z', $preparedEvent['client_dt'] );
		$this->assertSame( 'B', $preparedEvent['extra_default'] );
	}

	public function testPrepareMigratedLegacyEventSubmittedWithDt(): void {
		$preparedEvent = EventLoggingHelper::prepareEvent(
			'test.event.legacy',
			[
				'$schema' => '/test/event/legacy/1.0.0',
				'field_a' => 'A',
				'client_dt' => '2021-03-15T00:00:01Z',
				'dt' => '2021-03-15T00:00:01Z',
			],
			[ 'extra_default' => 'B' ]
		);

		$this->assertArrayHasKey( 'meta', $preparedEvent );
		$this->assertArrayNotHasKey( 'dt', $preparedEvent );
		$this->assertSame( 'test.event.legacy', $preparedEvent['meta']['stream'] );
		$this->assertSame( '2021-03-15T00:00:01Z', $preparedEvent['client_dt'] );
		$this->assertSame( 'B', $preparedEvent['extra_default'] );
	}

	public function testGetEventDefaults(): void {
		$config = MediaWikiServices::getInstance()->getMainConfig();
		$defaults = EventLoggingHelper::getEventDefaults( $config );
		$this->assertSame( $config->get( 'ServerName' ), $defaults['meta']['domain'] );
		$this->assertTrue( isset( $defaults['http']['request_headers']['user-agent'] ) );
	}
}
