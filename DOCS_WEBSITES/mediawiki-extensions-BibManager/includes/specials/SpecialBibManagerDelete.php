<?php

class SpecialBibManagerDelete extends UnlistedSpecialPage {

	public function __construct () {
		parent::__construct( 'BibManagerDelete' , 'bibmanagerdelete');
	}

	/**
	 * Main method of SpecialPage. Called by Framework.
	 * @global WebRequest $wgRequest Current MediaWiki WebRequest object
	 * @global OutputPage $wgOut Current MediaWiki OutputPage object
	 * @param mixed $par string or false, provided by Framework
	 */
	public function execute ( $par ) {
		global $wgOut;
		if (!$this->getUser()->isAllowed('bibmanagerdelete')){
			$wgOut->showErrorPage('badaccess','badaccess-group0');
			return true;
		}

		global $wgRequest;
		$this->setHeaders();
		$wgOut->setPageTitle( $this->msg( 'heading_delete' ) );
		$deleteSubmit = $wgRequest->getBool( 'bm_delete' );

		$citation = $wgRequest->getVal( 'bm_bibtexCitation', '' );
		if ( empty( $citation ) ) {
			$wgOut->addHtml( $this->msg( 'bm_error_not-found', $citation )->escaped() );
			return;
		}

		$entry = BibManagerRepository::singleton()->getBibEntryByCitation( $citation );
		if ( empty( $entry ) ) {
			$wgOut->addHtml( $this->msg( 'bm_error_not-found', $citation )->escaped() );
		}
		$entryType = $entry['bm_bibtexEntryType'];
		$typeDefs = BibManagerFieldsList::getTypeDefinitions();
		$entryFields = array_merge( // TODO RBV (17.12.11 15:01): encapsulte in BibManagerFieldsList
		    $typeDefs[$entryType]['required'], $typeDefs[$entryType]['optional']
		);
		if ( !$deleteSubmit ) {
			$wgOut->addHTML( $this->msg( 'bm_delete_confirm-delete', $citation )->escaped() );
			$wgOut->addHTML( '<hr />' );

			$table = array ( );
			$table[] = '<table id="bm_delete" class="wikitable" style="width:100%">';
			// Give grep a chance to find the usages:
			// bm_address, bm_annote, bm_author, bm_booktitle, bm_chapter, bm_crossref, bm_edition,
			// bm_editor, bm_eprint, bm_howpublished, bm_institution, bm_journal, bm_key, bm_month,
			// bm_note, bm_number, bm_organization, bm_pages, bm_publisher, bm_school, bm_series,
			// bm_title, bm_type, bm_url, bm_volume, bm_year
			foreach ( $entryFields as $fieldName ) {
				$table[] = '  <tr><th style="width:150px">' . $this->msg( 'bm_' . $fieldName )->escaped() . '</th><td>' . $entry['bm_' . $fieldName] . '</td></tr>';
			}
			$table[] = '</table>';
			$wgOut->addHTML( implode( "\n", $table ) );
		}
		$formDescriptor = array (
		    'bm_delete' => array (
			'class' => 'HTMLHiddenField',
			'default' => true,
		    ),
		    'bm_bibtexCitation' => array (
			'class' => 'HTMLHiddenField',
			'default' => $citation,
		    )
		);

		$htmlForm = HTMLForm::factory( 'ooui', $formDescriptor, $this->getContext(), 'bm_delete' );
		$htmlForm
			->setSubmitText( $this->msg( 'bm_delete_submit' )->text() )
			->setSubmitCallback( array ( $this, 'formSubmit' ) )
			->setSubmitDestructive();
		//TODO: Add cancel button that returns user to the place he came from. I.e. filtered overview

		$wgOut->addHTML( '<div id="bm_form">' );
		$htmlForm->show();
		$wgOut->addHTML( '</div>' );
	}

	/**
	 * Submit callback for delete form
	 * @global OutputPage $wgOut
	 * @param array $formData
	 * @return boolean
	 */
	public function formSubmit ( $formData ) {
		global $wgOut;
		if ( empty( $formData['bm_delete'] ) || $formData['bm_delete'] !== true )
			return false;

		$result = BibManagerRepository::singleton()->deleteBibEntry( $formData['bm_bibtexCitation'] );

		if ( $result === true ) {
			$wgOut->addHtml( $this->msg( 'bm_success_save-complete' )->escaped() );
			$wgOut->addHtml(
				$this->msg(
					'bm_success_link-to-list',
					SpecialPage::getTitleFor( "BibManagerList" )->getLocalURL()
				)->escaped()
			);
		}
		return $result;
	}

	protected function getGroupName() {
		return 'bibmanager';
	}
}
