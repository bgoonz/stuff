<?php

use MediaWiki\MediaWikiServices;

/* the form for deleting pages */
class DeleteBatchForm {
	public $mPage, $mFile, $mFileTemp;

	/**
	 * @var IContextSource
	 */
	protected $context;

	/**
	 * @var Title
	 */
	protected $title;

	/**
	 * @param string|null $par
	 * @param Title $title
	 * @param IContextSource $context
	 */
	function __construct( $par, $title, $context ) {
		$this->context = $context;
		$request = $context->getRequest();

		$this->title = $title;
		$this->mMode = $request->getText( 'wpMode' );
		$this->mPage = $request->getText( 'wpPage' );
		$this->mReason = $request->getText( 'wpReason' );
		$this->mFile = $request->getFileName( 'wpFile' );
		$this->mFileTemp = $request->getFileTempname( 'wpFile' );
	}

	/**
	 * Show the form for deleting pages
	 *
	 * @param string|null|false $errorMessage error message or null if there's no error
	 */
	function showForm( $errorMessage = false ) {
		$out = $this->context->getOutput();

		if ( $errorMessage ) {
			$out->setSubtitle( $this->context->msg( 'formerror' ) );
			$out->wrapWikiMsg( "<p class='error'>$1</p>\n", $errorMessage );
		}

		$out->addWikiMsg( 'deletebatch-help' );

		$tabindex = 1;

		$rows = [
			[
				Xml::label( $this->context->msg( 'deletebatch-as' )->text(), 'wpMode' ),
				$this->userSelect( 'wpMode', ++$tabindex )->getHtml()
			],
			[
				Xml::label( $this->context->msg( 'deletebatch-default-reason' )->text(), 'wpDefaultReason' ),
				Html::input( 'wpDefaultReason', '', 'text', [ 'id' => 'wpDefaultReason' ] )
			],
			[
				Xml::label( $this->context->msg( 'deletebatch-page' )->text(), 'wpPage' ),
				$this->pagelistInput( 'wpPage', ++$tabindex )
			],
			[
				$this->context->msg( 'deletebatch-or' )->parse(),
				'&#160;'
			],
			[
				Xml::label( $this->context->msg( 'deletebatch-caption' )->text(), 'wpFile' ),
				$this->fileInput( 'wpFile', ++$tabindex )
			],
			[
				'&#160;',
				$this->submitButton( 'wpdeletebatchSubmit', ++$tabindex )
			]
		];

		$form = Xml::openElement( 'form', [
			'name' => 'deletebatch',
			'enctype' => 'multipart/form-data',
			'method' => 'post',
			'action' => $this->title->getLocalURL( [ 'action' => 'submit' ] ),
		] );

		$form .= '<table>';

		foreach ( $rows as $row ) {
			list( $label, $input ) = $row;
			$form .= "<tr><td class='mw-label'>$label</td>";
			$form .= "<td class='mw-input'>$input</td></tr>";
		}

		$form .= '</table>';

		$form .= Html::hidden( 'title', $this->title );
		$form .= Html::hidden( 'wpEditToken', $this->context->getUser()->getEditToken() );
		$form .= '</form>';
		$out->addHTML( $form );
	}

	function userSelect( $name, $tabindex ) {
		$options = [];
		if ( $this->context->getUser()->isAllowed( 'deletebatch-spoof' ) ) {
			$options[$this->context->msg( 'deletebatch-select-script' )->text()] = 'script';
		}
		$options[$this->context->msg( 'deletebatch-select-yourself' )->text()] = 'you';

		$select = new XmlSelect( $name, $name );
		$select->setDefault( $this->mMode );
		$select->setAttribute( 'tabindex', $tabindex );
		$select->addOptions( $options );

		return $select;
	}

	function pagelistInput( $name, $tabindex ) {
		$params = [
			'tabindex' => $tabindex,
			'name' => $name,
			'id' => $name,
			'cols' => 40,
			'rows' => 10
		];

		return Xml::element( 'textarea', $params, $this->mPage, false );
	}

	function fileInput( $name, $tabindex ) {
		$params = [
			'type' => 'file',
			'tabindex' => $tabindex,
			'name' => $name,
			'id' => $name,
			'value' => $this->mFile
		];

		return Xml::element( 'input', $params );
	}

	function submitButton( $name, $tabindex ) {
		$params = [
			'tabindex' => $tabindex,
			'name' => $name,
		];

		return Xml::submitButton( $this->context->msg( 'deletebatch-delete' )->text(), $params );
	}

	/**
	 * wraps up multi deletes
	 * @param string $line
	 * @param string|null $filename
	 */
	function deleteBatch( $line = '', $filename = null ) {
		/* first, check the file if given */
		if ( $filename ) {
			/* both a file and a given page? not too much? */
			if ( $this->mPage != '' ) {
				$this->showForm( 'deletebatch-both-modes' );
				return;
			}
			if ( mime_content_type( $filename ) != 'text/plain' ) {
				$this->showForm( 'deletebatch-file-bad-format' );
				return;
			}
			$file = fopen( $filename, 'r' );
			if ( !$file ) {
				$this->showForm( 'deletebatch-file-missing' );
				return;
			}
		}

		/* switch user if necessary and if the user is allowed to do that */
		$user = $this->context->getUser();
		if ( $this->mMode == 'script' && $this->context->getUser()->isAllowed( 'deletebatch-spoof' ) ) {
			$username = wfMessage( 'deletebatch-system-username' )->text();
			$user = User::newFromName( $username );
			/* Create the user if necessary */
			if ( !$user->getId() ) {
				$user->addToDatabase();
			}
		}

		/* @todo run tests - run many tests */
		$dbw = wfGetDB( DB_PRIMARY );
		if ( $filename ) {
			/* if from filename, delete from filename */
			for ( $linenum = 1; !feof( $file ); $linenum++ ) {
				$line = trim( fgets( $file ) );
				if ( !$line ) {
					break;
				}
				/* explode and give me a reason
				   the file should contain only "page title|reason"\n lines
				   the rest is trash
				*/
				if ( strpos( $line, '|' ) !== -1 ) {
					$arr = explode( '|', $line );
				} else {
					$arr = [ $line ];
				}
				if ( !isset( $arr[1] ) ) {
					// Use default deletion reason
					$arr[1] = $this->context->getRequest()->getVal( 'wpDefaultReason', '' );
				}
				$this->deletePage( $arr[0], $user, $dbw, $arr[1], true, $linenum );
			}
		} else {
			/* run through text and do all like it should be */
			$lines = explode( "\n", $line );
			foreach ( $lines as $single_page ) {
				$single_page = trim( $single_page );
				/* explode and give me a reason */
				if ( strpos( $single_page, '|' ) !== -1 ) {
					$page_data = explode( '|', $single_page );
				} else {
					$page_data = [ $single_page ];
				}
				if ( !isset( $page_data[1] ) ) {
					// Use default deletion reason
					$page_data[1] = $this->context->getRequest()->getVal( 'wpDefaultReason', '' );
				}
				$this->deletePage( $page_data[0], $user, $dbw, $page_data[1] );
			}
		}

		$link_back = Linker::linkKnown(
			$this->title,
			$this->context->msg( 'deletebatch-link-back' )->escaped()
		);
		$this->context->getOutput()->addHTML( '<br /><b>' . $link_back . '</b>' );
	}

	/**
	 * Performs a single delete
	 *
	 * @param string $line Name of the page to be deleted
	 * @param User $user User performing the page deletions
	 * @param \Wikimedia\Rdbms\IDatabase $db
	 * @param string $reason User-supplied deletion reason
	 * @param bool $multi
	 * @param int $linenum Mostly for informational reasons
	 * @return bool
	 */
	private function deletePage( $line, $user, $db, $reason = '', $multi = false, $linenum = 0 ) {
		$page = Title::newFromText( $line );
		if ( $page === null ) {
			/* invalid title? */
			$this->context->getOutput()->addWikiMsg(
				'deletebatch-omitting-invalid', $line );
			return false;
		}

		// Check page existence
		$pageExists = $page->exists();

		// If it's a file, check file existence
		if ( $page->getNamespace() == NS_MEDIA ) {
			$page = Title::makeTitle( NS_FILE, $page->getDBkey() );
		}
		$localFile = null;
		$localFileExists = null;
		if ( $page->getNamespace() == NS_FILE ) {
			if ( method_exists( MediaWikiServices::class, 'getRepoGroup' ) ) {
				// MediaWiki 1.34+
				$localFile = MediaWikiServices::getInstance()->getRepoGroup()->getLocalRepo()
					->newFile( $page );
			} else {
				$localFile = wfLocalFile( $page );
			}
			$localFileExists = $localFile->exists();
		}

		if ( !$pageExists ) {
			/* no such page? */
			if ( !$localFileExists ) {
				/* no such file either? */
				$this->context->getOutput()->addWikiMsg(
					'deletebatch-omitting-nonexistent', $line );
				return false;
			} else {
				/* no such page, but there is such a file? */
				$this->context->getOutput()->addWikiMsg(
					'deletebatch-deleting-file-only', $line );
			}
		}

		$db->startAtomic( __METHOD__ );
		/* this stuff goes like articleFromTitle in Wiki.php */
		// Delete the page; in the case of a file, this would be the File: description page
		if ( $pageExists ) {
			$wikipage = WikiPage::factory( $page );
			/* what is the generic reason for page deletion?
			   something about the content, I guess...
			*/
			if ( version_compare( MW_VERSION, '1.35', '<' ) ) {
				$error = '';
				$wikipage->doDeleteArticle( $reason, false, null, null, $error, $user );
			} else {
				$wikipage->doDeleteArticleReal( $reason, $user );
			}
		}
		// Delete the actual file, if applicable
		if ( $localFileExists ) {
			// This deletes all versions of the file. This does not create a
			// log entry to note the file's deletion. It's assumed that the log
			// entry was already created when the file's description page was
			// deleted, and now we are just cleaning up after a deletion script
			// that didn't finish the job by deleting the file too.
			if ( method_exists( $localFile, 'deleteFile' ) ) {
				// MW 1.35+
				$localFile->deleteFile( $reason, $user );
			} else {
				$localFile->delete( $reason );
			}
		}
		$db->endAtomic( __METHOD__ );
		if ( $localFileExists ) {
			// Flush DBs in case of fragile file operations
			$lbFactory = MediaWikiServices::getInstance()->getDBLoadBalancerFactory();
			$lbFactory->commitMasterChanges( __METHOD__ );
		}

		return true;
	}

	/** on submit */
	function doSubmit() {
		$out = $this->context->getOutput();

		$out->setPageTitle( $this->context->msg( 'deletebatch-title' ) );
		if ( !$this->mPage && !$this->mFileTemp ) {
			$this->showForm( 'deletebatch-no-page' );
			return;
		}

		if ( $this->mPage ) {
			$out->setSubTitle( $this->context->msg( 'deletebatch-processing-from-form' ) );
		} else {
			$out->setSubTitle( $this->context->msg( 'deletebatch-processing-from-file' ) );
		}

		$this->deleteBatch( $this->mPage, $this->mFileTemp );
	}
}
