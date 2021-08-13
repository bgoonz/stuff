<?php

namespace MediaWiki\Extension\Commentbox;

use EditPage;
use Html;
use MediaWiki\MediaWikiServices;
use OutputPage;
use Title;

/**
 * Hook handlers for the Commentbox extension.
 *
 * @package MediaWiki\Extension\Commentbox
 */
class Hooks {

	/**
	 * @param OutputPage &$op
	 * @param string &$text
	 * @return bool
	 */
	public static function onOutputPageBeforeHTML( OutputPage &$op, &$text ) {
		global $wgRequest,
			   $wgCommentboxNamespaces, $wgCommentboxRows,
			   $wgCommentboxColumns;

		$title = $op->getTitle();
		if ( !$title->exists() ) {
			return true;
		}

		if ( class_exists( 'MediaWiki\Permissions\PermissionManager' ) ) {
			// MW 1.33+
			if ( !MediaWikiServices::getInstance()
				->getPermissionManager()
				->userCan( 'edit', $op->getUser(), $title )
			) {
				return true;
			}
		} else {
			if ( !$title->userCan( 'edit', true ) ) {
				return true;
			}
		}

		if ( !array_key_exists( $title->getNamespace(), $wgCommentboxNamespaces )
			|| !$wgCommentboxNamespaces[ $title->getNamespace() ] ) {
			return true;
		}

		$action = $wgRequest->getVal( 'action', 'view' );
		if ( !( $action == 'view' || $action == 'purge' || $action == 'submit' ) ) {
			return true;
		}
		if ( $wgRequest->getCheck( 'wpPreview' )
			|| $wgRequest->getCheck( 'wpLivePreview' )
			|| $wgRequest->getCheck( 'wpDiff' ) ) {
			return true;
		}
		if ( $wgRequest->getVal( 'preview' ) !== null ) {
			return true;
		}
		if ( $wgRequest->getVal( 'diff' ) !== null ) {
			return true;
		}

		$name = '';
		if ( !$op->getUser()->isRegistered() ) {
			$namecomment = $op->msg( 'commentbox-name-explanation' )->parse();
			$namelabel = $op->msg( 'commentbox-name' )->parse();
			$name = '<br />' . $namelabel;
			$name .= ' <input name="wpAuthor" tabindex="2" type="text" size="30" maxlength="50" /> ';
			$name .= $namecomment;
		}
		$inhalt = $op->msg( 'commentbox-prefill' )->plain();
		$save = $op->msg( 'commentbox-savebutton' )->parse();
		$texttitle = htmlspecialchars( Title::makeName( $title->getNamespace(), $title->getText() ) );

		$textarea = Html::element( 'textarea', [
			'accesskey' => ',',
			'name' => 'wpComment',
			'id' => 'wpComment',
			'rows' => $wgCommentboxRows,
			'cols' => $wgCommentboxColumns,
		], $inhalt );
		$saveButton = Html::submitButton(
			$save,
			[ 'name' => 'wpSave', 'id' => 'wpSave', 'accesskey' => 's', 'title' => "$save [alt-s]" ]
		);
		$formAttrs = [
			'id' => 'commentform',
			'name' => 'commentform',
			'method' => 'post',
			'action' => Title::newFromText( 'AddComment', NS_SPECIAL )->getFullURL(),
		];
		$formFields = $op->msg( 'commentbox-intro' )->parse()
			. $textarea
			. $name
			. Html::element( 'br' )
			. Html::input( 'wpPageName', $texttitle, 'hidden' )
			. Html::hidden( 'wpUnicodeCheck', EditPage::UNICODE_CHECK )
			. $saveButton;
		$text .= Html::rawElement( 'form', $formAttrs, $formFields );
		return true;
	}
}
