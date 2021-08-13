<?php

use MediaWiki\MediaWikiServices;

class BibManagerPagerList extends AlphabeticPager {
	private $searchType = '';
	private $searchTerm = '';

	function getQueryInfo () {
		global $wgRequest;
		$this->searchType = $wgRequest->getVal( 'wpbm_list_search_select', '' );
		$this->searchTerm = $wgRequest->getVal( 'wpbm_list_search_text', '' );
		$conds= array();
		if ( !empty( $this->searchType ) && !empty( $this->searchTerm ) ) {
			$conds[] = "bm_" . $this->searchType . " LIKE '%" . $this->searchTerm . "%'";
		}

		Hooks::run( 'BibManagerPagerBeforeSearch', array ( $this->searchType, $this->searchTerm, &$conds ) );
		return array (
			'tables'  => 'bibmanager',
			'fields'  => '*',
			'conds'   => $conds,
			'options' => array ( 'ORDER BY' => 'bm_bibtexCitation ASC' ),
		);
	}

	function getIndexField () {
		return 'bm_bibtexCitation';
	}

	/**
	 * Override from base class to add query string parameters
	 * @return array
	 */
	function getPagingQueries() {
		$queries = parent::getPagingQueries();
		if( !empty($this->searchType ) ) {
			foreach( $queries as $type => $query ) {
				$queries[$type]['wpbm_list_search_select'] = $this->searchType;
			}
		}
		if( !empty($this->searchTerm ) ) {
			foreach( $queries as $type => $query ) {
				$queries[$type]['wpbm_list_search_text'] = $this->searchTerm;
			}
		}
		return $queries;
	}

	/**
	 * Override from base class to add query string parameters
	 * @global Language $wgLang
	 * @return array
	 */
	function getLimitLinks() {
		global $wgLang;
		$links = array();
		if ( $this->mIsBackwards ) {
			$offset = $this->mPastTheEndIndex;
		} else {
			$offset = $this->mOffset;
		}
		$query = array( 'offset' => $offset );
		if( !empty($this->searchType ) ) {
			$query['wpbm_list_search_select'] = $this->searchType;
		}
		if( !empty($this->searchTerm ) ){
			$query['wpbm_list_search_text'] = $this->searchTerm;
		}

		foreach ( $this->mLimitsShown as $limit ) {
			$links[] = $this->makeLink(
				$wgLang->formatNum( $limit ),
				$query + array( 'limit' => $limit ),
				'num'
			);
		}
		return $links;
	}

	/**
	 *
	 * @param mixed $row
	 * @return string
	 */
	function formatRow ( $row ) {
		global $wgBibManagerCitationArticleNamespace;

		$citationTitle = Title::newFromText( $row->bm_bibtexCitation, $wgBibManagerCitationArticleNamespace );

		$linkRenderer = MediaWikiServices::getInstance()->getLinkRenderer();

		$citationLink = $linkRenderer->makeLink( $citationTitle, $row->bm_bibtexCitation );
		$editLink     = '';
		$deleteLink   = '';
		$exportLink   = new OOUI\CheckboxInputWidget( [
			'infusable' => true,
			'name' => 'cit[]',
			'value' => str_replace( '.', '__dot__', $row->bm_bibtexCitation ),
		] );

		$specialPageQuery = array ( 'bm_bibtexCitation' => $row->bm_bibtexCitation );

		$user = $this->getUser();
		if ($user->isAllowed('bibmanageredit')){
			$editLink = $linkRenderer->makeLink(
				SpecialPage::getTitleFor( 'BibManagerEdit' ),
				$this->msg( 'bm_list_table_edit' )->text(),
				array (
					'class' => 'icon edit',
					'title' => $this->msg( 'bm_list_table_edit' )->escaped()
				),
				$specialPageQuery
			);
		}

		if ($user->isAllowed('bibmanagerdelete')){
			$deleteLink = $linkRenderer->makeLink(
				SpecialPage::getTitleFor( 'BibManagerDelete' ),
				$this->msg( 'bm_list_table_delete' )->text(),
				array (
					'class' => 'icon delete',
					'title' => $this->msg( "bm_list_table_delete" )->escaped()
				),
				$specialPageQuery
			);
		}

		$format = BibManagerHooks::formatEntry((Array)$row);

		$tablerow = array ( );
		$tablerow[] = '<tr>';
		$tablerow[] = '  <td style="vertical-align:top;">' . $citationLink . '</td>';
		$tablerow[] = '  <td>' . $format . '</td>';
		if ($user->isAllowed('bibmanageredit') || $user->isAllowed('bibmanagerdelete')) {
			$tablerow[] = '  <td style="text-align:center;">' . $editLink . $deleteLink . '</td>';
		}
		$tablerow[] = '  <td style="text-align:center;">' . $exportLink . '</td>';
		$tablerow[] = '<tr>';

		return implode( "\n", $tablerow );
	}
}
