<?php

class SpecialDeleteBatch extends SpecialPage {
	/**
	 * Constructor
	 */
	public function __construct() {
		parent::__construct( 'DeleteBatch', 'deletebatch' );
	}

	public function doesWrites() {
		return true;
	}

	/**
	 * Show the special page
	 *
	 * @param string|null $par Parameter passed to the page, if any
	 * @throws UserBlockedError
	 * @return void
	 */
	public function execute( $par ) {
		# Check permissions
		$user = $this->getUser();
		if ( !$user->isAllowed( 'deletebatch' ) ) {
			$this->displayRestrictionError();
			return;
		}

		# Show a message if the database is in read-only mode
		$this->checkReadOnly();

		# If user is blocked, they don't need to access this page
		if ( $user->getBlock() ) {
			throw new UserBlockedError( $user()->getBlock() );
		}

		$this->getOutput()->setPageTitle( $this->msg( 'deletebatch-title' ) );
		$cSF = new DeleteBatchForm( $par, $this->getPageTitle(), $this->getContext() );

		$request = $this->getRequest();
		$action = $request->getVal( 'action' );
		if ( $action == 'success' ) {
			/* do something */
		} elseif ( $request->wasPosted() && $action == 'submit' &&
			$user->matchEditToken( $request->getVal( 'wpEditToken' ) ) ) {
			$cSF->doSubmit();
		} else {
			$cSF->showForm();
		}
	}

	/**
	 * Adds a link to Special:DeleteBatch within the page
	 * Special:AdminLinks, if the 'AdminLinks' extension is defined
	 * @param AdminLinks &$admin_links_tree
	 * @return bool
	 */
	static function addToAdminLinks( &$admin_links_tree ) {
		$general_section = $admin_links_tree->getSection( wfMessage( 'adminlinks_general' )->text() );
		$extensions_row = $general_section->getRow( 'extensions' );
		if ( $extensions_row === null ) {
			$extensions_row = new ALRow( 'extensions' );
			$general_section->addRow( $extensions_row );
		}
		$extensions_row->addItem( ALItem::newFromSpecialPage( 'DeleteBatch' ) );
		return true;
	}

	/**
	 * @inheritDoc
	 */
	protected function getGroupName() {
		return 'pagetools';
	}
}
