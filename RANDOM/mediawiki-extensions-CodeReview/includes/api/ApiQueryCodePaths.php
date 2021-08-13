<?php

/**
 * Created on 6th June 2011
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

class ApiQueryCodePaths extends ApiQueryBase {
	public function __construct( $query, $moduleName ) {
		parent::__construct( $query, $moduleName, 'cp' );
	}

	public function execute() {
		$this->checkUserRightsAny( 'codereview-use' );

		$params = $this->extractRequestParams();

		$repo = CodeRepository::newFromName( $params['repo'] );
		if ( !$repo instanceof CodeRepository ) {
			$this->dieWithError( [ 'apierror-invalidrepo', wfEscapeWikiText( $params['repo'] ) ] );
		}

		$this->addTables( 'code_paths' );
		$this->addFields( 'DISTINCT cp_path' );
		$this->addWhere( [ 'cp_repo_id' => $repo->getId() ] );
		$db = $this->getDB();

		$this->addWhere( 'cp_path ' . $db->buildLike( $params['path'], $db->anyString() ) );
		$this->addOption( 'USE INDEX', 'repo_path' );

		$this->addOption( 'LIMIT', 10 );

		$res = $this->select( __METHOD__ );

		$result = $this->getResult();

		$data = [];

		foreach ( $res as $row ) {
			$item = [];
			ApiResult::setContentValue( $item, 'path', $row->cp_path );
			$data[] = $item;
		}

		$result->setIndexedTagName( $data, 'paths' );
		$result->addValue( 'query', $this->getModuleName(), $data );
	}

	public function getAllowedParams() {
		return [
			'repo' => [
				ApiBase::PARAM_TYPE => 'string',
				ApiBase::PARAM_REQUIRED => true,
			],
			'path' => [
				ApiBase::PARAM_TYPE => 'string',
				ApiBase::PARAM_REQUIRED => true,
			],
		];
	}

	/**
	 * @inheritDoc
	 */
	protected function getExamplesMessages() {
		return [
			'action=query&list=codepaths&cprepo=MediaWiki&cppath=/trunk/phase3'
				=> 'apihelp-query+codepaths-example-1',
		];
	}
}
