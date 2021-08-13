<?php

/**
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

class ApiCodeUpdate extends ApiBase {

	public function execute() {
		$this->checkUserRightsAny( 'codereview-use' );

		$params = $this->extractRequestParams();

		$repo = CodeRepository::newFromName( $params['repo'] );
		if ( !$repo ) {
			$this->dieWithError( [ 'apierror-invalidrepo', wfEscapeWikiText( $params['repo'] ) ] );
		}

		$svn = SubversionAdaptor::newFromRepo( $repo->getPath() );
		$lastStoredRev = $repo->getLastStoredRev();

		if ( $lastStoredRev >= $params['rev'] ) {
			// Nothing to do, we're up to date.
			// Return an empty result
			$this->getResult()->addValue( null, $this->getModuleName(), [] );
			return;
		}

		// FIXME: this could be a lot?
		$log = $svn->getLog( '', $lastStoredRev + 1, $params['rev'] );
		if ( !$log ) {
			// FIXME: When and how often does this happen?
			// Should we use dieWithError() here instead?
			ApiBase::dieDebug( __METHOD__, 'Something awry...' );
		}

		$result = [];
		$revs = [];
		foreach ( $log as $data ) {
			$codeRev = CodeRevision::newFromSvn( $repo, $data );
			$codeRev->save();
			$result[] = [
				'id' => $codeRev->getId(),
				'author' => $codeRev->getAuthor(),
				'timestamp' => wfTimestamp( TS_ISO_8601, $codeRev->getTimestamp() ),
				'message' => $codeRev->getMessage()
			];
			$revs[] = $codeRev;
		}
		// Cache the diffs if there are a only a few.
		// Mainly for WMF post-commit ping hook...
		if ( count( $revs ) <= 2 ) {
			foreach ( $revs as $codeRev ) {
				$repo->setDiffCache( $codeRev ); // trigger caching
			}
		}
		$this->getResult()->setIndexedTagName( $result, 'rev' );
		$this->getResult()->addValue( null, $this->getModuleName(), $result );
	}

	public function mustBePosted() {
		// Discourage casual browsing :)
		return true;
	}

	public function isWriteMode() {
		return true;
	}

	public function getAllowedParams() {
		return [
			'repo' => [
				ApiBase::PARAM_TYPE => 'string',
				ApiBase::PARAM_REQUIRED => true,
			],
			'rev' => [
				ApiBase::PARAM_TYPE => 'integer',
				ApiBase::PARAM_MIN => 1,
				ApiBase::PARAM_REQUIRED => true,
			]
		];
	}

	/**
	 * @inheritDoc
	 */
	protected function getExamplesMessages() {
		return [
			'action=codeupdate&repo=MediaWiki&rev=42080'
				=> 'apihelp-codeupdate-example-1',
		];
	}
}
