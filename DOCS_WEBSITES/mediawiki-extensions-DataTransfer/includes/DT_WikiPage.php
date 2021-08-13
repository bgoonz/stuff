<?php
/**
 * Class for representing a wiki page.
 *
 * @author Yaron Koren
 * @ingroup DataTransfer
 */

class DTWikiPage {
	private $mPageName = null;
	private $mElements = [];

	public function __construct( $name ) {
		$this->mPageName = $name;
	}

	function getName() {
		return $this->mPageName;
	}

	function addTemplate( $template ) {
		$this->mElements[] = $template;
	}

	function addFreeText( $free_text ) {
		$this->mElements[] = $free_text;
	}

	function createText() {
		$text = "";
		foreach ( $this->mElements as $elem ) {
			if ( $elem instanceof DTWikiTemplate ) {
				$text .= $elem->createText();
			} else {
				$text .= $elem;
			}
		}
		return $text;
	}
}
