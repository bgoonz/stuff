<?php

class SpecialBibManagerExport extends UnlistedSpecialPage {

	public function __construct () {
		parent::__construct( 'BibManagerExport' );
	}

	/**
	 * Main method of SpecialPage. Called by framework.
	 * @global WebRequest $wgRequest Current MediaWiki WebRequest object
	 * @global OutputPage $wgOut Current MediaWiki OutputPage object
	 * @param mixed $par string or false, provided by Framework
	 */
	public function execute ( $par ) {
		global $wgOut, $wgRequest;
		// TODO RBV (17.12.11 16:46): This is very similar to the BibManagerEdit SpecialPage --> encapsulate logic

		$givenValues = $wgRequest->getArray( 'cit', array() );
		$out = '';
		foreach ( $givenValues as $citation ) {
			$citation = str_replace( '__dot__', '.', $citation);
			$entry = BibManagerRepository::singleton()->getBibEntryByCitation( $citation );
			if ( empty( $entry ) ) {
				continue;
			}
			$lines = array();
			$lines['entryType'] = $entry['bm_bibtexEntryType'];
			$lines['cite'] = $entry['bm_bibtexCitation'];
			$typeDefs = BibManagerFieldsList::getTypeDefinitions();
			$entryFields = array_merge( // TODO RBV (17.12.11 15:01): encapsulte in BibManagerFieldsList
				$typeDefs[$lines['entryType']]['required'], $typeDefs[$lines['entryType']]['optional']
			);

			foreach ($entryFields as $fieldName){
				$value = $entry['bm_' . $fieldName];
				if ( empty( $value ) ) continue;
				$lines[$fieldName] = $value;
			}

			$bibtex = new Structures_BibTex();
			$bibtex->setOption("extractAuthors", false);
			$bibtex->addEntry($lines);
			$out .= $bibtex->bibTex();
		}

		$wgOut->disable();
		wfResetOutputBuffers();

		$filename = 'export-' . date( 'Y-m-d_H-i-s' ) . '.bib';
		$wgRequest->response()->header( "Content-type: application/x-bibtex; charset=utf-8" );
		$wgRequest->response()->header( "Content-disposition: attachment;filename={$filename}" );


		echo $out;
	}

	protected function getGroupName() {
		return 'bibmanager';
	}
}