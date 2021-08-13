<?php
/**
 * @file
 * @copyright Copyright © 2007, Wikia Inc.
 * @license GPL-2.0-or-later
 */
class BlogTagCloud {
	/** @var int */
	public $tags_min_pts = 8;
	/** @var int */
	public $tags_max_pts = 32;
	/** @var int */
	public $tags_highest_count = 0;
	/** @var string */
	public $tags_size_type = 'pt';
	/** @var array */
	public $tags = [];
	/** @var int */
	public $limit;

	/**
	 * @param int $limit
	 */
	public function __construct( $limit = 10 ) {
		$this->limit = $limit;
		$this->initialize();
	}

	public function initialize() {
		$dbr = wfGetDB( DB_MASTER );
		$res = $dbr->select(
			'category',
			[ 'cat_title', 'cat_pages' ],
			[],
			__METHOD__,
			[
				'ORDER BY' => 'cat_pages DESC',
				'LIMIT' => $this->limit
			]
		);

		$message = wfMessage( 'blog-tagcloud-blacklist' );
		$catsExcluded = [];
		if ( !$message->isDisabled() ) {
			$catsExcluded = explode( "\n* ", $message->inContentLanguage()->text() );
		}

		Wikimedia\suppressWarnings(); // prevent PHP from bitching about strtotime()
		foreach ( $res as $row ) {
			$tag_name = Title::makeTitle( NS_CATEGORY, $row->cat_title );
			$tag_text = $tag_name->getText();
			// Exclude dates and blacklisted categories
			if (
				!in_array( $tag_text, $catsExcluded ) &&
				strtotime( $tag_text ) == ''
			) {
				if ( $row->cat_pages > $this->tags_highest_count ) {
					$this->tags_highest_count = $row->cat_pages;
				}
				$this->tags[$tag_text] = [ 'count' => $row->cat_pages ];
			}
		}
		Wikimedia\restoreWarnings();

		// sort tag array by key (tag name)
		if ( $this->tags_highest_count == 0 ) {
			return;
		}
		ksort( $this->tags );
		/* and what if we have _1_ category? like on a new wiki with nteen articles, mhm? */
		if ( $this->tags_highest_count == 1 ) {
			$coef = $this->tags_max_pts - $this->tags_min_pts;
		} else {
			$coef = ( $this->tags_max_pts - $this->tags_min_pts ) / ( ( $this->tags_highest_count - 1 ) * 2 );
		}
		foreach ( $this->tags as $tag => $att ) {
			$this->tags[$tag]['size'] = $this->tags_min_pts + ( $this->tags[$tag]['count'] - 1 ) * $coef;
		}
	}
}
