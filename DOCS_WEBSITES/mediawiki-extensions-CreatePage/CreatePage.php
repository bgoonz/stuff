<?php
/**
 * MediaWiki extension CreatePage.
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
if ( function_exists( 'wfLoadExtension' ) ) {
	wfLoadExtension( 'CreatePage' );
	// Keep i18n globals so mergeMessageFileList.php doesn't break
	$wgMessagesDirs['CreatePage'] = __DIR__ . '/i18n';
	$wgExtensionMessagesFiles['CreatePageAlias'] = __DIR__ . '/CreatePage.alias.php';
	$wgExtensionMessagesFiles['CreatePageMagic'] = __DIR__ . '/CreatePage.magic.php';
	wfWarn(
		'Deprecated PHP entry point used for the CreatePage extension. ' .
		'Please use wfLoadExtension() instead, ' .
		'see https://www.mediawiki.org/wiki/Special:MyLanguage/Manual:Extension_registration for more details.'
	);
	return;
} else {
	die( 'This version of the CreatePage extension requires MediaWiki 1.35+' );
}
