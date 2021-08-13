<?php
/**
 * A single row of the AdminLinks page, with a name (not displayed, used only
 * for organizing the rows), and a set of "items" (links)
 */
class ALRow {
	public $name;
	public $items;

	function __construct( $name ) {
		$this->name = $name;
		$this->items = array();
	}

	function addItem( $item, $next_item_label = null ) {
		if ( $next_item_label == null ) {
			$this->items[] = $item;
			return;
		}
		foreach ( $this->items as $i => $cur_item ) {
			if ( $cur_item->label === $next_item_label ) {
				array_splice( $this->items, $i, 0, array( $item ) );
				return;
			}
		}
		$this->items[] = $item;
	}

	function toString() {
		$text = "	<p>\n";
		foreach ( $this->items as $i => $item ) {
			if ( $i > 0 ) {
				$text .= " ·\n";
			}
			$text .= '		' . $item->text;
		}
		return $text . "\n	</p>\n";
	}
}
