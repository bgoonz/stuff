<?php

/**
 * Pager for CodeCommentsListView
 */
class CodeCommentsTablePager extends SvnTablePager {
	public function isFieldSortable( $field ) {
		return $field == 'cr_timestamp';
	}

	public function getDefaultSort() {
		return 'cc_timestamp';
	}

	public function getQueryInfo() {
		$query = [
			'tables' => [ 'code_comment', 'code_rev' ],
			'fields' => array_keys( $this->getFieldNames() ),
			'conds' => [ 'cc_repo_id' => $this->mRepo->getId() ],
			'join_conds' => [
				'code_rev' => [ 'LEFT JOIN', 'cc_repo_id = cr_repo_id AND cc_rev_id = cr_id' ]
			],
			'options' => [],
		];

		if ( count( $this->mView->mPath ) ) {
			$query['tables'][] = 'code_paths';
			$query['join_conds']['code_paths'] = [ 'INNER JOIN',
				'cc_repo_id = cp_repo_id AND cc_rev_id = cp_rev_id' ];
			$query['conds']['cp_path'] = $this->mView->mPath;
		}
		if ( $this->mView->mAuthor ) {
			$query['conds']['cc_user_text'] = User::newFromName( $this->mView->mAuthor )->getName();
		}

		return $query;
	}

	public function getCountQuery() {
		$query = $this->getQueryInfo();

		$query['fields'] = [ 'COUNT( DISTINCT cc_id ) AS rev_count' ];
		unset( $query['options']['GROUP BY'] );
		return $query;
	}

	public function getFieldNames() {
		return [
			'cc_timestamp' => $this->msg( 'code-field-timestamp' )->text(),
			'cc_user_text' => $this->msg( 'code-field-user' )->text(),
			'cc_rev_id' => $this->msg( 'code-field-id' )->text(),
			'cr_status' => $this->msg( 'code-field-status' )->text(),
			'cr_message' => $this->msg( 'code-field-message' )->text(),
			'cc_text' => $this->msg( 'code-field-text' )->text()
		];
	}

	public function formatValue( $name, $value ) {
		$linkRenderer = \MediaWiki\MediaWikiServices::getInstance()->getLinkRenderer();
		switch ( $name ) {
		case 'cc_rev_id':
			return $linkRenderer->makeLink(
				SpecialPage::getSafeTitleFor( 'Code',
					$this->mRepo->getName() . '/' . $value . '#code-comments' ),
				$value
			);
		case 'cr_status':
			return $linkRenderer->makeLink(
				SpecialPage::getTitleFor( 'Code',
					$this->mRepo->getName() . '/status/' . $value ),
				$this->mView->statusDesc( $value )
			);
		case 'cc_user_text':
			return Linker::userLink( -1, $value );
		case 'cr_message':
			return $this->mView->messageFragment( $value );
		case 'cc_text':
			return $this->mView->messageFragment( $value );
		case 'cc_timestamp':
			return $this->getLanguage()->timeanddate( $value, true );
		}

		throw new Exception( '$name is invalid input.' );
	}

	public function getTitle() {
		return SpecialPage::getTitleFor( 'Code', $this->mRepo->getName() . '/comments' );
	}
}
