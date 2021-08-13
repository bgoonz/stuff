<?php

namespace MediaWiki\Extensions\Collection;

use Wikimedia\RemexHtml\Serializer\Serializer;
use Wikimedia\RemexHtml\Tokenizer\Attributes;
use Wikimedia\RemexHtml\TreeBuilder\Element;
use Wikimedia\RemexHtml\TreeBuilder\TreeHandler;

/**
 * DOM tree munger for RemexHtml that makes small adjustments to a HTML document for including
 * in a collection (a HTML document that's more or less the concatenation of multiple original
 * documents).
 *
 * The munger is reused for parsing multiple documents and outputs a single unified document.
 * It makes small changes to make the resulting document valid and look good:
 * - converts h1 to h2 while preserving heading structure
 * - removes the document name from before self-references
 * - renames conflicting ids
 * - optionally adds numbers before the sections
 */
class RemexCollectionMunger implements TreeHandler {

	/**
	 * @var array
	 */
	private $options;

	/**
	 * Map from original document ID to collection document ID.
	 * A value of false means that the ID is reserved and upon encountering it a new mapping
	 * to a free id needs to be created. A value of true means the ID is used (ie. not reserved
	 * but will have to be in the next document).
	 * @var array
	 */
	private $idMap = [];

	/**
	 * Reference to section data. id and level will be updated to keep in sync with document changes.
	 * @var array[] [[ title => ..., id => ..., level => ... ], ...]
	 */
	private $sectionRef;

	/**
	 * 1-based index for the current source document in the list of source documents.
	 * @var int
	 */
	private $documentIndex = 0;

	/**
	 * URL for the current document, relative to its base URL. For a Parsoid document this will
	 * be something like './Title'.
	 * @var string
	 */
	private $selfLink;

	/**
	 * Tracks how many levels headings need to be moved. E.g. a document with h1;h2;h3
	 * needs to be transformed to h2;h3;h4 while a document with h2;h3;h1 to h2;h3;h2
	 * so we set $headingDisplacementLevel when encountering h1 and use it decide what to
	 * do with other headings.
	 * @var int
	 */
	private $headingDisplacementLevel = 0;

	/**
	 * @var HeadingCounter A counter for section numbers.
	 */
	private $sectionCounter;

	/**
	 * Source document end position.
	 * @var int
	 */
	private $endPos;

	/** @var Serializer */
	private $serializer;

	/**
	 * @param Serializer $serializer
	 * @param array $options
	 *   - topHeadingLevel: highest allowed heading level (e.g. '2' means h1 is disallowed and will
	 *     be "pushed down")
	 */
	public function __construct( Serializer $serializer, $options = [] ) {
		$this->serializer = $serializer;
		$this->options = $options + [
			'topHeadingLevel' => 2,
			'numberSections' => true,
		];
	}

	/**
	 * Reset internal state. Needs to be called before parsing a new source document.
	 * @param string $selfLink URL prefix before # which means this is a local URL
	 * @param array[] &$sections Section data; each section is a triple
	 *   [ title => ..., id => ..., level => ... ]. RemexCollectionMunger will update the id/level
	 *   to keep in sync with document changes.
	 * @param HeadingCounter $sectionCounter
	 */
	public function startCollectionSection( $selfLink, &$sections, HeadingCounter $sectionCounter ) {
		$this->documentIndex++;
		$this->headingDisplacementLevel = 0;
		// set all mappings to false: they are only valid within a single source document
		$this->idMap = array_fill_keys( array_keys( $this->idMap ), false );
		$this->sectionRef = &$sections;
		$this->selfLink = $selfLink;
		$this->sectionCounter = $sectionCounter;
	}

	/**
	 * Called by RemexHTML when parsing of a source document starts.
	 * @inheritDoc
	 */
	public function startDocument( $fragmentNamespace, $fragmentName ) {
		// This will emit a doctype even if fragment name is set. It needs to be
		// removed manually after getting the result from the Formatter.
		$this->serializer->startDocument( $fragmentNamespace, $fragmentName );
	}

	/**
	 * Called by RemexHTML when parsing stops.
	 * @param int $pos The input string length, i.e. the past-the-end position.
	 */
	public function endDocument( $pos ) {
		$this->endPos = $pos;
		$this->serializer->endDocument( $this->getPosition( $pos ) );
		// do nothing - this is not necessarily the end of the output document.
	}

	/**
	 * Called by RemexHTML when parsing characters.
	 * @inheritDoc
	 */
	public function characters(
		$preposition, $ref, $text, $start, $length, $sourceStart, $sourceLength
	) {
		$this->serializer->characters( $preposition, $ref, $text, $start, $length,
			$this->getPosition( $sourceStart ), $sourceLength );
	}

	/**
	 * Called by RemexHTML when parsing an element.
	 * @inheritDoc
	 */
	public function insertElement(
		$preposition, $ref, Element $element, $void, $sourceStart, $sourceLength
	) {
		// if the serializer has already seen this element, we already munged it
		if ( !$element->userData ) {
			$this->fixHeading( $element );
			$this->numberHeading( $element );
			$this->fixId( $element->attrs, $element );
		}
		$this->serializer->insertElement( $preposition, $ref, $element, $void,
			$this->getPosition( $sourceStart ), $sourceLength );
	}

	/**
	 * Called by RemexHTML when parsing an end tag.
	 * @inheritDoc
	 */
	public function endTag( Element $element, $sourceStart, $sourceLength ) {
		$this->serializer->endTag( $element, $this->getPosition( $sourceStart ), $sourceLength );
	}

	/**
	 * Called by RemexHTML when parsing a doctype declaration.
	 * @inheritDoc
	 */
	public function doctype( $name, $public, $system, $quirks, $sourceStart, $sourceLength ) {
		// we only need the body so no point in forwarding this
	}

	/**
	 * Called by RemexHTML when parsing a comment.
	 * @inheritDoc
	 */
	public function comment( $preposition, $ref, $text, $sourceStart, $sourceLength ) {
		$this->serializer->comment( $preposition, $ref, $text,
			$this->getPosition( $sourceStart ), $sourceLength );
	}

	/**
	 * Called by RemexHTML on parse errors.
	 * @inheritDoc
	 */
	public function error( $text, $pos ) {
		$this->serializer->error( $text, $this->getPosition( $pos ) );
	}

	/**
	 * Called by RemexHTML when updating element attributes.
	 * @inheritDoc
	 */
	public function mergeAttributes( Element $element, Attributes $attrs, $sourceStart ) {
		// RemexHTML should only call this method for <html> and <body> which we discard
		// so there is probably no need to fix ids but do it anyway just in case
		$this->fixId( $attrs, $element );
		$this->serializer->mergeAttributes( $element, $attrs, $this->getPosition( $sourceStart ) );
	}

	/**
	 * Called by RemexHTML in some edge cases when fixing invalid HTML.
	 * @inheritDoc
	 */
	public function removeNode( Element $element, $sourceStart ) {
		$this->serializer->removeNode( $element, $this->getPosition( $sourceStart ) );
	}

	/**
	 * Called by RemexHTML in some edge cases when fixing invalid HTML.
	 * @inheritDoc
	 */
	public function reparentChildren( Element $element, Element $newParent, $sourceStart ) {
		$this->serializer->reparentChildren( $element, $newParent, $this->getPosition( $sourceStart ) );
	}

	/**
	 * Translate a position in one of the source documents to a position in the document collection.
	 * This is only used for debugging so we just generate a number which makes it obvious where
	 * to look in the source documents.
	 * @param int $originalSourceStart
	 * @return int
	 */
	private function getPosition( $originalSourceStart ) {
		// "concatenate" document index and position within document.
		// this leaves ~100MB index space for each document which is plenty, and still fits
		// comfortably into an int even on 32-bit builds.
		return (int)( $this->documentIndex * 1e8 + $originalSourceStart );
	}

	/**
	 * Fix $element if it is a heading with the wrong level.
	 * h1 and maybe h2 are reserved for chapter/article titles, if we encounter any,
	 * force the whole heading structure to be on a lower level.
	 * @param Element $element
	 */
	private function fixHeading( $element ) {
		if ( !$this->isHeading( $element ) ) {
			return;
		}

		$level = (int)substr( $element->htmlName, 1 );
		$displace = max( $this->headingDisplacementLevel, $this->options['topHeadingLevel'] - $level );
		$this->headingDisplacementLevel = $displace;
		$newLevel = min( $level + $displace, 6 );
		if ( $newLevel !== $level ) {
			// update section data
			if ( isset( $element->attrs['id'] ) ) {
				foreach ( $this->sectionRef as $index => $section ) {
					if ( $section['id'] === $element->attrs['id'] ) {
						$this->sectionRef[$index]['level'] = $newLevel;
					}
				}
			}
			$element->name = $element->htmlName = 'h' . $newLevel;
		}
	}

	/**
	 * Add numbers before section/chapter/article titles if configured to do so.
	 * Section numbers are hierarchic, e.g. subsection 4 of section 3 of article 2
	 * (of a book with no chapters) will be numbered "2.3.4".
	 * @param Element $element
	 */
	private function numberHeading( $element ) {
		if ( !$this->isHeading( $element ) ) {
			return;
		}
		$level = (int)substr( $element->htmlName, 1 );
		if ( $this->options['numberSections'] ) {
			// Add the section number as a data element that can be displayed via CSS.
			// This is more semantic and probably more safe as well than trying to change
			// the content of a tag while Remex is parsing it.
			// Ideally such numbers would be added via CSS counters but that's problematic
			// because sections are not hierarchic in the DOM tree and they can have gaps
			// - e.g. we can have "<h2/><h4/>" in which case we want the section numbers
			// to be "1 1.1" and not "1 1.0.1".
			$element->attrs['data-mw-sectionnumber'] = $this->sectionCounter->incrementAndGet( $level );
		}
	}

	/**
	 * Fix $element if it has or refers to an id which conflicts with an id in another document.
	 * Needed to prevent id conflicts (e.g. two documents using the same section name). Also fix
	 * Parsoid internal references to be #section, not ./Title#section.
	 * @param Attributes $attrs
	 * @param Element $element
	 */
	private function fixId( $attrs, $element ) {
		if ( isset( $attrs['id'] ) ) {
			$newId = $this->getUnreservedId( $attrs['id'] );
			if ( $newId !== $attrs['id'] ) {
				// if we renamed a heading anchor, update section data
				if ( $this->isHeading( $element ) ) {
					foreach ( $this->sectionRef as $index => $section ) {
						if ( $section['id'] === $attrs['id'] ) {
							$this->sectionRef[$index]['id'] = $newId;
							break;
						}
					}
				}
				$attrs['id'] = $newId;
			}
		}
		// Make sure local references are in sync with ids.
		// We don't try to update cross-document references, too much effort.
		if (
			$element->htmlName === 'a' && isset( $attrs['href'] )
			&& $this->startsWith( $attrs['href'], $this->selfLink . '#' )
		) {
			$id = (int)substr( $attrs['href'], strlen( $this->selfLink ) + 1 );
			$id = $this->getUnreservedId( $id );
			$attrs['href'] = '#' . $id;
		}
	}

	/**
	 * Get an unreserved id and update the mapping.
	 * Will return $id if it does not conflict with earlier documents; otherwise it will find
	 * a free name and use that instead, consistently.
	 * @param int $id
	 * @return string
	 */
	private function getUnreservedId( $id ) {
		if ( !isset( $this->idMap[$id] ) ) {
			// No conflict. Mark this id as being in use.
			$this->idMap[$id] = true;
			return (string)$id;
		} elseif ( $this->idMap[$id] === true ) {
			// This id has been used in the same source document. That's fine, nothing to do.
			return (string)$id;
		} elseif ( $this->idMap[$id] === false ) {
			// This id has been used in a different source document, must remap.
			$n = 2;
			do {
				$replacement = $id . '_' . $n++;
			} while ( isset( $this->idMap[$replacement] ) );
			$this->idMap[$id] = $replacement;
			$this->idMap[$replacement] = false;
			return $replacement;
		} else {
			// This id has has already been remapped for the current source document.
			return $this->idMap[$id];
		}
	}

	/**
	 * Is $element a HTML heading (h1..h6) tag?
	 * @param Element $element
	 * @return bool
	 */
	private function isHeading( $element ) {
		return in_array( $element->htmlName, [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6' ], true );
	}

	/**
	 * Check for prefix match.
	 * @param string $haystack
	 * @param string $needle
	 * @return bool
	 */
	private function startsWith( $haystack, $needle ) {
		return substr_compare( $haystack, $needle, 0, strlen( $needle ) ) === 0;
	}

}
