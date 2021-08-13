<?php

/**
 * This class will test the datamodel sample.
 *
 * @author Matthias Mullie <mmullie@wikimedia.org>
 * @group Database
 */
class ArticleFeedbackv5ModelTest extends MediaWikiTestCase {
	/** @var ArticleFeedbackv5Model */
	protected $sample;

	/** @inheritDoc */
	protected $tablesUsed = [ 'aft_feedback' ];

	public function setUp(): void {
		parent::setUp();

		// init some volatile BagOStuff
		$cache = new WANObjectCache( [ 'cache' => new HashBagOStuff ] );
		ArticleFeedbackv5Model::setCache( $cache );

		// don't connect to external cluster but use main db, that has been prepared for unittests ($this->db)
		$this->setMwGlobals( 'wgArticleFeedbackv5Cluster', false );

		// init sample object
		$this->sample = new ArticleFeedbackv5Model();
		$this->sample->aft_page = 1;
		$this->sample->aft_page_revision = 1;
		$this->sample->aft_user = 1;
		$this->sample->aft_user_text = 'Sample';
		$this->sample->aft_user_token = '';
		$this->sample->aft_form = '6';
		$this->sample->aft_cta = '4';
		$this->sample->aft_link = 'X';
		$this->sample->aft_rating = 1;
		$this->sample->aft_comment = 'This is a test feedback entry';
		$this->sample->aft_claimed_user = 1;

		// we'll be using the * list a couple of times; pretend to have the
		// required permissions
		global $wgGroupPermissions;
		$this->mergeMwGlobalArrayValue(
			'wgGroupPermissions', [
				'*' => array_merge(
					$wgGroupPermissions['*'],
					array_fill_keys( ArticleFeedbackv5Permissions::$permissions, true )
				)
			]
		);
	}

	public function tearDown(): void {
		unset( $this->sample );

		$list = ArticleFeedbackv5Model::getList(
			'*',
			$this->getTestUser()->getUser(),
			null,
			0,
			'age',
			'DESC'
		);
		if ( $list ) {
			foreach ( $list as $entry ) {
				$entry->delete();
			}
		}

		parent::tearDown();
	}

	public function testInsert() {
		$this->sample->insert();

		// data in db
		$row = ArticleFeedbackv5Model::getBackend()->get(
			$this->sample->{ArticleFeedbackv5Model::getIdColumn()},
			$this->sample->{ArticleFeedbackv5Model::getShardColumn()}
		);
		$this->assertEquals( get_object_vars( $this->sample ), get_object_vars( $row->fetchObject() ) );
	}

	public function testUpdate() {
		$this->sample->insert();
		$sample = ArticleFeedbackv5Model::get(
			$this->sample->{ArticleFeedbackv5Model::getIdColumn()},
			$this->sample->{ArticleFeedbackv5Model::getShardColumn()}
		);
		$sample->aft_comment = "This is an updated feedback entry";
		$this->sample->update();

		// data in db
		$row = ArticleFeedbackv5Model::getBackend()->get(
			$this->sample->{ArticleFeedbackv5Model::getIdColumn()},
			$this->sample->{ArticleFeedbackv5Model::getShardColumn()}
		);
		$this->assertEquals( get_object_vars( $this->sample ), get_object_vars( $row->fetchObject() ) );
	}

	public function testGet() {
		$this->sample->insert();
		$this->assertEquals( $this->sample, ArticleFeedbackv5Model::get(
			$this->sample->{ArticleFeedbackv5Model::getIdColumn()},
			$this->sample->{ArticleFeedbackv5Model::getShardColumn()}
		) );
	}

	public function testGetList() {
		$size = 120;
		$probability = 1 / 2;

		for ( $i = 0; $i < $size; $i++ ) {
			$sample = clone $this->sample;

			// half of them will get a comment, half of them will be empty (so they go to separate lists)
			$sample->aft_comment = $i % ( 1 / $probability ) ? '' : 'Test feedback entry #' . ( $i + 1 );

			// I'll set bogus timestamps or they'd all be the same and we can't sort base on them
			$timestamp = wfTimestampNow();
			$sample->aft_timestamp = $timestamp + $i;

			$sample->insert();
		}

		// 1st batch
		$offset = 0;
		$user = $this->getTestUser()->getUser();
		$list = ArticleFeedbackv5Model::getList( 'allcomment', $user, null, $offset, 'age', 'ASC' );
		$this->assertEquals( $list->numRows(), ArticleFeedbackv5Model::LIST_LIMIT );
		$first = $list->fetchObject();
		$this->assertEquals( $first->aft_comment, 'Test feedback entry #1' );

		// 2nd batch
		$offset = $list->nextOffset();
		$list = ArticleFeedbackv5Model::getList( 'allcomment', $user, null, $offset, 'age', 'ASC' );
		$this->assertEquals( $list->numRows(), round( $size * $probability - ArticleFeedbackv5Model::LIST_LIMIT ) );
		$first = $list->fetchObject();
		$this->assertEquals( $first->aft_comment, 'Test feedback entry #101' );
	}

	public function testGetCount() {
		$size = 10;
		$probability = 1 / 2;

		for ( $i = 0; $i < $size; $i++ ) {
			$sample = clone $this->sample;

			// half of them will get a comment, half of them will be empty (so they go to separate lists)
			$sample->aft_comment = $i % ( 1 / $probability ) ? 'Test feedback entry #' . ( $i + 1 ) : '';
			$sample->insert();
		}

		$this->assertEquals( ArticleFeedbackv5Model::getCount( 'allcomment', null ), $size * $probability );
	}
}
