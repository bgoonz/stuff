<?php
 /*
 *  Helper class that parses XML
 *  Used for ISBN queries
 */
class BiblioXml {
	/*
	 * @var Xml Parser $parser: The xml parser to parse the input text.
	 */
	public $parser;

	/*
	 * @var array $data: Holds the data parsed from the xml document.
	 */
	public $data;

	/*
	 * The xml element handler for xml open tags.
	 * @param Xml Parser $parser: The Xml parser.
	 * @param string $name: The name of the element.
	 * @param array $attrs: The attributes of the element.
	 */
	function tag_open($parser, $name, $attrs) {
		$data['name'] = $name;
		$data['attributes'] = $attrs;
		$this->data[] = $data;
	}

	/*
	 * The xml element handler for xml close tags.
	 * @param Xml Parser $parser: The xml parser.
	 * @param string $name: The name of the element.
	 */
	function tag_close($parser, $name) {
		if (count($this->data) > 1) {
			$data = array_pop($this->data);
			$index = count($this->data) - 1;
			$this->data[$index]['child'][] = $data;
		}
	}

	/*
	 * The character data handler.
	 * @param Xml Parser $parser: The xml parser.
	 * @param string $s: The character data.
	 */
	function cdata($parser, $s) {
		$index = count($this->data) - 1;
		if (array_key_exists('content',$this->data[$index])) {
			$this->data[$index]['content'] .= $s;
		} else {
			$this->data[$index]['content'] = $s;
		}
	}

	/*
	 * Creates an xml parser and parses the input text.
	 * @param string $text: The xml text to parse.
	 * @return array $data: The array containing the data from the parsed text.
	 */
	function parse ($text) {
		$this->parser = xml_parser_create();
		xml_set_object($this->parser, $this);
		xml_set_element_handler($this->parser, "tag_open", "tag_close");
		xml_set_character_data_handler($this->parser, "cdata");
		xml_parse($this->parser, $text, true);
		xml_parser_free($this->parser);
		return $this->data;
	}
}