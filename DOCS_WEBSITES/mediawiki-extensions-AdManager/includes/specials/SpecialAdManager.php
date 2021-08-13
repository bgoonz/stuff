<?php

class SpecialAdManager extends FormSpecialPage {
	/** @var array|null */
	private $zones;
	/** @var array|null */
	private $adTexts;

	public function __construct() {
		parent::__construct( 'AdManager', 'admanager' );
	}

	/**
	 * Show the special page
	 *
	 * @param string|null $query Parameter passed to the special page or null
	 */
	public function execute( $query ) {
		if ( !AdManager::tableExists() ) {
			throw new ErrorPageError( 'internalerror', 'admanager_notable' );
		}
		// Fetch current zones table into array
		$this->zones = AdManagerZones::getZonesFromDB();
		if ( empty( $this->zones ) ) {
			throw new ErrorPageError( 'internalerror', 'admanager_noAdManagerZones' );
		}

		// Add the "blank zone" which represents pages/categories should definitely
		// not be shown, even if their category/parent category was otherwise set
		$this->zones[] = AdManagerZones::getBlankZoneID();

		$this->adTexts = AdManager::getAdTextsFromDB();

		parent::execute( $query );
	}

	/**
	 * Called from execute() to check if the given user can perform this action.
	 * Failures here must throw subclasses of ErrorPageError.
	 * @param User $user
	 * @return bool True
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
		$formFields = [];
		// Add a textarea for each zone and type
		foreach ( $this->zones as $zone ) {
			foreach ( AdManager::getTypes() as $type ) {
				if ( isset( $this->adTexts[$type][$zone] ) ) {
					$default = implode( "\n", $this->adTexts[$type][$zone] );
				} else {
					$default = '';
				}
				$name = "textarea_{$zone}_{$type}";
				$formFields[$name] = [
					'section' => $zone,
					'name' => $name,
					'label-message' => "admanager_label$type",
					'class' => 'HTMLTextAreaField',
					'cssclass' => 'am_textarea',
					'cols' => 40,
					'rows' => 15,
					'default' => $default
				];
			}
		}
		return $formFields;
	}

	/**
	 * Process the form on POST submission.
	 * @param array $data
	 * @return bool|string|array|Status As documented for HTMLForm::trySubmit.
	 */
	public function onSubmit( array $data ) {
		$ads = $this->dataToArray( $data );
		$adManager = new AdManager( $ads );
		return $adManager->execute();
	}

	/**
	 * Play with the HTMLForm
	 * @param HTMLForm $form
	 */
	protected function alterForm( HTMLForm $form ) {
		$form->setDisplayFormat( 'div' );
		$form->setWrapperLegend( false );
		foreach ( $this->zones as $zone ) {
			$form->setHeaderText( $this->getZoneLabel( $zone ), $zone );
		}
		$form->setSubmitTextMsg( 'admanager_submit' );
	}

	/**
	 * Get the header for this zone
	 *
	 * @param string $zone
	 * @return string
	 */
	public function getZoneText( $zone ) {
		// Check if this is the "NOAD" zone
		if ( $zone == AdManagerZones::getBlankZoneID() ) {
			$zoneText = $this->msg( 'admanager_noads' )->text();
		} else {
			$zoneText = $zone;
		}

		return $zoneText;
	}

	/**
	 * Get the name of this zone
	 *
	 * @param string $zone
	 * @return string
	 */
	public function getZoneLabel( $zone ) {
		return $this->msg( 'admanager_zonenum', $this->getZoneText( $zone ) )->text();
	}

	public function onSuccess() {
		$this->getOutput()->wrapWikiTextAsInterface(
			'successbox',
			$this->msg( 'admanager_added' )->plain()
		);
		$this->getOutput()->addWikiTextAsInterface( '<br clear="both">' );

		$this->getOutput()->addWikiMsg( 'admanager_gotozones' );
		$this->getOutput()->addWikiMsg( 'admanager_return' );
	}

	/**
	 * Add pre-text to the form
	 * @return string HTML which will be sent to $form->addPreText()
	 */
	protected function preText() {
		return $this->msg( 'admanager_docu' )->parseAsBlock();
	}

	/**
	 * Add post-text to the form
	 * @return string HTML which will be sent to $form->addPostText()
	 */
	protected function postText() {
		return $this->msg( 'admanager_gotozones' )->parseAsBlock();
	}

	/**
	 * Convert all the textareas into an array of ads
	 *
	 * @param array $data
	 * @return array
	 */
	private function dataToArray( array $data ) {
		// Load user input and do error checking
		$types = AdManager::getTypes();
		$ads = [];
		foreach ( $this->zones as $zone ) {
			foreach ( $types as $type ) {
				$adPages = explode( "\n", trim( $data["textarea_{$zone}_{$type}"] ) );

				foreach ( $adPages as $adPage ) {
					$adPage = trim( $adPage );
					if ( !$adPage ) {
						continue;
					}
					$ads[$type][$zone][] = $this->getAdPageTitleText( $adPage, $type );
				}
			}
		}
		return $ads;
	}

	/**
	 * Get the text representation of this ad page
	 *
	 * @param string $adPage
	 * @param string $type
	 * @return string
	 * @throws ErrorPageError
	 */
	private function getAdPageTitleText( $adPage, $type ) {
		if ( $type == 'Page' ) {
			$pageObject = Title::newFromText( trim( $adPage ) );
			/** @todo disallows Specials */
			if ( !$pageObject->exists() ) {
				throw new ErrorPageError( 'internalerror', 'admanager_invalidtargetpage',
				$adPage );
			} else {
				return $adPage;
			}
		} else {
			$categoryObject = Category::newFromName( $adPage );
			if ( !$categoryObject->getID() ) {
				throw new ErrorPageError( 'internalerror',
				'admanager_invalidtargetcategory', $adPage );
			} else {
				return $adPage;
			}
		}
	}
}
