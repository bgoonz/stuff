<?php
/**
 * Class for representing a template call within a wiki page.
 *
 * @author Yaron Koren
 * @ingroup DataTransfer
 */

class DTWikiTemplate {
	private $mName = null;
	private $mFields = [];

	public function __construct( $name ) {
		$this->mName = $name;
	}

	function addField( $name, $value ) {
		$this->mFields[$name] = $value;
	}

	function createText() {
		$multi_line_template = false;
		$text = '{{' . $this->mName;
		foreach ( $this->mFields as $field_name => $field_val ) {
			if ( is_numeric( $field_name ) ) {
				$text .= "|$field_val";
			} else {
				$text .= "\n|$field_name=$field_val";
				$multi_line_template = true;
			}
		}
		if ( $multi_line_template ) {
			$text .= "\n";
		}
		$text .= '}}' . "\n";
		return $text;
	}
}
