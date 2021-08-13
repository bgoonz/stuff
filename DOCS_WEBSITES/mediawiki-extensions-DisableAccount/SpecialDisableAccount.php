<?php
/**
 * @todo This should use FormSpecialPage
 */
class SpecialDisableAccount extends SpecialPage {
	function __construct() {
		parent::__construct( 'DisableAccount', 'disableaccount' );
	}

	public function doesWrites() {
		return true;
	}

	public function execute( $par ) {
		$this->setHeaders();
		$this->checkPermissions();

		$formFields = [
			'account' => [
				'type' => 'text',
				'required' => true,
				'label-message' => 'disableaccount-user',
			],
			'confirm' => [
				'type' => 'toggle',
				'validation-callback' => [ __CLASS__, 'checkConfirmation' ],
				'label-message' => 'disableaccount-confirm',
			],
		];

		$htmlForm = HTMLForm::factory( 'ooui', $formFields, $this->getContext(), 'disableaccount' );

		$htmlForm->setSubmitCallback( [ __CLASS__, 'submit' ] );

		$htmlForm->show();
	}

	static function checkConfirmation( $field, $allFields ) {
		if ( $field ) {
			return true;
		} else {
			return wfMessage( 'disableaccount-mustconfirm' )->parse();
		}
	}

	static function submit( $fields, $form ) {
		global $wgOut;

		// While we're not actually turning the user into a "system" user, it
		// has the same end result: all passwords and other authentication
		// credentials removed or set to something invalid, email blanked,
		// token invalidated, and existing sessions dropped. So let's just use
		// that if possible instead of duplicating all the code.
		if ( is_callable( 'User::newSystemUser' ) ) {
			$user = User::newSystemUser( $fields['account'], [ 'create' => false, 'steal' => true ] );
			if ( !$user ) {
				return wfMessage( 'disableaccount-nosuchuser', $fields['account'] )->text();
			}
		} else {
			$user = User::newFromName( $fields['account'] );

			if ( !$user || $user->getId() === 0 ) {
				return wfMessage( 'disableaccount-nosuchuser', $fields['account'] )->text();
			}

			$user->setPassword( null );
			$user->setEmail( null );
			$user->setToken();
		}

		$user->addGroup( 'inactive' );

		$user->saveSettings();
		$user->invalidateCache();

		$logEntry = new ManualLogEntry( 'block', 'disableaccount' );
		$logEntry->setPerformer( $form->getUser() );
		$logEntry->setTarget( $user->getUserPage() );
		$logEntry->setParameters( [ '4::targetUsername' => $user->getName() ] );
		$logId = $logEntry->insert();
		$logEntry->publish( $logId );

		$wgOut->addWikiMsg( 'disableaccount-success', $user->getName() );

		return true;
	}
}
