<?php
/**
 * PHP Unit tests for RemoteSchema class.
 *
 * @file
 * @ingroup Extensions
 *
 * @author Ori Livneh <ori@wikimedia.org>
 */

use MediaWiki\Http\HttpRequestFactory;
use PHPUnit\Framework\MockObject\MockObject;
use Wikimedia\TestingAccessWrapper;

/**
 * @group EventLogging
 * @covers RemoteSchema
 */
class RemoteSchemaTest extends MediaWikiTestCase {

	/** @var BagOStuff|MockObject */
	private $cache;
	/** @var MockObject */
	private $httpRequestFactory;
	/** @var RemoteSchema */
	private $schema;

	public $statusSchema = [ 'status' => [ 'type' => 'string' ] ];

	protected function setUp(): void {
		$this->setMwGlobals( [
			'wgEventLoggingSchemaApiUri' => 'https://schema.test/api',
		] );

		parent::setUp();

		$this->cache = new HashBagOStuff();

		$this->httpRequestFactory = $this->getMockBuilder( HttpRequestFactory::class )
			->disableOriginalConstructor()
			->onlyMethods( [ 'get' ] )
			->getMock();
		$this->schema = new RemoteSchema( 'Test', 99, $this->cache, $this->httpRequestFactory );
	}

	/**
	 * Tests behavior when content is in memcached.
	 * This is the most common scenario.
	 */
	public function testSchemaInCache() {
		// The revision is in cache...
		$this->cache->set( $this->schema->key, $this->statusSchema );

		// No HTTP call will be made
		$this->httpRequestFactory
			->expects( $this->never() )
			->method( 'get' );

		$this->assertEquals( $this->statusSchema, $this->schema->get() );
	}

	/**
	 * Calling get() multiple times should not result in multiple
	 * memcached calls; instead, once the content is retrieved, it
	 * should be stored locally as an object attribute.
	 * @covers RemoteSchema::get
	 */
	public function testContentLocallyCached() {
		// The revision is in cache...
		$this->cache->set( $this->schema->key, $this->statusSchema );

		// The cache is loaded into the class
		$this->assertEquals( $this->statusSchema, $this->schema->get(), 'first' );

		// On repeat calls, it will neither use the cache nor the HTTP,
		// rather keep the value we stored locally in the object.
		$this->cache->clear();

		$this->assertEquals( $this->statusSchema, $this->schema->get(), 'second repeat' );
		$this->assertEquals( $this->statusSchema, $this->schema->get(), 'third repeat' );
	}

	/**
	 * Tests behavior when content is missing from memcached and has to
	 * be retrieved via HTTP instead.
	 */
	public function testSchemaNotInCacheDoUpdate() {
		// If the revision is not in cache...
		$this->cache->clear();

		// ... we'll see an HTTP request for the revision
		$this->httpRequestFactory
			->expects( $this->once() )
			->method( 'get' )
			->with(
				$this->stringContains( '?' ),
				$this->equalTo( [
					'timeout' => RemoteSchema::LOCK_TIMEOUT * 0.8
				] )
			)
			->will( $this->returnValue( FormatJson::encode( $this->statusSchema ) ) );

		$this->assertEquals( $this->statusSchema, $this->schema->get() );
	}

	/**
	 * Tests behavior when content is missing from memcached and an
	 * update lock cannot be acquired.
	 */
	public function testSchemaNotInCacheNoUpdate() {
		// If the revision is not in cache...
		$this->cache->clear();

		// ... and the key is locked by another request,
		$wschema = TestingAccessWrapper::newFromObject( $this->schema );
		$wschema->lock();

		// then no HTTP request will be made:
		$this->httpRequestFactory
			->expects( $this->never() )
			->method( 'get' );

		// When unable to retrieve from memcached or acquire an update
		// lock to retrieve via HTTP, get() will return false.
		$this->assertFalse( $this->schema->get() );
	}
}
