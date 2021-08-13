<?php

class CreateRedirectHooks {
	/**
	 * Adds a shortcut link pointing to Special:CreateRedirect to the "toolbox" menu.
	 * If applicable, also adds a reference to the current title as a GET param.
	 *
	 * @param BaseTemplate &$tpl
	 * @return bool
	 */
	public static function onSkinTemplateToolboxEnd( &$tpl ) {
		$skin = $tpl->getSkin();

		// 1. Determine whether to actually add the link at all.
		// There are certain cases, e.g. in the edit dialog, in a special page,
		// where it's inappropriate for the link to appear.
		// 2. Check the title. Is it a "Special:" page? Don't display the link.
		$action = $skin->getRequest()->getText( 'action', 'view' );
		$title = $skin->getTitle();

		if ( $action != 'view' && $action != 'purge' && !$title->isSpecialPage() ) {
			return true;
		}

		// 3. Add the link!
		$href = SpecialPage::getTitleFor( 'CreateRedirect', $title->getPrefixedText() )->getLocalURL();
		echo Html::rawElement(
			'li', null, Html::element( 'a', [ 'href' => $href ], $skin->msg( 'createredirect' )->text() )
		);

		return true;
	}
}
