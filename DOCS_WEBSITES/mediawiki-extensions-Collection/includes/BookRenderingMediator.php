<?php

namespace MediaWiki\Extensions\Collection;

use Config;
use DerivativeContext;
use ErrorPageError;
use Exception;
use MediaWiki\MediaWikiServices;
use OutputPage;
use Psr\Log\LoggerAwareInterface;
use Psr\Log\LoggerAwareTrait;
use Psr\Log\LoggerInterface;
use Psr\Log\NullLogger;
use RequestContext;
use RestbaseVirtualRESTService;
use SkinApi;
use Status;
use TemplateParser;
use VirtualRESTServiceClient;
use WANObjectCache;

/**
 * A mediator class to tie together various aspects of book rendering.
 */
class BookRenderingMediator implements LoggerAwareInterface {

	use LoggerAwareTrait;

	/** @var WANObjectCache */
	private $htmlCache;

	/** @var VirtualRESTServiceClient */
	private $restServiceClient;

	/** @var TemplateParser */
	private $templateParser;

	public function __construct(
		WANObjectCache $bookCache,
		VirtualRESTServiceClient $restServiceClient,
		TemplateParser $templateParser
	) {
		$this->htmlCache = $bookCache;
		$this->restServiceClient = $restServiceClient;
		$this->templateParser = $templateParser;
		$this->logger = new NullLogger();
	}

	/**
	 * Render the HTML source and metadata for the book.
	 * @param array[] $collection Collection data, as returned by CollectionSession::getCollection().
	 * @return mixed[] associative array with:
	 *    - 'html': HTML, not including <body> or anything outside that.
	 *    - 'modules', 'modulestyles', 'jsconfigvars': ResourceLoader data
	 * @throws ErrorPageError When one of the internal API calls fails.
	 */
	public function getBook( array $collection ) {
		$dataProvider = new DataProvider( $this->restServiceClient );
		$dataProvider->setLogger( $this->logger );
		$bookRenderer = new BookRenderer( $this->templateParser );

		$status = $dataProvider->fetchPages( $collection );
		if ( $status->isOK() ) {
			$pages = $status->getValue();
		} else {
			$message = Status::wrap( $status )->getMessage( false, 'coll-rendererror-fetch-wrapper' );
			throw new ErrorPageError( 'coll-rendererror-title', $message );
		}
		$status = $dataProvider->fetchMetadata( array_keys( $pages ) );
		if ( $status->isOK() ) {
			$metadata = $status->getValue();
		} else {
			throw new ErrorPageError( 'coll-rendererror-title', Status::wrap( $status )->getMessage() );
		}
		$html = $bookRenderer->renderBook( $collection, $pages, $metadata );

		$fields = [ 'html', 'modules', 'modulestyles', 'jsconfigvars' ];
		return array_intersect_key( [ 'html' => $html ] + $metadata, array_fill_keys( $fields, null ) );
	}

	/**
	 * Get the HTML source and metadata for the book, from cache or by rendering it. Cache it if
	 * it wasn't cached before.
	 * @param array[] $collection Collection data, as returned by CollectionSession::getCollection().
	 * @return mixed[] See getBook(); also there will be a 'key' field with the WAN cache key.
	 */
	public function getBookFromCache( array $collection ) {
		// ignore irrelevant parts of the book definition
		$keyBase = array_filter( $collection, static function ( $key ) {
			return in_array( $key, [ 'title', 'subtitle', 'items' ], true );
		}, ARRAY_FILTER_USE_KEY );
		$keyBase['items'] = array_map( static function ( $item ) {
			return array_filter( $item, static function ( $key ) {
				return in_array( $key, [ 'type', 'title', 'revision' ], true );
			}, ARRAY_FILTER_USE_KEY );
		}, $keyBase['items'] );
		$key = $this->htmlCache->makeGlobalKey(
			'collection-book',
			md5( json_encode( $keyBase ) )
		);

		$book = $this->htmlCache->get( $key );
		if ( !$book ) {
			$book = $this->getBook( $collection );
			$book['key'] = $key;
			$this->htmlCache->set( $key, $book, 300 );
		}
		return $book;
	}

	/**
	 * @param string $key WAN cache key provided by some past getBook[FromCache] call.
	 * @return mixed[]|false Book data (see getBookFromCache()) or false if the cache key wasn't valid.
	 */
	public function getBookByCacheKey( $key ) {
		return $this->htmlCache->get( $key );
	}

	/**
	 * Append a book to the output.
	 * @param array $book See getBookFromCache().
	 * @param OutputPage $out Output to send to.
	 * @param bool $raw If true, set the output page to raw (no skin).
	 */
	public function outputBook( array $book, OutputPage $out, $raw = true ) {
		if ( $raw ) {
			$context = new DerivativeContext( $out->getContext() );
			$context->setSkin( new SkinApi() );
			$out->setContext( $context );
		}

		$out->addModuleStyles( [ 'ext.collection.offline' ] );
		$out->addModules( $book['modules'] );
		$out->addModuleStyles( $book['modulestyles'] );
		$out->addJsConfigVars( $book['jsconfigvars'] );
		$out->addHTML( $book['html'] );
	}

	/**
	 * Render a book with Electron and return the response.
	 * @param string $publicBookUrl A URL displaying the book. It cannot depend on cookies.
	 * @param OutputPage $out Output to send to.
	 * @throws ErrorPageError
	 */
	public function outputPdf( $publicBookUrl, OutputPage $out ) {
		// Collection have some settings such as pag	e size which could be passed to
		// Electron, but they don't seem to be exposed, and we ignore at least columnt
		// count anyway, so let's ignore the rest as well.
		$electronResponse = $this->restServiceClient->run( [
			'method' => 'GET',
			'url' => '/electron/pdf?' . wfArrayToCgi( [ 'url' => $publicBookUrl ] ),
		] );
		$errorMsg = null;
		if ( $electronResponse['error'] !== '' ) {
			$message = $out->msg( 'coll-rendererror-pdf', $electronResponse['error'] );
			throw new ErrorPageError( 'coll-rendererror-title', $message );
		} elseif ( $electronResponse['code'] !== 200 ) {
			$errorMsg = $electronResponse['code'];
			if ( $electronResponse['reason'] !== '' ) {
				$errorMsg .= ' ' . $electronResponse['reason'];
			}
			$message = $out->msg( 'coll-rendererror-pdf', $errorMsg );
			throw new ErrorPageError( 'coll-rendererror-title', $message );
		}
		$newPdfContent = $electronResponse['body'];
		$out->disable();
		$mediawikiResponse = $out->getContext()->getRequest()->response();
		$mediawikiResponse->statusHeader( 200 );
		$mediawikiResponse->header( 'Content-Type: application/pdf' );
		$mediawikiResponse->header( "Content-Disposition: attachment; filename='book.pdf'" );
		echo $newPdfContent;
	}

	/**
	 * Get a REST client instance.
	 * @param Config $config Site configuration
	 * @param LoggerInterface $logger
	 * @return VirtualRESTServiceClient
	 * @throws Exception When $wgVirtualRestConfig is not properly configured.
	 */
	public static function getRestServiceClient( Config $config, LoggerInterface $logger ) {
		// This method doesn't really belong to a mediator class; ideally we would just call
		// MediaWikiServices::getVirtualRESTServiceClient(), but that seems to
		// expect a completely different structure for $wgVirtualRestConfig to
		// what is actually there in either WMF production or Vagrant. See T175224.

		$client = new VirtualRESTServiceClient(
			MediaWikiServices::getInstance()->getHttpRequestFactory()->createMultiClient( [
				'logger' => $logger,
			] )
		);
		$config = $config->get( 'VirtualRestConfig' );
		$modules = [
			'restbase' => RestbaseVirtualRESTService::class,
			'electron' => ElectronVirtualRestService::class,
		];
		foreach ( $modules as $module => $class ) {
			if ( !isset( $config['modules'][$module] ) || !is_array( $config['modules'][$module] ) ) {
				throw new Exception( "VirtualRESTService module $module is not configured propely" );
			}
			$params = $config['modules'][$module];
			if ( isset( $config['global'] ) ) {
				$params += $config['global'];
			}
			if ( $params['forwardCookies'] ) {
				$params['forwardCookies'] =
					RequestContext::getMain()->getRequest()->getHeader( 'Cookie' );
			}
			$client->mount( "/$module/", [ 'class' => $class, 'config' => $params ] );
		}
		return $client;
	}

}
