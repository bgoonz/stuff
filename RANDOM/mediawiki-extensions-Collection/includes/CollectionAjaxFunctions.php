<?php

use MediaWiki\Session\SessionManager;

class CollectionAjaxFunctions {

	public static function onAjaxGetCollection() {
		$session = SessionManager::getGlobalSession();
		if ( isset( $session['wsCollection'] ) ) {
			$collection = $session['wsCollection'];
		} else {
			$collection = [];
		}
		$r = new AjaxResponse( FormatJson::encode( [ 'collection' => $collection ] ) );
		$r->setContentType( 'application/json' );
		return $r;
	}

	public static function onAjaxPostCollection( $collection = '', $redirect = '' ) {
		$session = SessionManager::getGlobalSession();
		$session->persist();
		$collection = FormatJson::decode( $collection, true );
		$r = new AjaxResponse();
		if ( $collection === null ) {
			wfDebugLog( 'collection', 'Invalid collection received.' );
			$r->setResponseCode( 400 );
			$r->setContentType( 'text/plain' );
			$r->addText( 'Invalid collection.' );
			return $r;
		}
		$collection['enabled'] = true;
		$session['wsCollection'] = $collection;
		if ( $redirect ) {
			$title = Title::newFromText( $redirect );
			$redirecturl = wfExpandUrl( $title->getFullURL(), PROTO_CURRENT );
			$r->setResponseCode( 302 );
			header( 'Location: ' . $redirecturl );
		} else {
			$title = SpecialPage::getTitleFor( 'Book' );
			$redirecturl = wfExpandUrl( $title->getFullURL(), PROTO_CURRENT );
			$r->setContentType( 'application/json' );
			$r->addText( FormatJson::encode( [ 'redirect_url' => $redirecturl ] ) );
		}
		return $r;
	}

	public static function onAjaxGetMWServeStatus( $collection_id = '', $writer = 'rl' ) {
		$response = CollectionRenderingAPI::instance( $writer )
			->getRenderStatus( $collection_id );
		$result = $response->response;
		if ( isset( $result['status']['progress'] ) ) {
			$result['status']['progress'] = number_format( $result['status']['progress'], 2, '.', '' );
		}
		$r = new AjaxResponse( FormatJson::encode( $result ) );
		$r->setContentType( 'application/json' );
		return $r;
	}

	public static function onAjaxCollectionAddArticle( $namespace = 0, $title = '', $oldid = '' ) {
		SpecialCollection::addArticleFromName( $namespace, $title, $oldid );
		return self::onAjaxCollectionGetItemList();
	}

	public static function onAjaxCollectionRemoveArticle( $namespace = 0, $title = '', $oldid = '' ) {
		SpecialCollection::removeArticleFromName( $namespace, $title, $oldid );
		return self::onAjaxCollectionGetItemList();
	}

	public static function onAjaxCollectionAddCategory( $title = '' ) {
		SpecialCollection::addCategoryFromName( $title );
		return self::onAjaxCollectionGetItemList();
	}

	public static function onAjaxCollectionGetBookCreatorBoxContent(
		$ajaxHint = '',
		$oldid = null,
		$pageName = null
	) {
		if ( $oldid !== null ) {
			$oldid = intval( $oldid );
		}
		$title = null;
		if ( $pageName !== null ) {
			$title = Title::newFromText( $pageName );
		}
		if ( $title === null ) {
			$title = Title::newMainPage();
		}
		$html = CollectionHooks::getBookCreatorBoxContent( $title, $ajaxHint, $oldid );
		$result = [];
		$result['html'] = $html;
		$r = new AjaxResponse( FormatJson::encode( $result ) );
		$r->setContentType( 'application/json' );
		return $r;
	}

	public static function onAjaxCollectionGetItemList() {
		$collection = CollectionSession::getCollection();
		$template = new CollectionListTemplate();
		$template->set( 'collection', $collection );
		$template->set( 'is_ajax', true );
		$result = [];
		$result['html'] = $template->getHTML();
		$result['collection'] = $collection;
		$r = new AjaxResponse( FormatJson::encode( $result ) );
		$r->setContentType( 'application/json' );
		return $r;
	}

	public static function onAjaxCollectionRemoveItem( $index = 0 ) {
		SpecialCollection::removeItem( (int)$index );
		return self::onAjaxCollectionGetItemList();
	}

	public static function onAjaxCollectionAddChapter( $name = '' ) {
		SpecialCollection::addChapter( $name );
		return self::onAjaxCollectionGetItemList();
	}

	public static function onAjaxCollectionRenameChapter( $index = 0, $name = '' ) {
		SpecialCollection::renameChapter( (int)$index, $name );
		return self::onAjaxCollectionGetItemList();
	}

	public static function onAjaxCollectionSetTitles( $title = '', $subtitle = '', $settings = '' ) {
		SpecialCollection::setTitles( $title, $subtitle );
		$settings = FormatJson::decode( $settings, true );
		if ( is_array( $settings ) ) {
			SpecialCollection::setSettings( $settings );
		}
		return self::onAjaxCollectionGetItemList();
	}

	public static function onAjaxCollectionSetSorting( $items_string = '' ) {
		$parsed = [];
		parse_str( $items_string, $parsed );
		$items = [];
		foreach ( $parsed['item'] as $s ) {
			if ( is_numeric( $s ) ) {
				$items[] = intval( $s );
			}
		}
		SpecialCollection::setSorting( $items );
		return self::onAjaxCollectionGetItemList();
	}

	public static function onAjaxCollectionClear() {
		CollectionSession::clearCollection();
		CollectionSuggest::clear();
		return self::onAjaxCollectionGetItemList();
	}

	public static function onAjaxCollectionGetPopupData( $title = '' ) {
		global $wgExtensionAssetsPath;
		$result = [];
		$imagePath = "$wgExtensionAssetsPath/Collection/images";
		$t = Title::newFromText( $title );
		if ( $t && $t->isRedirect() ) {
			$wikiPage = WikiPage::factory( $t );
			$t = $wikiPage->followRedirect();
			if ( $t instanceof Title ) {
				$title = $t->getPrefixedText();
			}
		}
		if ( CollectionSession::findArticle( $title ) == -1 ) {
			$result['action'] = 'add';
			$result['text'] = wfMessage( 'coll-add_linked_article' )->text();
			$result['img'] = "$imagePath/silk-add.png";
		} else {
			$result['action'] = 'remove';
			$result['text'] = wfMessage( 'coll-remove_linked_article' )->text();
			$result['img'] = "$imagePath/silk-remove.png";
		}
		$result['title'] = $title;
		$r = new AjaxResponse( FormatJson::encode( $result ) );
		$r->setContentType( 'application/json' );
		return $r;
	}

	/**
	 * Backend of several following SAJAX function handlers...
	 * @param string $action provided by the specific handlers internally
	 * @param string $article title passed in from client
	 * @return AjaxResponse with JSON-encoded array including HTML fragment.
	 */
	public static function onCollectionSuggestAction( $action = '', $article = '' ) {
		$result = CollectionSuggest::refresh( $action, $article );
		$undoLink = Xml::element( 'a',
			[
				'href' => SkinTemplate::makeSpecialUrl(
					'Book',
					[ 'bookcmd' => 'suggest', 'undo' => $action, 'arttitle' => $article ]
				),
				'onclick' => "collectionSuggestCall('UndoArticle'," .
					Xml::encodeJsVar( [ $action, $article ] ) . "); return false;",
				'title' => wfMessage( 'coll-suggest_undo_tooltip' )->text(),
			],
			wfMessage( 'coll-suggest_undo' )->text()
		);
		// Message keys used:
		// coll-suggest_article_ban
		// coll-suggest_article_add
		// coll-suggest_article_remove
		$result['last_action'] = wfMessage( "coll-suggest_article_$action", $article )
			->rawParams( $undoLink )->parse();
		$result['collection'] = CollectionSession::getCollection();
		$r = new AjaxResponse( FormatJson::encode( $result ) );
		$r->setContentType( 'application/json' );
		return $r;
	}

	public static function onAjaxCollectionSuggestBanArticle( $article = '' ) {
		return self::onCollectionSuggestAction( 'ban', $article );
	}

	public static function onAjaxCollectionSuggestAddArticle( $article = '' ) {
		return self::onCollectionSuggestAction( 'add', $article );
	}

	public static function onAjaxCollectionSuggestRemoveArticle( $article = '' ) {
		return self::onCollectionSuggestAction( 'remove', $article );
	}

	public static function onAjaxCollectionSuggestUndoArticle( $lastAction = '', $article = '' ) {
		$result = CollectionSuggest::undo( $lastAction, $article );
		$r = new AjaxResponse( FormatJson::encode( $result ) );
		$r->setContentType( 'application/json' );
		return $r;
	}

	public static function onAjaxCollectionSortItems() {
		SpecialCollection::sortItems();
		return self::onAjaxCollectionGetItemList();
	}

}
