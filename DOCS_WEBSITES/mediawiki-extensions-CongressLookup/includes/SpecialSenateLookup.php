<?php
/**
 * This class uses the state to look up information about the user's senate representatives
 * and presents that information to the user.
 */
class SpecialSenateLookup extends UnlistedSpecialPage {

	protected $state = null;

	protected $senators = [];

	public function __construct() {
		// Register special page
		parent::__construct( 'SenateLookup' );
	}

	/**
	 * Shows the page to the user.
	 * @param string $sub The subpage string argument (if any).
	 */
	public function execute( $sub ) {
		$out = $this->getOutput();
		$out->addModuleStyles( 'ext.congresslookup.styles' );
		$out->setPageTitle( $this->msg( 'congresslookup-senator-contact' ) );

		// Pull in query string parameters
		$state = $this->getRequest()->getVal( 'state' );

		if ( strlen( $state ) !== 2 ) {
			$out->addHTML(
				Html::element(
					'div',
					[ 'class' => 'error' ],
					$this->msg( 'congresslookup-state-error' )->text()
				)
			);
			return;
		}

		$this->state = $state;
		// Load the contact information
		$this->loadSenators();
		$myContactArray = [];
		foreach ( $this->senators as $senator ) {
			if ( isset( $senator['state'] ) && $senator['state'] === $state ) {
				$myContactArray['contacts'][] = $senator;
			}
		}

		if ( !$myContactArray ) {
			$out->addHTML(
				Html::element(
					'div',
					[ 'class' => 'error' ],
					$this->msg( 'congresslookup-senator-error' )->text()
				)
			);
			return;
		}

		// Build the HTML table
		$templateParser = new TemplateParser( __DIR__ . '/templates' );
		$contactsHtml = $templateParser->processTemplate( 'contacts', $myContactArray );
		$out->addHTML( $contactsHtml );
		// Show sidebar content
		$parsedSidebarMessage = $this->msg( 'net-neutrality-sidebar' )->parse();
		$out->addHTML(
			Html::rawElement(
				'div',
				[ 'class' => 'plainlinks', 'id' => 'instructions' ],
				$parsedSidebarMessage
			)
		);
	}

	/**
	 * Load senators from a json file.
	 */
	protected function loadSenators() {
		$contents = file_get_contents( __DIR__ . '/senators.json' );
		$contents = json_decode( $contents, true );
		if ( $contents ) {
			$this->senators = $contents['senators'];
		}
	}
}
