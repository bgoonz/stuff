<?php
/**
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
 *
 * @file
 */

use MediaWiki\Content\Transform\PreSaveTransformParams;

/**
 * Content handler for JSON.
 *
 * @author Ori Livneh <ori@wikimedia.org>
 * @author Kunal Mehta <legoktm@gmail.com>
 *
 * @since 1.24
 * @ingroup Content
 */
class JsonContentHandler extends CodeContentHandler {

	public function __construct( $modelId = CONTENT_MODEL_JSON ) {
		parent::__construct( $modelId, [ CONTENT_FORMAT_JSON ] );
	}

	/**
	 * @return string
	 */
	protected function getContentClass() {
		return JsonContent::class;
	}

	public function makeEmptyContent() {
		$class = $this->getContentClass();
		return new $class( '{}' );
	}

	public function preSaveTransform(
		Content $content,
		PreSaveTransformParams $pstParams
	): Content {
		$deprecatedContent = $this->maybeCallDeprecatedContentPST( $content, $pstParams );
		if ( $deprecatedContent ) {
			return $deprecatedContent;
		}

		'@phan-var JsonContent $content';

		// FIXME: WikiPage::doEditContent invokes PST before validation. As such, native data
		// may be invalid (though PST result is discarded later in that case).
		if ( !$content->isValid() ) {
			return $content;
		}

		$contentClass = $this->getContentClass();
		return new $contentClass( JsonContent::normalizeLineEndings( $content->beautifyJSON() ) );
	}
}
