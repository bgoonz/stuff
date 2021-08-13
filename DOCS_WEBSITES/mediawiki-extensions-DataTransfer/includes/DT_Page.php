<?php
/**
 * Class holding the data of a page to be imported
 *
 * @author Yaron Koren
 */

class DTPage {
	private $mName;
	private $mTemplates;
	private $mFreeText;

	public function __construct() {
		$this->mTemplates = [];
	}

	function setName( $name ) {
		$this->mName = $name;
	}

	function getName() {
		return $this->mName;
	}

	function addTemplateField( $template_name, $field_name, $value ) {
		if ( !array_key_exists( $template_name, $this->mTemplates ) ) {
			$this->mTemplates[$template_name] = [];
		}
		$this->mTemplates[$template_name][$field_name] = $value;
	}

	function setFreeText( $free_text ) {
		$this->mFreeText = $free_text;
	}

	function createText() {
		$text = "";
		foreach ( $this->mTemplates as $template_name => $fields ) {
			$fieldsAdded = false;
			$text .= '{{' . $template_name;
			foreach ( $fields as $field_name => $val ) {
				if ( $val != '' ) {
					$text .= "\n|$field_name=$val";
					$fieldsAdded = true;
				}
			}
			if ( $fieldsAdded ) {
				$text .= "\n";
			}
			$text .= '}}' . "\n";
		}
		$text .= $this->mFreeText;
		return $text;
	}
}
