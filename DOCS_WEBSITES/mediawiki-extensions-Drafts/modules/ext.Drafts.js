/* JavaScript for Drafts extension */

var wgDraft;

function Draft() {

	/* Private Members */

	// Reference to object's self
	var self = this,
		// Configuration settings
		configuration = null,
		// State of the draft as it pertains to asynchronous saving
		state = 'unchanged',
		// Timer handle for auto-saving
		timer = null,
		// Reference to edit form draft is being edited with
		form = null;

	/* Functions */

	/**
	 * Sets the state of the draft
	 *
	 * @param {string} newState
	 */
	this.setState = function ( newState ) {
		if ( state !== newState ) {
			// Stores state information
			state = newState;
			// Updates UI elements
			var button = OO.ui.ButtonWidget.static.infuse( $( '#wpDraftWidget' ) );
			switch ( state ) {
				case 'unchanged':
					button.setDisabled( true );
					button.setLabel( mediaWiki.message( 'drafts-save-save' ).text() );
					break;
				case 'changed':
					button.setDisabled( false );
					button.setLabel( mediaWiki.message( 'drafts-save-save' ).text() );
					break;
				case 'saved':
					button.setDisabled( true );
					button.setLabel( mediaWiki.message( 'drafts-save-saved' ).text() );
					break;
				case 'saving':
					button.setDisabled( true );
					button.setLabel( mediaWiki.message( 'drafts-save-saving' ).text() );
					break;
				case 'error':
					button.setDisabled( true );
					button.setLabel( mediaWiki.message( 'drafts-save-error' ).text() );
					break;
				default: break;
			}
		}
	};

	/**
	 * Gets the state of the draft
	 *
	 * @return {string} 'unchanged', 'changed', 'saved', 'saving' or 'error'
	 */
	this.getState = function () {
		return state;
	};

	/**
	 * Sends draft data to server to be saved
	 *
	 * @param {Event} event
	 */
	this.save = function ( event ) {
		event.preventDefault();
		// Checks if a save is already taking place
		if ( state === 'saving' ) {
			// Exits function immediately
			return;
		}
		// Sets state to saving
		self.setState( 'saving' );
		var params = {
			action: 'savedrafts',
			drafttoken: form.wpDraftToken.value,
			token: form.wpEditToken.value,
			id: form.wpDraftID.value,
			title: form.wpDraftTitle.value,
			section: form.wpSection.value,
			starttime: form.wpStarttime.value,
			edittime: form.wpEdittime.value,
			scrolltop: form.wpTextbox1.scrollTop,
			text: form.wpTextbox1.value,
			summary: form.wpSummary.value
		};

		if ( form.wpMinoredit !== undefined && form.wpMinoredit.checked ) {
			params.minoredit = 1;
		}

		// Performs asynchronous save on server
		var api = new mediaWiki.Api();
		api.post( params ).done( self.respond ).fail( self.respond );

		// Re-allow request if it is not done in 10 seconds
		self.timeoutID = window.setTimeout(
			"wgDraft.setState( 'changed' );", 10000
		);
		// Ensure timer is cleared in case we saved manually before it expired
		clearTimeout( timer );
		timer = null;
	};

	/**
	 * Updates the user interface to represent being out of sync with the server
	 */
	this.change = function () {
		// Sets state to changed
		self.setState( 'changed' );
		// Checks if timer is pending and if we want to wait for user input
		if ( !configuration.autoSaveBasedOnInput ) {
			if ( timer ) {
				return;
			}
			if ( configuration.autoSaveWait && configuration.autoSaveWait > 0 ) {
				// Sets timer to save automatically after a period of time
				timer = setTimeout(
					'wgDraft.save();', configuration.autoSaveWait * 1000
				);
			}
			return;
		}

		if ( timer ) {
			// Clears pending timer
			clearTimeout( timer );
		}
		// Checks if auto-save wait time was set, and that it's greater than 0
		if ( configuration.autoSaveWait && configuration.autoSaveWait > 0 ) {
			// Sets timer to save automatically after a period of time
			timer = setTimeout(
				'wgDraft.save();', configuration.autoSaveWait * 1000
			);
		}
	};

	/**
	 * Initializes the user interface
	 */
	this.initialize = function () {
		// Cache edit form reference
		form = document.editform;
		// Check to see that the form and controls exist
		if ( form && form.wpDraftSave ) {
			// Handle manual draft saving through clicking the save draft button
			jQuery( form.wpDraftSave ).on( 'click', function ( event ) {
				self.save( event );
			} );
			// Handle keeping track of state by watching for changes to fields
			jQuery( form.wpTextbox1 ).on( 'keypress keyup keydown paste cut', self.change );
			jQuery( form.wpSummary ).on( 'keypress keyup keydown paste cut', self.change );
			if ( form.wpMinoredit ) {
				jQuery( form.wpMinoredit ).on( 'change', self.change );
			}
			// Handle clicks on "Discard" links in the table above the editor when there
			// are saved drafts for a page
			jQuery( '.mw-discard-draft-link' ).on( 'click', function ( event ) {
				// *Always* prevent default action, which is to follow the link
				// eslint-disable-next-line no-alert
				if ( !confirm( mediaWiki.msg( 'drafts-view-warn' ) ) ) {
					event.preventDefault();
				}
			} );
			// Gets configured specific values
			configuration = {
				autoSaveWait: mediaWiki.config.get( 'wgDraftAutoSaveWait' ),
				autoSaveTimeout: mediaWiki.config.get( 'wgDraftAutoSaveTimeout' ),
				autoSaveBasedOnInput: mediaWiki.config.get( 'wgDraftAutoSaveInputBased' )
			};
		}
	};

	/**
	 * Responds to the server after a save request has been handled
	 *
	 * @param {Object} data
	 */
	this.respond = function ( data ) {
		// Checks that an error did not occur
		if ( data.savedrafts && data.savedrafts.id ) {
			// Changes state to saved
			self.setState( 'saved' );
			// Gets id of newly inserted draft (or updates if it already exists)
			// and stores it in a hidden form field
			form.wpDraftID.value = data.savedrafts.id;
		} else {
			// Changes state to error
			self.setState( 'error' );
		}
	};
}

wgDraft = new Draft();
window.wgDraft = wgDraft; // Expose this due to the various setTimeout() calls
wgDraft.initialize();
