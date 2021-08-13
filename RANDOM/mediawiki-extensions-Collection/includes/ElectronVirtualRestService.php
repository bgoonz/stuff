<?php

namespace MediaWiki\Extensions\Collection;

use Closure;
use VirtualRESTService;

/**
 * Virtual REST service for Electron
 */
class ElectronVirtualRestService extends VirtualRESTService {
	/**
	 * Example Electron requests:
	 *  GET /pdf/{$URL}
	 *  POST /pdf
	 *    (with the HTML as the POST body)
	 *
	 * @param array $params Key/value map
	 *   - url            : Electron server URL
	 *   - options        : Electron options, see
	 *     https://github.com/wikimedia/mediawiki-services-electron-render#get-pdf---render-pdf
	 *   - timeout        : Request timeout (optional)
	 *   - HTTPProxy      : Use HTTP proxy (optional)
	 */
	public function __construct( array $params ) {
		// set up defaults and merge them with the given params
		$mparams = array_merge( [
			'name' => 'electron',
			'url' => 'http://localhost:3000/',
			'options' => [],
			'forwardCookies' => false,
			'timeout' => null,
			'HTTPProxy' => null,
		], $params );

		$mparams['options'] = array_merge(
			[ 'accessKey' => 'secret' ],
			(array)$mparams['options']
		);

		$mparams['url'] = (string)$mparams['url'];
		// Ensure that the url parameter has a trailing slash.
		if ( substr( $mparams['url'], -1 ) !== '/' ) {
			$mparams['url'] .= '/';
		}

		parent::__construct( $mparams );
	}

	/**
	 * @inheritDoc
	 * @phan-param array[] $reqs
	 */
	public function onRequests( array $reqs, Closure $idGeneratorFunc ) {
		$result = [];
		foreach ( $reqs as $key => $req ) {
			$req['url'] = $this->params['url'] . $req['url'];
			if ( $this->params['options'] ) {
				$parts = wfParseUrl( $req['url'] );
				$query = isset( $parts['query'] ) ? wfCgiToArray( $parts['query'] ) : [];
				$query += $this->params['options'];
				$parts['query'] = wfArrayToCgi( $query );
				$req['url'] = wfAssembleUrl( $parts );
			}
			if ( $this->params['timeout'] != null ) {
				$req['reqTimeout'] = $this->params['timeout'];
			}
			if ( $this->params['HTTPProxy'] ) {
				$req['proxy'] = $this->params['HTTPProxy'];
			}
			$result[$key] = $req;
		}
		return $result;
	}
}
