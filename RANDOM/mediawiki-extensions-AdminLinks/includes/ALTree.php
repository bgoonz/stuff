<?php
/**
 * The 'tree' that holds all the sections, rows, and links for the AdminLinks
 * page
 */
class ALTree {
	public $sections;

	function __construct() {
		$this->sections = array();
	}

	function getSection( $section_header ) {
		foreach ( $this->sections as $cur_section ) {
			if ( $cur_section->header === $section_header ) {
				return $cur_section;
			}
		}
		return null;
	}

	function addSection( $section, $next_section_header = null ) {
		if ( $next_section_header == null ) {
			$this->sections[] = $section;
			return;
		}
		foreach ( $this->sections as $i => $cur_section ) {
			if ( $cur_section->header === $next_section_header ) {
				array_splice( $this->sections, $i, 0, array( $section ) );
				return;
			}
		}
		$this->sections[] = $section;
	}

	function toString() {
		$text = "";
		foreach ( $this->sections as $section ) {
			$text .= $section->toString();
		}
		return $text;
	}
}
