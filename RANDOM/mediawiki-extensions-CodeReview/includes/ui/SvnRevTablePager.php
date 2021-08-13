<?php

/**
 * Pager for CodeRevisionListView
 */
class SvnRevTablePager extends SvnTablePager {
	public function getSVNPath() {
		return $this->mView->mPath;
	}

	public function getDefaultSort() {
		return count( $this->mView->mPath ) ? 'cp_rev_id' : 'cr_id';
	}

	public function getQueryInfo() {
		$defaultSort = $this->getDefaultSort();
		// Path-based query...
		if ( $defaultSort === 'cp_rev_id' ) {
			$query = [
				'tables' => [ 'code_paths', 'code_rev', 'code_comment' ],
				'fields' => $this->getSelectFields(),
				'conds' => [
					'cp_repo_id' => $this->mRepo->getId(),
					'cp_path' => $this->getSVNPath(),
				],
				'options' => [
					'GROUP BY' => $defaultSort,
					'USE INDEX' => [ 'code_path' => 'cp_repo_id' ]
				],
				'join_conds' => [
					'code_rev' => [ 'INNER JOIN',
						'cr_repo_id = cp_repo_id AND cr_id = cp_rev_id' ],
					'code_comment' => [ 'LEFT JOIN',
						'cc_repo_id = cp_repo_id AND cc_rev_id = cp_rev_id' ],
				]
			];
		// No path; entire repo...
		} else {
			$query = [
				'tables' => [ 'code_rev', 'code_comment' ],
				'fields' => $this->getSelectFields(),
				'conds' => [ 'cr_repo_id' => $this->mRepo->getId() ],
				'options' => [ 'GROUP BY' => $defaultSort ],
				'join_conds' => [
					'code_comment' => [ 'LEFT JOIN',
						'cc_repo_id = cr_repo_id AND cc_rev_id = cr_id' ],
				]
			];
		}

		if ( $this->mView->mAuthor ) {
			$query['conds']['cr_author'] = $this->mView->mAuthor;
		}

		if ( $this->mView->mStatus ) {
			$query['conds']['cr_status'] = $this->mView->mStatus;
		}
		return $query;
	}

	public function getCountQuery() {
		$query = $this->getQueryInfo();

		$query['fields'] = [ 'COUNT( DISTINCT cr_id ) AS rev_count' ];
		unset( $query['options']['GROUP BY'] );
		return $query;
	}

	public function getSelectFields() {
		return array_unique(
			[ $this->getDefaultSort(),
				'cr_id',
				'cr_repo_id',
				'cr_status',
				'COUNT(DISTINCT cc_id) AS comments',
				'cr_path',
				'cr_message',
				'cr_author',
				'cr_timestamp'
			] );
	}

	public function getFieldNames() {
		$fields = [
			'cr_id' => $this->msg( 'code-field-id' )->text(),
			'cr_status' => $this->msg( 'code-field-status' )->text(),
			'comments' => $this->msg( 'code-field-comments' )->text(),
			'cr_path' => $this->msg( 'code-field-path' )->text(),
			'cr_message' => $this->msg( 'code-field-message' )->text(),
			'cr_author' => $this->msg( 'code-field-author' )->text(),
			'cr_timestamp' => $this->msg( 'code-field-timestamp' )->text()
		];
		# Only show checkboxen as needed
		if ( $this->mView->batchForm ) {
			$fields = [ 'selectforchange' => $this->msg( 'code-field-select' )->text() ] + $fields;
		}
		return $fields;
	}

	public function formatValue( $name, $value ) {
		// unused
	}

	public function formatRevValue( $name, $value, $row ) {
		$pathQuery = count( $this->mView->mPath )
			? [ 'path' => $this->mView->getPathsAsString() ] : [];

		$linkRenderer = \MediaWiki\MediaWikiServices::getInstance()->getLinkRenderer();
		switch ( $name ) {
		case 'selectforchange':
			$sort = $this->getDefaultSort();
			return Xml::check( "wpRevisionSelected[]", false, [ 'value' => $row->$sort ] );
		case 'cr_id':
			return $linkRenderer->makeLink(
				SpecialPage::getTitleFor( 'Code', $this->mRepo->getName() . '/' . $value ),
				$value,
				[],
				[]
			);
		case 'cr_status':
			$options = $pathQuery;
			if ( $this->mView->mAuthor ) {
				$options['author'] = $this->mView->mAuthor;
			}
			$options['status'] = $value;
			return $linkRenderer->makeLink(
				SpecialPage::getTitleFor( 'Code', $this->mRepo->getName() ),
				$this->mView->statusDesc( $value ),
				[],
				$options
			);
		case 'cr_author':
			$options = $pathQuery;
			if ( $this->mView->mStatus ) {
				$options['status'] = $this->mView->mStatus;
			}
			$options['author'] = $value;
			return $linkRenderer->makeLink(
				SpecialPage::getTitleFor( 'Code', $this->mRepo->getName() ),
				$value,
				[],
				$options
			);
		case 'cr_message':
			return $this->mView->messageFragment( $value );
		case 'cr_timestamp':
			return $this->getLanguage()->timeanddate( $value, true );
		case 'comments':
			if ( $value ) {
				$special = SpecialPage::getTitleFor(
					'Code',
					$this->mRepo->getName() . '/' . $row->{$this->getDefaultSort()},
					'code-comments'
				);
				return $linkRenderer->makeLink(
					$special, $this->getLanguage()->formatNum( $value ) );
			} else {
				return '-';
			}
		case 'cr_path':
			$title = $this->mRepo->getName();

			$options = [ 'path' => (string)$value ];
			if ( $this->mView->mAuthor ) {
				$options['author'] = $this->mView->mAuthor;
			}
			if ( $this->mView->mStatus ) {
				$options['status'] = $this->mView->mStatus;
			}

			return Xml::openElement( 'div', [ 'title' => (string)$value, 'dir' => 'ltr' ] ) .
					$linkRenderer->makeLink(
						SpecialPage::getTitleFor( 'Code', $title ),
						$this->getLanguage()->truncateForVisual( (string)$value, 50 ),
						[ 'title' => (string)$value ],
						$options
					) . '</div>';
		}

		return '';
	}

	/**
	 * @return Title
	 */
	public function getTitle() {
		return SpecialPage::getTitleFor( 'Code', $this->mRepo->getName() );
	}
}
