<?php

class CreatePageHooks {

	/**
	 * @param OutputPage &$out
	 */
	public static function addCreatePageModules( OutputPage &$out ) {
		$out->addModules( 'ext.createPage' );
	}

	/**
	 * Set up the #createpage parser function
	 *
	 * @param Parser $parser
	 */
	public static function setupParserFunction( Parser $parser ) {
		$parser->setFunctionHook( 'createpage', [ __CLASS__, 'createpageParserFunction' ],
			Parser::SFH_OBJECT_ARGS );
	}

	/**
	 * @param Parser &$parser
	 * @param PPFrame $frame
	 * @param array $args
	 * @return string
	 */
	public static function createpageParserFunction( Parser &$parser, PPFrame $frame, array $args ) {
		$html = Html::openElement( 'form', [
			'action' => SpecialPage::getTitleFor( 'CreatePageRedirect' )->getLocalURL(),
			'method' => 'post',
			'style' => 'display: inline',
			'class' => 'createpageform'
		] );

		$html .= Html::input(
			'pagename',
			array_key_exists( 1, $args ) ? trim( $frame->expand( $args[1] ) ) : '', 'text',
				[ 'class' => 'pagenameinput' ]
		);

		if ( array_key_exists( 0, $args ) ) {
			$namespaceText = trim( $frame->expand( $args[0] ) );
			$attribs = [];

			// Find the ID of this namespace, if there is one.
			$namespaceID = MWNamespace::getCanonicalIndex( strtolower( $namespaceText ) );
			if ( $namespaceID != 0 ) {
				$attribs['nsid'] = $namespaceID;
			}
			$html .= Html::hidden( 'pagens', $namespaceText, $attribs );
		}

		$html .= '&#160;';

		$html .= Html::input(
			'createpage',
			array_key_exists( 2, $args ) ? trim( $frame->expand( $args[2] ) ) :
					wfMessage( 'cp-create' )->text(), 'submit'
		);

		if ( array_key_exists( 3, $args ) ) {
			$html .= Html::hidden( 'preload', trim( $frame->expand( $args[3] ) ) );
		}

		$html .= '</form>';

		return $parser->insertStripItem( $html );
	}
}
