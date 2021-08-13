<?php

use MediaWiki\MediaWikiServices;

/**
 * Base class for API that interacts with book rendering service
 */
abstract class CollectionRenderingAPI {
	/** @var self */
	private static $inst;

	/** @var string|false */
	protected $writer;

	/**
	 * @param string|false $writer Name of a writer, or false if none specified/needed.
	 *
	 * @return self
	 */
	public static function instance( $writer = false ) {
		if ( !self::$inst ) {
			self::$inst = new MWServeRenderingAPI( $writer );
		}
		return self::$inst;
	}

	/**
	 * @param string|false $writer Name of a writer, or false if none specified/needed.
	 */
	public function __construct( $writer ) {
		$this->writer = $writer;
	}

	/**
	 * When overridden in derived class, performs a request to the service
	 *
	 * @param string $command
	 * @param array $params
	 * @return CollectionAPIResult
	 */
	abstract protected function makeRequest( $command, array $params );

	/**
	 * @return string Expanded wgScriptPath to work around T39868
	 */
	private function getBaseUrl() {
		global $wgScriptPath;

		return wfExpandUrl( $wgScriptPath ?: '/', PROTO_CANONICAL );
	}

	/**
	 * Requests a collection to be rendered
	 * @param array $collection
	 *
	 * @return CollectionAPIResult
	 */
	public function render( array $collection ) {
		return $this->doRender( [
				'metabook' => $this->buildJsonCollection( $collection ),
			]
		);
	}

	/**
	 * Requests a queued collection to be immediately rendered
	 *
	 * @param string $collectionId
	 * @return CollectionAPIResult
	 */
	public function forceRender( $collectionId ) {
		return $this->doRender( [
				'collection_id' => $collectionId,
				'force_render' => true
			]
		);
	}

	protected function doRender( array $params ) {
		$params['base_url'] = $this->getBaseUrl();
		$params['script_extension'] = '.php';
		$params['language'] = MediaWikiServices::getInstance()->getContentLanguage()
			->getCode();
		return $this->makeRequest( 'render', $params );
	}

	/**
	 * Requests the service to create a collection package and send it to an external server
	 * e.g. for printing
	 *
	 * @param array $collection
	 * @param string $url
	 *
	 * @return CollectionAPIResult
	 */
	public function postZip( array $collection, $url ) {
		return $this->makeRequest( 'zip_post',
			[
				'metabook' => $this->buildJsonCollection( $collection ),
				'base_url' => $this->getBaseUrl(),
				'script_extension' => '.php',
				'pod_api_url' => $url,
			]
		);
	}

	/**
	 * Returns information about a collection's rendering status
	 *
	 * @param string $collectionId
	 * @return CollectionAPIResult
	 */
	public function getRenderStatus( $collectionId ) {
		return $this->makeRequest(
			'render_status',
			[
				'collection_id' => $collectionId,
			]
		);
	}

	/**
	 * Requests a download of rendered collection
	 *
	 * @param string $collectionId
	 * @return CollectionAPIResult
	 */
	public function download( $collectionId ) {
		return $this->makeRequest( 'download',
			[
				'collection_id' => $collectionId,
			]
		);
	}

	/**
	 * @return array
	 */
	protected function getLicenseInfos() {
		global $wgCollectionLicenseName, $wgCollectionLicenseURL, $wgRightsIcon;
		global $wgRightsPage, $wgRightsText, $wgRightsUrl;

		$licenseInfo = [
			'type' => 'license',
		];

		$fromMsg = wfMessage( 'coll-license_url' )->inContentLanguage();
		if ( !$fromMsg->isDisabled() ) {
			$licenseInfo['mw_license_url'] = $fromMsg->text();
			return [ $licenseInfo ];
		}

		if ( $wgCollectionLicenseName ) {
			$licenseInfo['name'] = $wgCollectionLicenseName;
		} else {
			$licenseInfo['name'] = wfMessage( 'coll-license' )->inContentLanguage()->text();
		}

		if ( $wgCollectionLicenseURL ) {
			$licenseInfo['mw_license_url'] = $wgCollectionLicenseURL;
		} else {
			$licenseInfo['mw_rights_icon'] = $wgRightsIcon;
			$licenseInfo['mw_rights_page'] = $wgRightsPage;
			$licenseInfo['mw_rights_url'] = $wgRightsUrl;
			$licenseInfo['mw_rights_text'] = $wgRightsText;
		}

		return [ $licenseInfo ];
	}

	/**
	 * @param array $collection
	 * @return string
	 */
	protected function buildJsonCollection( array $collection ) {
		$result = [
			'type' => 'collection',
			'licenses' => $this->getLicenseInfos()
		];

		if ( isset( $collection['title'] ) ) {
			$result['title'] = $collection['title'];
		}
		if ( isset( $collection['subtitle'] ) ) {
			$result['subtitle'] = $collection['subtitle'];
		}
		if ( isset( $collection['settings'] ) ) {
			foreach ( $collection['settings'] as $key => $val ) {
				$result[$key] = $val;
			}
			// compatibility with old mw-serve
			$result['settings'] = $collection['settings'];
		}

		$items = [];
		if ( isset( $collection['items'] ) ) {
			$currentChapter = null;
			foreach ( $collection['items'] as $item ) {
				if ( $item['type'] == 'article' ) {
					if ( $currentChapter === null ) {
						$items[] = $item;
					} else {
						$currentChapter['items'][] = $item;
					}
				} elseif ( $item['type'] == 'chapter' ) {
					if ( $currentChapter !== null ) {
						$items[] = $currentChapter;
					}
					$currentChapter = $item;
				}
			}
			if ( $currentChapter !== null ) {
				$items[] = $currentChapter;
			}
		}
		$result['items'] = $items;

		$result['wikis'] = [
			[
				'type' => 'wikiconf',
				'baseurl' => $this->getBaseUrl(),
				'script_extension' => '.php',
				'format' => 'nuwiki',
			],
		];

		// Prefer VRS configuration if present.
		$context = RequestContext::getMain();
		$vrs = $context->getConfig()->get( 'VirtualRestConfig' );
		if ( isset( $vrs['modules'] ) && isset( $vrs['modules']['restbase'] ) ) {
			// if restbase is available, use it
			$params = $vrs['modules']['restbase'];
			$domain = preg_replace(
				'/^(https?:\/\/)?([^\/:]+?)(\/|:\d+\/?)?$/',
				'$2',
				$params['domain']
			);
			$url = preg_replace(
				'#/?$#',
				'/' . $domain . '/v1/',
				$params['url']
			);
			for ( $i = 0, $count = count( $result['wikis'] ); $i < $count; $i++ ) {
				$result['wikis'][$i]['restbase1'] = $url;
			}
		} elseif ( isset( $vrs['modules'] ) && isset( $vrs['modules']['parsoid'] ) ) {
			// there's a global parsoid config, use it next
			$params = $vrs['modules']['parsoid'];
			$domain = preg_replace(
				'/^(https?:\/\/)?([^\/:]+?)(\/|:\d+\/?)?$/',
				'$2',
				$params['domain']
			);
			for ( $i = 0, $count = count( $result['wikis'] ); $i < $count; $i++ ) {
				$result['wikis'][$i]['parsoid'] = $params['url'];
				$result['wikis'][$i]['prefix'] = $params['prefix'];
				$result['wikis'][$i]['domain'] = $domain;
			}
		} elseif ( ExtensionRegistry::getInstance()->isLoaded( 'VisualEditor' ) ) {
			// fall back to Visual Editor configuration globals
			global $wgVisualEditorParsoidURL, $wgVisualEditorParsoidPrefix,
				$wgVisualEditorParsoidDomain, $wgVisualEditorRestbaseURL;
			for ( $i = 0, $count = count( $result['wikis'] ); $i < $count; $i++ ) {
				// Parsoid connection information
				if ( $wgVisualEditorParsoidURL ) {
					$result['wikis'][$i]['parsoid'] = $wgVisualEditorParsoidURL;
					$result['wikis'][$i]['prefix'] = $wgVisualEditorParsoidPrefix;
					$result['wikis'][$i]['domain'] = $wgVisualEditorParsoidDomain;
				}
				// RESTbase connection information
				if ( $wgVisualEditorRestbaseURL ) {
					// Strip the trailing "/page/html".
					$restbase1 = preg_replace( '|/page/html/?$|', '/', $wgVisualEditorRestbaseURL );
					$result['wikis'][$i]['restbase1'] = $restbase1;
				}
			}
		}

		return FormatJson::encode( $result );
	}
}
