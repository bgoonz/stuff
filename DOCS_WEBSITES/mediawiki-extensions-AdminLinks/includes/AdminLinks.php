<?php
/**
 * Class for the page Special:AdminLinks
 *
 * @author Yaron Koren
 */

use MediaWiki\Linker\LinkTarget;
use MediaWiki\MediaWikiServices;

class AdminLinks extends SpecialPage {
	/**
	 * Constructor
	 */
	function __construct() {
		parent::__construct( 'AdminLinks' );
	}

	function createInitialTree() {
		$tree = new ALTree();

		// 'general' section
		$general_section = new ALSection( $this->msg( 'adminlinks_general' )->text() );
		$main_row = new ALRow( 'main' );
		$main_row->addItem( ALItem::newFromSpecialPage( 'Statistics' ) );
		$main_row->addItem( ALItem::newFromSpecialPage( 'Version' ) );
		$main_row->addItem( ALItem::newFromSpecialPage( 'Specialpages' ) );
		$main_row->addItem( ALItem::newFromSpecialPage( 'Log' ) );
		$main_row->addItem( ALItem::newFromSpecialPage( 'Allmessages' ) );
		$main_row->addItem( ALItem::newFromEditLink(
			'Sidebar',
			$this->msg( 'adminlinks_editsidebar' )->text()
		) );
		$main_row->addItem( ALItem::newFromEditLink(
			'Common.css',
			$this->msg( 'adminlinks_editcss' )->text()
		) );
		$main_row->addItem( ALItem::newFromEditLink(
			'Mainpage',
			$this->msg( 'adminlinks_editmainpagename' )->text()
		) );
		$general_section->addRow( $main_row );
		$tree->addSection( $general_section );

		// 'users' section
		$users_section = new ALSection( $this->msg( 'adminlinks_users' )->text() );
		$main_row = new ALRow( 'main' );
		$main_row->addItem( ALItem::newFromSpecialPage( 'Listusers' ) );
		$main_row->addItem( ALItem::newFromSpecialPage( 'CreateAccount' ) );
		$main_row->addItem( ALItem::newFromSpecialPage( 'Userrights' ) );
		$users_section->addRow( $main_row );
		$tree->addSection( $users_section );

		// 'browsing and searching' section
		$browse_search_section = new ALSection( $this->msg( 'adminlinks_browsesearch' )->text() );
		$main_row = new ALRow( 'main' );
		$main_row->addItem( ALItem::newFromSpecialPage( 'Allpages' ) );
		$main_row->addItem( ALItem::newFromSpecialPage( 'Listfiles' ) );
		$main_row->addItem( ALItem::newFromSpecialPage( 'Search' ) );
		$browse_search_section->addRow( $main_row );
		$tree->addSection( $browse_search_section );

		// 'importing and exporting' section
		$import_export_section = new ALSection( $this->msg( 'adminlinks_importexport' )->text() );
		$main_row = new ALRow( 'main' );
		$main_row->addItem( ALItem::newFromSpecialPage( 'Export' ) );
		$main_row->addItem( ALItem::newFromSpecialPage( 'Import' ) );
		$import_export_section->addRow( $main_row );
		$tree->addSection( $import_export_section );

		return $tree;
	}

	function execute( $query ) {
		$out = $this->getOutput();

		$this->setHeaders();
		$out->addModuleStyles( 'mediawiki.special' );

		$admin_links_tree = $this->createInitialTree();
		Hooks::run( 'AdminLinks', array( &$admin_links_tree ) );
		$out->addHTML( $admin_links_tree->toString() );
	}

	/**
	 * For administrators, add a link to the special 'AdminLinks' page
	 * among the user's "personal URLs" at the top, if they have
	 * the 'adminlinks' permission.
	 *
	 * @param array &$personal_urls
	 * @param Title &$title
	 * @param SkinTemplate $skinTemplate
	 *
	 * @return bool true
	 */
	public static function addURLToUserLinks(
		array &$personal_urls,
		Title &$title,
		SkinTemplate $skinTemplate
	) {
		// if user is a sysop, add link
		if ( $skinTemplate->getUser()->isAllowed( 'adminlinks' ) ) {
			$al = SpecialPage::getTitleFor( 'AdminLinks' );
			$href = $al->getLocalURL();
			$admin_links_vals = array(
				'text' => $skinTemplate->msg( 'adminlinks' )->text(),
				'href' => $href,
				'active' => ( $href == $title->getLocalURL() )
			);

			// find the location of the 'my preferences' link, and
			// add the link to 'AdminLinks' right before it.
			// this is a "key-safe" splice - it preserves both the
			// keys and the values of the array, by editing them
			// separately and then rebuilding the array.
			// based on the example at http://us2.php.net/manual/en/function.array-splice.php#31234
			$tab_keys = array_keys( $personal_urls );
			$tab_values = array_values( $personal_urls );
			$prefs_location = array_search( 'preferences', $tab_keys );
			array_splice( $tab_keys, $prefs_location, 0, 'adminlinks' );
			array_splice( $tab_values, $prefs_location, 0, array( $admin_links_vals ) );

			$personal_urls = array();
			$tabKeysCount = count( $tab_keys );
			for ( $i = 0; $i < $tabKeysCount; $i++ ) {
				$personal_urls[$tab_keys[$i]] = $tab_values[$i];
			}
		}
		return true;
	}

	/**
	 * Helper function for backward compatibility.
	 *
	 * @param LinkTarget|Title $title
	 * @param string|null $msg Must be HTML escaped already
	 * @param array $attrs
	 * @param array $params Query parameters
	 * @return string
	 */
	public static function makeLink( $title, $msg = null, $attrs = array(), $params = array() ) {
		$linkRenderer = MediaWikiServices::getInstance()->getLinkRenderer();
		if ( $msg !== null ) {
			$html = new HtmlArmor( $msg );
		} else {
			// null
			$html = $msg;
		}
		return $linkRenderer->makeKnownLink( $title, $html, $attrs, $params );
	}

	/** @inheritDoc */
	protected function getGroupName() {
		return 'users';
	}
}
