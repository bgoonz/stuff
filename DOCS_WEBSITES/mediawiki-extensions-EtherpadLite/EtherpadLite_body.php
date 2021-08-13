<?php
/**
 * EtherpadLite extension class
 *
 * @file
 * @ingroup Extensions
 *
 * @author Thomas Gries
 * @license GPL v2
 * @license MIT
 *
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 */

class EtherpadLite {
 	
	/**
	 * Tell the parser how to handle <eplite> elements
	 * https://www.mediawiki.org/wiki/Manual:Tag_extensions
	 * @param $parser Parser Object
	 */
	static function EtherpadLiteParserInit( $parser ) {

		global $wgEtherpadLitePadsOnThisPage;

		$wgEtherpadLitePadsOnThisPage = array();
		$parser->setHook( 'eplite', array( __CLASS__, 'EtherpadLiteRender' ) );

		return true;

	}

	static function EtherpadLiteRender( $input, array $args, Parser $parser, PPFrame $frame ) {
		global $wgEtherpadLiteDefaultPadUrl, $wgEtherpadLiteDefaultWidth, $wgEtherpadLiteDefaultHeight,
			$wgEtherpadLiteMonospacedFont, $wgEtherpadLiteShowControls, $wgEtherpadLiteShowLineNumbers,
			$wgEtherpadLiteShowChat, $wgEtherpadLiteShowAuthorColors, $wgEtherpadLiteUrlWhitelist,
			$wgEtherpadLitePadsOnThisPage;

		# check the user input

		# undefined id= attributes are replaced by id="" and result
		# in Etherpad Lite server showing its entry page - where you can open a new pad.
		$args['id']       = ( isset( $args['id'] ) ) ? $args['id'] : "";

		$args['height']   = ( isset( $args['height'] ) ) ? $args['height'] : $wgEtherpadLiteDefaultHeight;
		$args['width']    = ( isset( $args['width'] ) ) ? $args['width'] : $wgEtherpadLiteDefaultWidth;
	
		$useMonospaceFont = wfBoolToStr(
			( ( isset( $args['monospaced-font'] ) ) ? filter_var( $args['monospaced-font'], FILTER_VALIDATE_BOOLEAN ) : $wgEtherpadLiteMonospacedFont )
		);

		$showControls = wfBoolToStr(
			( ( isset( $args['show-controls'] ) ) ? filter_var( $args['show-controls'], FILTER_VALIDATE_BOOLEAN ) : $wgEtherpadLiteShowControls )
		);

		$showLineNumbers = wfBoolToStr(
			( ( isset( $args['show-linenumbers'] ) ) ? filter_var( $args['show-linenumbers'], FILTER_VALIDATE_BOOLEAN ) : $wgEtherpadLiteShowLineNumbers )
		);
			
		$showChat = wfBoolToStr(
			( ( isset( $args['show-chat'] ) ) ? filter_var( $args['show-chat'], FILTER_VALIDATE_BOOLEAN ) : $wgEtherpadLiteShowChat )
		);
	
		$noColors = wfBoolToStr(
			! ( ( isset( $args['show-colors'] ) ) ? filter_var( $args['show-colors'], FILTER_VALIDATE_BOOLEAN ) : $wgEtherpadLiteShowAuthorColors )
		);

		# src= is the pad server base url and is user input in <eplite src= > tag from MediaWiki page
		# id=  is the pad name (also known as pad id) and is user input in <eplite id=  > tag from MediaWiki page
	
		$src = ( isset( $args['src'] ) ) ? $args['src'] : $wgEtherpadLiteDefaultPadUrl;
		# Sanitizer::cleanUrl just does some normalization, somewhat not needed.
		$src = Sanitizer::cleanUrl( $src );
	
		switch ( true ) {
	
		# disallow because there is no whitelist or empty whitelist
		case ( !isset( $wgEtherpadLiteUrlWhitelist ) 
			|| !is_array( $wgEtherpadLiteUrlWhitelist )
			|| ( count( $wgEtherpadLiteUrlWhitelist ) === 0 ) ):
			return EtherpadLite::EtherpadLiteError( 'etherpadlite-empty-whitelist',
				$src
			);
			break;

		# allow
		case ( in_array( "*", $wgEtherpadLiteUrlWhitelist ) ):
		case ( in_array( $src, $wgEtherpadLiteUrlWhitelist ) ):
			break;

		# otherwise disallow
		case ( !in_array( $src, $wgEtherpadLiteUrlWhitelist ) ):
		default:
			$listOfAllowed = $parser->getFunctionLang()->listToText( $wgEtherpadLiteUrlWhitelist );
			$numberAllowed = $parser->getFunctionLang()->formatNum( count( $wgEtherpadLiteUrlWhitelist ) );
			return EtherpadLite::EtherpadLiteError( 'etherpadlite-url-is-not-whitelisted',
				array( $src, $listOfAllowed, $numberAllowed )
			);
		}

		# Append the id to end of url. Strip off trailing / if present before appending one.
		$url = preg_replace( "/\/+$/", "", $src ) . "/" . $args['id'];

		# prevent multiple iframes and rendering of a same pad on a page
		# show an error message if a pad is found more than once on a page.
		#
		# the empty id however may be used more than once as the empty id invokes an
		# Etherpad Lite server showing its "create a pad" html page.

		if ( !in_array( $url, $wgEtherpadLitePadsOnThisPage ) ) {
			$wgEtherpadLitePadsOnThisPage[] = $url;
		} elseif ( $args['id'] !== "" ) {
			return EtherpadLite::EtherpadLiteError( 'etherpadlite-pad-used-more-than-once', $url );
		}

	
		# preset the pad username from MediaWiki username or IP
		# this not strict, as the pad username can be overwritten in the pad
		#
		# attention: 
		# 1. we must render the page for each visiting user to get their username
		# 2. the pad username can currently be overwritten when editing the pad
		#
		# Future todo might be to make the adding of username optional
		# since disabling of cache has a significant performance impact
		# on larger sites.

		$parser->getOutput()->updateCacheExpiry( 0 );

		# Etherpad Lite requires rawurlencoded userName, thus we must add it manually
	
		$url = wfAppendQuery( $url, array(
				"showControls"     => $showControls,
				"showChat"         => $showChat,
				"showLineNumbers"  => $showLineNumbers,
				"useMonospaceFont" => $useMonospaceFont,
				"noColors"         => $noColors,
			)
		) . "&userName=" . rawurlencode( $parser->getUser()->getName() );

		# @todo One could potentially stuff other css in the width argument
		# since ; isn't checked for. Since overall css is checked for allowed
		# rules, this isn't super big deal.
		$iframeAttributes = array(
			"style" => "width:" . $args['width'] . ";" .
				"height:" . $args['height'],
			"class" => "eplite-iframe-" . $args['id'] ,
			"src"   => Sanitizer::cleanUrl( $url ),
		);

		$sanitizedAttributes = Sanitizer::validateAttributes( $iframeAttributes, array (
			"style" => true,
			"class" => true,
			"src" => true
		) );

		if ( !isset( $sanitizedAttributes['src'] ) ) {
			// The Sanitizer decided that the src attribute was no good.
			// (aka used a protocol that isn't in the whitelist)
			return EtherpadLite::EtherpadLiteError( 'etherpadlite-invalid-pad-url', $src );	
		}

		$output = Html::rawElement(
			'iframe', 
			$sanitizedAttributes
		);

		$parser->addTrackingCategory( 'etherpadlite-tracking-category' );
		return $output;
	}

	/**
	* Output an error message, all wraped up nicely.
	* @param String $errorMessageName The system message that this error is
	* @param String|Array $param Error parameter (or parameters)
	* @return String Html that is the error.
	*/
	private static function EtherpadLiteError( $errorMessageName, $param ) {

		// Anything from a parser tag should use Content lang for message,
		// since the cache doesn't vary by user language: use inContentLanguage
		// The ->parse() part makes everything safe from an escaping standpoint.

		return Html::rawElement( 'span', array( 'class' => 'error' ),
			"Extension:EtherpadLite: -- Error: " . wfMessage( $errorMessageName )->inContentLanguage()->params( $param )->parse()
		);

	}

} /* class EtherpadLite */
