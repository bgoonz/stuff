<?php

/*
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301, USA.
 * http://www.gnu.org/copyleft/gpl.html
 */

use MediaWiki\MediaWikiServices;

class DoubleWiki {
	// phpcs:disable Generic.Files.LineLength
	/**
	 * Tags that must be closed. (list copied from Sanitizer.php)
	 * @var string
	 */
	public $tags = '/<\/?(b|del|i|ins|u|font|big|small|sub|sup|h1|h2|h3|h4|h5|h6|cite|code|em|s|strike|strong|tt|tr|td|var|div|center|blockquote|ol|ul|dl|table|caption|pre|ruby|rt|rb|rp|p|span)([\s](.*?)>|>)/i';
	// phpcs:enable

	/**
	 * Read the list of matched phrases and add tags to the html output.
	 * @param string &$text
	 * @param string $lang
	 */
	private function addMatchingTags( &$text, $lang ) {
		$pattern = "/<div id=\"align-" . preg_quote( $lang, '/' )
			. "\" style=\"display:none;\">\n*<pre>(.*?)<\/pre>\n*<\/div>/is";
		$m = [];
		if ( !preg_match( $pattern, $text, $m ) ) {
			return;
		}
		$text = str_replace( $m[1], '', $text );
		$line_pattern = '/\s*([^:\n]*?)\s*=\s*([^:\n]*?)\s*\n/i';
		$items = [];
		preg_match_all( $line_pattern, $m[1], $items, PREG_SET_ORDER );
		foreach ( $items as $n => $i ) {
			$text = str_replace( $i[1], "<span id=\"dw-" . $n
				. "\" title=\"{$i[2]}\"/>" . $i[1], $text );
		}
	}

	/**
	 * OutputPageBeforeHTML hook handler
	 * @link https://www.mediawiki.org/wiki/Manual:Hooks/OutputPageBeforeHTML
	 *
	 * @param OutputPage &$out OutputPage object
	 * @param string &$text HTML to mangle
	 * @return bool
	 */
	public static function onOutputPageBeforeHTML( &$out, &$text ) {
		$dw = new self();
		$dw->addMatchedText( $out, $text );
		return true;
	}

	/**
	 * Hook function called with &match=lang
	 * Transform $text into a bilingual version
	 * @param OutputPage &$out
	 * @param string &$text
	 * @return bool
	 */
	private function addMatchedText( &$out, &$text ) {
		global $wgDoubleWikiCacheTime;

		$matchCode = $out->getRequest()->getText( 'match' );
		if ( $matchCode === '' ) {
			return true;
		}

		$this->addMatchingTags( $text, $matchCode );
		$cache = MediaWikiServices::getInstance()->getMainWANObjectCache();
		$fname = __METHOD__;

		foreach ( $out->getLanguageLinks() as $iwLinkText ) {
			$iwt = Title::newFromText( $iwLinkText );
			if ( $iwt->getInterwiki() !== $matchCode ) {
				continue;
			}

			$newText = $cache->getWithSetCallback(
				$cache->makeKey(
					'doublewiki-bilingual-pagetext',
					$out->getLanguage()->getCode(),
					$iwt->getPrefixedDbKey()
				),
				$wgDoubleWikiCacheTime,
				// @TODO: maybe integrate with WikiPage::purgeInterwikiCheckKey() somehow?
				function ( $oldValue ) use ( $iwt, $out, $matchCode, $text, $cache, $fname ) {
					$services = MediaWikiServices::getInstance();
					$contLang = $services->getContentLanguage();

					$foreignUrl = $iwt->getCanonicalURL();
					$currentUrl = $out->getTitle()->getLocalURL();
					$foriegnLangName = Language::fetchLanguageName( $matchCode );
					$contentLangName = Language::fetchLanguageName( $contLang->getCode() );

					// TODO: Consider getting Last-Modified header and use $cache->daptiveTTL()
					$translation = $services->getHttpRequestFactory()
						->get( wfAppendQuery( $foreignUrl, [ 'action' => 'render' ] ), [], $fname );

					if ( $translation === null ) {
						// not cached
						return false;
					}

					list( $text, $translation ) = $this->getMangledTextAndTranslation(
						$text,
						$translation,
						$matchCode
					);

					return $this->matchColumns(
						$text,
						$contentLangName,
						$currentUrl,
						$contLang,
						$translation,
						$foriegnLangName,
						$foreignUrl,
						Language::factory( $matchCode )
					);
				}
			);

			if ( $newText !== false ) {
				$text = $newText;
			}

			break;
		}

		return true;
	}

	/**
	 * @param string $text
	 * @param string $translation
	 * @param string $matchLangCode
	 * @return string[] (new text, new translation)
	 */
	private function getMangledTextAndTranslation( $text, $translation, $matchLangCode ) {
		global $wgLanguageCode;

		/**
		 * first find all links that have no 'class' parameter.
		 * these links are local so we add '?match=xx' to their url,
		 * unless it already contains a '?'
		 */
		$translation = preg_replace(
			"/<a href=\"http:\/\/([^\"\?]*)\"(([\s]+)(c(?!lass=)|[^c\>\s])([^\>\s]*))*\>/i",
			"<a href=\"http://\\1?match={$wgLanguageCode}\"\\2>",
			$translation
		);
		// now add class='extiw' to these links
		$translation = preg_replace(
			"/<a href=\"http:\/\/([^\"]*)\"(([\s]+)(c(?!lass=)|[^c\>\s])([^\>\s]*))*\>/i",
			"<a href=\"http://\\1\" class=\"extiw\"\\3>",
			$translation
		);
		// use class='extiw' for images too
		$translation = preg_replace(
			"/<a href=\"http:\/\/([^\"]*)\"([^\>]*)class=\"image\"([^\>]*)\>/i",
			"<a href=\"http://\\1\"\\2class=\"extiw\"\\3>",
			$translation
		);

		// add prefixes to internal links, in order to prevent duplicates
		$translation = preg_replace(
			"/<a href=\"#(.*?)\"/i",
			"<a href=\"#l_\\1\"",
			$translation
		);
		$translation = preg_replace(
			"/<li id=\"(.*?)\"/i",
			"<li id=\"l_\\1\"",
			$translation
		);

		$text = preg_replace(
			"/<a href=\"#(.*?)\"/i",
			"<a href=\"#r_\\1\"",
			$text
		);
		$text = preg_replace(
			"/<li id=\"(.*?)\"/i",
			"<li id=\"r_\\1\"",
			$text
		);

		// add ?match= to local links of the local wiki
		$text = preg_replace(
			"/<a href=\"\/([^\"\?]*)\"/i",
			"<a href=\"/\\1?match={$matchLangCode}\"",
			$text
		);

		return [ $text, $translation ];
	}

	/**
	 * @param string $left_text
	 * @param string $left_title
	 * @param string $left_url
	 * @param Language $left_lang
	 * @param string $right_text
	 * @param string $right_title
	 * @param string $right_url
	 * @param Language $right_lang
	 * Format the text as a two-column table with aligned paragraphs
	 * @return string
	 */
	private function matchColumns( $left_text, $left_title, $left_url, $left_lang,
		$right_text, $right_title, $right_url, $right_lang ) {
		list( $left_slices, $left_tags ) = $this->findSlices( $left_text );

		$body = '';
		$left_chunk = '';
		$right_chunk = '';
		$left_langcode = '';
		$right_langcode = '';

		$leftSliceCount = count( $left_slices );
		for ( $i = 0; $i < $leftSliceCount; $i++ ) {
			// some slices might be empty
			if ( $left_slices[$i] == '' ) {
				continue;
			}

			$found = false;
			$tag = $left_tags[1][$i] ?? '';
			$left_chunk .= $left_slices[$i];

			// if we are at the end of the loop, finish quickly
			if ( $i == $leftSliceCount - 1 ) {
				$right_chunk .= $right_text;
				$found = true;
			} else {
				// look for requested tag in the text
				$a = strpos( $right_text, $tag );
				if ( $a ) {
					$found = true;
					$sub = substr( $right_text, 0, $a );
					// detect the end of previous paragraph
					// regexp matches the rightmost delimiter
					$m = [];
					if ( preg_match( "/(.*)<\/(p|dl)>/is", $sub, $m ) ) {
						$right_chunk .= $m[0];
						$right_text = substr( $right_text, strlen( $m[0] ) );
					}
				}
			}

			if ( $found && $right_chunk ) {
				// Detect paragraphs
				$left_bits = $this->findParagraphs( $left_chunk );
				$right_bits = $this->findParagraphs( $right_chunk );

				// Do not align paragraphs if counts are different
				if ( count( $left_bits ) != count( $right_bits ) ) {
					$left_bits = [ $left_chunk ];
					$right_bits = [ $right_chunk ];
				}

				$left_chunk = '';
				$right_chunk = '';
				$leftBitCount = count( $left_bits );
				$left_langcode = htmlspecialchars( $left_lang->getHtmlCode() );
				$left_langdir = $left_lang->getDir();
				$right_langcode = htmlspecialchars( $right_lang->getHtmlCode() );
				$right_langdir = $right_lang->getDir();
				for ( $l = 0; $l < $leftBitCount; $l++ ) {
					$body .=
					 "<tr><td valign=\"top\" style=\"vertical-align:100%;padding-right: 0.5em\" "
					 . "lang=\"{$left_langcode}\" dir=\"{$left_langdir}\" class=\"mw-content-{$left_langdir}\">"
					 . "<div style=\"width:35em; margin:0px auto\">\n" . $left_bits[$l] . "</div>"
					 . "</td>\n<td valign=\"top\" style=\"padding-left: 0.5em\" "
					 . "lang=\"{$right_langcode}\" dir=\"{$right_langdir}\" "
					 . "class=\"mw-content-{$right_langdir}\">"
					 . "<div style=\"width:35em; margin:0px auto\">\n" . $right_bits[$l] . "</div>"
					 . "</td></tr>\n";
				}
			}
		}

		// format table head and return results
		$leftUrlEscaped = htmlspecialchars( $left_url );
		$rightUrlEscaped = htmlspecialchars( $right_url );
		$head = "<table id=\"doubleWikiTable\" width=\"100%\" border=\"0\" bgcolor=\"white\" "
			. "rules=\"cols\" cellpadding=\"0\"><colgroup><col width=\"50%\"/><col width=\"50%\"/>"
			. "</colgroup><thead><tr><td bgcolor=\"#cfcfff\" align=\"center\" "
			. "lang=\"{$left_langcode}\"><a href=\"{$leftUrlEscaped}\">{$left_title}</a></td>"
			. "<td bgcolor=\"#cfcfff\" align=\"center\" lang=\"{$right_langcode}\">"
			. "<a href=\"{$rightUrlEscaped}\" class='extiw'>{$right_title}</a></td></tr></thead>\n";
		return $head . $body . "</table>";
	}

	/**
	 * Split text and return a set of html-balanced paragraphs
	 * @param string $text
	 * @return array
	 */
	private function findParagraphs( $text ) {
		$result = [];
		$bits = preg_split( $this->tags, $text );
		$m = [];
		preg_match_all( $this->tags, $text, $m, PREG_SET_ORDER );
		$counter = 0;
		$out = '';
		$matchCount = count( $m );
		for ( $i = 0; $i < $matchCount; $i++ ) {
			$t = $m[$i][0];
			if ( substr( $t, 0, 2 ) != "</" ) {
				$counter++;
			} else {
				$counter--;
			}
			$out .= $bits[$i] . $t;
			if ( ( $t == "</p>" || $t == "</dl>" ) && $counter == 0 ) {
				$result[] = $out;
				$out = '';
			}
		}
		if ( $out ) {
			$result[] = $out;
		}
		return $result;
	}

	/**
	 * Split text and return a set of html-balanced slices
	 * @param string $left_text
	 * @return array
	 */
	private function findSlices( $left_text ) {
		$tag_pattern = "/<span id=\"dw-[^\"]*\" title=\"([^\"]*)\"\/>/i";
		$left_slices = preg_split( $tag_pattern, $left_text );
		$left_tags = [];
		preg_match_all( $tag_pattern, $left_text, $left_tags, PREG_PATTERN_ORDER );
		$n = count( $left_slices );

		/**
		 * Make slices that are full paragraphs
		 * If two slices correspond to the same paragraph, the second one will be empty
		 */
		for ( $i = 0; $i < $n - 1; $i++ ) {
			$str = $left_slices[$i];
			$m = [];
			if ( preg_match( "/(.*)<(p|dl)>/is", $str, $m ) ) {
				$left_slices[$i] = $m[1];
				$left_slices[$i + 1] = substr( $str, strlen( $m[1] ) ) . $left_slices[$i + 1];
			}
		}

		/**
		 * Keep only slices that contain balanced html
		 * If a slice is unbalanced, we merge it with the next one.
		 * The first and last slices are compensated.
		 */
		$stack = [];
		$opening = '';

		for ( $i = 0; $i < $n; $i++ ) {
			$m = [];
			preg_match_all( $this->tags, $left_slices[$i], $m, PREG_SET_ORDER );
			$counter = 0;
			$matchCount = count( $m );
			for ( $k = 0; $k < $matchCount; $k++ ) {
				$t = $m[$k];
				if ( substr( $t[0], 0, 2 ) != "</" ) {
					$counter++;
					array_push( $stack, $t );
				} else {
					array_pop( $stack );
					$counter--;
				}
			}
			if ( $i == 0 ) {
				$closure = '';
				for ( $k = 0; $k < $counter; $k++ ) {
					$opening .= "<" . $stack[$k][1] . ">";
					$closure = "</" . $stack[$k][1] . ">" . $closure;
				}
				$left_slices[$i] .= $closure;
			} elseif ( $i == $n - 1 ) {
				$left_slices[$i] = $opening . $left_slices[$i];
			} elseif ( $counter != 0 ) {
				$left_slices[$i + 1] = $left_slices[$i] . $left_slices[$i + 1];
				$left_slices[$i] = '';
			}
		}
		return [ $left_slices, $left_tags ];
	}

	/**
	 * BeforePageDisplay hook handler
	 * @link https://www.mediawiki.org/wiki/Manual:Hooks/BeforePageDisplay
	 *
	 * @param OutputPage &$out OutputPage object
	 * @param Skin &$skin The skin in use
	 * @return bool
	 */
	public static function onBeforePageDisplay( OutputPage &$out, Skin &$skin ) {
		if ( $out->getRequest()->getText( 'match' ) !== '' ) {
			$out->setRobotPolicy( 'noindex,nofollow' );
		}
		return true;
	}
}
