<?php
/**
 * Collection Extension for MediaWiki
 *
 * Copyright (C) PediaPress GmbH
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301, USA.
 * http://www.gnu.org/copyleft/gpl.html
 */
namespace MediaWiki\Extensions\Collection;

use OutputPage;
use TemplateParser;

/**
 * A helper class to easily handle extra styles and render html for messages boxes informing
 * about on-ging Book Creator maintenance and unavailability of PDF generation feature.
 *
 * When Book Creator gets back to stable you can safely remove this class with all usages and all
 * ext.collection.bookcreator.messageBox modules.
 *
 * @see https://phabricator.wikimedia.org/T175996
 */
class MessageBoxHelper {

	/**
	 * Inject MessageBox modules (styles&icons) to OutputPage
	 *
	 * @param OutputPage $out
	 */
	public static function addModuleStyles( OutputPage $out ) {
		$out->addModules( [
			'ext.collection.bookcreator.messageBox'
		] );
		$out->addModuleStyles( [
			'mediawiki.hlist',
			'ext.collection.bookcreator.messageBox.styles',
			'ext.collection.bookcreator.messageBox.icons',
		] );
	}

	/**
	 * Render boxes informing about PDF feature unavailability.
	 *
	 * @return string Generated HTML
	 */
	public static function renderWarningBoxes() {
		$templateParser = new TemplateParser( __DIR__ . DIRECTORY_SEPARATOR . '..'
			. DIRECTORY_SEPARATOR . 'templates' );

		$args = [
			"warning_title" => wfMessage( 'coll-warning-disable-pdf-title' )->text(),
			"warning_text" => wfMessage( 'coll-warning-disable-pdf-text' )->text(),
			"warning_learn_more" => wfMessage( 'coll-warning-learn-more' )->text(),
			"notice_title" => wfMessage( 'coll-notice-download-pdf-title' )->text(),
			"notice_text" => wfMessage( 'coll-notice-download-pdf-text' )->parse()
		];
		return $templateParser->processTemplate( 'warning', $args );
	}

}
