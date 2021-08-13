<?php

namespace MediaWiki\Extensions\Collection;

use Html;
use LogicException;
use Sanitizer;
use TemplateParser;
use Title;

/**
 * Renders HTML view of a book by concatenating and transforming HTML and generating some
 * leading/trailing pages.
 */
class BookRenderer {

	/** @var TemplateParser */
	private $templateParser;

	/**
	 * @param TemplateParser $templateParser
	 */
	public function __construct( TemplateParser $templateParser ) {
		$this->templateParser = $templateParser;
	}

	/**
	 * Generate the concatenated page.
	 * @param array[] $collection as returned by
	 *   CollectionSession::getCollection().
	 * @param string[] $pages Map of prefixed DB key => Parsoid HTML.
	 * @param array[] $metadata Map of prefixed DB key => metadata, as returned by fetchMetadata().
	 *   Section data will be updated to account for heading level and id changes.
	 * @return array with keys html representing the data needed to render the book
	 */
	public function getBookTemplateData( $collection, $pages, $metadata ) {
		$hasChapters = !empty( array_filter( $collection['items'], static function ( $item ) {
			return $item['type'] === 'chapter';
		} ) );
		$articleCount = count( array_filter( $collection['items'], static function ( $item ) {
			return $item['type'] === 'article';
		} ) );
		$hasArticles = $articleCount > 0;

		$headingCounter = new HeadingCounter();
		$bookBodyHtml = '';
		$title = $collection['title'];
		$items = $collection['items'];
		'@phan-var array[] $items';
		$tocHeadingCounter = new HeadingCounter();
		$outline = [];

		// First we need to render the articles as we can't know the TOC anchors for sure
		// until we have resolved id conflicts.
		// FastFormatter chokes on Parsoid HTML. HtmlFormatter is still plenty fast anyway.
		$formatter = new \Wikimedia\RemexHtml\Serializer\HtmlFormatter();
		$serializer = new \Wikimedia\RemexHtml\Serializer\Serializer( $formatter );
		$munger = new RemexCollectionMunger( $serializer, [
			'topHeadingLevel' => $hasChapters ? 3 : 2,
		] );
		foreach ( $items as $item ) {
			$titleText = $item['title'];
			$title = Title::newFromText( $titleText );
			if ( $item['type'] === 'chapter' ) {
				$outline[] = $this->getBookChapterData( $title, $tocHeadingCounter );
				$bookBodyHtml .= Html::element( 'h1', [
						'id' => 'mw-book-chapter-' . Sanitizer::escapeIdForAttribute( $titleText ),
						'class' => 'mw-book-chapter',
						'data-mw-sectionnumber' => $headingCounter->incrementAndGet( -2 ),
					], $titleText ) . "\n";
			} elseif ( $item['type'] === 'article' ) {
				$dbkey = $title->getPrefixedDBkey();
				$html = $this->getBodyContents( $pages[$dbkey] );

				$headingAttribs = [
					'id' => 'mw-book-article-' . $dbkey,
					'class' => 'mw-book-article',
				];
				$mungerOptions = [];
				if ( $articleCount > 1 ) {
					$mungerOptions['sectionNumberPrefix'] = $headingAttribs['data-mw-sectionnumber']
						= $headingCounter->incrementAndGet( -1 );
				}
				$bookBodyHtml .= Html::rawElement( 'h2', $headingAttribs,
					$metadata['displaytitle'][$dbkey] ) . "\n";

				$munger->startCollectionSection( './' . $dbkey, $metadata['sections'][$dbkey],
					$headingCounter );
				$treeBuilder = new \Wikimedia\RemexHtml\TreeBuilder\TreeBuilder( $munger, [] );
				$dispatcher = new \Wikimedia\RemexHtml\TreeBuilder\Dispatcher( $treeBuilder );
				$tokenizer = new \Wikimedia\RemexHtml\Tokenizer\Tokenizer( $dispatcher, $html, [
					// HTML comes from Parsoid so we can skip validation
					'ignoreErrors' => true,
					'ignoreCharRefs' => true,
					'ignoreNulls' => true,
					'skipPreprocess' => true,
				] );
				$tokenizer->execute( [
					'fragmentNamespace' => \Wikimedia\RemexHtml\HTMLData::NS_HTML,
					'fragmentName' => 'body',
				] );
				$outline = array_merge( $outline,
					$this->getArticleChaptersData( $title, $tocHeadingCounter,
						$metadata['displaytitle'], $metadata['sections'], $articleCount )
				);
				$bookBodyHtml .= Html::openElement( 'article' )
					. substr( $serializer->getResult(), 15 ) // strip "<!DOCTYPE html>"
					. Html::closeElement( 'article' );
			} else {
				throw new LogicException( 'Unknown collection item type: ' . $item['type'] );
			}
		}

		if ( $hasChapters ) {
			$metadataLevel = -2;
		} elseif ( $articleCount > 1 ) {
			$metadataLevel = -1;
		} else {
			$metadataLevel = 0;
		}
		$hasImages = isset( $metadata['images'] ) && $metadata['images'];
		$hasLicense = isset( $metadata['license'] ) && $metadata['license'];

		if ( $hasArticles ) {
			$outline = array_merge( $outline,
				$this->getAdditionalBookChapters( $tocHeadingCounter, $metadataLevel,
					$hasImages, $hasLicense )
			);
		}

		$templateData = [
			'toc' => [
				'title' => $collection['title'],
				'subtitle' => $collection['subtitle'] ?? false,
				'toctitle' => wfMessage( 'coll-toc-title' )->text(),
				'tocitems' => $this->getNestedOutline( $outline ),
			],
			'html' => $bookBodyHtml,
		];

		if ( $hasArticles ) {
			$templateData['contributors'] = [
				'names' => array_keys( $metadata['contributors'] ),
				'headingMsg' => wfMessage( 'coll-contributors-title' )->text(),
				'level' => $headingCounter->incrementAndGetTopLevel(),
			];
		} else {
			$templateData['contributors'] = false;
		}
		if ( $hasImages ) {
			$messages = [
				'sourceMsg' => wfMessage( 'coll-images-source' )->text(),
				'licenseMsg' => wfMessage( 'coll-images-license' )->text(),
				'artistMsg' => wfMessage( 'coll-images-original-artist' )->text()
			];
			// Mustache templates in Lightncandy are not able to access template data in parent object
			// to circumvent that we have to repeat the common messages across all the items.
			$images = [];
			foreach ( $metadata['images'] as $image ) {
				$images[] = array_merge( $image, $messages );
			}

			$templateData['images'] = [
				'images' => $images,
				'headingMsg' => wfMessage( 'coll-images-title' )->text(),
				'level' => $headingCounter->incrementAndGetTopLevel(),
			];
		} else {
			$templateData['images'] = false;
		}
		if ( $hasLicense ) {
			$templateData['license'] = [
				'license' => $metadata['license'],
				'headingMsg' => wfMessage( 'coll-license-title' )->text(),
				'level' => $headingCounter->incrementAndGetTopLevel(),
			];
		} else {
			$templateData['license'] = false;
		}
		return $templateData;
	}

	/**
	 * Generate the concatenated page.
	 * @param array[] $collection Collection, as returned by CollectionSession::getCollection().
	 * @param string[] $pages Map of prefixed DB key => Parsoid HTML.
	 * @param array[] &$metadata Map of prefixed DB key => metadata, as returned by fetchMetadata().
	 *   Section data will be updated to account for heading level and id changes.
	 *   Also, an outline will be added (see getBookTemplateData() for format).
	 * @return string HTML of the rendered book (without body/head).
	 */
	public function renderBook( $collection, $pages, &$metadata ) {
		$book = $this->getBookTemplateData( $collection, $pages, $metadata );
		return $this->templateParser->processTemplate( 'book', $this->fixTemplateData( $book ) );
	}

	/**
	 * Generate template data for outline chapter
	 * @param Title $title for book
	 * @param HeadingCounter $tocHeadingCounter
	 * @return array
	 */
	private function getBookChapterData( $title, $tocHeadingCounter ) {
		return [
			'text' => htmlspecialchars( $title, ENT_QUOTES ),
			'type' => 'chapter',
			'level' => -2,
			'anchor' => 'mw-book-chapter-' . Sanitizer::escapeIdForAttribute( $title ),
			'number' => $tocHeadingCounter->incrementAndGet( -2 ),
		];
	}

	/**
	 * Generate template data for the chapters in the given article
	 * @param Title $title to extract sections for
	 * @param HeadingCounter $tocHeadingCounter
	 * @param array[] $displayTitles mapping dbkeys to display titles for the book
	 * @param array[] $sections Section data; each section is a triple
	 *   [ title => ..., id => ..., level => ... ]. RemexCollectionMunger will update the id/level
	 *   to keep in sync with document changes.
	 * @param int $articleCount number of articles in the book
	 * @return array
	 */
	private function getArticleChaptersData(
		$title, $tocHeadingCounter, $displayTitles, $sections, $articleCount
	) {
		$chapters = [];
		$dbkey = $title->getPrefixedDBkey();

		if ( $articleCount > 1 ) {
			$chapters[] = [
				'text' => $displayTitles[$dbkey],
				'type' => 'article',
				'level' => -1,
				'anchor' => 'mw-book-article-' . $dbkey,
				'number' => $tocHeadingCounter->incrementAndGet( -1 ),
			];
		}
		foreach ( $sections[$dbkey] as $section ) {
			'@phan-var array $section';
			$chapters[] = [
				'text' => $section['title'],
				'type' => 'section',
				'level' => $section['level'],
				'anchor' => $section['id'],
				'number' => $tocHeadingCounter->incrementAndGet( $section['level'] ),
			];
		}
		return $chapters;
	}

	/**
	 * Generate template data for any additional chapters in the given article
	 * @param HeadingCounter $tocHeadingCounter
	 * @param int $metadataLevel the table of contents level for a given article
	 * @param bool $hasImages whether the book contains images section
	 * @param bool $hasLicense whether the book contains a license section
	 * @return array[]
	 */
	private function getAdditionalBookChapters(
		$tocHeadingCounter, $metadataLevel, $hasImages = false, $hasLicense = false
	) {
		$outline = [
			[
				'text' => wfMessage( 'coll-contributors-title' )->text(),
				'type' => 'contributors',
				'level' => $metadataLevel,
				'anchor' => 'mw-book-contributors',
				'number' => $tocHeadingCounter->incrementAndGetTopLevel(),
			],
		];
		if ( $hasImages ) {
			$outline[] = [
				'text' => wfMessage( 'coll-images-title' )->text(),
				'type' => 'images',
				'level' => $metadataLevel,
				'anchor' => 'mw-book-images',
				'number' => $tocHeadingCounter->incrementAndGetTopLevel(),
			];
		}
		if ( $hasLicense ) {
			$outline[] = [
				'text' => wfMessage( 'coll-license-title' )->text(),
				'type' => 'license',
				'level' => $metadataLevel,
				'anchor' => 'mw-book-license',
				'number' => $tocHeadingCounter->incrementAndGetTopLevel(),
			];
		}
		return $outline;
	}

	/**
	 * Get the part inside the <body> from an HTML file.
	 * Not very robust (a <body> tag in a comment or CDATA section could confuse it) but the
	 * <head> section has no user-controlled part so using it with Parsoid HTML should be fine.
	 * @param string $html
	 * @return string
	 */
	private function getBodyContents( $html ) {
		return preg_replace( '/(^.*?<body\b[^>]*>)|(<\/body>\s*<\/html>\s*$)/si', '', $html );
	}

	/**
	 * Turns a flat outline into a nested outline. Each outline item will contain
	 * a field called 'children' which as an array of child outline items.
	 * @param array[] $outline An outline, as constructed by getBookTemplateData().
	 * @return array[]
	 */
	public function getNestedOutline( array $outline ) {
		$nestedOutline = [];
		$lastItems = []; // level => last (currently open) item on that level
		foreach ( $outline as &$item ) {
			$item['children'] = [];

			$level = $item['level'];
			$lastItems = array_filter( $lastItems, static function ( $key ) use ( $level ) {
				return $key < $level;
			}, ARRAY_FILTER_USE_KEY );

			if ( $lastItems ) {
				end( $lastItems );
				$key = key( $lastItems );
				$lastItems[$key]['children'][] = &$item;
			} else {
				$nestedOutline[] = &$item;
			}
			$lastItems[$level] = &$item;
		}
		return $nestedOutline;
	}

	/**
	 * Fix a data array for Mustache.
	 * Mustache is too stupid to be able to handle conditional pre/postfixes for
	 * arrays (e.g. do not wrap into <ul> when the array of list items is empty).
	 * The lightncandy implementation is too stupid to even do that for non-arrays.)
	 * Add a 'foo?' field for every 'foo', which casts it to boolean.
	 * @param array $data
	 * @return array
	 */
	public function fixTemplateData( $data ) {
		$fixedData = [];
		if ( !is_array( $data ) ) {
			return $data;
		}
		foreach ( $data as $field => $value ) {
			// treat 0/'0' as truthy
			if ( !is_bool( $value ) ) {
				$fixedData[$field . '?'] = !in_array( $value, [ false, [], '' ], true );
			}
			if ( is_array( $value ) ) {
				if ( array_keys( $value ) === array_keys( array_values( $value ) ) ) {
					// consecutive numeric keys - treat as an array
					$fixedData[$field] = array_map( [ $this, 'fixTemplateData' ], $value );
				} else {
					// treat as a hash
					$fixedData[$field] = $this->fixTemplateData( $value );
				}
			} else {
				$fixedData[$field] = $value;
			}
		}
		return $fixedData;
	}

}
