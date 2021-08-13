<?php
/**
 * Static functions called by various outside hooks.
 *
 * @author Yaron Koren
 * @ingroup DataTransfer
 */
class DTHooks {

	/**
	 * Add links to the 'AdminLinks' special page, defined by the Admin Links
	 * extension
	 */
	public static function addToAdminLinks( $admin_links_tree ) {
		$import_export_section = $admin_links_tree->getSection( wfMessage( 'adminlinks_importexport' )->text() );
		$main_row = $import_export_section->getRow( 'main' );
		$main_row->addItem( ALItem::newFromSpecialPage( 'ViewXML' ) );
		$main_row->addItem( ALItem::newFromSpecialPage( 'ImportXML' ) );
		$main_row->addItem( ALItem::newFromSpecialPage( 'ImportCSV' ) );
		if ( class_exists( 'PHPExcel' ) ) {
			$main_row->addItem( ALItem::newFromSpecialPage( 'ImportSpreadsheet' ) );
		}
		return true;
	}

}
