<?php

/**
 * All hooked functions used by ArticleIndex
 */

class ArticleIndexHooks {

	/**
	 * Set up the parser hooks
	 * @param Parser $parser
	 */
	public static function registerParserHook( $parser ) {
		$parser->setHook( 'aindex', [ 'ArticleIndexHooks', 'aindexRender' ] );
		$parser->setHook( 'articleindex', [ 'ArticleIndexHooks', 'articleindexRender' ] );
	}

	/**
	 * Callback function for registerParserHook
	 * @param string $input user-supplied input, unused
	 * @param array $args user-supplied arguments, unused
	 * @param Parser $parser unused
	 * @return string HTML
	 */
	public static function aindexRender( $input, $args, $parser ) {
		return "<span class='articleIndexedWord'>" . htmlspecialchars( $input ) . "</span>";
	}

	/**
	 * Callback function for registerParserHook
	 * @param string $input user-supplied input, unused
	 * @param array $args user-supplied arguments, unused
	 * @param Parser $parser unused
	 * @return string HTML
	 */
	public static function articleindexRender( $input, $args, $parser ) {
		return "<div class='articleindex'></div>";
	}

	/**
	 * Place the index
	 * @param OutputPage $out
	 * @param Skin $skin unused
	 */
	public static function showIndex( $out, $skin ) {
		if ( $out->isArticle() && strpos( $out->mBodytext, "<span class='articleIndexedWord'>" ) !== false ) {
			$out->addModules( 'ext.ArticleIndex' );

			// get tagged words
			$pattern = "/<span class='articleIndexedWord'>([^<]*)<\/span>/";
			preg_match_all( $pattern, $out->mBodytext, $matches, PREG_SET_ORDER );
			$words = [];

			foreach ( $matches as $m ) {
				// convert to lowercase with first letter capitalized
				$displayedWord = mb_strtolower( $m[1] );
				$firstLetter = mb_strtoupper( mb_substr( $displayedWord, 0, 1 ) );
				$displayedWord = $firstLetter . mb_substr( $displayedWord, 1 );
				array_push( $words, $displayedWord );
			}
			$words = array_unique( $words );
			setlocale( LC_ALL, 'cs_CZ' );
			usort( $words, 'strcoll' );

			// show the index
			$prev_first_letter = '';
			$index = '';
			foreach ( $words as $w ) {
				if ( mb_substr( $w, 0, 1, 'UTF-8' ) != $prev_first_letter ) {
					$index .= '<strong>:: ' . mb_substr( $w, 0, 1, 'UTF-8' ) . '</strong><br/>';
				}
				$index .= "<a class='articleIndexLink'>$w</a><br/>";
				$prev_first_letter = mb_substr( $w, 0, 1, 'UTF-8' );
			}
			$out->mBodytext = preg_replace( "/<div class='articleindex'><\/div>/", $index, $out->mBodytext );
		}
	}
}
