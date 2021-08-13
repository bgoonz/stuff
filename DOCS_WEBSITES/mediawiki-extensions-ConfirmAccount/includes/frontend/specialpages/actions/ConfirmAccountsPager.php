<?php

/**
 * Query to list out pending accounts
 */
class ConfirmAccountsPager extends ReverseChronologicalPager {
	public $mForm, $mConds;

	function __construct(
		$form, $conds, $type, $rejects = false, $showHeld = false, $showStale = false
	) {
		$this->mForm = $form;
		$this->mConds = $conds;

		$this->mConds['acr_type'] = $type;

		$this->rejects = $rejects;
		$this->stale = $showStale;
		if ( $rejects || $showStale ) {
			$this->mConds['acr_deleted'] = 1;
		} else {
			$this->mConds['acr_deleted'] = 0;
			if ( $showHeld ) {
				$this->mConds[] = 'acr_held IS NOT NULL';
			} else {
				$this->mConds[] = 'acr_held IS NULL';
			}

		}
		parent::__construct();
		# Treat 20 as the default limit, since each entry takes up 5 rows.
		$urlLimit = $this->mRequest->getInt( 'limit' );
		$this->mLimit = $urlLimit ? $urlLimit : 20;
	}

	/**
	 * @return Title
	 */
	function getTitle() {
		return $this->mForm->getFullTitle();
	}

	/**
	 * @param stdClass $row
	 * @return string
	 */
	function formatRow( $row ) {
		return $this->mForm->formatRow( $row );
	}

	/**
	 * @return string
	 */
	function getStartBody() {
		if ( $this->getNumRows() ) {
			return '<ul>';
		} else {
			return '';
		}
	}

	/**
	 * @return string
	 */
	function getEndBody() {
		if ( $this->getNumRows() ) {
			return '</ul>';
		} else {
			return '';
		}
	}

	/**
	 * @return array
	 */
	function getQueryInfo() {
		$conds = $this->mConds;
		$tables = [ 'account_requests' ];
		$fields = [ 'acr_id', 'acr_name', 'acr_real_name', 'acr_registration', 'acr_held',
			'acr_user', 'acr_email', 'acr_email_authenticated', 'acr_bio', 'acr_notes',
			'acr_urls', 'acr_filename', 'acr_type', 'acr_rejected' ];
		# Stale requests have a user ID of zero
		if ( $this->stale ) {
			$conds[] = 'acr_user = 0';
		} elseif ( $this->rejects ) {
			$conds[] = 'acr_user != 0';
			$tables[] = 'user';
			$conds[] = 'acr_user = user_id';
			$fields[] = 'user_name';
			$fields[] = 'acr_rejected';
		}
		return [
			'tables' => $tables,
			'fields' => $fields,
			'conds' => $conds
		];
	}

	/**
	 * @return string
	 */
	function getIndexField() {
		return 'acr_registration';
	}
}
