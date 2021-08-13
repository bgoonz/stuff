<?php
/**
 * This file is part of the MediaWiki extension CreatePage.
 *
 * Copyright (C) 2012, Ike Hecht & Jeroen De Dauw
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 * @ingroup Extensions
 * @author Ike Hecht
 * @author Jeroen De Dauw
 * @version 0.1
 * @link https://www.mediawiki.org/wiki/Extension:Create_Page Documentation
 * @license https://www.gnu.org/licenses/gpl-3.0-standalone.html GPL-3.0-or-later
 */
class SpecialCreatePageRedirect extends UnlistedSpecialPage {

	public function __construct() {
		parent::__construct( 'CreatePageRedirect' );
	}

	/**
	 * @param string|null $subPage
	 */
	public function execute( $subPage ) {
		$req = $this->getRequest();
		if ( $req->getCheck( 'pagename' ) ) {
			$pageName = $req->getText( 'pagename' );
			$pageNamespace = $req->getText( 'pagens' );
			if ( $pageNamespace == '' ||
				substr( $pageName, 0, strlen( "$pageNamespace:" ) ) == "$pageNamespace:" ) {
				$title = Title::newFromText( $pageName );
			} else {
				$title = Title::newFromText( "$pageNamespace:$pageName" );
			}
			$target = $this->getTargetURL( $title );
		} else {
			$target = Title::newMainPage()->getLocalURL();
		}
		$this->getOutput()->redirect( $target, '301' );
	}

	/**
	 * @param Title $title
	 * @return array
	 */
	private function getTargetURL( Title $title ) {
		$config = $this->getConfig();
		$isKnown = $title->isKnown();

		$query = [];
		if ( !$isKnown || $config->get( 'CreatePageEditExisting' ) ) {
			# Preload is not yet supported by VisualEditor, but probably will be eventually.
			# See https://phabricator.wikimedia.org/T51622
			$query['preload'] = $this->getRequest()->getText( 'preload', '' );
			if ( !$isKnown ) {
				$query['redlink'] = '1';
			}
			if ( $config->get( 'CreatePageUseVisualEditor' ) ) {
				$query['veaction'] = 'edit';
			} else {
				$query['action'] = 'edit';
			}
		}
		return $title->getLocalUrl( $query );
	}
}
