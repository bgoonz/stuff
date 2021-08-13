<?php

abstract class CodeCommentLinker {
	/**
	 * @var CodeRepository
	 */
	protected $mRepo;

	/**
	 * @param CodeRepository $repo
	 */
	public function __construct( $repo ) {
		$this->mRepo = $repo;
	}

	/**
	 * @param string $text
	 * @return string
	 */
	public function link( $text ) {
		# Catch links like https://www.mediawiki.org/wiki/Special:Code/MediaWiki/44245#c829
		# Ended by space or brackets (like those pesky <br /> tags)
		$EXT_LINK_URL_CLASS = '[^][<>"\\x00-\\x20\\x7F\p{Zs}]';

		$text = preg_replace_callback(
			'/(^|[^\w[])(' . wfUrlProtocolsWithoutProtRel() . ')(' . $EXT_LINK_URL_CLASS . '+)/',
			[ $this, 'generalLink' ], $text );
		$text = preg_replace_callback( '/\br(\d+)\b/',
			[ $this, 'messageRevLink' ], $text );
		$text = preg_replace_callback( CodeRevision::BugReference,
			[ $this, 'messageBugLink' ], $text );
		return $text;
	}

	/**
	 * @param array $arr
	 * @return string
	 */
	public function generalLink( $arr ) {
		$url = $arr[2] . $arr[3];
		// Re-add the surrounding space/punctuation
		return $arr[1] . $this->makeExternalLink( $url, $url );
	}

	/**
	 * @param array $arr
	 * @return string
	 */
	public function messageBugLink( $arr ) {
		$text = $arr[0];
		$bugNo = intval( $arr[1] );
		$url = $this->mRepo->getBugPath( $bugNo );
		if ( $url ) {
			return $this->makeExternalLink( $url, $text );
		} else {
			return $text;
		}
	}

	/**
	 * @param array $matches
	 * @return string
	 */
	public function messageRevLink( $matches ) {
		$text = $matches[0];
		$rev = intval( $matches[1] );

		$repo = $this->mRepo->getName();
		$title = SpecialPage::getTitleFor( 'Code', "$repo/$rev" );

		return $this->makeInternalLink( $title, $text );
	}

	/**
	 * @param string $url
	 * @param string $text
	 * @return string
	 */
	abstract public function makeExternalLink( $url, $text );

	/**
	 * @param Title $title
	 * @param string $text
	 * @return string
	 */
	abstract public function makeInternalLink( $title, $text );
}
