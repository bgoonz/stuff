<?php

class BiblioPlusHooks {

	static function onRegistration()  {
		// Time To Live; store var in the cache for CACHE_TTL seconds.
		define( 'CACHE_TTL', 3600 * 24 );
	}

	static function onBeforePageDisplay( &$out ) {
		$out->addModules( 'ext.biblioPlus.qtip.config' );
		return true;
	}

	static function biblioPlusSetup( Parser $parser ) {
		$biblio = new BiblioPlus;
		$parser->setHook( "cite", array( $biblio,'biblioRenderCite' ) );
		$parser->setHook( "nocite", array( $biblio, 'biblioRenderNocite' ) );
		$parser->setHook( "biblio", array( $biblio, 'biblioRenderBiblio' ) );
		return true;
	}
}
