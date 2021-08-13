<?php

use MediaWiki\Tests\Maintenance\DumpTestCase;

/**
 * Unit tests for Abstractfilter
 *
 * Tests for AbstractFilter::writeOpenPage and AbstractFilter::writeClosePage
 * (and in depth tests of AbstractFilter::writeRevision) are missing, as their
 * working relies on volatile database internals. We test them in the
 * integration tests within BackupDumperAbstractsTest.
 *
 * @group Database
 * @group Dump
 * @covers AbstractFilter
 * @covers NoredirectFilter
 */
class AbstractFilterTest extends DumpTestCase {

	public function testRegister() {
		$map = [
			[ 'abstract', AbstractFilter::class, null ],
			[ 'noredirect', NoredirectFilter::class, null ]
		];

		$dumperMock = $this->createMock( BackupDumper::class );

		$dumperMock->expects( $this->exactly( count( $map ) ) )
			->method( 'registerFilter' )
			->willReturnOnConsecutiveCalls( $map );

		AbstractFilter::register( $dumperMock );
	}

	public function testWriteOpenStreamNull() {
		$sinkMock = $this->createMock( DumpOutput::class );

		$sinkMock->expects( $this->exactly( 1 ) )
			->method( 'writeOpenStream' )
			->with( $this->matchesRegularExpression( '@^[[:space:]]*<feed>[[:space:]]*$@' ) );

		// Checking against side effects

		$sinkMock->expects( $this->never() )
			->method( 'writeCloseStream' );

		$sinkMock->expects( $this->never() )
			->method( 'writeOpenPage' );

		$sinkMock->expects( $this->never() )
			->method( 'writeClosePage' );

		$sinkMock->expects( $this->never() )
			->method( 'writeRevision' );

		$sinkMock->expects( $this->never() )
			->method( 'writeLogItem' );

		// Performing the actual test

		$af = new AbstractFilter( $sinkMock );
		$af->writeOpenStream( null );
	}

	public function testWriteOpenStreamEmptyString() {
		$sinkMock = $this->createMock( DumpOutput::class );

		$sinkMock->expects( $this->exactly( 1 ) )
			->method( 'writeOpenStream' )
			->with( $this->matchesRegularExpression( '@^[[:space:]]*<feed>[[:space:]]*$@' ) );

		// Checking against side effects

		$sinkMock->expects( $this->never() )
			->method( 'writeCloseStream' );

		$sinkMock->expects( $this->never() )
			->method( 'writeOpenPage' );

		$sinkMock->expects( $this->never() )
			->method( 'writeClosePage' );

		$sinkMock->expects( $this->never() )
			->method( 'writeRevision' );

		$sinkMock->expects( $this->never() )
			->method( 'writeLogItem' );

		// Performing the actual test

		$af = new AbstractFilter( $sinkMock );
		$af->writeOpenStream( "" );
	}

	public function testWriteOpenStreamText() {
		$sinkMock = $this->createMock( DumpOutput::class );

		$sinkMock->expects( $this->exactly( 1 ) )
			->method( 'writeOpenStream' )
			->with( $this->matchesRegularExpression( '@^[[:space:]]*<feed>[[:space:]]*$@' ) );

		// Checking against side effects

		$sinkMock->expects( $this->never() )
			->method( 'writeCloseStream' );

		$sinkMock->expects( $this->never() )
			->method( 'writeOpenPage' );

		$sinkMock->expects( $this->never() )
			->method( 'writeClosePage' );

		$sinkMock->expects( $this->never() )
			->method( 'writeRevision' );

		$sinkMock->expects( $this->never() )
			->method( 'writeLogItem' );

		// Performing the actual test

		$af = new AbstractFilter( $sinkMock );
		$af->writeOpenStream( "foo" );
	}

	public function testWriteCloseStreamNull() {
		$sinkMock = $this->createMock( DumpOutput::class );

		$sinkMock->expects( $this->exactly( 1 ) )
			->method( 'writeCloseStream' )
			->with( $this->matchesRegularExpression( '@^[[:space:]]*</feed>[[:space:]]*$@' ) );

		// Checking against side effects

		$sinkMock->expects( $this->never() )
			->method( 'writeOpenStream' );

		$sinkMock->expects( $this->never() )
			->method( 'writeOpenPage' );

		$sinkMock->expects( $this->never() )
			->method( 'writeClosePage' );

		$sinkMock->expects( $this->never() )
			->method( 'writeRevision' );

		$sinkMock->expects( $this->never() )
			->method( 'writeLogItem' );

		// Performing the actual test

		$af = new AbstractFilter( $sinkMock );
		$af->writeCloseStream( null );
	}

	public function testWriteCloseStreamEmptyString() {
		$sinkMock = $this->createMock( DumpOutput::class );

		$sinkMock->expects( $this->exactly( 1 ) )
			->method( 'writeCloseStream' )
			->with( $this->matchesRegularExpression( '@^[[:space:]]*</feed>[[:space:]]*$@' ) );

		// Checking against side effects

		$sinkMock->expects( $this->never() )
			->method( 'writeOpenStream' );

		$sinkMock->expects( $this->never() )
			->method( 'writeOpenPage' );

		$sinkMock->expects( $this->never() )
			->method( 'writeClosePage' );

		$sinkMock->expects( $this->never() )
			->method( 'writeRevision' );

		$sinkMock->expects( $this->never() )
			->method( 'writeLogItem' );

		// Performing the actual test

		$af = new AbstractFilter( $sinkMock );
		$af->writeCloseStream( "" );
	}

	public function testWriteCloseStreamText() {
		$sinkMock = $this->createMock( DumpOutput::class );

		$sinkMock->expects( $this->exactly( 1 ) )
			->method( 'writeCloseStream' )
			->with( $this->matchesRegularExpression( '@^[[:space:]]*</feed>[[:space:]]*$@' ) );

		// Checking against side effects

		$sinkMock->expects( $this->never() )
			->method( 'writeOpenStream' );

		$sinkMock->expects( $this->never() )
			->method( 'writeOpenPage' );

		$sinkMock->expects( $this->never() )
			->method( 'writeClosePage' );

		$sinkMock->expects( $this->never() )
			->method( 'writeRevision' );

		$sinkMock->expects( $this->never() )
			->method( 'writeLogItem' );

		// Performing the actual test

		$af = new AbstractFilter( $sinkMock );
		$af->writeCloseStream( "foo" );
	}

	public function testWriteRevision() {
		$sinkMock = $this->createMock( DumpOutput::class );

		// No output of any kind is expected, as the filter outputs only the most current
		// revision, and can detect the most recent only only after all revisions have been
		// passed.

		$sinkMock->expects( $this->never() )
			->method( 'writeOpenStream' );

		$sinkMock->expects( $this->never() )
			->method( 'writeCloseStream' );

		$sinkMock->expects( $this->never() )
			->method( 'writeOpenPage' );

		$sinkMock->expects( $this->never() )
			->method( 'writeClosePage' );

		$sinkMock->expects( $this->never() )
			->method( 'writeRevision' );

		$sinkMock->expects( $this->never() )
			->method( 'writeLogItem' );

		// Performing the actual test

		$af = new AbstractFilter( $sinkMock );
		$af->writeRevision( (object)[], 'bar' );
	}
}
