<?php

namespace MediaWiki\Extensions\Collection\Specials;

use CollectionSession;
use ErrorPageError;
use Html;
use MediaWiki\Extensions\Collection\BookRenderingMediator;
use MediaWiki\Logger\LoggerFactory;
use MediaWiki\MediaWikiServices;
use SpecialPage;
use TemplateParser;
use UnlistedSpecialPage;
use User;

/**
 * Special page to display a book as a single HTML page.
 */
class SpecialRenderBook extends UnlistedSpecialPage {

	public function __construct() {
		parent::__construct( 'RenderBook' );
	}

	/**
	 * A placeholder method for checking whether the current user is
	 * allowed to make use of the special page for testing purposes.
	 * Currently this defaults to false, until we implement proper
	 * permissioning (see T178289)
	 * @param User $user to check permissions for
	 * @return bool
	 */
	public function hasUserGotTestingPermission( $user ) {
		return false;
	}

	public function execute( $subPage ) {
		$key = null;
		if ( strpos( $subPage, '/' ) !== false ) {
			list( $subPage, $key ) = explode( '/', $subPage, 2 );
		}
		if ( !$this->hasUserGotTestingPermission( $this->getUser() ) ) {
			return;
		}

		$services = MediaWikiServices::getInstance();
		$restClientLogger = LoggerFactory::getInstance( 'http' );
		$restClient = BookRenderingMediator::getRestServiceClient(
			$this->getConfig(), $restClientLogger );
		$templateParser = new TemplateParser( __DIR__ . '/templates' );
		$templateParser->enableRecursivePartials( true );
		$mediator = new BookRenderingMediator( $services->getMainWANObjectCache(),
			$restClient, $templateParser );
		$mediator->setLogger( LoggerFactory::getInstance( 'collection' ) );

		switch ( $subPage ) {
			case 'clear':
				$services->getMainWANObjectCache()->delete( (string)$key );
				$this->getOutput()->redirect( $this->getPageTitle( 'test' )->getFullURL() );
				return;
			case 'raw':
			case 'skinned':
				$book = $mediator->getBookByCacheKey( (string)$key );
				if ( !$book ) {
					throw new ErrorPageError( 'coll-rendererror-title', 'coll-rendererror-no-cache' );
				}
				$mediator->outputBook( $book, $this->getOutput(), $subPage === 'raw' );
				return;

			case 'electron':
				$bookUrl = $this->getPageTitle( "skinned/$key" )->getFullURL();
				$mediator->outputPdf( $bookUrl, $this->getOutput() );
				return;

			case 'test':
				$key = $mediator->getBookFromCache( $this->getCollection() )['key'];
				$options = [
					'clear' => 'Clear cache',
					'raw' => 'HTML, raw',
					'skinned' => 'HTML, as wiki page',
					'electron' => 'PDF',
				];
				$html = Html::openElement( 'ul', [] );
				foreach ( $options as $mode => $description ) {
					$linkUrl = $this->getPageTitle( "$mode/$key" )->getFullURL();
					$link = Html::element( 'a', [ 'href' => $linkUrl ], $description );
					$html .= Html::rawElement( 'li', [], $link );
				}
				$html .= Html::closeElement( 'ul' );
				$this->getOutput()->addHTML( $html );
				return;

			default:
				// Should not be linked from anywhere, but let's do something more useful than
				// showing an empty page, just in case.
				$this->getOutput()->redirect( SpecialPage::getTitleFor( 'Book' )->getFullURL() );
				return;
		}
	}

	/**
	 * Returns the current collection.
	 * @return array[] Collection, as returned by CollectionSession::getCollection().
	 * @throws ErrorPageError When there is no active connection.
	 */
	private function getCollection() {
		if ( !CollectionSession::hasSession() ) {
			CollectionSession::startSession();
		}
		$collection = CollectionSession::getCollection();
		if ( !$collection || !$collection['enabled'] || !$collection['items'] ) {
			throw new ErrorPageError( 'coll-rendererror-title', 'coll-rendererror-no-session' );
		}
		return $collection;
	}

}
