<?php

class CodeCommentLinkerWiki extends CodeCommentLinker {
	/**
	 * @param string $url
	 * @param string $text
	 * @return string
	 */
	public function makeExternalLink( $url, $text ) {
		return "[$url $text]";
	}

	/**
	 * @param Title $title
	 * @param string $text
	 * @return string
	 */
	public function makeInternalLink( $title, $text ) {
		return '[[' . $title->getPrefixedText() . "|$text]]";
	}
}
