<?php
/**
 * Lets the user import an XML file to turn into wiki pages
 *
 * @author Yaron Koren
 */

class DTImportXML extends SpecialPage {

	/**
	 * Constructor
	 */
	public function __construct( $name = 'ImportXML' ) {
		parent::__construct( $name );
	}

	public function doesWrites() {
		return true;
	}

	function execute( $query ) {
		$this->setHeaders();

		if ( !$this->getUser()->isAllowed( 'datatransferimport' ) ) {
			throw new PermissionsError( 'datatransferimport' );
		}

		$request = $this->getRequest();
		if ( $request->getCheck( 'import_file' ) ) {
			$text = DTUtils::printImportingMessage();
			$uploadResult = ImportStreamSource::newFromUpload( "file_name" );
			$source = $uploadResult->value;
			$importSummary = $request->getVal( 'import_summary' );
			$forPagesThatExist = $request->getVal( 'pagesThatExist' );
			$text .= self::modifyPages( $source, $importSummary, $forPagesThatExist );
		} else {
			$formText = DTUtils::printFileSelector( $this->msg( 'dt_filetype_xml' )->text() );
			$formText .= DTUtils::printExistingPagesHandling();
			$formText .= DTUtils::printImportSummaryInput( $this->msg( 'dt_filetype_xml' )->text() );
			$formText .= DTUtils::printSubmitButton();
			$text = "\t" . Xml::tags( 'form',
				[
					'enctype' => 'multipart/form-data',
					'action' => '',
					'method' => 'post'
				], $formText ) . "\n";
		}

		$this->getOutput()->addHTML( $text );
	}

	function modifyPages( $source, $editSummary, $forPagesThatExist ) {
		if ( $source == null ) {
			return Html::element( 'div', [ 'class' => 'error' ], wfMessage( 'importnofile' )->text() );
		}

		$text = "";
		$xml_parser = new DTXMLParser( $source );
		$xml_parser->doParse();
		$jobs = [];
		$job_params = [];
		$job_params['user_id'] = $this->getUser()->getId();
		$job_params['edit_summary'] = $editSummary;
		$job_params['for_pages_that_exist'] = $forPagesThatExist;

		foreach ( $xml_parser->getPages() as $page ) {
			$title = Title::newFromText( $page->getName() );
			$job_params['text'] = $page->createText();
			$jobs[] = new DTImportJob( $title, $job_params );
		}
		JobQueueGroup::singleton()->push( $jobs );

		$text .= $this->msg( 'dt_import_success' )->numParams( count( $jobs ) )->params( 'XML' )
			->parseAsBlock();
		return $text;
	}
}
