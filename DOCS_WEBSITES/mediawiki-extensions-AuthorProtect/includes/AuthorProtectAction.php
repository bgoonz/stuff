<?php

use MediaWiki\MediaWikiServices;

class AuthorProtectAction extends FormAction {

	/**
	 * @inheritDoc
	 */
	public function getName() {
		return 'authorprotect';
	}

	/**
	 * @inheritDoc
	 */
	public function getRestriction() {
		return 'authorprotect';
	}

	/**
	 * @param User $user
	 */
	protected function checkCanExecute( User $user ) {
		parent::checkCanExecute( $user );

		if ( !AuthorProtect::userIsAuthor( $user, $this->getTitle() ) ) {
			throw new ErrorPageError( 'errorpagetitle', 'authorprotect-notauthor', [ $user->getName() ] );
		}

		if ( class_exists( 'MediaWiki\Permissions\PermissionManager' ) ) {
			// MW 1.33+
			$errors = MediaWikiServices::getInstance()->getPermissionManager()
				->getPermissionErrors(
					'protect',
					$user,
					$this->getTitle(),
					'secure',
					[ 'badaccess-groups' ]
				);
		} else {
			$errors = $this->getTitle()->getUserPermissionsErrors(
				'protect',
				$user,
				'secure',
				[ 'badaccess-groups' ]
			);
		}

		$errors = array_values( $errors );
		if ( $errors ) {
			throw new PermissionsError( 'authorprotect', $errors );
		}
	}

	/**
	 * @inheritDoc
	 */
	protected function getPageTitle() {
		return wfMessage( 'authorprotect' )->escaped();
	}

	/**
	 * @inheritDoc
	 */
	protected function getDescription() {
		// page subtitle
		return '';
	}

	/**
	 * @inheritDoc
	 */
	protected function preText() {
		return $this->msg( 'authorprotect-intro' )->parseAsBlock();
	}

	/**
	 * @inheritDoc
	 */
	public function onSuccess() {
		$this->getOutput()->addWikiMsg( 'authorprotect-success' );
	}

	/**
	 * @param mixed $data
	 *
	 * @return bool
	 */
	public function onSubmit( $data ) {
		$title = $this->getTitle();
		$user = $this->getUser();
		$out = $this->getOutput();
		$restrictionTypes = $title->getRestrictionTypes();

		$restrictions = [];
		$expiration = [];
		$expiry = $this->getExpiry( $data['ExpiryTime'] );

		foreach ( $restrictionTypes as $type ) {
			// FIXME: schema supports multiple restrictions on a page, but there is no real functionality
			// to work with this in MediaWiki core. Once core fully supports multiple restrictions, this will
			// need to be updated to work with that. Otherwise, we could be accidentally obliterating restrictions.
			$rest = $title->getRestrictions( $type );
			if ( $rest !== [] ) {
				if ( !call_user_func_array( [ $user, 'isAllowedAll' ], $rest ) ) {
					// don't let them lower the protection level
					$restrictions[$type] = implode( '', $rest );
					$expiration[$type] = $title->getRestrictionExpiry( $type );
					continue;
				}
			}

			if ( $data["check-{$type}"] ) {
				$restrictions[$type] = 'author';
				$expiration[$type] = $expiry;
			} else {
				if ( in_array( 'author', $rest ) ) {
					$restrictions[$type] = '';
					$expiration[$type] = '';
				} else {
					$restrictions[$type] = implode( '', $rest );
					$expiration[$type] = $title->getRestrictionExpiry( $type );
				}
			}
		}

		$article = Article::newFromTitle( $title, $this->getContext() );
		$cascade = false;
		$success = $article->getPage()->doUpdateRestrictions(
			$restrictions,
			$expiration,
			// cascading protection disabled, need to pass by reference
			$cascade,
			$data['Reason'],
			$user
		);

		return $success;
	}

	/**
	 * @return string[] html
	 */
	protected function getFormFields() {
		$title = $this->getTitle();
		$request = $this->getRequest();
		$user = $this->getUser();
		$out = $this->getOutput();
		$restrictionTypes = $title->getRestrictionTypes();

		$fields = [];

		foreach ( $title->getRestrictionTypes() as $type ) {
			$rest = $title->getRestrictions( $type );

			if ( $rest !== [] ) {
				if ( !call_user_func_array( [ $user, 'isAllowedAll' ], $rest ) ) {
					// it's protected at a level higher than them,
					// so don't let them change it so they can now mess with stuff
					continue;
				}
			}

			// Give grep a chance to find the usages:
			// authorprotect-edit, authorprotect-move
			$checked = in_array( 'author', $rest );
			$fields["check-$type"] = [
				'type' => 'check',
				'name' => "check-$type",
				'label-message' => "authorprotect-$type",
				'default' => $checked
			];
		}

		$fields['ExpiryTime'] = [
			'type' => 'text',
			'label-message' => 'protectexpiry'
		];

		$fields['Reason'] = [
			'type' => 'text',
			'label-message' => [ 'protectcomment', 'reason' ]
		];

		return $fields;
	}

	/**
	 * Forked from ProtectionForm::getExpiry and modified to rewrite '' to infinity
	 *
	 * @param string $value
	 *
	 * @return string
	 */
	private function getExpiry( $value ) {
		if ( $value == 'infinite' || $value == 'indefinite' || $value == 'infinity' || $value == '' ) {
			$time = wfGetDB( DB_REPLICA )->getInfinity();
		} else {
			$unix = strtotime( $value );

			if ( !$unix || $unix === -1 ) {
				return false;
			}

			// Fixme: non-qualified absolute times are not in users specified timezone
			// and there isn't notice about it in the ui
			$time = wfTimestamp( TS_MW, $unix );
		}

		return $time;
	}

	/**
	 * @inheritDoc
	 */
	protected function usesOOUI() {
		return true;
	}
}
