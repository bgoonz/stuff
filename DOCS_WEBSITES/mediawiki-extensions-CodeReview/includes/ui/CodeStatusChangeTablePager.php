<?php

/**
 * Pager for CodeRevisionListView
 */
class CodeStatusChangeTablePager extends SvnTablePager {

	public function isFieldSortable( $field ) {
		return $field == 'cpc_timestamp';
	}

	public function getDefaultSort() {
		return 'cpc_timestamp';
	}

	public function getQueryInfo() {
		$query = [
			'tables' => [ 'code_prop_changes', 'code_rev' ],
			'fields' => array_keys( $this->getFieldNames() ),
			'conds' => [ 'cpc_repo_id' => $this->mRepo->getId(), 'cpc_attrib' => 'status' ],
			'join_conds' => [
				'code_rev' => [ 'LEFT JOIN', 'cpc_repo_id = cr_repo_id AND cpc_rev_id = cr_id' ]
			],
			'options' => [],
		];

		if ( count( $this->mView->mPath ) ) {
			$query['tables'][] = 'code_paths';
			$query['join_conds']['code_paths'] = [
				'INNER JOIN', 'cpc_repo_id = cp_repo_id AND cpc_rev_id = cp_rev_id'
			];
			$query['conds']['cp_path'] = $this->mView->mPath;
		}
		if ( $this->mView->mAuthor ) {
			$query['conds']['cpc_user_text'] = User::newFromName( $this->mView->mAuthor )->getName();
		}

		return $query;
	}

	public function getFieldNames() {
		return [
			'cpc_timestamp' => $this->msg( 'code-field-timestamp' )->text(),
			'cpc_user_text' => $this->msg( 'code-field-user' )->text(),
			'cpc_rev_id' => $this->msg( 'code-field-id' )->text(),
			'cr_author' => $this->msg( 'code-field-author' )->text(),
			'cr_message' => $this->msg( 'code-field-message' )->text(),
			'cpc_removed' => $this->msg( 'code-old-status' )->text(),
			'cpc_added' => $this->msg( 'code-new-status' )->text(),
			'cr_status' => $this->msg( 'code-field-status' )->text(),
		];
	}

	public function formatValue( $name, $value ) {
		$linkRenderer = \MediaWiki\MediaWikiServices::getInstance()->getLinkRenderer();
		// Give grep a chance to find the usages:
		// code-status-new, code-status-fixme, code-status-reverted, code-status-resolved,
		// code-status-ok, code-status-deferred, code-status-old
		switch ( $name ) {
		case 'cpc_rev_id':
			return $linkRenderer->makeLink(
				SpecialPage::getTitleFor( 'Code',
					$this->mRepo->getName() . '/' . $value . '#code-changes' ),
				$value
			);
		case 'cr_author':
			return $this->mView->authorLink( $value );
		case 'cr_message':
			return $this->mView->messageFragment( $value );
		case 'cr_status':
			return $linkRenderer->makeLink(
				SpecialPage::getTitleFor( 'Code',
					$this->mRepo->getName() . '/status/' . $value ),
				$this->mView->statusDesc( $value ) );
		case 'cpc_user_text':
			return Linker::userLink( -1, $value );
		case 'cpc_removed':
			return $this->msg( $value ? "code-status-$value" : 'code-status-new' )->escaped();
		case 'cpc_added':
			return $this->msg( "code-status-$value" )->escaped();
		case 'cpc_timestamp':
			return $this->getLanguage()->timeanddate( $value, true );
		}

		throw new Exception( '$name is invalid input.' );
	}

	public function getTitle() {
		return SpecialPage::getTitleFor( 'Code', $this->mRepo->getName() . '/statuschanges' );
	}
}
