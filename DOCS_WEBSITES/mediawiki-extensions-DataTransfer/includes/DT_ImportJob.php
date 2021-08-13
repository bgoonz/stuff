<?php

/**
 * Background job to import a page into the wiki, for use by Data Transfer
 *
 * @author Yaron Koren
 */
class DTImportJob extends Job {

	function __construct( $title, $params = '', $id = 0 ) {
		parent::__construct( 'dtImport', $title, $params, $id );
	}

	/**
	 * Run a dtImport job
	 * @return bool success
	 */
	function run() {
		if ( $this->title === null ) {
			$this->error = "dtImport: Invalid title";
			return false;
		}

		$wikiPage = WikiPage::factory( $this->title );
		if ( !$wikiPage ) {
			$this->error = 'dtImport: Wiki page not found "' . $this->title->getPrefixedDBkey() . '"';
			return false;
		}

		$for_pages_that_exist = $this->params['for_pages_that_exist'];
		if ( $for_pages_that_exist == 'skip' && $this->title->exists() ) {
			return true;
		}

		// Change global $wgUser variable to the one specified by
		// the job only for the extent of this import.
		global $wgUser;
		$actual_user = $wgUser;
		$wgUser = User::newFromId( $this->params['user_id'] );
		$text = $this->params['text'];
		if ( $this->title->exists() ) {
			if ( $for_pages_that_exist == 'append' ) {
				$existingText = ContentHandler::getContentText( $wikiPage->getContent() );
				$text = $existingText . "\n" . $text;
			} elseif ( $for_pages_that_exist == 'merge' ) {
				$existingPageStructure = DTPageStructure::newFromTitle( $this->title );
				$newPageStructure = new DTPageStructure;
				$newPageStructure->parsePageContents( $text );
				$existingPageStructure->mergeInPageStructure( $newPageStructure );
				$text = $existingPageStructure->toWikitext();
			}
			// otherwise, $for_pages_that_exist == 'overwrite'
		}
		$edit_summary = $this->params['edit_summary'];
		$new_content = new WikitextContent( $text );
		// It's strange that doEditContent() doesn't
		// automatically attach the 'bot' flag when the user
		// is a bot...
		if ( $wgUser->isAllowed( 'bot' ) ) {
			$flags = EDIT_FORCE_BOT;
		} else {
			$flags = 0;
		}
		$wikiPage->doEditContent( $new_content, $edit_summary, $flags );

		$wgUser = $actual_user;
		return true;
	}
}
