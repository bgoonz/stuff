<?php
/**
 * Lets the user import a spreadsheet file to turn into wiki pages
 *
 * @author Stephan Gambke
 * @ingroup DataTransfer
 */

class DTImportSpreadsheet extends DTImportCSV {

	public function __construct( $name = 'ImportSpreadsheet' ) {
		parent::__construct( $name );
	}

	protected function printForm() {
		if ( !class_exists( 'PhpOffice\PhpSpreadsheet\Spreadsheet' ) && !class_exists( 'PHPExcel' ) ) {
			return '<div class="error">You must have the PhpSpreadsheet or PHPExcel library installed to run this page.</div>';
		}

		$formText = DTUtils::printFileSelector( $this->getFiletype() );
		$formText .= DTUtils::printExistingPagesHandling();
		$formText .= DTUtils::printImportSummaryInput( $this->getFiletype() );
		$formText .= DTUtils::printSubmitButton();
		$text = "\t" . Xml::tags( 'form',
			[
				'enctype' => 'multipart/form-data',
				'action' => '',
				'method' => 'post'
			], $formText ) . "\n";
		return $text;
	}

	protected function importFromFile( $file, $encoding, &$pages ) {
		if ( $file === null ) {
			return wfMessage( 'emptyfile' )->text();
		}

		$metadata = stream_get_meta_data( $file );
		$filename = $metadata['uri'];

		if ( class_exists( 'PhpOffice\PhpSpreadsheet\Spreadsheet' ) ) {
			$spreadsheet = \PhpOffice\PhpSpreadsheet\IOFactory::load( $filename );
		} elseif ( class_exists( 'PHPExcel' ) ) {
			$spreadsheet = PHPExcel_IOFactory::load( $filename );
		}

		$table = $spreadsheet->getSheet( 0 )->toArray( '', true, true, false );

		return $this->importFromArray( $table, $pages );
	}

	protected function getFiletype() {
		return wfMessage( 'dt_filetype_spreadsheet' )->text();
	}
}
