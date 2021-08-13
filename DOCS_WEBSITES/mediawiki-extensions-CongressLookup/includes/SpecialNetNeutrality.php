<?php
/**
 * This class creates a page which asks the user for their state. It then sends them to
 * the Special:SenatorLookup page with the appropriate state info.
 */
class SpecialNetNeutrality extends UnlistedSpecialPage {

	public function __construct() {
		// Register special page
		parent::__construct( 'NetNeutrality' );
	}

	/**
	 * Shows the page to the user.
	 * @param string $sub The subpage string argument (if any).
	 */
	public function execute( $sub ) {
		$out = $this->getOutput();
		$out->enableOOUI();
		$out->addModuleStyles( 'ext.congresslookup.styles' );
		$out->setPageTitle( $this->msg( 'congresslookup-net-neutrality' ) );

		$parsedHeaderMessage = $this->msg( 'net-neutrality-header' )->parse();
		$out->addHTML( Html::rawElement( 'div', [ 'class' => 'plainlinks' ], $parsedHeaderMessage ) );

		$form = new OOUI\FormLayout( [
			'method' => 'POST',
			'action' => 'Special:SenateLookup',
			'items' => [
				new OOUI\HorizontalLayout( [
					'items' => [
						new OOUI\LabelWidget( [
							'label' => 'Contact your senators:'
						] ),
						new OOUI\DropdownInputWidget( [
							'name' => 'state',
							'infusable' => true,
							'options' => [
								[ 'data' => 'AK', 'label' => 'Alaska' ],
								[ 'data' => 'AL', 'label' => 'Alabama' ],
								[ 'data' => 'AR', 'label' => 'Arkansas' ],
								[ 'data' => 'AZ', 'label' => 'Arizona' ],
								[ 'data' => 'CA', 'label' => 'California' ],
								[ 'data' => 'CO', 'label' => 'Colorado' ],
								[ 'data' => 'CT', 'label' => 'Connecticut' ],
								[ 'data' => 'DE', 'label' => 'Delaware' ],
								[ 'data' => 'FL', 'label' => 'Florida' ],
								[ 'data' => 'GA', 'label' => 'Georgia' ],
								[ 'data' => 'HI', 'label' => 'Hawaii' ],
								[ 'data' => 'IA', 'label' => 'Iowa' ],
								[ 'data' => 'ID', 'label' => 'Idaho' ],
								[ 'data' => 'IL', 'label' => 'Illinois' ],
								[ 'data' => 'IN', 'label' => 'Indiana' ],
								[ 'data' => 'KS', 'label' => 'Kansas' ],
								[ 'data' => 'KY', 'label' => 'Kentucky' ],
								[ 'data' => 'LA', 'label' => 'Louisiana' ],
								[ 'data' => 'MA', 'label' => 'Massachusetts' ],
								[ 'data' => 'MD', 'label' => 'Maryland' ],
								[ 'data' => 'ME', 'label' => 'Maine' ],
								[ 'data' => 'MI', 'label' => 'Michigan' ],
								[ 'data' => 'MN', 'label' => 'Minnesota' ],
								[ 'data' => 'MO', 'label' => 'Missouri' ],
								[ 'data' => 'MS', 'label' => 'Mississippi' ],
								[ 'data' => 'MT', 'label' => 'Montana' ],
								[ 'data' => 'NC', 'label' => 'North Carolina' ],
								[ 'data' => 'ND', 'label' => 'North Dakota' ],
								[ 'data' => 'NE', 'label' => 'Nebraska' ],
								[ 'data' => 'NH', 'label' => 'New Hampshire' ],
								[ 'data' => 'NJ', 'label' => 'New Jersey' ],
								[ 'data' => 'NM', 'label' => 'New Mexico' ],
								[ 'data' => 'NV', 'label' => 'Nevada' ],
								[ 'data' => 'NY', 'label' => 'New York' ],
								[ 'data' => 'OH', 'label' => 'Ohio' ],
								[ 'data' => 'OK', 'label' => 'Oklahoma' ],
								[ 'data' => 'OR', 'label' => 'Oregon' ],
								[ 'data' => 'PA', 'label' => 'Pennsylvania' ],
								[ 'data' => 'RI', 'label' => 'Rhode Island' ],
								[ 'data' => 'SC', 'label' => 'South Carolina' ],
								[ 'data' => 'SD', 'label' => 'South Dakota' ],
								[ 'data' => 'TN', 'label' => 'Tennessee' ],
								[ 'data' => 'TX', 'label' => 'Texas' ],
								[ 'data' => 'UT', 'label' => 'Utah' ],
								[ 'data' => 'VA', 'label' => 'Virginia' ],
								[ 'data' => 'VT', 'label' => 'Vermont' ],
								[ 'data' => 'WA', 'label' => 'Washington' ],
								[ 'data' => 'WI', 'label' => 'Wisconsin' ],
								[ 'data' => 'WV', 'label' => 'West Virginia' ],
								[ 'data' => 'WY', 'label' => 'Wyoming' ]
							]
						] ),
						new OOUI\ButtonInputWidget( [
							'name' => 'Lookup',
							'label' => 'Lookup',
							'type' => 'submit',
							'flags' => [ 'primary', 'progressive' ],
							'icon' => 'search',
							'infusable' => true
						] )
					]
				] )
			]
		] );

		$out->addHTML( Html::rawElement( 'div', [ 'class' => 'stateform' ], $form ) );

		$parsedFooterMessage = $this->msg( 'net-neutrality-footer' )->parse();
		$out->addHTML( Html::rawElement( 'div', [ 'class' => 'plainlinks' ], $parsedFooterMessage ) );
	}
}
