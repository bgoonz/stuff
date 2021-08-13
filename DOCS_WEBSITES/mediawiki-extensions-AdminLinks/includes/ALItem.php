<?php

use MediaWiki\MediaWikiServices;

/**
 * A single 'item' in the AdminLinks page, most likely representing a link
 * but also conceivably containing other text; also contains a label, which
 * is not displayed and is only used for organizational purposes.
 */
class ALItem {
	public $text;
	public $label;

	static function newFromPage( $page_name_or_title, $desc = null, $query = array() ) {
		$item = new ALItem();
		$item->label = $desc;
		if ( $page_name_or_title instanceof Title ) {
			$title = $page_name_or_title;
		} else {
			$title = Title::newFromText( $page_name_or_title );
			if ( !$title ) {
				return null;
			}
		}
		// @phan-suppress-next-line SecurityCheck-DoubleEscaped
		$item->text = AdminLinks::makeLink( $title, htmlspecialchars( $desc ), array(), $query );
		return $item;
	}

	static function newFromSpecialPage( $page_name ) {
		global $wgOut;
		$item = new ALItem();
		$item->label = $page_name;

		if ( method_exists( 'MediaWiki\MediaWikiServices', 'getSpecialPageFactory' ) ) {
			// MW 1.32+
			$page = MediaWikiServices::getInstance()
				->getSpecialPageFactory()
				->getPage( $page_name );
		} else {
			/** @phan-suppress-next-line PhanUndeclaredClassMethod */
			$page = SpecialPageFactory::getPage( $page_name );
		}

		if ( $page ) {
			// @phan-suppress-next-line SecurityCheck-DoubleEscaped
			$item->text = AdminLinks::makeLink( $page->getPageTitle(),
				htmlspecialchars( $page->getDescription() ) );
		} else {
			$wgOut->addHTML( "<span class=\"error\">" .
				wfMessage( 'adminlinks_pagenotfound', $page_name )->escaped() . "<br></span>" );
		}
		return $item;
	}

	static function newFromEditLink( $page_name, $desc ) {
		$item = new ALItem();
		$item->label = $page_name;
		$title = Title::makeTitleSafe( NS_MEDIAWIKI, $page_name );
		$edit_link = $title->getFullURL( 'action=edit' );
		$item->text = "<a href=\"$edit_link\">" . htmlspecialchars( $desc ) . "</a>";
		return $item;
	}

	static function newFromExternalLink( $url, $label ) {
		$item = new ALItem();
		$item->label = $label;
		$item->text = "<a class=\"external text\" rel=\"nofollow\" href=\"" .
			Sanitizer::encodeAttribute( $url ) . "\">" . htmlspecialchars( $label ) . "</a>";
		return $item;
	}
}
