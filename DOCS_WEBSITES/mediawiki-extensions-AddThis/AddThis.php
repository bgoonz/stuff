<?php

/**
 * Class file for the AddThis extension
 *
 * @addtogroup Extensions
 * @license GPL-2.0-only
 */
class AddThis {
	/**
	 * Register parser hook
	 *
	 * @param Parser &$parser
	 * @return bool
	 */
	public static function AddThisHeaderTag( &$parser ) {
		$parser->setHook( 'addthis', __CLASS__ . '::parserHook' );

		return true;
	}

	/**
	 * Parser hook for the <addthis /> tag extension.
	 *
	 * @param Parser $parser
	 * @return string
	 */
	public static function parserHook( $parser ) {
		global $wgAddThis, $wgAddThispubid, $wgAddThisHServ, $wgAddThisBackground, $wgAddThisBorder;

		# Localisation for "Share"
		$share = wfMessage( 'addthis' )->escaped();

		# Output AddThis widget
		$output = '<!-- AddThis Button BEGIN -->
			<div class="addthis_toolbox addthis_default_style" id="addthistoolbar" style="background:' .
			$wgAddThisBackground . '; border-color:' . $wgAddThisBorder . ';">
				<a href="//www.addthis.com/bookmark.php?v=250&amp;pubid=' . $wgAddThispubid .
			'" class="addthis_button_compact">&nbsp;' . $share .
			'</a><span class="addthis_separator">&nbsp;</span>';

		$output .= self::makeLinks( $wgAddThisHServ );
		$output .= '</div>
			<script type="text/javascript" src="//s7.addthis.com/js/250/addthis_widget.js#pubid=' .
			$wgAddThispubid . '"></script>';

		# Output AddThis Address Bar Sharing script, if enabled
		if ( $wgAddThis['addressbarsharing'] ) {
			$output .=
				'<script type="text/javascript">var addthis_config = {"data_track_addressbar":true};</script>';
		}

		return $output;
	}

	/**
	 * Function for article header toolbar
	 *
	 * @param Article &$article
	 * @param bool &$outputDone
	 * @param bool &$pcache
	 * @return bool|bool
	 */
	public static function AddThisHeader( &$article, &$outputDone, &$pcache ) {
		global $wgOut, $wgAddThispubid, $wgAddThis, $wgAddThisHeader, $wgAddThisMain,
			   $wgAddThisHServ, $wgAddThisBackground, $wgAddThisBorder;

		# Check if page is in content namespace and the setting to enable/disable
		# article header tooblar either on the main page or at all
		if ( !MWNamespace::isContent( $article->getTitle()->getNamespace() )
			|| !$wgAddThisHeader
			|| ( $article->getTitle()->equals( Title::newMainPage() ) && !$wgAddThisMain )
		) {
			return true;
		}

		# Localisation for "Share"
		$share = wfMessage( 'addthis' )->escaped();

		# Output AddThis widget
		$wgOut->addHTML( '<!-- AddThis Button BEGIN -->
			<div class="addthis_toolbox addthis_default_style" id="addthistoolbar" style="background:' .
			$wgAddThisBackground . '; border-color:' . $wgAddThisBorder . ';">
			<a href="//www.addthis.com/bookmark.php?v=250&amp;pubid=' . $wgAddThispubid .
			'" class="addthis_button_compact">&nbsp;' . $share .
			'</a><span class="addthis_separator">&nbsp;</span>' );

		$wgOut->addHTML( self::makeLinks( $wgAddThisHServ ) );

		$wgOut->addHTML( '</div>
			<script type="text/javascript" src="//s7.addthis.com/js/250/addthis_widget.js#pubid=' .
			$wgAddThispubid . '"></script>' );

		# Output AddThis Address Bar Sharing script, if enabled
		if ( $wgAddThis['addressbarsharing'] ) {
			$wgOut->addHTML(
				'<script type="text/javascript">var addthis_config = {"data_track_addressbar":true};</script>'
			);
		}

		return true;
	}

	/**
	 * Function for sidebar portlet
	 *
	 * @param Skin $skin
	 * @param Sidebar &$bar
	 * @return bool|array
	 */
	public static function AddThisSidebar( $skin, &$bar ) {
		global $wgOut, $wgAddThis, $wgAddThispubid, $wgAddThisSidebar, $wgAddThisSBServ;

		# Load css stylesheet
		$wgOut->addModuleStyles( 'ext.addThis' );

		# Check setting to enable/disable sidebar portlet
		if ( !$wgAddThisSidebar ) {
			return true;
		}

		# Output AddThis widget
		$bar['addthis'] = '<!-- AddThis Button BEGIN -->
			<div class="addthis_toolbox addthis_default_style" id="addthissidebar">';

		$bar['addthis'] .= self::makeLinks( $wgAddThisSBServ );

		$bar['addthis'] .= '</div>
			<script type="text/javascript" src="//s7.addthis.com/js/250/addthis_widget.js#pubid=' .
			$wgAddThispubid . '"></script>';

		# Output AddThis Address Bar Sharing script, if enabled
		if ( $wgAddThis['addressbarsharing'] ) {
			$bar['addthis'] .=
				'<script type="text/javascript">var addthis_config = {"data_track_addressbar":true};</script>';
		}

		return true;
	}

	/**
	 * Converts an array definition of links into HTML tags
	 *
	 * @param array $links
	 * @return string
	 */
	protected static function makeLinks( $links ) {
		$html = '';
		foreach ( $links as $link ) {
			$attribs = $link['attribs'] ?? '';

			$html .= '<a class="addthis_button_' . $link['service'] . '" ' . $attribs . '></a>';
		}

		return $html;
	}
}
