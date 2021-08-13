<?php

use MediaWiki\MediaWikiServices;

/**
* Class that takes PubMed pmids and ISBN numbers and calls the appropriate online service
* to get the full reference.  The references are then formatted for output in the references section
* at the bottom of a page.
* All code without an author tag in the function documentation was taken from the Biblio extension.
*/
class BiblioPlus {

	/**
	* @var array $citations: Management of the citation indices (order in which they appear in the text).
	*/
	public $citations = array();

	/**
	* Returns an array element with index $key, or null if it does not exist.
	*
	* @param array $array: The array to search.
	* @param integer $key: The index of the desired element.
	* @return array element|null: The array element, or null if the key does not exist.
	*/
	function get( $array, $key ) {
		if ( is_array( $array ) && array_key_exists( $key, $array ) ) {
			return $array[$key];
		} else {
			return NULL;
		}
	}

	/**
	* Removes the brackets from around a link.
	*
	* @param string $link: The link to remove the brackets from.
	* @return string: The link with any brackets removed.
	*/
	function unbracket( $link ) {
		$matches = array();
		preg_match( '/ \[ ( [^\]]* ) \] /sx', $link, $matches );
		return $matches[1];
	}

	/**
	* Converts a link (http://a.b.c or [internal] or [inter:wiki]) to a URL.
	*
	* @param string $link: The link to convert.
	* @param string $query: An additional CGI parameter, such as "action=raw".
	* @return string: The link, converted to a URL.
	*/
	function makeUrl( $link, $query = '' ) {
		$m = $this->unbracket( $link );
		if ( isset( $m ) ) {
			$title = Title::newFromText( $m );
			$url = $title->getFullURL( $query );
			return $url;
		} else {
			return $link;
		}
	}

	/**
	* Reads text from a URL and returns it as a string.
	*
	* @param string $url: The URL to call.
	* @return string: The contents of the URL as a string.
	*/
	function fetchUrl( $url ) {
		Wikimedia\suppressWarnings();
		$oldUrlFopen = ini_set( 'allow_url_fopen', true );
		$result = implode( '', file( $url ) );
		ini_set( 'allow_url_fopen', $oldUrlFopen );
		Wikimedia\restoreWarnings();
		return $result;
	}

	/**
	* Returns the source code of a local wiki page.
	*
	* @param Title $title: The title of the wiki page.
	* @return string: The source code of the input page.
	*/
	function fetchPage( $title ) {
		$rev = Revision::newFromTitle( $title );
		return ContentHandler::getContentText( $rev->getContent() );
	}

	/**
	* Returns the number of the reference if already cited, or
	* if $create is true then assign & return a new one, otherwise return -1.
	*
	* @param integer $key: The index of the citation to return or create.
	* @param boolean $create: Indicates whether or not a new reference number should be created.
	* @return integer: The reference number, or -1 if one was not created.
	*/
	function citationIndex( $key, $create = true ) {
		if ( array_key_exists( $key, $this->citations ) ) {
			// ref was already cited
			return $this->citations[$key];
		} elseif ( $create ) {
			// ref was not cited yet
			$index = count( $this->citations );
			$this->citations[$key] = $index;
			return $index;
		} else {
			return -1;
		}
	}

	/**
	* Adds a period to the end of the input text, if there isn't one already.
	*
	* @param string $s: The input text.
	* @return string: The text with a period at the end.
	*/
	function period( $s ) {
		if ( $s != '' && substr ( $s, -1 ) != '.' ) {
			return "$s.";
		} else {
			return $s;
		}
	}

	/**
	* Adds HTML tags to italicize the input text.
	*
	* @param string $s: The input text.
	* @return string: The text with html italics tags.
	*/
	function italic( $s ) {
		if ( $s == '' ) {
			return $s;
		} else {
			return "<em>$s</em>";
		}
	}

	/******************
	* PUB MED QUERIES
	*******************
	*/

	/**
	* Gets full citations for a list of PubMed pmids by calling the NCBI's eUtilities service.
	* @author Karen Eddy
	*
	* @param array $pmids - an array of PubMed pmids to query.
	* @return string: The XML file returned by the eUtilities service, or an empty string if no pmids were entered.
	*/
	function eSummary( $pmids ) {
		if ( count( $pmids ) > 0 ) {
			global $wgSitename, $wgEmergencyContact;
			define( 'EUTILS_ROOT', "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/" );
			define( 'ESUMMARY_URL', EUTILS_ROOT . 'esummary.fcgi' );

			Wikimedia\suppressWarnings();
			$query = array( 'db' => 'pubmed',
				'id' => implode( ',', $pmids ),
				'version' => '2.0',
				'tool' => $wgSitename,
				'email' => $wgEmergencyContact );

			$params = array( 'http' => array( 'method' => 'POST', 'content' => http_build_query( $query ) ) );

			$context = stream_context_create( $params );
			$fp = fopen( ESUMMARY_URL, 'rb', false, $context );
			if ( $fp ) {
				$response = stream_get_contents( $fp );
				if ( $response !== false ) {
					return $response;
				}
			Wikimedia\restoreWarnings();
			}
		}
		return '';
	}

	/**
	* Takes the XML file returned from NCBI's eUtilities service and returns the formatted citations.
	* @author Karen Eddy
	*
	* @param string $pmXml: The XML file returned from the call to eSummary().
	* @return array: The formatted citations, indexed by pmid, or an empty array if $pmXml is an empty string.
	*/
	function parsePubMed( $pmXml ) {
		$formattedRefs = array();
		$xml = simplexml_load_string( $pmXml );

		if ( $xml ) {
			// find the document summary tags
			$docSums = $xml;
			$docSums = $docSums->xpath('//DocumentSummary');

		   // extract required information from each document summary
			foreach ( $docSums as $docSum ) {
				$authors = array();

				// get the pmid
				$pmid = ( string )$docSum['uid'];

				// get the list of authors
				if ( $docSum->Authors ) {
					foreach ( $docSum->Authors->children() as $author ) {
						$authors[] = $author->Name;
					}
					$authors = $this->concatAuthors( $authors );
				}

				// get the other attributes
				$title = $docSum->Title;
				$source = $this->period( $docSum->Source );
				$pubDate = $docSum->PubDate;
				$volume = $docSum->Volume;
				$issue = $docSum->Issue;
				$pages = $docSum->Pages;
				$doi = '';

				if ( $docSum->ArticleIds ) {
					foreach ( $docSum->ArticleIds->children() as $articleId ) {
						if ( $articleId->IdType == 'doi' ) {
							$doi = $articleId->Value;
							break;
						}
					}
				}
				// format for output to page
				$origin = "$source $pubDate";
				$origin .= $volume == '' ? '' : ";$volume";
				$origin .= $issue == '' ? '' : "($issue)";
				$origin .= $pages == '' ? '' : ":$pages";

				$formattedRefs[$pmid] = $this->formatBib( $authors, $title, $origin, $pmid, $doi, '', '' );

			} // end foreach $docSums
		}
		return $formattedRefs;
	}

	/**
	* Formatting of a PubMed or ISBN DB citation.
	*
	* @param string $authors: The authors of the citation.
	* @param string $title: The title of the citation.
	* @param string $origin: The source of the citation.
	* @param string $pmid: The PubMed ID of the citation, if it is a PubMed citation.
	* @param string $doi: The DOI of the citation, if it has a DOI.
	* @param string $isbn: The ISBN of the citation, if it is an ISBN.
	* @param string $isbndbref: The ISBN reference of the citation, if it is an ISBN.
	* @return sting: The formatted citation.
	*/
	function formatBib( $authors, $title, $origin, $pmid, $doi, $isbn, $isbndbref ) {
		$title = $this->period( $title );
		$title = $this->italic( $title );

		$authors = $this->period( $authors );
		$origin = $this->period( $origin );

		$codes = '';

		$result = "$authors $title $origin";
		$style = 'class="extiw" style="color:Black; text-decoration:none"';

		// set the link for the citation itself
		if ( $doi != '' ) {
			$title = 'title="'. wfMessage( 'biblioplus-doi-tooltip' )->escaped() .'"';
			$result = "<a href=\"http://dx.doi.org/$doi\" $title $style>$result</a>";
			$codes .= " " . $this->htmlInterLink( "http://dx.doi.org/$doi", $this->smallCaps( 'DOI:' ) .
				$doi, "DOI: $doi" ) . ' |';
		} elseif ( $pmid != '' ) {
			$title = 'title="' .wfMessage( 'biblioplus-pmid-tooltip' )->escaped() . '"';
			$result = "<a href=\"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/elink.fcgi?cmd=prlinks&dbfrom=pubmed&retmode=ref&id=$pmid\" $title $style>$result</a>";
		} elseif ( $isbn != '' ) {
			$title = 'title="' . wfMessage( 'biblioplus-isbn-tooltip' )->escaped() . '"';
			$result = "<a href=\"http://isbndb.com/d/book/$isbndbref.html\" $title $style>$result</a>";
			$codes .= ' ' . $this->htmlInterLink( "http://isbndb.com/d/book/$isbndbref.html",
				$this->smallCaps( 'ISBN:' ) . $isbn, "ISBN:$isbn" );
		}
		return $result . $codes;
	}

	/**
	* Takes an array of author names and formats them into a string.
	*
	* @param array $authors: The author names.
	* @return string: The author names, separated by commas, with 'and' between the last two in the list.
	*/
	function concatAuthors( $authors ) {
		$n = count( $authors );
		$result = '';
		if ( $n > 0 ) {
			$result = $authors[0];
			for ( $i = 1; $i <= $n - 2; $i++ ) {
				$result .= ", $authors[$i]";
			}
			if ( $n == 2 ) {
				$auth = $authors[$n - 1];
				$result .= " and $auth.";
			} elseif ( $n > 2 ) {
				$auth = $authors[$n - 1];
				$result .= ", and $auth.";
			}
		}
		return $result;
	}

	/**
	* Returns a PubMed URL for the input PubMed IDs.
	*
	* @param array $pmids: The PubMed IDs to create links to.
	* @return string: The PubMed URL of the input PubMed IDs.
	*/
	function pubMedUrl( $pmids ) {
		$listUids = implode( ',', $pmids );
		return "https://www.ncbi.nlm.nih.gov/entrez/query.fcgi?cmd=Retrieve&db=pubmed&dopt=Abstract&list_uids=$listUids";
	}

	/**
	* Returns a HubMed URL for the input PubMed IDs.
	*
	* @param array $pmids: The PubMed IDs to create a link to.
	* @return string: The HubMed URL of the input PubMed IDs.
	*/
	function hubMedUrl( $pmids ) {
		$listUids = implode( ',', $pmids );
		return "http://www.hubmed.org/display.cgi?uids=$listUids";
	}

	/******************
	* ISBN DB QUERIES
	*******************
	*/

	/**
	* Formats the input author names for output to the citation list.
	*
	* @param string $text: The author names.
	* @return string: The formatted author names.
	*/
	function formatAuthors( $text ) {
		$patterns = array( '/\s+([:,;.!?])/', '/c(\d+)/', '/[:,;!?]\s*$/m' );
		$replacements = array( '\1', '\1', '.' );
		return preg_replace( $patterns, $replacements, $text );
	}

	/**
	* Formats the input publisher for output to the citation list.
	*
	* @param string $text: The publisher.
	* @return string: The formatted publisher.
	*/
	function formatPublisher( $text ) {
		$patterns = array( '/\s+([:,;.!?])/', '/c(\d+)/', '/[:,;!?]\s*$/m' );
		$replacements = array( '\1', '\1', '.' );
		return preg_replace( $patterns, $replacements, $text );
	}

	/**
	* Checks whether or not the input parameter is an array.
	*
	* @param array|string|integer $a: The input variable.
	* @return array: The input variable, if it is an array, otherwise an empty array.
	*/
	function isArray( $a ) {
		return is_array( $a ) ? $a : array();
	}

	/**
	* Returns the ISBN DB access key(s).
	*
	* @return array: The ISBN DB access key(s).
	*/
	function getIsbnDbKeys() {
		global $wgBiblioPlusIsbnDbKey, $wgBiblioPlusIsbnDbKeys;
		if ( isset( $wgBiblioPlusIsbnDbKey ) ) {
			return array( $wgBiblioPlusIsbnDbKey );
		} elseif ( isset( $wgBiblioPlusIsbnDbKeys ) ) {
			return $wgBiblioPlusIsbnDbKeys;
		} else {
			return array( '9EOE2OGZ' );
		}
	}

	/**
	* Randomly chooses and returns an array element from the input array.
	*
	* @param array $a: The array to choose an element from.
	* @return string|integer: A random element from the array.
	*/
	function getRandomElement( $a ) {
		return $a[rand( 0, count( $a ) - 1 )];
	}

	/**
	* Queries the ISBN DB for the input $isbn reference, formats and returns it.
	*
	* @param string $isbn: The ISBN to query.
	* @return string: The formatted ISBN reference.
	*/
	function isbnDbQueryOne( $isbn ) {
		$accessKey = $this->getRandomElement( $this->getIsbnDbKeys() );
		$url = "http://isbndb.com/api/books.xml?access_key=${accessKey}&index1=isbn&value1=${isbn}";
		$text = $this->fetchUrl( $url );
		$xmlParser = new BiblioXml();
		$data = $xmlParser->parse( $text );

		$thisbook = $this->get( $this->get( $this->get( $this->get( $this->get( $data, 0 ), 'child' ), 0 ), 'child' ), 0 );
		$isbndbref = $this->get( $this->get( $thisbook, 'attributes' ), 'BOOK_ID' );
		$bookinfo = $this->isArray( $this->get( $thisbook, 'child' ) );
		$authors = '';
		$title = '';
		$origin = '';
		foreach ( $bookinfo as $field ) {
			switch ( $this->get( $field, 'name' ) ) {
				case 'TITLE' :
					$title = $this->get( $field, 'content' );
					break;
				case 'AUTHORSTEXT' :
					$authors = $this->formatAuthors( $this->get( $field, 'content' ) );
					break;
				case 'PUBLISHERTEXT' :
					$origin = $this->formatPublisher( $this->get( $field, 'content' ) );
					break;
			}
		}

		$result = $this->formatBib( $authors, $title, $origin, '', '', $isbn, $isbndbref );
		return $result;
	}

	/**
	* Queries the ISBN DB for the input $isbns.
	*
	* @param array $isbns: The ISBNs to query.
	* @return array: The formatted ISBN references.
	*/
	function isbnDbQuery( $isbns ) {
		$result = array();
		$cache = ObjectCache::getLocalClusterInstance();
		foreach ( $isbns as $isbn ) {
			$cacheKey = $cache->makeKey( 'Biblio', $isbn );
			$res = $cache->get( $cacheKey );
			if ( $res ) {
				wfDebug( "Biblio cache hit $cacheKey\n" );
			} else {
				wfDebug( "Biblio cache miss $cacheKey\n" );
				$res = $this->isbnDbQueryOne( $isbn );
			}
			$cache->set( $cacheKey, $res, CACHE_TTL );
			$result["$isbn"] = $res;
		}
		return $result;
	}

	/*******************************
	* General formatting functions
	********************************
	*/

	/**
	* Creates an HTML URL link from the input $url and $text.
	*
	* @param string $url: The URL.
	* @param string $text: The link text to show on the page.
	* @return string: The HTML URL link.
	*/
	function htmlLink( $url, $text ) {
		return "<a href=\"$url\">$text</a>";
	}

	/**
	* Creates an HTML URL link from the input $url and $text, containing class & id for tooltip.
	*
	* @param string $url: The URL.
	* @param string $text: The link text to show on the page.
	* @return string: The HTML URL link.
	*/
	function htmlLinkTooltip( $url, $text ) {
		return "<a href=\"$url\" class=\"tooltip-from-element\">$text</a>";
	}

	/**
	* Creates an HTML URL internal link from the input $url and $text.
	*
	* @param string $url: The URL.
	* @param string $text: The link text to show on the page.
	* @param string $title: The contents of the tooltip that shows when the link is hovered over.
	* @return string: The HTML URL internal link.
	*/
	function htmlInterLink( $url, $text, $title ) {
		return "<a href=\"$url\" class=extiw title=\"$title\"" . " rel=\"nofollow\">$text</a>";
	}

	/**
	* Creates an HTML URL external link from the input $url and $text.
	*
	* @param string $url: The URL.
	* @param string $text: The link text to show on the page.
	* @param string $title: The contents of the tooltip that shows when the link is hovered over.
	* @return string: The HTML URL external link.
	*/
	function htmlExtLink( $url, $text, $title ) {
		return "<a href=\"$url\" class=\"external\" title=\"$title\"" . " rel=\"nofollow\">$text</a>";
	}

	/**
	* Returns the input $text with CSS formatting for small caps.
	*
	* @param string $text: The text to format.
	* @return string: The text, formatted for small caps.
	*/
	function smallCaps( $text ) {
		return "<span style=\"font-variant:small-caps;\">" . $text . "</span>";
	}

	/**
	* Returns the input text with CSS formatting for Mediawiki class noprint.
	*
	* @param string $text: The text to format.
	* @return string: The text, formatted for noprint.
	*/
	function noprint( $text ) {
		return "<span class=noprint>$text</span>";
	}

	/**
	* Returns the input text with CSS formatting for Mediawiki class error.
	*
	* @param string $text: The text to format.
	* @return string: The text, formatted for error.
	*/
	function error( $text ) {
		return "<span class=error>$text</span>";
	}

	 /**
	* Returns the input text with CSS formatting for Mediawiki class errorbox.
	*
	* @param string $text: The text to format.
	* @return string: The text, formatted for errorbox.
	*/
	function errorbox( $text ) {
		return "<div style='float:none;' class=errorbox>$text</div>";
	}

	/**
	* Replaces line breaks with spaces in the input text.
	*
	* @param string $text: The text to format.
	* @return string: The text with no line breaks or leading or trailing spaces.
	*/
	function cleanLi( $text ) {
		return trim( str_replace( array( '\n', '\r' ), ' ', $text ) );
	}

	/**
	* Splits the $input string by the regular expression.
	*
	* @param string $input: The string to split.
	* @return array: The substrings of the $input string.
	*/
	function splitBiblio( $input ) {
		return preg_split( "/[[:space:]]*^[ \t]*#[[:space:]]*/m", $input, -1, PREG_SPLIT_NO_EMPTY );
	}

	/**
	* Expands URLs non-recursively.
	*
	* @param array $list: 2D array of URLs.
	* @return array: 2D array of URLs.
	*/
	function expandList( $list ) {
		$result = array();
		foreach ( $list as $ref ) {
			$matches = array();
			preg_match( '/ ^ \[ ( \[[^\]]*\] | [^\]]* ) \] /sx', $ref, $matches );
			if ( isset( $matches[1] ) ) {
				// It is a link to a list of references
				$link = $matches[1];
				$name = $this->unbracket( $link );
				if ( isset( $name ) ) {
					// It is a wiki or interwiki link
					$title = Title::newFromText( $name );
					if ( $title->isLocal() ) {
						// It is a local page
						$x = $this->fetchPage( $title );
					} else {
						// It is a shortcut for an external URL ("interwiki").
						// It must point directly to the raw bibliography database,
						// not to a regular HTML wiki page.
						$url = $this->makeUrl( $link );
						$x = $this->fetchUrl( $url );
					}
				} else {
					// It is a plain URL
					$url = $this->makeUrl( $link );
					$x = $this->fetchUrl( $url );
				}

				$biburl = $this->makeUrl( $link );
				foreach ( $this->splitBiblio( $x ) as $item ) {
					$result[] = array( 'ref' => $item, 'biburl' => $biburl );
				}
			} else {
				// A single reference
				$result[] = array( 'ref' => $ref );
			}
		}
		return $result;
	}

	/**
	* Parses the content of the biblio tags into entries, PubMed IDs and ISBNs.
	*
	* @param array $list: 2D array of entries listed within biblio tags.
	* @return array: 3D array of entries, PubMed IDs and ISBNs.
	*/
	function parseBiblio( $list ) {
		$result = array();
		$pmids = array();
		$isbns = array();

		foreach ( $list as $ref ) {
			$matches = array();
			preg_match( '/([-+A-Za-z_0-9]+)(.*?)(?:[[:space:]]\/\/(.*))?$/s', $ref['ref'], $matches );
			$key = $this->get( $matches, 1 );
			$srctext = $this->cleanLi( $this->get( $matches, 2 ) );
			$annot = $this->get( $matches, 3 );
			$m = array();
			preg_match( '/^[[:space:]]*pmid=([0-9]+)/', $srctext, $m );
			$pmid = $this->get( $m, 1 );
			preg_match( '/^[[:space:]]*isbn=([-0-9]+[Xx]?)/', $srctext, $m );
			$isbn = $this->get( $m, 1 );
			$x = array( 'key' => $key, 'annot' => $annot );
			if ( $pmid != '' ) {
				$x['pmid'] = $pmid;
				$pmids[] = $pmid;
			} elseif ( $isbn != '' ) {
				$x['isbn'] = $isbn;
				$isbns[] = $isbn;
			} else { // free wikitext
				$x['wikitext'] = $srctext;
			}
			if ( isset( $ref['biburl'] ) ) {
				$x['biburl'] = $ref['biburl'];
			}
			$result[] = $x;
		}
		return array( 'entries' => $result, 'pmids' => $pmids, 'isbns' => $isbns );
	}

	/**
	* Parses wikitext.
	*
	* @param array $pdata: Parser data.
	* @param string $wikitext: The wikitext.
	* @return string: The parsed text.
	*/
	function parseFreetext( $pdata, $wikitext ) {
		$localParser = MediaWikiServices::getInstance()->getParserFactory()->create();
		$parserResult = $localParser->parse( $wikitext, $pdata['title'], $pdata['options'], false );
		return trim( $parserResult->getText() );
	}

	/**
	* Formats comments after a reference.
	*
	* @param string $text: The comment.
	* @return string: HTML / CSS formatting of the string, creating a border around it.
	*/
	function formatAnnot( $text ) {
		return "<dd><dl><table style=\"border:1px dashed #aaa; padding-left:1.5em; padding-right:1.5em; margin-bottom:1em\"><tr><td>$text</td></tr></table></dd></dl>";
	}

	/**
	* Parses a comment after a reference.
	*
	* @param array $pdata: Parser data.
	* @param string $wikitext: The wikitext.
	* @return string: The formatted comment, or the empty string if $wikitext was empty.
	*/
	function parseAnnot( $pdata, $wikitext ) {
		$text = trim( $wikitext );
		$result = $text == '' ? '' : $this->formatAnnot( $this->parseFreetext( $pdata, $text ) );
		return $result;
	}

	/*******************************
	* MEDIAWIKI CALLBACKS FOR TAGS
	********************************
	*/

	/**
	* Conversion of the contents of <cite> tags.
	*
	* @param string $input: Text inside <cite> tag.
	* @param array $params: Arguments inside <cite> tag.
	* @param Parser $parser: Parser object.
	* @return string: The cite tag, formatted for output to the page.
	*/
	function biblioRenderCite( $input, $params, $parser ) {
		return $this->renderCite( $input, $this->biblioGetParserData( $parser ), true );
	}

	/**
	* Conversion of the contents of <nocite> tags.
	*
	* @param string $input: Text inside <cite> tag.
	* @param array $params: Arguments inside <cite> tag.
	* @param Parser $parser: Parser object.
	* @return string: The nocite tag, formatted for output to the page.
	*/
	function biblioRenderNocite( $input, $params, $parser ) {
		  return $this->renderNocite( $input, $this->biblioGetParserData( $parser ), false );
	}

	/**
	* Conversion of the contents of <biblio> tags.
	*
	* @param string $input: Text inside <cite> tag.
	* @param array $params: Arguments inside <cite> tag.
	* @param Parser $parser: Parser object.
	* @return string: The biblio tag, formatted for output to the page.
	*/
	function biblioRenderBiblio( $input, $params, $parser ) {
		global $wgBiblioPlusForce;
		if ( isset( $params['force'] ) )
		{
			$force = ( $params['force'] == 'true' );
		} else {
			$force = $wgBiblioPlusForce;
		}
		return $this->renderBiblio( $input, $this->biblioGetParserData( $parser ), $force );
	}

	/****************************
	* RENDERING OF TAG CONTENTS
	*****************************
	*/

	/**
	* Gets the data from the parser, used in set up.
	*
	* @param Parser $parser: Parser object.
	* @return array: The data extracted from the parser.
	*/
	function biblioGetParserData( $parser ) {
		$parserData = array();

		$parserData['parser'] = $parser;
		$parserData['title'] = $parser->getTitle();
		$parserData['options'] = $parser->getOptions();
		$parserData['options']->enableLimitReport( false );
		return $parserData;
	}

	/**
	* Conversion of the contents of <cite> tags.
	*
	* @param text $input: Text inside <cite> tag.
	* @param array $pdata: Parser data.
	* @param boolean $render: If true, citation will be created and returned; if false, returns empty string.
	* @return string: Numbered citation(s) for insertion into the text.
	*/
	function renderCite( $input, $pdata, $render = true ) {
		$keys = preg_split( '/[^-+A-Za-z_0-9]+/', $input, -1, PREG_SPLIT_NO_EMPTY );
		$list = array();
		foreach ( $keys as $key ) {
			$index = $this->citationIndex( $key, true );
			$list[] = array( $index, $key );
		}
		if ( $render ) {
			sort( $list );
			$links = array();
			foreach ( $list as $ent ) {
				$link = $this->htmlLinkTooltip( "#bibkey_$ent[1]", $ent[0] + 1 );
				$links[] = $link;
			}
			return '[' . implode( ', ', $links ) . ']';
		} else {
			return '';
		}
	}

	/**
	* Conversion of the contents of <nocite> tags - reference will be included, even though not cited in text.
	*
	* @param string $input: Text inside <nocite> tags.
	* @param array $pdata: Parser data.
	* @return string: Empty string.
	*/
	function renderNocite( $input, $pdata ) {
		return $this->renderCite( $input, $pdata, false );
	}

	/**
	* Conversion of the contents of <biblio> tags.
	*
	* @param string $input: Text inside <biblio> tags.
	* @param array $pdata: Parser data.
	* @param boolean $force: If true, references will be listed even if not cited in text;
	* if false, references will only be listed if cited in text.
	* @return array: Formatted references.
	*/
	function renderBiblio( $input, $pdata, $force ) {
		$refs = array();
		$list = $this->expandList( $this->splitBiblio( $input ) );
		$parseResult = $this->parseBiblio( $list );
		$entries = $parseResult['entries'];
		$pmids = $parseResult['pmids'];
		$isbns = $parseResult['isbns'];
		$pmentries = array();
		$pmidsToFetch = array();

		// caching features
		$cache = ObjectCache::getLocalClusterInstance();
		foreach ( $pmids as $pmid ) {
			$cacheKey = $cache->makeKey( 'Biblio', $pmid );
			$res = $cache->get( $cacheKey );
			if ( $res ) {
				wfDebug( "Biblio cache hit $cacheKey\n" );
				$pmentries["$pmid"] = $res;
			} else {
				wfDebug( "Biblio cache miss $cacheKey\n" );
				array_push( $pmidsToFetch, $pmid );
			}
		}

		// retrieve data for pmids
		if ( count( $pmidsToFetch ) ) {
			// get the xml file from eSummary call & parse it for output to the page
			$pmXml = $this->eSummary( $pmidsToFetch );
			$pmentries1 = $this->parsePubMed( $pmXml );

			foreach ( $pmentries1 as $pmid => $value ) {
				$pmentries[$pmid] = $value;
			}
		}

		// set the cache for the formatted pmid citations just returned from eSummary
		foreach ( $pmentries as $pmid => $value ) {
			$cacheKey = $cache->makeKey( 'Biblio' , $pmid );
			$cache->set( $cacheKey, $value, CACHE_TTL );
		}

		// retrieve data for ISBNs
		$isbnentries = $this->isbnDbQuery( $isbns );
		$refs = array();
		$errors = array();

		// go through all entries and extract data to format reference
		foreach ( $entries as $ref ) {
			$key = $this->get( $ref, 'key' );
			$annot = $this->parseAnnot( $pdata, $this->get( $ref, 'annot' ) );
			$pmid = $this->get( $ref, 'pmid' );
			$isbn = $this->get( $ref, 'isbn' );
			$wikitext = $this->get( $ref, 'wikitext' );
			$biburl = $this->get( $ref, 'biburl' );
			$text = '';

			// add links to articles at the end of the reference
			if ( !is_null( $pmid ) ) { // PubMed result
				$pmlink = $this->htmlInterLink( $this->pubMedUrl( array( $pmid ) ),
					$this->smallCaps( ' PubMed ID:' ) . "$pmid", "PubMed ID: $pmid" );
				$hmlink = $this->htmlInterLink( $this->hubMedUrl( array( $pmid ) ),
					$this->smallCaps( 'HubMed' ), "PubMed ID: $pmid" );
				if ( array_key_exists( $pmid, $pmentries ) ) {
					$text = $pmentries["$pmid"] . $this->noprint( " $pmlink | $hmlink" );
				} else {
					$error = "Error fetching PMID $pmid: $pmerror";
					array_push( $errors, $error );
					$text = $this->error( $error );
				}
			} elseif ( !is_null( $isbn ) ) { // ISBN
				$text = $isbnentries["$isbn"];
			} elseif ( !is_null( $wikitext ) ) { // plain wikitext
				$text = $this->parseFreetext( $pdata, $wikitext );
			}
			$index = $this->citationIndex( $key, $force );
			if ( $index >= 0 )
				$refs[] = array( 'index' => $index,
					'key' => $key,
					'text' => $text,
					'pmid' => $pmid,
					'isbn' => $isbn,
					'annot' => $annot,
					'biburl' => $biburl );
		}
		sort( $refs );
		reset( $refs );
		$sortedPmids = array();
		foreach ( $refs as $ref ) {
			$pmid = $this->get( $ref, 'pmid' );
			if ( !is_null( $pmid ) ) {
				$sortedPmids[] = $pmid;
			}
		}
		$header = '';
		$footer = '';
		if ( count( $errors ) ) {
			$header = $this->errorbox( implode( '<br>', $errors ) );
		}
		if ( count( $sortedPmids ) > 1 ) {
			$footer .= wfMessage( 'biblioplus-medline-abstracts' )->escaped() . ' ' .
				$this->htmlInterLink( $this->pubMedUrl( $sortedPmids ),
				$this->smallCaps( 'PubMed' ), wfMessage( 'biblioplus-pubmed-abstracts' )->escaped() ) .
				' | ' . $this->htmlInterLink( $this->hubMedUrl( $sortedPmids ),
				$this->smallCaps( 'HubMed' ), wfMessage( 'biblioplus-hubmed-abstracts' )->escaped() );
			$footer = $this->noprint( $footer );
		}
		$result = array();
		foreach ( $refs as $ref ) {
			$index = $this->get( $ref, 'index' ) + 1;
			$key = $this->get( $ref, 'key' );
			$annot = $this->get( $ref, 'annot' );
			$text = $this->get( $ref, 'text' );
			$vkey = "<span style=\"color:#aaa\">[$key]</span>";
			if ( isset( $ref['biburl'] ) ) {
				$biburl = htmlspecialchars( $ref['biburl'] );
				$vkey = '<a href="' .$biburl .'" class="extiw" style="text-decoration:none" title="' .
					wfMessage( 'biblioplus-vkey-title' )->escaped() . '">' . $vkey . '</a>';
			}
			$vkey = $this->noprint( $vkey );
			$vkey .= " $annot";
			$result[] = "<li id=\"bibkey_$key\" value=\"$index\"> $text $vkey\n</li>";
		}

		// error_reporting($initial_error_reporting);
		global $wgBiblioPlusVersion;
		return $header . '<!-- Produced by BiblioPlus version ' . $wgBiblioPlusVersion . ' -->' .
			'<ol>' . implode( '', $result ) . '</ol>' . $footer;
	}

	/**********************
	*  Debugging functions
	***********************
	*/

	/**
	* Wraps a string in an HTML comment tag and prints it out.
	*
	* @param string $x: The comment.
	*/
	function comment( $x ) {
		echo "<!-- $x -->\n";
	}

	/**
	* Wraps an array in an HTML comment tag and prints it out.
	*
	* @param array $x: The comments.
	*/
	function commentArray( $x ) {
		echo '<!--\n';
		print_r( $x );
		echo '\n-->\n';
	}

} // end of BiblioPlus class definition
