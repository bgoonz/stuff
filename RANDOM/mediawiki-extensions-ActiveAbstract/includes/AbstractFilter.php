<?php
/**
 * Generate XML feed for Yahoo's Active Abstracts project
 * Plugin for dumpBackup.php; call as eg:
 *
 * php dumpBackup.php \
 *   --plugin=AbstractFilter \
 *   --current \
 *   --output=gzip:/dumps/abstract.xml.gz \
 *     --filter=namespace:NS_MAIN \
 *     --filter=noredirect \
 *     --filter=abstract
 *
 * Can optionally convert output text to a given language variant:
 *   --filter=abstract:variant=zh-cn
 */

use MediaWiki\MediaWikiServices;
use MediaWiki\Revision\SlotRecord;
use UtfNormal\Validator;

/**
 * Tosses away the MediaWiki XML and generates new output
 */
class AbstractFilter {

	/** @var ExportProgressFilter */
	protected $sink;

	/** @var string|false */
	private $variant;

	/** @var Title|null */
	protected $title;

	/** @var stdClass|null */
	protected $revision;

	/**
	 * @param ExportProgressFilter &$sink
	 * @param string $params
	 */
	public function __construct( &$sink, $params = '' ) {
		$this->sink =& $sink;

		$bits = explode( '=', $params, 2 );
		if ( count( $bits ) === 2 && $bits[0] === 'variant' ) {
			$this->variant = $bits[1];
		} else {
			$this->variant = false;
		}
	}

	/**
	 * Register the filter function with the dump manager
	 * @param BackupDumper $dumper
	 */
	public static function register( $dumper ) {
		$dumper->registerFilter( 'abstract', self::class );
		$dumper->registerFilter( 'noredirect', NoredirectFilter::class );
	}

	/**
	 * @param string $string
	 */
	public function writeOpenStream( $string ) {
		$this->sink->writeOpenStream( "<feed>\n" );
	}

	/**
	 * @param string $string
	 */
	public function writeCloseStream( $string ) {
		$this->sink->writeCloseStream( "</feed>\n" );
	}

	/**
	 * @param stdClass $page
	 * @param string $string
	 */
	public function writeOpenPage( $page, $string ) {
		global $wgSitename;
		$this->title = Title::makeTitle( $page->page_namespace, $page->page_title );
		$title = $wgSitename . wfMessage( 'colon-separator' )->text() . $this->title->getPrefixedText();

		$xml = "<doc>\n";
		$xml .= Xml::element( 'title', null, $this->variant( $title ) ) . "\n";
		$xml .= Xml::element( 'url', null, $this->title->getCanonicalUrl() ) . "\n";

		// add abstract and links when we have revision data...
		$this->revision = null;

		$this->sink->writeOpenPage( $page, $xml );
	}

	/**
	 * Convert text to the preferred output language variant, if set.
	 * @param string $text
	 * @return string
	 */
	private function variant( $text ) {
		if ( $this->variant ) {
			return MediaWikiServices::getInstance()
				->getContentLanguage()
				->getConverter()
				->translate( $text, $this->variant );
		}

		return $text;
	}

	/**
	 * @param string $string
	 */
	public function writeClosePage( $string ) {
		$xml = '';
		if ( $this->revision ) {
			if ( $this->title->getContentModel() === CONTENT_MODEL_TEXT
				|| $this->title->getContentModel() === CONTENT_MODEL_WIKITEXT ) {
				try {
					$xml .= Xml::element( 'abstract', null,
						$this->variant(
							$this->extractAbstract( $this->revision ) ) ) . "\n";
				} catch ( Exception $ex ) {
					if ( $ex instanceof MWException || $ex instanceof RuntimeException ) {
						$xml .= Xml::element( 'abstract', [ 'serialization-error' => '' ] ) . "\n";
						wfLogWarning( "failed to get abstract content for page " .
							$this->title->getPrefixedText() . " with id " .
							$this->revision->rev_page . "\n" );
					} else {
						throw $ex;
					}
				}
			} else {
				$xml .= Xml::element( 'abstract', [ 'not-applicable' => '' ] ) . "\n";
			}
			$xml .= "<links>\n";

			try {
				$links = $this->sectionLinks( $this->revision );
				if ( empty( $links ) ) {
					// If no TOC, they want us to fall back to categories.
					$links = $this->categoryLinks( $this->revision );
				}
				foreach ( $links as $anchor => $url ) {
					$xml .= $this->formatLink( $url, $anchor, 'nav' );
				}
			} catch ( Exception $ex ) {
				if ( $ex instanceof MWException || $ex instanceof RuntimeException ) {
					wfLogWarning( "failed to get abstract links for page " .
						$this->title->getPrefixedText() . " with id " .
						$this->revision->rev_page . "\n" );
					$links = [];
				} else {
					throw $ex;
				}
			}
			// @todo: image links

			$xml .= "</links>\n";
		}
		$xml .= "</doc>\n";
		$this->sink->writeClosePage( $xml );
		// In rare cases, link cache has the same key for some pages which
		// might be read as part of the same batch. T220424
		$linkCache = MediaWikiServices::getInstance()->getLinkCache();
		$linkCache->clearLink( $this->title );
		$this->title = null;
		$this->revision = null;
	}

	/**
	 * Get the page's textual content (main slot only).
	 *
	 * @param stdClass $rev Database row with revision data
	 * @return string
	 */
	protected function getText( $rev ) {
		try {
			$store = MediaWikiServices::getInstance()->getRevisionStore();
			$rec = $store->newRevisionFromRow( $rev );
			$content = $rec->getContent( SlotRecord::MAIN );

			if ( !$content instanceof TextContent ) {
				// This should not happen, since writeClosePage() checks the content model.
				return '';
			}

			// TODO: cache this!
			return $content->getText();
		} catch ( MWException | RuntimeException | InvalidArgumentException $ex ) {
			// fall through
		}

		wfLogWarning( "failed to get text for revid " . $rev->rev_id . "\n" );
		return '';
	}

	/**
	 * Extract an abstract from the page
	 * @param stdClass $rev Database row with revision data
	 * @return string
	 */
	protected function extractAbstract( $rev ) {
		$text = $this->getText( $rev );

		$stripped = $this->stripMarkup( $text );
		$extract = $this->extractStart( $stripped );
		$clipped = substr( $extract, 0, 1024 ); // not too long pls

		return Validator::cleanUp( $clipped );
	}

	/**
	 * Strip markup to show plaintext
	 * @param string $text
	 * @return string
	 */
	protected function stripMarkup( $text ) {
		$contLang = MediaWikiServices::getInstance()->getContentLanguage();

		$text = substr( $text, 0, 4096 ); // don't bother with long text...

		$image = preg_quote( $contLang->getNsText( NS_FILE ), '#' );
		$text = str_replace( [ "'''", "''" ], "", $text );
		// HTML-style comments
		$text = preg_replace( '#<!--.*?-->#s', '', $text );
		// HTML-style tags
		$text = preg_replace( '#</?[a-z0-9]+.*?>#s', '', $text );
		// URL links
		$text = preg_replace( '#\\[[a-z]+:.*? (.*?)\\]#s', '$1', $text );
		// template parameters
		$text = preg_replace( '#\\{\\{\\{.*?\\}\\}\\}#s', '', $text );
		// template calls
		$text = preg_replace( '#\\{\\{.*?\\}\\}#s', '', $text );
		// tables
		$text = preg_replace( '#\\{\\|.*?\\|\\}#s', '', $text );
		// images
		$text = preg_replace( "#
			\\[\\[
				:?$image\\s*:
					(
						[^][]*
						\[\[
						[^][]*
						\]\]
					)*
				[^][]*
			\\]\\]#six", '', $text );
		// links
		$text = preg_replace( '#\\[\\[([^|\\]]*\\|)?(.*?)\\]\\]#s', '$2', $text );
		// indented lines near start are usually disambigs or notices
		$text = preg_replace( '#^:.*$#m', '', $text );
		$text = Sanitizer::decodeCharReferences( $text );

		return trim( $text );
	}

	/**
	 * Extract the first two sentences, if detectable, from the text.
	 * @param string $text
	 * @return string
	 */
	private function extractStart( $text ) {
		$endchars = [
			'.', '!', '?', // regular ASCII
			'。', // full-width ideographic full-stop
			'．', '！', '？', // double-width roman forms
			'｡', // half-width ideographic full stop
		];

		$endgroup = implode( '', array_map( 'preg_quote', $endchars ) );
		$end = "[$endgroup]";
		$sentence = ".*?$end+";
		$firsttwo = "/^($sentence$sentence)/u";

		$matches = [];

		if ( preg_match( $firsttwo, $text, $matches ) ) {
			return $matches[1];
		}

		$firstLine = explode( "\n", $text, 2 )[0];
		return trim( $firstLine );
	}

	/**
	 * Extract a list of TOC links
	 * @param stdClass $rev Database row with revision data
	 * @return string[] List of URL strings, indexed by name/title
	 *
	 * @todo FIXME extract TOC items properly
	 * @todo FIXME check for explicit __NOTOC__
	 */
	protected function sectionLinks( $rev ) {
		$parser = MediaWikiServices::getInstance()->getParser();

		$headers = [];

		$text = $this->getText( $rev );
		$secs = preg_split(
			'/(^=+.+?=+|^<h[1-6].*?' . '>.*?<\/h[1-6].*?' . '>)(?!\S)/mi',
			$text, -1,
			PREG_SPLIT_DELIM_CAPTURE
		);

		$secsCount = count( $secs );
		for ( $i = 1; $i < $secsCount; $i += 2 ) {
			$inside = preg_replace( '/^=+\s*(.*?)\s*=+/', '$1', $secs[$i] );
			$stripped = $this->stripMarkup( $inside ); // strip internal markup and <h[1-6]>
			$header = Validator::cleanUp( $stripped );
			$anchor = $parser->guessSectionNameFromWikiText( $header );
			$url = $this->title->getCanonicalUrl() . $anchor;
			$headers[$header] = $url;
		}

		return $headers;
	}

	/**
	 * Fetch the list of category links for this page
	 * @param stdClass $rev Database row with revision data
	 * @return string[] List of URL strings, indexed by category name
	 */
	protected function categoryLinks( $rev ) {
		$id = $rev->page_id;
		$dbr = wfGetDB( DB_REPLICA );
		$result = $dbr->select( 'categorylinks',
			[ 'cl_to' ],
			[ 'cl_from' => $id ],
			__METHOD__ );

		$links = [];
		foreach ( $result as $row ) {
			$category = Title::makeTitle( NS_CATEGORY, $row->cl_to );
			$links[$category->getText()] = $category->getCanonicalUrl();
		}

		return $links;
	}

	/**
	 * Format a <sublink> element, like so:
	 * <sublink linktype="nav">
	 *    <anchor>1939 Births</anchor>
	 *    <link>http://en.wikipedia.org/wiki/Category:1939_births</link>
	 * </sublink>
	 *
	 * @param string $url
	 * @param string $anchor Human-readable link text; eg title or fragment
	 * @param string $type "nav" or "image"
	 * @return string XML fragment
	 */
	protected function formatLink( $url, $anchor, $type ) {
		$maxUrlLength = 1024; // as defined in Yahoo's .xsd
		return Xml::openElement( 'sublink', [ 'linktype' => $type ] ) .
			Xml::element( 'anchor', null, $this->variant( $anchor ) ) .
			Xml::element( 'link', null, substr( $url, 0, $maxUrlLength ) ) .
			Xml::closeElement( 'sublink' ) . "\n";
	}

	/**
	 * @param stdClass $rev
	 * @param string $string
	 */
	public function writeRevision( $rev, $string ) {
		// Only use one revision's worth of data to output
		$this->revision = $rev;
	}
}
