<?php

/**
 * Handle the special page and process with the AdManagerZones class
 */
class SpecialAdManagerZones extends FormSpecialPage {
	/**
	 * @var AdManagerZones DB layer
	 */
	private $adManagerZones;

	public function __construct() {
		parent::__construct( 'AdManagerZones', 'admanager' );
	}

	/**
	 * Show the special page
	 *
	 * @param string|null $query Parameter passed to the special page or null
	 */
	public function execute( $query ) {
		if ( !AdManagerZones::tableExists() ) {
			throw new ErrorPageError( 'internalerror', 'admanager_notable' );
		}

		parent::execute( $query );
	}

	/**
	 * Called from execute() to check if the given user can perform this action.
	 * Failures here must throw subclasses of ErrorPageError.
	 *
	 * @param User $user
	 * @return true
	 */
	protected function checkExecutePermissions( User $user ) {
		parent::checkExecutePermissions( $user );
		// Check that the user is allowed to access this special page
		if ( !$user->isAllowed( 'admanager' ) ) {
			throw new PermissionsError( 'admanager' );
		}
		return true;
	}

	/**
	 * Get an HTMLForm descriptor array
	 * @return array
	 */
	protected function getFormFields() {
		return [
			'zones' => [
				'class' => 'HTMLTextAreaField',
				'style' => 'margin-bottom: 1em;',
				'default' => implode( "\n", AdManagerZones::getZonesFromDB() ),
				'cols' => 25,
				'rows' => 20,
				'validation-callback' => __CLASS__ . '::validateZonesText'
			]
		];
	}

	/**
	 * Process the form on POST submission.
	 * @param array $data
	 * @return bool
	 */
	public function onSubmit( array $data ) {
		$zones = explode( "\n", $data['zones'] );
		$this->adManagerZones = new AdManagerZones( array_filter( $zones ) ); // remove blanks
		return $this->adManagerZones->execute();
	}

	/**
	 * Output a nice box listing the zones now in the db and some links
	 */
	public function onSuccess() {
		$this->getOutput()->wrapWikiTextAsInterface(
			'successbox',
			$this->getZonesAddedMessage() .
			$this->getZonesRemovedMessage()
		);
		$this->getOutput()->addWikiTextAsInterface( '<br clear="both">' );

		$this->getOutput()->addWikiMsg( 'admanager_gotoads' );
		$this->getOutput()->addReturnTo( $this->getPageTitle() );
	}

	/**
	 * Play with the HTMLForm
	 *
	 * @param HTMLForm $form
	 */
	protected function alterForm( HTMLForm $form ) {
		$form->setDisplayFormat( 'div' );
		$form->setWrapperLegendMsg( 'admanagerzones_docu' );
		$form->setSubmitTextMsg( 'admanager_submit' );
	}

	/**
	 * Add post-text to the form
	 *
	 * @return string HTML which will be sent to $form->addPostText()
	 */
	protected function postText() {
		return $this->msg( 'admanager_gotoads' )->parseAsBlock();
	}

	/**
	 * Validate a string of text containing zones
	 *
	 * @param string $zonesText Each zone must be delimited by \n
	 * @return bool
	 */
	public static function validateZonesText( $zonesText ) {
		$zones = explode( "\n", $zonesText );
		return AdManagerZones::validateZones( $zones );
	}

	/**
	 * Get the complete message detailing which zones were added
	 *
	 * @return string Message
	 */
	public function getZonesAddedMessage() {
		$zonesToAdd = $this->adManagerZones->getZonesToAdd();
		if ( empty( $zonesToAdd ) ) {
			return "\n* " . $this->msg( 'admanager_nozonesadded' )->escaped();
		}

		$text = '';
		foreach ( $zonesToAdd as $zone ) {
			$text .= "\n* " . $this->msg( 'admanager_addedzone', $zone )->escaped();
		}
		return $text;
	}

	/**
	 * Get the complete message detailing which zones were removed
	 *
	 * @return string Message
	 */
	public function getZonesRemovedMessage() {
		$zonesToRemove = $this->adManagerZones->getZonesToRemove();
		if ( empty( $zonesToRemove ) ) {
			return "\n* " . $this->msg( 'admanager_nozonesremoved' )->escaped();
		}

		$text = '';
		foreach ( $zonesToRemove as $zone ) {
			$text .= "\n* " . $this->msg( 'admanager_removedzone', $zone )->escaped();
		}

		return $text;
	}
}
