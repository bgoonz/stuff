<?php

class SpecialEmailCapture extends SpecialPage {
	public function __construct() {
		parent::__construct( 'EmailCapture', 'emailcapture' );
	}

	public function doesWrites() {
		return true;
	}

	public function execute( $par ) {
		$this->setHeaders();

		$code = $this->getRequest()->getVal( 'verify' );
		if ( $code !== null ) {
			$dbw = wfGetDB( DB_MASTER );
			$row = $dbw->selectRow(
				'email_capture',
				[ 'ec_verified' ],
				[ 'ec_code' => $code ],
				__METHOD__
			);
			if ( $row && !$row->ec_verified ) {
				$dbw->update(
					'email_capture',
					[ 'ec_verified' => 1 ],
					[ 'ec_code' => $code ],
					__METHOD__
				);
				if ( $dbw->affectedRows() ) {
					$this->getOutput()->addWikiMsg( 'emailcapture-success' );
				} else {
					$this->getOutput()->addWikiMsg( 'emailcapture-failure' );
				}
			} elseif ( $row && $row->ec_verified ) {
				$this->getOutput()->addWikiMsg( 'emailcapture-already-confirmed' );
			} else {
				$this->getOutput()->addWikiMsg( 'emailcapture-invalid-code' );
			}
		} else {
			// Show simple form for submitting verification code
			$o = Html::openElement( 'form', [
				'action' => $this->getPageTitle()->getFullUrl(),
				'method' => 'post'
			] );
			$o .= Html::element( 'p', [], $this->msg( 'emailcapture-instructions' )->text() );
			$o .= Html::openElement( 'blockquote' );
			$o .= Html::element( 'label', [ 'for' => 'emailcapture-verify' ],
				$this->msg( 'emailcapture-verify' )->text() ) . ' ';
			$o .= Html::input( 'verify', '', 'text',
				[ 'id' => 'emailcapture-verify', 'size' => 32 ] ) . ' ';
			$o .= Html::input( 'submit', $this->msg( 'emailcapture-submit' )->text(), 'submit' );
			$o .= Html::closeElement( 'blockquote' );
			$o .= Html::closeElement( 'form' );
			$this->getOutput()->addHtml( $o );
		}
	}
}
