<?php
/**
 * MediaWiki Extension
 * CreateRedirect
 * By Marco Zafra ("Digi")
 * Started: September 18, 2007
 *
 * Adds a special page that eases creation of redirects via a simple form.
 * Also adds a menu item to the sidebar as a shortcut.
 *
 * This program, CreateRedirect, is Copyright (C) 2007 Marco Zafra.
 * CreateRedirect is released under the GNU Lesser General Public License version 3.
 *
 * This file is part of CreateRedirect.
 * See the main file ("CreateRedirect.php") for additional information.
 *
 * CreateRedirect is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */

/* Body file:
 * The bulk of the routines are stored here.
 * This is where all the internal processing actually occurs.
 */

class SpecialCreateRedirect extends FormSpecialPage {

	/**
	 * @var int
	 * Number of edits made in onSubmit().
	 */
	protected $editCount = 0;

	/**
	 * Constructor -- set up the new special page
	 */
	public function __construct() {
		parent::__construct( 'CreateRedirect' );
	}

	/**
	 * @inheritDoc
	 */
	public function onSubmit( array $data ) {
		$redirectTarget = Title::newFromText( $data['crRedirectTitle'] );
		if ( !$redirectTarget ) {
			return Status::newFatal( 'createredirect-invalid-title', $data['crRedirectTitle'] );
		}

		$origTitles = array_filter( preg_split( "/[\r\n]+/", $data['crOrigTitle'] ) );

		$status = Status::newGood();
		foreach ( $origTitles as $pageName ) {
			$this->createOneRedirect( $pageName, $status, $redirectTarget, $data['crOverwrite'] );
		}

		if ( !$this->editCount && $status->isGood() ) {
			// Empty multiline field. Show the form again.
			return false;
		}

		return $status;
	}

	/**
	 * Create redirect from page A to page B.
	 *
	 * @param string $pageName Title of original page. (we are making a redirect to this page)
	 * @param Status $status Status object for placing errors into it.
	 * @param Title $redirectTarget Title of redirect page.
	 * @param bool $overwrite Whether to allow overwriting the existing page with the new redirect.
	 */
	protected function createOneRedirect( $pageName, $status,
		Title $redirectTarget, bool $overwrite
	) {
		$crOrigTitle = Title::newFromText( $pageName );
		if ( !$crOrigTitle ) {
			$status->fatal( 'createredirect-invalid-title', $pageName );
			return;
		}

		if ( $crOrigTitle->exists() && !$overwrite ) {
			// Creating this redirect would result in overwriting an existing page.
			// Warn about that, but provide "create anyway" button.
			$status->fatal( 'createredirect-would-overwrite', $crOrigTitle->getFullText() );
			return;
		}

		$contentHandler = new WikitextContentHandler();
		$content = $contentHandler->makeRedirectContent( $redirectTarget );

		$page = WikiPage::factory( $crOrigTitle );
		$saveStatus = $page->doEditContent( $content, '', EDIT_INTERNAL | EDIT_MINOR | EDIT_AUTOSUMMARY );

		if ( $saveStatus->isOK() ) {
			$linkRenderer = $this->getLinkRenderer();
			$this->getOutput()->addHTML( Xml::tags( 'div', [ 'class' => 'mw-createredirect-done' ],
				$this->msg( 'createredirect-redirect-done' )->rawParams(
					$linkRenderer->makeKnownLink( $crOrigTitle, null, [], [ 'redirect' => 'no' ] ),
					$linkRenderer->makeKnownLink( $redirectTarget )
				)->escaped()
			) );
			$this->editCount ++;
		}

		$status->merge( $saveStatus );
	}

	/**
	 * @inheritDoc
	 */
	protected function preText() {
		return $this->msg( 'createredirect-instructions' )->escaped();
	}

	/**
	 * @inheritDoc
	 */
	protected function getFormFields() {
		$request = $this->getRequest();
		$crTitle = Title::newFromText( $request->getText( 'crRedirectTitle',
			$request->getText( 'crTitle', $this->par )
		) );

		$crRedirectTitleDefault = '';
		$crOrigTitleDefault = '';

		if ( $crTitle ) {
			$crRedirectTitleDefault = $crTitle->getPrefixedText();
			if ( $crTitle->getNamespace() != NS_MAIN ) {
				$crOrigTitleDefault = $crTitle->getNsText() . ':';
			}
		}

		$origTitleType = 'text';
		if ( strpos( $request->getText( 'crOrigTitle' ), "\n" ) !== false ) {
			$origTitleType = 'textarea';
		}

		return [
			'crOrigTitle' => [
				'type' => $origTitleType,
				'name' => 'crOrigTitle',
				'id' => 'crOrigTitle',
				'size' => 60,
				'rows' => 4,
				'label-message' => 'createredirect-page-title',
				'default' => $crOrigTitleDefault,
				'required' => true
			],
			// TODO: non-javascript button id="crMultiLine"?
			'crRedirectTitle' => [
				'type' => 'title',
				'name' => 'crRedirectTitle',
				'id' => 'crRedirectTitle',
				'size' => 60,
				'label-message' => 'createredirect-redirect-to',
				'default' => $crRedirectTitleDefault,
				'required' => true,
				'autocomplete' => false
			],
			'crOverwrite' => [
				'type' => 'check',
				'label-message' => 'createredirect-overwrite'
			]
		];
	}

	/**
	 * @inheritDoc
	 */
	protected function alterForm( HTMLForm $form ) {
		$form->setId( 'redirectform' )
			->setSubmitTextMsg( 'createredirect-save' )
			->setWrapperLegend( false );

		$this->getOutput()->addModules( 'ext.createredirect' );
	}

	/**
	 * @inheritDoc
	 */
	protected function getDisplayFormat() {
		return 'ooui';
	}

	/**
	 * @inheritDoc
	 */
	protected function getGroupName() {
		return 'pagetools';
	}
}
