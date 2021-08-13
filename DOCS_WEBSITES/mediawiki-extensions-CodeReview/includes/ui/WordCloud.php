<?php
/**
 * wordCloud Copyright 2007 Derek Harvey
 * www.lotsofcode.com
 *
 * This file is part of wordCloud.
 *
 * wordCloud is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * wordCloud is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.    See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with wordCloud; if not, write to the Free Software
 * Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA
 *
 * ---
 * Adapted for use with MediaWiki, cleaned up coding style, etc on 2010-11-03
 */
class WordCloud {
	/**
	 * Nice big array of words and their weights
	 * @var array
	 */
	private $wordsArray = [];

	/**
	 * An optional callback to format the text before outputting
	 */
	private $callback;

	/**
	 * Mapping of percentage limits to their CSS classes
	 */
	private $classPercentages = [
		1 => 99, 2 => 70, 3 => 60,
		4 => 50, 5 => 40, 6 => 30,
		7 => 20, 8 => 10, 9 => 5
	];

	/**
	 * Constructor
	 *
	 * @param array $words Array of word => rank pairs
	 * @param Callback|null $callback
	 */
	public function __construct( array $words = [], $callback = null ) {
		foreach ( $words as $word => $rank ) {
			$this->addWord( $word, $rank );
		}
		$this->callback = $callback ?: [ $this, 'defaultTextCallback' ];
	}

	/**
	 * Assign word to array
	 *
	 * @param string $word The word to add
	 * @param int $value The weight to give it
	 */
	public function addWord( $word, $value = 1 ) {
		$word = strtolower( $word );
		if ( array_key_exists( $word, $this->wordsArray ) ) {
			$this->wordsArray[$word] += $value;
		} else {
			$this->wordsArray[$word] = $value;
		}
	}

	/**
	 * Calculate size of words array
	 *
	 * @return int
	 */
	public function getCloudSize() {
		return array_sum( $this->wordsArray );
	}

	/**
	 * Create the HTML code for each word and apply font size.
	 *
	 * @return string
	 */
	public function getCloudHtml() {
		global $wgCodeReviewShuffleTagCloud;
		if ( count( $this->wordsArray ) === 0 ) {
			return '';
		}

		if ( $wgCodeReviewShuffleTagCloud ) {
			$this->shuffleCloud();
		} else {
			ksort( $this->wordsArray );
		}

		$max = max( $this->wordsArray );
		if ( is_array( $this->wordsArray ) ) {
			$return = '';
			foreach ( $this->wordsArray as $word => $popularity ) {
				$sizeRange = $this->getClassFromPercent( ( $popularity / $max ) * 100 );
				$return .= call_user_func_array( $this->callback, [ $word, $sizeRange ] );
			}
			return '<div class="mw-wordcloud">' . $return . '</div>';
		}
		return '';
	}

	/**
	 * Default text callback for word display
	 *
	 * @param string $word
	 * @param string $sizeRange
	 * @return string
	 */
	public function defaultTextCallback( $word, $sizeRange ) {
		return Html::element( 'span', [
			'class' => 'mw-wordcloud-size-' . $sizeRange ], $word );
	}

	/**
	 * Shuffle associated names in array
	 */
	private function shuffleCloud() {
		$keys = array_keys( $this->wordsArray );

		shuffle( $keys );

		if ( count( $keys ) && is_array( $keys ) ) {
			$tmpArray = $this->wordsArray;
			$this->wordsArray = [];
			foreach ( $keys as $value ) {
				$this->wordsArray[$value] = $tmpArray[$value];
			}
		}
	}

	/**
	 * Get the class range using a percentage
	 *
	 * @param int $percent
	 * @return int
	 */
	private function getClassFromPercent( $percent ) {
		foreach ( $this->classPercentages as $class => $limit ) {
			if ( $percent >= $limit ) {
				return $class;
			}
		}
		return max( array_keys( $this->classPercentages ) ) + 1;
	}
}
