<?php

use MediaWiki\MediaWikiServices;

class BibManagerHooks {

	/**
	 * Default MW-Importer (for MW <=1.16 and MW >= 1.17)
	 * @param Updater $updater
	 * @return boolean true if alright
	 */
	public static function onLoadExtensionSchemaUpdates ( $updater = null ) {
		$updater->addExtensionUpdate(
			array (
				'addTable',
				'bibmanager',
				dirname( __DIR__ ) . '/maintenance/bibmanager.sql',
				true
			)
		);
		return true;
	}

	/**
	 *
	 * @param OutputPage $out
	 * @param Skin $skin
	 * @return bool Always true to keep hook running
	 */
	public static function onBeforePageDisplay ( &$out, &$skin ) {
		if ( $out->getTitle()->equals( SpecialPage::getTitleFor( 'BibManagerList' ) ) ) {
			$out->addModules( 'ext.bibManager.List');
		}
		return true;
	}

	/**
	 * Init-method for the BibManager-Hooks
	 * @param Parser $parser
	 * @return bool Always true to keep hooks running
	 */
	public static function onParserFirstCallInit ( &$parser ) {
		$parser->setHook( 'bib', 'BibManagerHooks::onBibTag' );
		$parser->setHook( 'biblist', 'BibManagerHooks::onBiblistTag' );
		$parser->setHook( 'bibprint', 'BibManagerHooks::onBibprintTag' );
		return true;
	}

	/**
	 * Method for the BibManager-Tag <bib id='citation' />
	 * @param string $input
	 * @param array $args
	 * @param Parser $parser
	 * @param PPFrame $frame
	 * @return String the link to the Bib-Cit entered by id
	 */
	public static function onBibTag ( $input, $args, $parser, $frame ) {
		global $wgBibManagerCitationArticleNamespace;
		$parser->getOutput()->updateCacheExpiry( 0 );
		if ( !isset( $args['id'] ) ) {
			return '[' . wfMessage( 'bm_missing-id' )->escaped() . ']';
		}
		$parser->getOutput()->addModuleStyles( 'ext.bibManager.styles' );

		$entry = BibManagerRepository::singleton()
			->getBibEntryByCitation( $args['id'] );

		$sTooltip = '';
		$sLink = '';
		if ( empty( $entry ) ) {
			$spTitle = SpecialPage::getTitleFor( 'BibManagerCreate' );
			$sLink = $parser->getLinkRenderer()->makeBrokenLink(
				$spTitle,
				$args['id'],
				array( 'class' => 'new' ),
				array ( 'bm_bibtexCitation' => $args['id'] )
			);
			$sTooltip = '<span>' . wfMessage('bm_error_not-existing')->escaped();
			if ($parser->getUser()->isAllowed('bibmanagercreate')){
				$sLinkToEdit = SpecialPage::getTitleFor( 'BibManagerCreate' )
					->getLocalURL(
						array (
							'bm_bibtexCitation' => $args['id']
						)
					);
				$sTooltip .= Html::element(
					"a",
					array(
						"href" => $sLinkToEdit
					),
					wfMessage( 'bm_tag_click_to_create' )->text()
				);
			}
			$sTooltip .= '</span>';
		} else {
			$oCitationTitle = Title::newFromText(
				$args['id'],
				$wgBibManagerCitationArticleNamespace
			);
			$sLink = $parser->getLinkRenderer()->makeLink(
				$oCitationTitle,
				$args['id'],
				array ( 'title' => '' )
			);
			$sTooltip = self::getTooltip( $entry, $args, $parser->getUser() );
		}
		return '<span class="bibmanager-citation">[' . $sLink . ']' . $sTooltip . '</span>';
	}

	public static function getTooltip ( $entry, $args, User $user ) {
		$typeDefs = BibManagerFieldsList::getTypeDefinitions();
		$entryTypeFields = array_merge(
			$typeDefs[$entry['bm_bibtexEntryType']]['required'], $typeDefs[$entry['bm_bibtexEntryType']]['optional']
		);

		$tooltip = array ( );
		Hooks::run( 'BibManagerBibTagBeforeTooltip', array ( &$entry ) );
		foreach ( $entry as $key => $value ) {
			$unprefixedKey = substr( $key, 3 );
			if ( empty( $value ) || !in_array( $unprefixedKey, $entryTypeFields ) )
				continue; //Filter unnecessary fields
			if ( $unprefixedKey == 'author' ) {
				$value = implode( '; ', explode( ' and ', $value ) ); // TODO RBV (22.12.11 15:34): Duplicate code!
			}
			$tooltip[] = XML::element( 'strong', null, wfMessage( $key )->escaped() . ': ' ) . ' '
				. XML::element( 'em', null, $value )
				."<br/>";//. XML::element( 'br', null, null ); //This is just a little exercise
		}

		$tooltip[] = self::getIcons( $entry, $user );
		$tooltipString = implode( "", $tooltip );
		$tooltipString = '<span>' . $tooltipString . '</span>';

		if ( isset( $args['mode'] ) && $args['mode'] == 'full' ) {
			$format = self::formatEntry( $entry );
			$tooltipString = ' ' . $format . ' ' . $tooltipString;
		}
		return $tooltipString;
	}

	public static function getIcons ( $entry, User $user ) {
		global $wgScriptPath;
		global $wgBibManagerScholarLink;
		$icons = array ( );

		if ( !empty( $entry['bm_bibtexCitation'] ) && $user->isAllowed('bibmanageredit') ) {
			$icons['edit'] = array (
				'src' => $wgScriptPath . '/extensions/BibManager/resources/images/pencil.png',
				'title' => 'bm_tooltip_edit',
				'href' => SpecialPage::getTitleFor( 'BibManagerEdit' )
				->getLocalURL( array ( 'bm_bibtexCitation' => $entry['bm_bibtexCitation'] ) )
			);
		}
		$scholarLink = str_replace( '%title%', $entry['bm_title'], $wgBibManagerScholarLink );
		$icons['scholar'] = array (
			'src' => $wgScriptPath . '/extensions/BibManager/resources/images/book.png',
			'title' => 'bm_tooltip_scholar',
			'href' => $scholarLink
		);

		Hooks::run( 'BibManagerGetIcons', array ( $entry, &$icons ) );

		$out = array ( );
		foreach ( $icons as $key => $iconDesc ) {
			$text = wfMessage( $iconDesc['title'] )->escaped();
			$iconEl = XML::element(
				'img', array (
				'src' => $iconDesc['src'],
				'alt' => $text,
				'title' => $text
				)
			);
			$anchorEl = XML::tags(
				'a', array (
				'href' => $iconDesc['href'],
				'title' => $text,
				'target' => '_blank',
				), $iconEl
			);
			$out[] = XML::wrapClass( $anchorEl, 'bm_icon_link' );
		}

		return implode( '', $out );
	}

	/**
	 * Method for the BibManager-Tag <biblist />
	 * @param String $input
	 * @param array $args
	 * @param Parser $parser
	 * @param PPFrame $frame
	 * @return string List of used <bib />-tags
	 */
	public static function onBiblistTag ( $input, $args, $parser, $frame ) {
		$parser->getOutput()->updateCacheExpiry( 0 );

		$page = new WikiPage( $parser->getTitle() );
		$pageContent = $page->getContent();
		$content = ContentHandler::getContentText( $pageContent );
		$parser->getOutput()->addModuleStyles( 'ext.bibManager.styles' );

		$out = array();
		$out[] = XML::element( 'hr', null, null );
		$out[] = wfMessage( 'bm_tag_tag-used' )->escaped();

		$bibTags = array ( );
		preg_match_all( '<bib.*?id=[\'"\ ]*(.*?)[\'"\ ].*?>', $content, $bibTags ); // TODO RBV (10.11.11 13:31): It might be better to have a db table for wikipage <-> citation relationship. This table could be updated in bib-Tag callback.
		if ( empty( $bibTags[0][0] ) ) {
			return wfMessage( 'bm_tag_no-tags-used' )->escaped(); //No Tags found
		}
		$entries = array ( );
		$repo = BibManagerRepository::singleton();

		natsort( $bibTags[1] ); // TODO RBV (23.12.11 13:27): Customizable sorting?

		foreach ( $bibTags[1] as $citation ) {
			// TODO RBV (10.11.11 13:14): This is not good. If a lot of citations every citation will cause db query.
			$entries[$citation] = $repo->getBibEntryByCitation( $citation );
		}

		//$out[] = XML::openElement( 'table', array ( 'class' => 'bm_list_table' ) );

		// TODO RBV (23.12.11 13:28): Remove filtering
		if ( isset( $args['filter'] ) ) {
			$filterValues = explode( ',', $args['filter'] );
			foreach ( $filterValues as $val ) {
				$temp = explode( ':', trim( $val ) );
				$filter [$temp[0]] = $temp[1];
			}
		}

		$out = self::getTable($entries, $parser->getUser());

		return $out;

		//HINT: Maybe better way to find not existing entries after a _single_ db call.
		/*
		  $aMissingCits = array_diff(self::$aBibTagUsed, $aFoundCits);
		  foreach ($aMissingCits as $sCit){
		  $aOut [$sCit] = "<li><a href='".SpecialPage::getTitleFor("BibManagerCreate")->getLocalURL()."' >[".$sCit."]</a> (".wfMessage('bm_error_not-existing')->escaped().")</li>";
		  }
		 */
	}

	/**
	 * Method for the BibManager-Tag <bibprint />
	 * @global object $wgScript
	 * @param String $input
	 * @param array $args
	 * @param Parser $parser
	 * @param PPFrame $frame
	 * @return string
	 */
	public static function onBibprintTag ( $input, $args, $parser, $frame ) {
		global $wgBibManagerCitationArticleNamespace;
		$parser->getOutput()->updateCacheExpiry( 0 );

		if ( !isset( $args['filter'] ) && !isset($args['citation'] ))
			return '[' . wfMessage( 'bm_missing-filter' )->escaped() . ']';
		$repo = BibManagerRepository::singleton();
		if (isset($args['citation'])){
			$res [] = $repo->getBibEntryByCitation($args['citation']);
		}
		else {
			$filters = explode( ',', trim( $args['filter'] ) );
			$fieldsDefs = BibManagerFieldsList::getFieldDefinitions();
			$validFieldNames = array_keys( $fieldsDefs );
			$conds = array ( );
			foreach ( $filters as $val ) {
				$keyValuePairs = explode( ':', trim( $val ), 2 );
				if ( count( $keyValuePairs ) == 1 )
					continue; //No ':' included, so we skip it.

				$key = $keyValuePairs[0];
				if ( !in_array( $key, $validFieldNames ) )
					continue; //No valid DB field, so skip it.

				$values = explode( '|', $keyValuePairs[1] );
				$tmpCond = array ( );
				foreach ( $values as $value ) {
					$tmpCondPart = 'bm_' . $key . ' ';
					if ( strpos( $value, '%' ) !== false ) { //Truncating? We need a "LIKE"
						$tmpCondPart .= 'LIKE "' . $value . '"';
					} else {
						$tmpCondPart .= '= "' . $value . '"';
					}
					$tmpCond[] = $tmpCondPart;
				}

				$conds[] = implode( ' OR ', $tmpCond );
			}
			if ( empty( $conds ) )
				return '[' . wfMessage( 'bm_invalid-filter' )->escaped() . ']';

			$res = $repo->getBibEntries( $conds );
		}
		$out = self::getTable($res, $parser->getUser());
		return $out;
	}

	public static function onSkinAfterContent ( &$data ) {
		$data .= self::onBiblistTag( null, null, null, null );
		return true;
	}

	public static function formatEntry ( $entry, $formatOverride = '', $prefixedKeys = true ) {
		global $wgBibManagerCitationFormats;
		$format = $wgBibManagerCitationFormats['-']; //Use default
		if ( isset( $entry['bm_bibtexEntryType'] ) && !empty( $wgBibManagerCitationFormats[$entry['bm_bibtexEntryType']] ) ) {
			$format = !empty( $formatOverride ) ? $formatOverride : $wgBibManagerCitationFormats[$entry['bm_bibtexEntryType']];
		}

		foreach ( $entry as $key => $value ) { //Replace placeholders
			if ( empty( $value ) )
				continue;

			if ( $prefixedKeys )
				$key = substr( $key, 3 ); //'bm_title' --> 'title'

			if ( $key == 'author' || $key == 'editor' )
				$value = implode( '; ', explode( ' and ', $value ) );

			if ( $key == 'editor' )
				$value .= wfMessage( 'bm_editor_addition' )->escaped();

			if ( $key == 'url' ) {
				$urlKey = $prefixedKeys ? 'bm_url' : 'url';
				$value = ' '.XML::element(
					'a',
					array(
						'href'   => $entry[$urlKey],
						'target' => '_blank',
						'class'  => 'external',
						'rel'    => 'nofollow'
					),
					wfMessage( 'bm_url')->escaped()
				);
			}

			$format = str_replace( '%' . $key . '%', $value, $format );
		}

		Hooks::run( 'BibManagerFormatEntry', array ( $entry, $prefixedKeys, &$format ) );
		return $format;
	}

	public static function getTableEntry($citLink, $citFormat, $citIcons){
		$out = '';
		$out .= XML::openElement( 'tr' );
		$out .= '<td style="width:100px; text-align: left; vertical-align: top;">[' . $citLink . ']</td>';
		$out .= '<td>' . $citFormat . '</td>';
		$out .= '<td style="width:70px">' . $citIcons . '</td>';
		$out .= XML::closeElement( 'tr' );
		return $out;
	}

	public static function getTable($res, User $user){
		global $wgBibManagerCitationArticleNamespace;
		$out = Html::openElement( 'table', array ( 'class' => 'bm_list_table' ) );
		if ( $res === false ) {
			return '[' . wfMessage( 'bm_no-data-found' )->escaped() . ']';
		}
		$linkRenderer = MediaWikiServices::getInstance()->getLinkRenderer();
		foreach ( $res as $key => $val ) {
			if ( empty( $val ) ){
				$spTitle = SpecialPage::getTitleFor( 'BibManagerCreate' ); // TODO RBV (10.11.11 13:50): Dublicate code --> encapsulate
				$citLink = $linkRenderer->makeBrokenLink(
					$spTitle,
					$key,
					array ( 'class' => 'new' ),
					array ( 'bm_bibtexCitation' => $key )
				);
				$sLinkToEdit = SpecialPage::getTitleFor( 'BibManagerCreate' )->getLocalURL( array ( 'bm_bibtexCitation' => $key ));
				$citFormat = '<em>' . wfMessage('bm_error_not-existing')->escaped();
				if ( $user->isAllowed('bibmanagercreate') ) {
					$citFormat .= Html::element(
						'a',
						array( 'href' => $sLinkToEdit ),
						wfMessage( 'bm_tag_click_to_create' )->text()
					);
				}
				$citFormat .='</em>';
				$citIcons = '';
			}
			else {
				$title = Title::newFromText(
					$val['bm_bibtexCitation'],
					$wgBibManagerCitationArticleNamespace
				);
				$citLink = $linkRenderer->makeLink( $title, $val['bm_bibtexCitation'] );
				$citFormat = self::formatEntry( $val );
				$citIcons = self::getIcons( $val, $user );
			}

			$out .= Html::openElement( 'tr' );
			$out .= '<td style="width:100px; text-align: left; vertical-align: top;">[' . $citLink . ']</td>';
			$out .= '<td>' . $citFormat . '</td>';
			$out .= '<td style="width:70px">' . $citIcons . '</td>';
			$out .= Html::closeElement( 'tr' );
		}
		$out .= Html::closeElement( 'table' );
		return $out;
	}
}
