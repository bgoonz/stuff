/**
 * ArticleFeedback special page
 *
 * @package    ArticleFeedback
 * @subpackage Resources
 * @author     Greg Chiasson <gchiasson@omniti.com>
 * @author     Yoni Shostak <yoni@omniti.com>
 * @author     Reha Sterbin <reha@omniti.com>
 * @author     Matthias Mullie <mmullie@wikimedia.org>
 */

( function ( $, mw ) {

	// {{{ articleFeedbackv5special definition

	$.articleFeedbackv5special = {};

	// {{{ Properties

	/**
	 * What page is this?
	 */
	$.articleFeedbackv5special.page = undefined;

	/**
	 * Are we at the watchlist page?
	 */
	$.articleFeedbackv5special.watchlist = undefined;

	/**
	 * The url to which to send the pull request
	 */
	$.articleFeedbackv5special.apiUrl = mw.util.wikiScript( 'api' );

	/**
	 * The current user type
	 *
	 * anon = Unregistered
	 * registered = Registered
	 * editor = Autoconfirmed
	 * monitor = Rollbacker / Reviewer
	 * oversighter = Oversighter
	 *
	 * @see https://www.mediawiki.org/wiki/Article_feedback/Version_5/Feature_Requirements#Access_and_permissions
	 */
	$.articleFeedbackv5special.userType = undefined;

	/**
	 * The referral -- how the user got to this page
	 *
	 * url  = Typed in the url directly
	 * cta  = Clicked on the link in CTA 5
	 * talk = Clicked on the link in the talk page
	 */
	$.articleFeedbackv5special.referral = undefined;

	/**
	 * Controls for the list: sort, filter, continue flag, etc
	 */
	$.articleFeedbackv5special.listControls = {
		filter: mw.config.get( 'afStartingFilter' ),
		feedbackId: mw.config.get( 'afStartingFeedbackId' ), // Permalinks require a feedback ID
		sort: mw.config.get( 'afStartingSort' ),
		sortDirection: mw.config.get( 'afStartingSortDirection' ),
		offset: null,
		disabled: false,	// Prevent (at least limit) a flood of ajax requests.
		allowMultiple: false
	};

	/**
	 * User activity: for each feedback record on this page, anything the user
	 * has done (flagged as abuse, marked as helpful/unhelpful)
	 *
	 * @member object
	 */
	$.articleFeedbackv5special.activity = {};

	/**
	 * Filter cookie name (page id is appended on init)
	 *
	 * @member string
	 */
	$.articleFeedbackv5special.filterCookieName = 'last-filter';

	/**
	 * User activity cookie name (page id is appended on init)
	 *
	 * @member string
	 */
	$.articleFeedbackv5special.activityCookieName = 'aft-activity';

	/**
	 * Currently displayed panel host element id attribute value
	 *
	 * @member string
	 */
	$.articleFeedbackv5special.currentPanelHostId = undefined;

	/**
	 * Callback to be executed when tipsy form is submitted
	 *
	 * @member function
	 */
	$.articleFeedbackv5special.tipsyCallback = undefined;

	/**
	 * Highlighted feedback ID
	 *
	 * @member int
	 */
	$.articleFeedbackv5special.highlightId = undefined;

	// }}}
	// {{{ Init methods

	// {{{ setup

	/**
	 * Sets up the page
	 */
	$.articleFeedbackv5special.setup = function () {
		var $loading1, $loading2, hash;

		// Get the user type
		if ( mw.user.isAnon() ) {
			$.articleFeedbackv5special.userType = 'anon';
		} else if ( mw.config.get( 'wgArticleFeedbackv5Permissions' )[ 'aft-oversighter' ] ) {
			$.articleFeedbackv5special.userType = 'oversighter';
		} else if ( mw.config.get( 'wgArticleFeedbackv5Permissions' )[ 'aft-monitor' ] ) {
			$.articleFeedbackv5special.userType = 'monitor';
		} else if ( mw.config.get( 'wgArticleFeedbackv5Permissions' )[ 'aft-editor' ] ) {
			$.articleFeedbackv5special.userType = 'editor';
		} else {
			$.articleFeedbackv5special.userType = 'registered';
		}

		// Get the referral
		$.articleFeedbackv5special.referral = mw.config.get( 'afReferral' );

		// Set up config vars
		$.articleFeedbackv5special.page = mw.config.get( 'afPageId' );
		$.articleFeedbackv5special.watchlist = mw.config.get( 'wgCanonicalSpecialPageName' ) === 'ArticleFeedbackv5Watchlist' ? 1 : 0;

		// check if there is feedback
		$.articleFeedbackv5special.emptyMessage();

		// Grab the user's activity out of the cookie
		$.articleFeedbackv5special.loadActivity();

		// Bind events
		$.articleFeedbackv5special.initTipsies();

		// Bind events
		$.articleFeedbackv5special.setBinds();

		// Add a loading tag to the top and hide it
		$loading1 = mw.template.get( 'jquery.articleFeedbackv5.special', 'loading.mustache' ).render();
		$loading1.attr( 'id', $loading1.attr( 'id' ) + '-top' );
		$loading1.find( '.articleFeedbackv5-loading-message' ).text( mw.msg( 'articlefeedbackv5-loading-tag' ) );
		$loading1.hide();
		$( '#articleFeedbackv5-show-feedback' ).before( $loading1 );

		// Add a loading tag to the bottom and hide it
		$loading2 = mw.template.get( 'jquery.articleFeedbackv5.special', 'loading.mustache' ).render();
		$loading2.attr( 'id', $loading2.attr( 'id' ) + '-bottom' );
		$loading2.find( '.articleFeedbackv5-loading-message' ).text( mw.msg( 'articlefeedbackv5-loading-tag' ) );
		$loading2.hide();
		$( '#articleFeedbackv5-show-more' ).before( $loading2 );
		$( '#articleFeedbackv5-refresh-list' ).button();

		// Is there a highlighted ID?
		hash = window.location.hash.replace( '#', '' );
		if ( hash.match( /^\w+$/ ) && $.articleFeedbackv5special.filter !== 'id' ) {
			$.articleFeedbackv5special.highlightId = hash;
			$.articleFeedbackv5special.pullHighlight();
		}

		// Process preloaded feedback
		$.articleFeedbackv5special.processControls(
			mw.config.get( 'afCount' ),
			mw.config.get( 'afFilterCount' ),
			mw.config.get( 'afOffset' ),
			mw.config.get( 'afShowMore' )
		);
		$.articleFeedbackv5special.processFeedback();

	};

	// }}}

	// {{{ initTipties

	/**
	 * Initialize the flyout infowindows
	 */
	$.articleFeedbackv5special.initTipsies = function () {
		var helpLink, action, $container, tipsySubmit;

		// set tipsy defaults, once
		$.fn.tipsy.defaults = {
			delayIn: 0,					// delay before showing tooltip (ms)
			delayOut: 0,				// delay before hiding tooltip (ms)
			fade: false,				// fade tooltips in/out?
			fallback: '',				// fallback text to use when no tooltip text
			gravity: $.fn.tipsy.autoWE,	// gravity according to directionality
			html: true,					// is tooltip content HTML?
			live: false,				// use live event support?
			offset: 10,					// pixel offset of tooltip from element
			opacity: 1.0,				// opacity of tooltip
			title: 'title',				// attribute/callback containing tooltip text
			trigger: 'manual'			// how tooltip is triggered - hover | focus | manual
		};

		// clicking anywhere (but tipsy) should close an open tipsy
		$( document ).click( function ( e ) {
			if (
				// if a panel is currently open
				$.articleFeedbackv5special.currentPanelHostId !== undefined &&
				// and we did not just open it
				$.articleFeedbackv5special.currentPanelHostId !== $( e.target ).attr( 'id' ) &&
				// and we clicked outside of the open panel
				$( e.target ).parents( '.tipsy' ).length === 0
			) {
				$( '#' + $.articleFeedbackv5special.currentPanelHostId ).tipsy( 'hide' );
				$.articleFeedbackv5special.currentPanelHostId = undefined;
			}
		} );

		// Link to help is dependent on the group the user belongs to
		helpLink = mw.msg( 'articlefeedbackv5-help-special-linkurl' );
		if ( mw.config.get( 'wgArticleFeedbackv5Permissions' )[ 'aft-oversighter' ] ) {
			helpLink = mw.msg( 'articlefeedbackv5-help-special-linkurl-oversighters' );
		} else if ( mw.config.get( 'wgArticleFeedbackv5Permissions' )[ 'aft-monitor' ] ) {
			helpLink = mw.msg( 'articlefeedbackv5-help-special-linkurl-monitors' );
		} else if ( mw.config.get( 'wgArticleFeedbackv5Permissions' )[ 'aft-editor' ] ) {
			helpLink = mw.msg( 'articlefeedbackv5-help-special-linkurl-editors' );
		}

		// localize tipsies
		for ( action in $.articleFeedbackv5special.actions ) {
			$container = $( '<div></div>' );
			if ( $.articleFeedbackv5special.actions[ action ].hasTipsy && $.articleFeedbackv5special.actions[ action ].tipsyHtml === undefined ) {
				$container.html( mw.template.get( 'jquery.articleFeedbackv5.special', 'note-panel.mustache' ).render() );
				$container.find( '#articleFeedbackv5-noteflyover-caption' ).text( mw.msg( 'articlefeedbackv5-noteflyover-' + action + '-caption' ) );
				$container.find( '#articleFeedbackv5-noteflyover-description' ).html( mw.config.get( 'mw.msg.articlefeedbackv5-noteflyover-' + action + '-description' ) );
				$container.find( '#articleFeedbackv5-noteflyover-label' ).text( mw.msg( 'articlefeedbackv5-noteflyover-' + action + '-label' ) );
				$container.find( '#articleFeedbackv5-noteflyover-submit' ).text( mw.msg( 'articlefeedbackv5-noteflyover-' + action + '-submit' ) );
				// will add an 'action' attribute to the link
				$container.find( '#articleFeedbackv5-noteflyover-help' ).text( mw.msg( 'articlefeedbackv5-noteflyover-' + action + '-help' ) );
				$container.find( '#articleFeedbackv5-noteflyover-help' ).attr( 'href', helpLink + mw.msg( 'articlefeedbackv5-noteflyover-' + action + '-help-link' ) );
			} else {
				$container.html( $.articleFeedbackv5special.actions[ action ].tipsyHtml );
			}
			$.articleFeedbackv5special.actions[ action ].tipsyHtml = $container.html();
		}

		// Bind actions
		for ( action in $.articleFeedbackv5special.actions ) {
			$( document ).on( 'click touchstart', '.articleFeedbackv5-' + action + '-link', function ( e ) {
				var action = $( this ).data( 'action' );

				if ( !$( this ).hasClass( 'inactive' ) ) {
					$.articleFeedbackv5special.actions[ action ].click( e );
				}
			} );

			// hide actions that are supposed to have a tipsy, but have no content
			if ( $.articleFeedbackv5special.actions[ action ].hasTipsy && $.articleFeedbackv5special.actions[ action ].tipsyHtml === '' ) {
				$( '.articleFeedbackv5-' + action + '-link' ).hide();
			}
		}

		// flyover panels submit actions (post-flag comments)
		tipsySubmit = function ( e ) {
			var $container, id, $noteLink;

			e.preventDefault();

			if ( typeof $.articleFeedbackv5special.tipsyCallback === 'function' ) {
				// execute and clear callback function
				$.articleFeedbackv5special.tipsyCallback( e );
				$.articleFeedbackv5special.tipsyCallback = undefined;
			} else {
				$container = $( '#' + $.articleFeedbackv5special.currentPanelHostId ).closest( '.articleFeedbackv5-feedback' );
				id = $container.data( 'id' );
				$noteLink = $container.find( '#articleFeedbackv5-note-link-' + id );

				$.articleFeedbackv5special.addNote(
					id,
					$container.data( 'pageid' ),
					$noteLink.data( 'log-id' ),
					$noteLink.data( 'action' ),
					$( '#articleFeedbackv5-noteflyover-note' ).attr( 'value' )
				);
			}

			// hide tipsy
			$( '#' + $.articleFeedbackv5special.currentPanelHostId ).tipsy( 'hide' );
			$.articleFeedbackv5special.currentPanelHostId = undefined;
		};

		// tipsies can be submitted by clicking the link, or submitting the form (hitting enter key)
		$( document ).on( 'submit', 'form.articleFeedbackv5-form-flyover', tipsySubmit );
		$( document ).on( 'click touchstart', '#articleFeedbackv5-noteflyover-submit', tipsySubmit );

		// bind flyover panel close button
		$( document ).on( 'click touchstart', '#articleFeedbackv5-noteflyover-close', function ( e ) {
			e.preventDefault();
			$( '#' + $.articleFeedbackv5special.currentPanelHostId ).tipsy( 'hide' );
			$.articleFeedbackv5special.currentPanelHostId = undefined;
		} );
	};

	// }}}
	// {{{ setBinds

	/**
	 * Binds events for each of the controls
	 */
	$.articleFeedbackv5special.setBinds = function () {
		// Filter select
		$( '#articleFeedbackv5-filter-select' ).on( 'change', function () {
			var id = $( this ).val();
			if ( id === '' || id === 'X' ) {
				return false;
			}
			$.articleFeedbackv5special.toggleFilter( id );
			$.articleFeedbackv5special.loadFeedback( true, false );
			return false;
		} );

		// Disable the dividers
		$( '#articleFeedbackv5-filter-select option[value=""]' ).attr( 'disabled', true );
		$( '#articleFeedbackv5-filter-select option[value=X]' ).attr( 'disabled', true );

		// Filter links
		$( '.articleFeedbackv5-filter-link' ).on( 'click', function ( e ) {
			var id;

			e.preventDefault();
			id = $.articleFeedbackv5special.stripID( this, 'articleFeedbackv5-special-filter-' );
			$.articleFeedbackv5special.toggleFilter( id );
			$.articleFeedbackv5special.loadFeedback( true, false );
		} );

		// Sort select
		$( '#articleFeedbackv5-sort-select' ).on( 'change', function () {
			var sort = $( this ).val().split( '-' );
			if ( sort === '' ) {
				return false;
			}
			$.articleFeedbackv5special.toggleSort( sort[ 0 ], sort[ 1 ] );
			$.articleFeedbackv5special.loadFeedback( true, false );
			return false;
		} );

		// Disable the dividers
		$( '#articleFeedbackv5-sort-select option[value=""]' ).attr( 'disabled', true );

		// Show more
		$( '#articleFeedbackv5-show-more' ).on( 'click', function () {
			$.articleFeedbackv5special.loadFeedback( false, false );
			return false;
		} );

		// Refresh list
		$( '#articleFeedbackv5-refresh-list' ).on( 'click', function () {
			$.articleFeedbackv5special.listControls.offset = null;
			$.articleFeedbackv5special.loadFeedback( true, false );
			return false;
		} );

		// When clicking the hidden post mask, remove the mask
		$( document ).on( 'click touchstart', '.articleFeedbackv5-post-screen', function () {
			// don't hide if it's only an empty mask (= when insufficient permissions
			// won't let the user see the feedback's details)
			if ( $( this ).parent( '.articleFeedbackv5-feedback-emptymask' ).length === 0 ) {
				$( this ).hide();
			}
		} );

		// bind short/long version toggle
		$( document ).on( 'click touchstart', '.articleFeedbackv5-comment-toggle', function ( e ) {
			e.preventDefault();
			$( e.target ).siblings( '.articleFeedbackv5-comment-short' ).hide();
			$( e.target ).siblings( '.articleFeedbackv5-comment-full' ).show();
			$( e.target ).hide();
		} );

		// switch to enable AFTv5
		$( '.articlefeedbackv5-enable-button' ).button();
		$( '#articlefeedbackv5-enable' ).on( 'click', function ( e ) {
			e.preventDefault();

			$.aftUtils.setStatus( $.articleFeedbackv5special.page, 1, function ( data, error ) {
				// refresh page to reflect changes
				if ( data !== false ) {
					location.reload( true );
				} else if ( error ) {
					alert( error );
				}
			} );
		} );
	};

	// }}}
	// {{{ bindTipsies

	/**
	 * Bind panels to controls - that cannot be 'live' events due to jQuery.tipsy
	 * limitations. This function should be invoked after feedback posts are loaded,
	 * without parameters. The function should be invoked with the id parameter set
	 * after an action is executed and its link is replaced ith reverse action.
	 *
	 * @param {jQuery} $node node to bind tipsies for.
	 */
	$.articleFeedbackv5special.bindTipsies = function ( $node ) {
		$node.find( '.articleFeedbackv5-tipsy-link' )
			.tipsy( {
				title: function () {
					var action = $( this ).data( 'action' );
					return $.articleFeedbackv5special.actions[ action ].tipsyHtml;
				}
			} )
			// make sure event is only bound once (having it twice would toggle on & immediately off again)
			.off( 'click', null, $.articleFeedbackv5special.toggleTipsy )
			.on( 'click', null, null, $.articleFeedbackv5special.toggleTipsy );
	};

	// }}}

	// }}}
	// {{{ Utility methods

	// {{{ emptyMessage

	/**
	 * Checks if there is feedback loaded and outputs a message if not
	 */
	$.articleFeedbackv5special.emptyMessage = function () {
		var $feedbackContainer = $( '#articleFeedbackv5-show-feedback' );
		if ( $feedbackContainer.children().length === 0 ) {
			$feedbackContainer.append(
				$( '<div id="articlefeedbackv5-no-feedback" />' ).text(
					mw.msg( 'articlefeedbackv5-no-feedback' )
				)
			);
		} else {
			$( '#articlefeedbackv5-no-feedback' ).remove();
		}
	};

	// {{{ toggleFilter

	/**
	 * Toggle on a certain filter
	 * Please note that this will _not_ automatically fetch the new data, which requires a call to loadFeedback
	 *
	 * @param {string} id The id of the filter to be enabled
	 */
	$.articleFeedbackv5special.toggleFilter = function ( id ) {
		$.articleFeedbackv5special.listControls.filter = id;
		$.articleFeedbackv5special.listControls.offset = null;
		$.articleFeedbackv5special.setSortByFilter( id );

		// update filter in select (if present) & text-links (if any)
		$( '#articleFeedbackv5-select-wrapper' ).removeClass( 'filter-active' );
		$( '.articleFeedbackv5-filter-link' ).removeClass( 'filter-active' );
		if ( $( '#articleFeedbackv5-filter-select option[value=' + id + ']' ).length > 0 ) {
			$( '#articleFeedbackv5-select-wrapper' ).addClass( 'filter-active' );
		} else {
			$( '#articleFeedbackv5-filter-select' ).val( '' );
		}
		$( '#articleFeedbackv5-special-filter-' + id ).addClass( 'filter-active' );
	};

	// }}}
	// {{{ toggleSort

	/**
	 * Toggle on a certain sort
	 * Please note that this will _not_ automatically fetch the new data, which requires a call to loadFeedback
	 *
	 * @param {string} sort The sorting method
	 * @param {string} direction The direction to sort (asc/desc)
	 */
	$.articleFeedbackv5special.toggleSort = function ( sort, direction ) {
		direction = direction.toUpperCase();

		$.articleFeedbackv5special.listControls.sort = sort;
		$.articleFeedbackv5special.listControls.sortDirection = direction;
		$.articleFeedbackv5special.listControls.offset = null;

		$( '#articleFeedbackv5-sort-select' ).val( sort + '-' + direction );
	};

	// }}}
	// {{{ flagAction

	/**
	 * Utility method: Fire flagging-call upon clicking an action link
	 *
	 * @param {jQuery.Event} e event
	 */
	$.articleFeedbackv5special.flagAction = function ( e ) {
		var $container;

		e.preventDefault();

		$container = $( e.target ).closest( '.articleFeedbackv5-feedback' );
		if ( $.articleFeedbackv5special.canBeFlagged( $container ) ) {
			$.articleFeedbackv5special.flagFeedback(
				$container.data( 'id' ),
				$container.data( 'pageid' ),
				$( e.target ).data( 'action' ),
				'',
				{}
			);
		}
	};

	// }}}
	// {{{ toggleTipsy

	/**
	 * Utility method: Toggles tipsy display for an action link
	 *
	 * @param {jQuery.Event} e event
	 * @return {boolean} true if showing tipsy, false if hiding
	 */
	$.articleFeedbackv5special.toggleTipsy = function ( e ) {
		var $l;

		e.preventDefault();

		$l = $( e.target );

		// are we hiding the current tipsy?
		if ( $l.attr( 'id' ) === $.articleFeedbackv5special.currentPanelHostId ) {
			$l.tipsy( 'hide' );
			$.articleFeedbackv5special.currentPanelHostId = undefined;
			return false;
		} else {
			// no, we're displaying another one
			if ( $.articleFeedbackv5special.currentPanelHostId !== undefined ) {
				$( '#' + $.articleFeedbackv5special.currentPanelHostId ).tipsy( 'hide' );
			}
			$l.tipsy( 'show' );
			$.articleFeedbackv5special.currentPanelHostId = $l.attr( 'id' );

			// immediately focus text field (after all, that's what we're opening the flyout for)
			$( '#articleFeedbackv5-noteflyover-note' ).focus();

			return true;
		}
	};

	// }}}
	// {{{ stripID

	/**
	 * Utility method: Strips long IDs down to the specific bits we care about
	 *
	 * @param {Object} object
	 * @param {string} toRemove
	 * @return {string}
	 */
	$.articleFeedbackv5special.stripID = function ( object, toRemove ) {
		return $( object ).attr( 'id' ).replace( toRemove, '' );
	};

	// }}}

	// {{{ setSortByFilter

	/**
	 * Utility method: Sets the sort type and direction according to the filter
	 * passed in
	 *
	 * @param {string} filter the internal-use id of the filter
	 */
	$.articleFeedbackv5special.setSortByFilter = function ( filter ) {
		var defaults = mw.config.get( 'wgArticleFeedbackv5DefaultSorts' );
		if ( filter in defaults ) {
			$.articleFeedbackv5special.toggleSort( defaults[ filter ][ 0 ], defaults[ filter ][ 1 ] );
		} else {
			$.articleFeedbackv5special.toggleSort( 'age', 'DESC' );
		}
	};

	// }}}

	// }}}
	// {{{ Process methods

	// {{{ flagFeedback

	/**
	 * Sends the request to mark a response
	 *
	 * @param {number} id		the feedback id
	 * @param {number} pageId	the page id
	 * @param {string} action	action to execute
	 * @param {string} note		note for action (default empty)
	 * @param {Object} options	key => value pairs of additional API action-specific parameters
	 * @return {boolean}
	 */
	$.articleFeedbackv5special.flagFeedback = function ( id, pageId, action, note, options ) {
		var requestData;

		// default parameters
		note = typeof note !== undefined ? note : '';

		if ( $.articleFeedbackv5special.listControls.disabled ) {
			return false;
		}

		// This was causing problems with eg 'clicking helpful when the cookie
		// already says unhelpful', which is a case where two ajax requests
		// is perfectly legitimate.
		// Check another global variable to not disable ajax in that case.
		if ( !$.articleFeedbackv5special.listControls.allowMultiple ) {
			// Put a lock on ajax requests to prevent another one from going
			// through while this is still running. Prevents manic link-clicking
			// messing up the counts, and generally seems like a good idea.
			$.articleFeedbackv5special.listControls.disabled = true;
		}

		// Merge request data and options objects (flat)
		requestData = {
			pageid: pageId,
			feedbackid: id,
			flagtype: action,
			note: note,
			source: $.articleFeedbackv5special.getSource(),
			format: 'json',
			action: 'articlefeedbackv5-flag-feedback'
		};
		// this "options" is currently solely used to add "toggle" to params, when appropriate
		$.extend( requestData, options );

		$.ajax( {
			url: $.articleFeedbackv5special.apiUrl,
			type: 'POST',
			dataType: 'json',
			data: requestData,
			success: function ( data ) {
				var errorMessage;

				if ( 'articlefeedbackv5-flag-feedback' in data ) {
					data = data[ 'articlefeedbackv5-flag-feedback' ];

					// replace entry by new render
					if ( 'render' in data ) {
						$( '.articleFeedbackv5-feedback[data-id=' + id + ']' )
							.replaceWith( data.render );
					}

					// invoke the registered onSuccess callback for the executed action
					if ( 'onSuccess' in $.articleFeedbackv5special.actions[ action ] ) {
						$.articleFeedbackv5special.actions[ action ].onSuccess( id, data );
					}

				// display error message
				} else if ( 'error' in data ) {
					errorMessage = data.error.info;

					if ( 'render' in data.error ) {
						$( '.articleFeedbackv5-feedback[data-id=' + id + ']' )
							.replaceWith( data.error.render );

						errorMessage = mw.msg( 'articlefeedbackv5-feedback-reloaded-after-error', errorMessage );
					}

					$( '.articleFeedbackv5-feedback[data-id=' + id + '] .articleFeedbackv5-feedback-tools' )
						.append( '<p class="articleFeedbackv5-form-toolbox-error">' + errorMessage + '</p>' );
				}

				// re-mark active flags in reader tools
				$.articleFeedbackv5special.markActiveFlags( id );

				// re-bind panels (tipsies)
				$.articleFeedbackv5special.bindTipsies( $( '.articleFeedbackv5-feedback[data-id="' + id + '"]' ) );

				// re-enable ajax flagging
				$.articleFeedbackv5special.listControls.disabled = false;
			},
			error: function () {
				var errorMessage = mw.msg( 'articlefeedbackv5-error-flagging' );
				$( '.articleFeedbackv5-feedback[data-id=' + id + '] .articleFeedbackv5-feedback-tools' )
					.append( '<p class="articleFeedbackv5-form-toolbox-error">' + errorMessage + '</p>' );

				// re-enable ajax flagging
				$.articleFeedbackv5special.listControls.disabled = false;
			}
		} );
		return false;
	};

	// }}}
	// {{{ addNote

	/**
	 * Updates the previous flag with a textual comment about it
	 *
	 * @param {number} id		the feedback id
	 * @param {number} pageId	the page id
	 * @param {number} logId	the log id
	 * @param {string} action	original action
	 * @param {string} note		note for action (default empty)
	 * @return {boolean}
	 */
	$.articleFeedbackv5special.addNote = function ( id, pageId, logId, action, note ) {
		var requestData;

		// note should be filled out or there's no point in firing this request
		if ( !note ) {
			return false;
		}

		if ( $.articleFeedbackv5special.listControls.disabled ) {
			return false;
		}
		$.articleFeedbackv5special.listControls.disabled = true;

		// Merge request data and options objects (flat)
		requestData = {
			feedbackid: id,
			pageid: pageId,
			logid: logId,
			note: note,
			flagtype: action,
			source: $.articleFeedbackv5special.getSource(),
			format: 'json',
			action: 'articlefeedbackv5-add-flag-note'
		};

		$.ajax( {
			url: $.articleFeedbackv5special.apiUrl,
			type: 'POST',
			dataType: 'json',
			data: requestData,
			success: function ( data ) {
				var errorMessage;

				if ( 'articlefeedbackv5-add-flag-note' in data ) {
					data = data[ 'articlefeedbackv5-add-flag-note' ];

					// replace entry by new render
					if ( 'render' in data ) {
						$( '.articleFeedbackv5-feedback[data-id=' + id + ']' )
							.replaceWith( data.render );
					}

					// re-mark active flags in reader tools
					$.articleFeedbackv5special.markActiveFlags( id );

					// re-bind panels (tipsies)
					$.articleFeedbackv5special.bindTipsies( $( '.articleFeedbackv5-feedback[data-id="' + id + '"]' ) );

				// display error message
				} else if ( 'error' in data ) {
					errorMessage = data.error.info;

					if ( 'render' in data.error ) {
						$( '.articleFeedbackv5-feedback[data-id=' + id + ']' )
							.replaceWith( data.error.render );

						errorMessage = mw.msg( 'articlefeedbackv5-feedback-reloaded-after-error', errorMessage );
					}

					$( '.articleFeedbackv5-feedback[data-id=' + id + '] .articleFeedbackv5-feedback-tools' )
						.append( '<p class="articleFeedbackv5-form-toolbox-error">' + errorMessage + '</p>' );
				}

				// re-enable ajax flagging
				$.articleFeedbackv5special.listControls.disabled = false;
			},
			error: function () {
				var errorMessage = mw.msg( 'articlefeedbackv5-invalid-log-update' );
				$( '.articleFeedbackv5-feedback[data-id=' + id + '] .articleFeedbackv5-feedback-tools' )
					.append( '<p class="articleFeedbackv5-form-toolbox-error">' + errorMessage + '</p>' );

				// re-enable ajax flagging
				$.articleFeedbackv5special.listControls.disabled = false;
			}
		} );

		return false;
	};

	// }}}
	// {{{ loadActivityLog

	/**
	 * Load the activity log for a feedback post item
	 *
	 * @param {number} id           feedback post item id
	 * @param {number} pageId
	 * @param {string} continueInfo should be null for the first request (first page), then the continue info returned from the last API call
	 * @param {string} location     where to put the results
	 * @return {boolean}
	 */
	$.articleFeedbackv5special.loadActivityLog = function ( id, pageId, continueInfo, location ) {
		var data = {
			action: 'query',
			list: 'articlefeedbackv5-view-activity',
			format: 'json',
			aafeedbackid: id,
			aapageid: pageId
		};
		if ( continueInfo ) {
			data.aacontinue = continueInfo;
		}
		if ( location === '#articleFeedbackv5-permalink-activity-log' ) {
			data.aanoheader = true;
		}
		$.ajax( {
			url: $.articleFeedbackv5special.apiUrl,
			type: 'GET',
			dataType: 'json',
			data: data,
			cache: false,
			context: { location: location },
			success: function ( data ) {
				var $place;

				if ( data[ 'articlefeedbackv5-view-activity' ].hasHeader ) {
					$( location ).html( data[ 'articlefeedbackv5-view-activity' ].activity );
				} else {
					$place = $( location ).find( '.articleFeedbackv5-activity-more' );
					if ( $place.length > 0 ) {
						$place.replaceWith( data[ 'articlefeedbackv5-view-activity' ].activity );
					} else {
						$( location ).html( data[ 'articlefeedbackv5-view-activity' ].activity );
					}
				}
				if ( data[ 'query-continue' ] && data[ 'query-continue' ][ 'articlefeedbackv5-view-activity' ] ) {
					$( location ).find( '.articleFeedbackv5-activity-more' )
						.data( 'continue', data[ 'query-continue' ][ 'articlefeedbackv5-view-activity' ].aacontinue )
						.click( function ( e ) {
							e.preventDefault();
							$.articleFeedbackv5special.loadActivityLog(
								id,
								pageId,
								$( e.target ).data( 'continue' ),
								location
							);
						} );
				}
			},
			error: function () {
				// FIXME this messages isn't defined
				$( location ).text( mw.msg( 'articleFeedbackv5-view-activity-error' ) );
			}
		} );

		return false;
	};

	// }}}
	// {{{ loadFeedback

	/**
	 * Pulls in a set of responses.
	 *
	 * When a next-page load is requested, it appends the new responses; on a
	 * sort or filter change, the existing responses are removed from the view
	 * and replaced.
	 *
	 * @param {boolean} resetContents   whether to remove the existing responses
	 * @param {boolean} prependContents whether to prepend the results onto the existing feedback
	 * @return {boolean}
	 */
	$.articleFeedbackv5special.loadFeedback = function ( resetContents, prependContents ) {
		var params;

		// save this filter state
		$.articleFeedbackv5special.saveFilters();

		if ( resetContents || prependContents ) {
			$( '#articleFeedbackv5-feedback-loading-top' ).fadeIn();
		} else {
			$( '#articleFeedbackv5-feedback-loading-bottom' ).fadeIn();
		}
		params = {
			afvfpageid: $.articleFeedbackv5special.page,
			afvffilter: $.articleFeedbackv5special.listControls.filter,
			afvffeedbackid: $.articleFeedbackv5special.listControls.feedbackId,
			afvfsort: $.articleFeedbackv5special.listControls.sort,
			afvfsortdirection: $.articleFeedbackv5special.listControls.sortDirection,
			afvfoffset: $.articleFeedbackv5special.listControls.offset,
			afvfwatchlist: $.articleFeedbackv5special.watchlist,
			action: 'query',
			format: 'json',
			list: 'articlefeedbackv5-view-feedback',
			maxage: 0
		};
		$.ajax( {
			url: $.articleFeedbackv5special.apiUrl,
			type: 'GET',
			dataType: 'json',
			data: params,
			cache: false,
			context: { info: params },
			success: function ( data ) {
				if ( 'articlefeedbackv5-view-feedback' in data ) {
					if ( resetContents ) {
						$( '#articleFeedbackv5-show-feedback' ).empty();
					}
					if ( prependContents ) {
						$( '#articleFeedbackv5-show-feedback' ).prepend( data[ 'articlefeedbackv5-view-feedback' ].feedback );
					} else {
						$( '#articleFeedbackv5-show-feedback' ).append( data[ 'articlefeedbackv5-view-feedback' ].feedback );
					}
					if ( $.articleFeedbackv5special.highlightId ) {
						if ( this.info.afvffeedbackid === $.articleFeedbackv5special.highlightId ) {
							$( '.articleFeedbackv5-feedback[data-id=' + $.articleFeedbackv5special.highlightId + ']:not(.articleFeedbackv5-feedback-highlighted)' ).remove();
							$.articleFeedbackv5special.highlightId = undefined;
						} else if ( !prependContents ) {
							$.articleFeedbackv5special.pullHighlight();
						}
					} else {
						$.articleFeedbackv5special.processControls(
							data[ 'articlefeedbackv5-view-feedback' ].count,
							data[ 'articlefeedbackv5-view-feedback' ].filtercount,
							data[ 'articlefeedbackv5-view-feedback' ].offset,
							data[ 'articlefeedbackv5-view-feedback' ].more
						);
					}
					$.articleFeedbackv5special.processFeedback();
				} else {
					$( '#articleFeedbackv5-show-feedback' ).text( mw.msg( 'articlefeedbackv5-error-loading-feedback' ) );
				}
				if ( resetContents || prependContents ) {
					$( '#articleFeedbackv5-feedback-loading-top' ).fadeOut();
				} else {
					$( '#articleFeedbackv5-feedback-loading-bottom' ).fadeOut();
				}

				$.articleFeedbackv5special.emptyMessage();
			},
			error: function () {
				$( '#articleFeedbackv5-show-feedback' ).text( mw.msg( 'articlefeedbackv5-error-loading-feedback' ) );
				if ( resetContents || prependContents ) {
					$( '#articleFeedbackv5-feedback-loading-top' ).fadeOut();
				} else {
					$( '#articleFeedbackv5-feedback-loading-bottom' ).fadeOut();
				}
			}
		} );

		return false;
	};

	// }}}
	// {{{ pullHighlight

	/**
	 * Pulls in the highlighted feedback, if requested.
	 */
	$.articleFeedbackv5special.pullHighlight = function () {
		var old, key;

		old = {
			filter: $.articleFeedbackv5special.listControls.filter,
			feedbackId: $.articleFeedbackv5special.listControls.feedbackId,
			sort: $.articleFeedbackv5special.listControls.sort,
			sortDirection: $.articleFeedbackv5special.listControls.sortDirection,
			offset: $.articleFeedbackv5special.listControls.offset,
			disabled: $.articleFeedbackv5special.listControls.disabled,
			allowMultiple: $.articleFeedbackv5special.listControls.allowMultiple,
			showMore: $.articleFeedbackv5special.listControls.showMore
		};
		$.articleFeedbackv5special.listControls.feedbackId = $.articleFeedbackv5special.highlightId;
		$.articleFeedbackv5special.loadFeedback( false, true );
		for ( key in old ) {
			$.articleFeedbackv5special.listControls[ key ] = old[ key ];
		}
	};

	// }}}
	// {{{ processControls

	/**
	 * Processes the controls of a set of responses
	 *
	 * @param {number} count        the total number of responses
	 * @param {number} filtercount  the number of responses for "featured" filter
	 * @param {number} offset       the offset
	 * @param {boolean} showMore    whether there are more records to show
	 */
	$.articleFeedbackv5special.processControls = function ( count, filtercount, offset, showMore ) {
		$( '#articleFeedbackv5-feedback-count-total' ).text( count );
		$( '#articleFeedbackv5-feedback-count-filter' ).text( filtercount );
		$.articleFeedbackv5special.listControls.offset = offset;
		if ( showMore ) {
			$( '#articleFeedbackv5-show-more' ).show();
		} else {
			$( '#articleFeedbackv5-show-more' ).hide();
		}
	};

	// }}}
	// {{{ markActiveFlags

	/**
	 * Mark reader tools als active when they've been flagged
	 * by this user already
	 *
	 * @param {string} id
	 */
	$.articleFeedbackv5special.markActiveFlags = function ( id ) {
		var $link;

		/*
		 * If the user already flagged as helpful/unhelpful, mark the
		 * button as active and change the action to undo-(un)helpful.
		 */
		if ( $.articleFeedbackv5special.getActivityFlag( id, 'helpful' ) ) {
			$( '#articleFeedbackv5-helpful-link-' + id )
				.addClass( 'helpful-active' )
				.data( 'action', 'undo-helpful' );
		} else if ( $.articleFeedbackv5special.getActivityFlag( id, 'unhelpful' ) ) {
			$( '#articleFeedbackv5-unhelpful-link-' + id )
				.addClass( 'helpful-active' )
				.data( 'action', 'undo-unhelpful' );
		}

		/**
		 * If the user already flagged as abusive, change the text to
		 * reflect this and change the action to unflag.
		 */
		if ( $.articleFeedbackv5special.getActivityFlag( id, 'flag' ) ) {
			$( '#articleFeedbackv5-flag-link-' + id )
				.text( mw.msg( 'articlefeedbackv5-abuse-saved' ) )
				.attr( 'title', mw.msg( 'articlefeedbackv5-abuse-saved-tooltip' ) )
				.data( 'action', 'unflag' );
		}

		// if the user already requested oversight, change action to unrequest
		if ( $.articleFeedbackv5special.getActivityFlag( id, 'request' ) ) {
			$link = $( '#articleFeedbackv5-request-link-' + id );

			if ( !$link.hasClass( 'inactive' ) ) {
				// oversight has been request: turn link into unrequest
				$link
					.text( mw.msg( 'articlefeedbackv5-form-unrequest' ) )
					.data( 'action', 'unrequest' )
					.removeClass( 'articleFeedbackv5-request-link' )
					.addClass( 'articleFeedbackv5-unrequest-link' )
					.removeClass( 'articleFeedbackv5-tipsy-link' );
			} else {
				// oversight request has been declined - mark as such
				$link
					.text( mw.msg( 'articlefeedbackv5-form-declined' ) );
			}
		}
	};

	// }}}
	// {{{ processFeedback

	/**
	 * Processes in a set of responses
	 */
	$.articleFeedbackv5special.processFeedback = function () {
		var $newList = $( '#articleFeedbackv5-show-feedback' );
		$newList.find( '.articleFeedbackv5-feedback' ).each( function () {
			var id = $( this ).data( 'id' );

			$.articleFeedbackv5special.markActiveFlags( id );
		} );

		$.articleFeedbackv5special.bindTipsies( $( 'body' ) );
	};

	// }}}
	// {{{ getActivity

	/**
	 * Utility method: Gets the activity for a feedback ID
	 *
	 * @param {number} fid the feedback ID
	 * @param {string} action the action
	 * @return {boolean} true if action executed by user, false if not
	 */
	$.articleFeedbackv5special.getActivityFlag = function ( fid, action ) {
		if ( fid in $.articleFeedbackv5special.activity && action in $.articleFeedbackv5special.activity[ fid ] ) {
			return $.articleFeedbackv5special.activity[ fid ][ action ];
		}
		return false;
	};

	// }}}
	// {{{ setActivityFlag

	/**
	 * Utility method: Sets an activity flag
	 *
	 * @param {string} fid   the feedback id
	 * @param {string} flag  the flag name
	 * @param {string} value the value
	 */
	$.articleFeedbackv5special.setActivityFlag = function ( fid, flag, value ) {
		if ( !( fid in $.articleFeedbackv5special.activity ) ) {
			$.articleFeedbackv5special.activity[ fid ] = [];
		}
		$.articleFeedbackv5special.activity[ fid ][ flag ] = value;
		$.articleFeedbackv5special.storeActivity();
	};

	// }}}
	// {{{ loadActivity

	/**
	 * Loads the user activity from the cookie
	 */
	$.articleFeedbackv5special.loadActivity = function () {
		var flatActivity, actions, action, i, parts, fid, indexes, j;

		flatActivity = $.cookie( mw.config.get( 'wgCookiePrefix' ) + $.aftUtils.getCookieName( $.articleFeedbackv5special.activityCookieName ) );
		if ( flatActivity ) {
			// get "indexes" for each action - shorter than the action name string
			actions = [];
			for ( action in $.articleFeedbackv5special.actions ) {
				actions.push( action );
			}

			flatActivity = flatActivity.split( '|' );
			for ( i in flatActivity ) {
				parts = flatActivity[ i ].split( ':' );
				fid = parts[ 0 ];
				indexes = parts[ 1 ].split( ',' );

				$.articleFeedbackv5special.activity[ fid ] = [];
				for ( j in indexes ) {
					action = actions[ indexes[ j ] ];

					$.articleFeedbackv5special.activity[ fid ][ action ] = true;
				}
			}
		}
	};

	// }}}
	// {{{ storeActivity

	/**
	 * Stores the user activity to the cookie
	 * A person's own activity will be saved in a cookie; since there
	 * can be quite a lot of activity on quite a lot of feedback, let's
	 * make the value to be saved to the cookie rather short.
	 * The result will look like: '143:1,5|342:3'
	 */
	$.articleFeedbackv5special.storeActivity = function () {
		var flatActivity, actions, action, fid, indexes, index;

		// get "indexes" for each action - shorter than the action name string
		actions = [];
		for ( action in $.articleFeedbackv5special.actions ) {
			actions.push( action );
		}

		flatActivity = [];
		for ( fid in $.articleFeedbackv5special.activity ) {
			indexes = [];
			for ( action in $.articleFeedbackv5special.activity[ fid ] ) {
				index = actions.indexOf( action );

				// only save if action is known & true
				if ( $.articleFeedbackv5special.activity[ fid ][ action ] && index > -1 ) {
					indexes.push( index );
				}
			}

			if ( indexes.length > 0 ) {
				flatActivity.push( fid + ':' + indexes.join( ',' ) );
			}
		}

		// only the most recent 100 are of interest
		flatActivity = flatActivity.splice( -100 );

		$.cookie(
			mw.config.get( 'wgCookiePrefix' ) + $.aftUtils.getCookieName( $.articleFeedbackv5special.activityCookieName ),
			flatActivity.join( '|' ),
			{ expires: 365, path: '/' }
		);
	};

	// }}}
	// {{{ getSource

	/**
	 * In the log, we'll save the source an action originates from - this will
	 * return what type of page we're currently on.
	 *
	 * @return {string}
	 */
	$.articleFeedbackv5special.getSource = function () {
		if ( $.articleFeedbackv5special.watchlist ) {
			return 'watchlist';
		} else if ( $.articleFeedbackv5special.listControls.filter === 'id' ) {
			return 'permalink';
		} else if ( $.articleFeedbackv5special.page ) {
			return 'article';
		} else {
			return 'central';
		}
	};

	// }}}
	// {{{ canBeFlagged

	/**
	 * Checks if a post can be flagged: post is not inappropriate/hidden/oversighted
	 * or user had permissions to (un)hide/(un)oversight
	 *
	 * @param {jQuery} $post
	 * @return {boolean} true if post can be flagged, or false otherwise
	 */
	$.articleFeedbackv5special.canBeFlagged = function ( $post ) {
		return $post.find( '.articleFeedbackv5-post-screen' ).length === 0 ||
			mw.config.get( 'wgArticleFeedbackv5Permissions' )[ 'aft-editor' ] ||
			mw.config.get( 'wgArticleFeedbackv5Permissions' )[ 'aft-monitor' ] ||
			mw.config.get( 'wgArticleFeedbackv5Permissions' )[ 'aft-oversighter' ];
	};

	// }}}
	// {{{ saveFilters

	/**
	 * Saves the filters' current state to a cookie
	 *
	 * @return {boolean}
	 */
	$.articleFeedbackv5special.saveFilters = function () {
		var filterParams;

		// don't save on permalink page
		if ( $.articleFeedbackv5special.listControls.filter === 'id' ) {
			return false;
		}

		// stringify filters data
		filterParams = {
			page: $.articleFeedbackv5special.page,
			listControls: $.articleFeedbackv5special.listControls
		};
		filterParams = JSON.stringify( filterParams );

		// note: we're overwriting the same cookie for every page; assuming that they won't like to come
		// back later to previous pages and find their previous settings again (plus less cookie size)
		$.cookie(
			mw.config.get( 'wgCookiePrefix' ) + $.aftUtils.getCookieName( $.articleFeedbackv5special.filterCookieName ),
			filterParams,
			{ expires: 1, path: '/' }
		);
	};

	// }}}

	// }}}
	// {{{ Actions

	/**
	 * Actions - available actions on the page.
	 *
	 * Each action is an object with the following properties:
	 * 		hasTipsy - true if the action needs a flyover panel
	 * 		tipsyHtml - html for the corresponding flyover panel
	 * 		click - click action
	 * 		onSuccess - callback to execute after action success. Callback parameters:
	 * 			id - respective post id
	 * 			data - any data returned by the AJAX call
	 */
	$.articleFeedbackv5special.actions = {

		// {{{ Vote helpful

		helpful: {
			hasTipsy: false,
			click: function ( e ) {
				var $container, id;

				e.preventDefault();

				$container = $( e.target ).closest( '.articleFeedbackv5-feedback' );
				if ( $.articleFeedbackv5special.canBeFlagged( $container ) ) {
					id = $container.data( 'id' );

					$.articleFeedbackv5special.flagFeedback(
						id,
						$container.data( 'pageid' ),
						$( e.target ).data( 'action' ),
						'',
						{ toggle: $.articleFeedbackv5special.getActivityFlag( id, 'unhelpful' ) }
					);
				}
			},
			onSuccess: function ( id ) {
				$.articleFeedbackv5special.setActivityFlag( id, 'helpful', true );
				$.articleFeedbackv5special.setActivityFlag( id, 'unhelpful', false );
			}
		},

		// }}}
		// {{{ Un-vote helpful

		'undo-helpful': {
			hasTipsy: false,
			click: function ( e ) {
				var $container;

				e.preventDefault();

				$container = $( e.target ).closest( '.articleFeedbackv5-feedback' );
				if ( $.articleFeedbackv5special.canBeFlagged( $container ) ) {
					$.articleFeedbackv5special.flagFeedback(
						$container.data( 'id' ),
						$container.data( 'pageid' ),
						$( e.target ).data( 'action' ),
						'',
						{}
					);
				}
			},
			onSuccess: function ( id ) {
				$.articleFeedbackv5special.setActivityFlag( id, 'helpful', false );
				$.articleFeedbackv5special.setActivityFlag( id, 'unhelpful', false );
			}
		},

		// }}}
		// {{{ Vote unhelpful

		unhelpful: {
			hasTipsy: false,
			click: function ( e ) {
				var $container, id;
				e.preventDefault();

				$container = $( e.target ).closest( '.articleFeedbackv5-feedback' );
				if ( $.articleFeedbackv5special.canBeFlagged( $container ) ) {
					id = $container.data( 'id' );

					$.articleFeedbackv5special.flagFeedback(
						id,
						$container.data( 'pageid' ),
						$( e.target ).data( 'action' ),
						'',
						{ toggle: $.articleFeedbackv5special.getActivityFlag( id, 'helpful' ) }
					);
				}
			},
			onSuccess: function ( id ) {
				$.articleFeedbackv5special.setActivityFlag( id, 'helpful', false );
				$.articleFeedbackv5special.setActivityFlag( id, 'unhelpful', true );
			}
		},

		// }}}
		// {{{ Un-vote unhelpful

		'undo-unhelpful': {
			hasTipsy: false,
			click: function ( e ) {
				var $container;

				e.preventDefault();

				$container = $( e.target ).closest( '.articleFeedbackv5-feedback' );
				if ( $.articleFeedbackv5special.canBeFlagged( $container ) ) {
					$.articleFeedbackv5special.flagFeedback(
						$container.data( 'id' ),
						$container.data( 'pageid' ),
						$( e.target ).data( 'action' ),
						'',
						{}
					);
				}
			},
			onSuccess: function ( id ) {
				$.articleFeedbackv5special.setActivityFlag( id, 'helpful', false );
				$.articleFeedbackv5special.setActivityFlag( id, 'unhelpful', false );
			}
		},

		// }}}
		// {{{ Flag post as abusive

		flag: {
			hasTipsy: false,
			click: function ( e ) {
				var $container, id;

				e.preventDefault();

				// only allow flagging if not yet flagged
				$container = $( e.target ).closest( '.articleFeedbackv5-feedback' );
				if ( $.articleFeedbackv5special.canBeFlagged( $container ) ) {
					id = $container.data( 'id' );
					if ( !$.articleFeedbackv5special.getActivityFlag( id, 'flag' ) ) {
						$.articleFeedbackv5special.flagFeedback(
							id,
							$container.data( 'pageid' ),
							$( e.target ).data( 'action' ),
							'',
							{}
						);
					}
				}
			},
			onSuccess: function ( id ) {
				$.articleFeedbackv5special.setActivityFlag( id, 'flag', true );
			}
		},

		// }}}
		// {{{ Unflag post as abusive

		unflag: {
			hasTipsy: false,
			click: function ( e ) {
				var $container, id;

				e.preventDefault();

				// only allow unflagging if flagged by this user
				$container = $( e.target ).closest( '.articleFeedbackv5-feedback' );
				if ( $.articleFeedbackv5special.canBeFlagged( $container ) ) {
					id = $container.data( 'id' );
					if ( $.articleFeedbackv5special.getActivityFlag( id, 'flag' ) ) {
						$.articleFeedbackv5special.flagFeedback(
							id,
							$container.data( 'pageid' ),
							$( e.target ).data( 'action' ),
							'',
							{}
						);
					}
				}
			},
			onSuccess: function ( id ) {
				$.articleFeedbackv5special.setActivityFlag( id, 'flag', false );
			}
		},

		// }}}
		// {{{ Feature post action

		feature: {
			hasTipsy: true,
			tipsyHtml: undefined,
			click: $.articleFeedbackv5special.flagAction,
			onSuccess: function () {
				// activity flag is not particularly useful here
			}
		},

		// }}}
		// {{{ Un-feature post action

		unfeature: {
			hasTipsy: true,
			tipsyHtml: undefined,
			click: $.articleFeedbackv5special.flagAction,
			onSuccess: function () {
				// activity flag is not particularly useful here
			}
		},

		// }}}
		// {{{ Mark resolved post action

		resolve: {
			hasTipsy: true,
			tipsyHtml: undefined,
			click: $.articleFeedbackv5special.flagAction,
			onSuccess: function () {
				// activity flag is not particularly useful here
			}
		},

		// }}}
		// {{{ Unmark as resolved post action

		unresolve: {
			hasTipsy: true,
			tipsyHtml: undefined,
			click: $.articleFeedbackv5special.flagAction,
			onSuccess: function () {
				// activity flag is not particularly useful here
			}
		},

		// }}}
		// {{{ Mark post as non-actionable action

		noaction: {
			hasTipsy: true,
			tipsyHtml: undefined,
			click: $.articleFeedbackv5special.flagAction,
			onSuccess: function () {
				// activity flag is not particularly useful here
			}
		},

		// }}}
		// {{{ Unmark post as non-actionable action

		unnoaction: {
			hasTipsy: true,
			tipsyHtml: undefined,
			click: $.articleFeedbackv5special.flagAction,
			onSuccess: function () {
				// activity flag is not particularly useful here
			}
		},

		// }}}
		// {{{ Mark post as inappropriate

		inappropriate: {
			hasTipsy: true,
			tipsyHtml: undefined,
			click: $.articleFeedbackv5special.flagAction,
			onSuccess: function () {
				// activity flag is not particularly useful here
			}
		},

		// }}}
		// {{{ Unmark post as inappropriate

		uninappropriate: {
			hasTipsy: true,
			tipsyHtml: undefined,
			click: $.articleFeedbackv5special.flagAction,
			onSuccess: function () {
				// activity flag is not particularly useful here
			}
		},

		// }}}
		// {{{ Hide post action

		hide: {
			hasTipsy: true,
			tipsyHtml: undefined,
			click: function () {
				// tipsy has been opened - bind flag submission
				$.articleFeedbackv5special.tipsyCallback = function () {
					var $container = $( '#' + $.articleFeedbackv5special.currentPanelHostId ).closest( '.articleFeedbackv5-feedback' );
					if ( $.articleFeedbackv5special.canBeFlagged( $container ) ) {
						$.articleFeedbackv5special.flagFeedback(
							$container.data( 'id' ),
							$container.data( 'pageid' ),
							'hide',
							$( '#articleFeedbackv5-noteflyover-note' ).val(),
							{}
						);
					}
				};
			},
			onSuccess: function () {
				// activity flag is not particularly useful here
			}
		},

		// }}}
		// {{{ Show post action

		unhide: {
			hasTipsy: true,
			tipsyHtml: undefined,
			click: $.articleFeedbackv5special.flagAction,
			onSuccess: function () {
				// activity flag is not particularly useful here
			}
		},

		// }}}
		// {{{ Archive post

		archive: {
			hasTipsy: true,
			tipsyHtml: undefined,
			click: $.articleFeedbackv5special.flagAction,
			onSuccess: function () {
				// activity flag is not particularly useful here
			}
		},

		// }}}
		// {{{ Unarchive post

		unarchive: {
			hasTipsy: true,
			tipsyHtml: undefined,
			click: $.articleFeedbackv5special.flagAction,
			onSuccess: function () {
				// activity flag is not particularly useful here
			}
		},

		// }}}
		// {{{ Request oversight action

		request: {
			hasTipsy: true,
			tipsyHtml: undefined,
			click: function () {
				// tipsy has been opened - bind flag submission
				$.articleFeedbackv5special.tipsyCallback = function () {
					var $container = $( '#' + $.articleFeedbackv5special.currentPanelHostId ).closest( '.articleFeedbackv5-feedback' );
					if ( $.articleFeedbackv5special.canBeFlagged( $container ) ) {
						$.articleFeedbackv5special.flagFeedback(
							$container.data( 'id' ),
							$container.data( 'pageid' ),
							'request',
							$( '#articleFeedbackv5-noteflyover-note' ).val(),
							{}
						);
					}
				};
			},
			onSuccess: function ( id ) {
				$.articleFeedbackv5special.setActivityFlag( id, 'request', true );
			}
		},

		// }}}
		// {{{ Cancel oversight request action

		unrequest: {
			hasTipsy: true,
			tipsyHtml: undefined,
			click: function ( e ) {
				var $container, id;

				e.preventDefault();

				// only allow unrequesting if requested by this user
				$container = $( e.target ).closest( '.articleFeedbackv5-feedback' );
				if ( $.articleFeedbackv5special.canBeFlagged( $container ) ) {
					id = $container.data( 'id' );
					if ( $.articleFeedbackv5special.getActivityFlag( id, 'request' ) ) {
						$.articleFeedbackv5special.flagFeedback(
							$container.data( 'id' ),
							$container.data( 'pageid' ),
							$( e.target ).data( 'action' ),
							'',
							{}
						);
					}
				}
			},
			onSuccess: function ( id ) {
				$.articleFeedbackv5special.setActivityFlag( id, 'request', false );
			}
		},

		// }}}
		// {{{ Oversight post action

		oversight: {
			hasTipsy: true,
			tipsyHtml: undefined,
			click: function () {
				// tipsy has been opened - bind flag submission
				$.articleFeedbackv5special.tipsyCallback = function () {
					var $container = $( '#' + $.articleFeedbackv5special.currentPanelHostId ).closest( '.articleFeedbackv5-feedback' );
					if ( $.articleFeedbackv5special.canBeFlagged( $container ) ) {
						$.articleFeedbackv5special.flagFeedback(
							$container.data( 'id' ),
							$container.data( 'pageid' ),
							'oversight',
							$( '#articleFeedbackv5-noteflyover-note' ).val(),
							{}
						);
					}
				};
			},
			onSuccess: function () {
				// activity flag is not particularly useful here
			}
		},

		// }}}
		// {{{ Un-oversight action

		unoversight: {
			hasTipsy: true,
			tipsyHtml: undefined,
			click: $.articleFeedbackv5special.flagAction,
			onSuccess: function () {
				// activity flag is not particularly useful here
			}
		},

		// }}}
		// {{{ Decline oversight action

		decline: {
			hasTipsy: true,
			tipsyHtml: undefined,
			click: $.articleFeedbackv5special.flagAction,
			onSuccess: function () {
				// activity flag is not particularly useful here
			}
		},

		/*
		 * Well, those below are not really "actions", but we can use the
		 * structure that has been setup for actions, for these as well ;)
		 */

		// }}}
		// {{{ View activity log action

		activity: {
			hasTipsy: true,
			tipsyHtml: '\
				<div>\
					<div class="articleFeedbackv5-flyover-header">\
						<h3 id="articleFeedbackv5-noteflyover-caption"><html:msg key="activity-pane-header" /></h3>\
						<a id="articleFeedbackv5-noteflyover-close" href="#"></a>\
					</div>\
					<div id="articleFeedbackv5-activity-log"></div>\
				</div>',
			click: function ( e ) {
				// upon executing this, tipsy will be open already
				var $container = $( e.target ).closest( '.articleFeedbackv5-feedback' );
				$.articleFeedbackv5special.loadActivityLog( $container.data( 'id' ), $container.data( 'pageid' ), 0, '#articleFeedbackv5-activity-log' );
			}
		},

		// }}}
		// {{{ View activity log action on permalink

		activity2: {
			click: function ( e ) {
				var $container;

				e.preventDefault();

				if ( $( e.target ).data( 'started' ) ) {
					$( '#articleFeedbackv5-permalink-activity-log' ).fadeOut();
					$( e.target ).text( mw.msg( 'articlefeedbackv5-permalink-activity-more' ) );
					$( e.target ).data( 'started', false );
				} else {
					$container = $( '#articleFeedbackv5-show-feedback .articleFeedbackv5-feedback' );
					$.articleFeedbackv5special.loadActivityLog( $container.data( 'id' ), $container.data( 'pageid' ), 0, '#articleFeedbackv5-permalink-activity-log' );
					$( '#articleFeedbackv5-permalink-activity-log' ).fadeIn();
					$( e.target ).text( mw.msg( 'articlefeedbackv5-permalink-activity-fewer' ) );
					$( e.target ).data( 'started', true );
				}
			}
		},

		// }}}
		// {{{ Discuss feedback on article/user's talk page

		discuss: {
			click: function ( e ) {
				var exists, link, title, content, editTime, editToken, watchlist, $form;

				exists = $( e.target ).data( 'section-exists' );

				if ( !exists ) {
					e.preventDefault();

					/*
					 * The href set for an already existing section will lead to the
					 * edit-form to create a new section (with the title already
					 * filled out). However, there's no way to already preload the
					 * content. Let's fake the submission of the edit form with some
					 * preset content.
					 */

					link = $( e.target ).attr( 'href' ) + '#editform';
					title = $( e.target ).data( 'section-title' );
					content = $( e.target ).data( 'section-content' );
					editTime = $( e.target ).data( 'section-edittime' );
					editToken = $( e.target ).data( 'section-edittoken' );
					watchlist = $( e.target ).data( 'section-watchlist' );

					$form = $( '\
						<form method="post">\
							<input type="text" name="wpSummary" />\
							<textarea name="wpTextbox1" />\
							<input type="hidden" name="wpEdittime" />\
							<input type="hidden" name="wpStarttime" />\
							<input type="hidden" name="wpEditToken" />\
							<input type="hidden" name="wpPreview" />\
							<input type="hidden" name="wpWatchthis" />\
							<input type="submit" />\
						</form>' );

					$form.attr( 'action', link );
					$( '[name=wpSummary]', $form ).val( title );
					$( '[name=wpTextbox1]', $form ).val( content );
					$( '[name=wpEdittime]', $form ).val( editTime );
					$( '[name=wpStarttime]', $form ).val( editTime );
					$( '[name=wpEditToken]', $form ).val( editToken );
					$( '[name=wpPreview]', $form ).val( 1 );
					$( '[name=wpWatchthis]', $form ).val( watchlist );

					$( e.target ).append( $form );
					$form
						.hide()
						.submit();
				}
			}
		},

		// }}}
		// {{{ Open AFTv5 settings pane

		settings: {
			hasTipsy: true,
			tipsyHtml: function () {
				var article, $link, userPermissions, link, content;

				article = $.aftUtils.article();

				/*
				 * Don't show the link if AFTv5 protection is disabled.
				 * Also don't show it if page is enabled/disabled via the categories.
				 * To change that, one would have to edit the page and remove that
				 * category, not change it via the link for page protection that we'll
				 * be displaying here.
				 */
				if (
					!mw.config.get( 'wgArticleFeedbackv5EnableProtection', 1 ) ||
					$.aftUtils.whitelist( article ) ||
					$.aftUtils.blacklist( article )
				) {
					return '';
				}

				// build link to enable feedback form
				$link = $( '<a href="#" id="articleFeedbackv5-settings-status"></a>' );
				$( '#articleFeedbackv5-settings-menu' ).append( $link );

				// check if user can enable AFTv5
				if ( $.aftUtils.canSetStatus( true ) ) {
					$link
						.attr( 'data-status', 1 )
						.text( mw.msg( 'articlefeedbackv5-settings-status-enable' ) );

				// or disable
				} else if ( $.aftUtils.canSetStatus( false ) ) {
					$link
						.attr( 'data-status', 0 )
						.text( mw.msg( 'articlefeedbackv5-settings-status-disable' ) );

				// if status can not be changed at all (e.g. insufficient permissions), don't do anything
				} else {
					return '';
				}

				userPermissions = mw.config.get( 'wgArticleFeedbackv5Permissions' );

				// administrators can change detailed visibility in ?action=protect
				if ( 'aft-administrator' in userPermissions && userPermissions[ 'aft-administrator' ] ) {
					link = mw.util.getUrl( article.title, { action: 'protect' } );

					$link.attr( 'href', link );

				// editors can enable/disable for readers via API
				} else {
					$( document ).on( 'click', '#articleFeedbackv5-settings-status', function ( e ) {
						var status;

						e.preventDefault();

						status = $( this ).data( 'status' );
						$.aftUtils.setStatus( article.id, status, function ( data, error ) {
							// refresh page to reflect changes
							if ( data !== false ) {
								location.reload( true );
							} else if ( error ) {
								alert( error );
							}
						} );
					} );
				}

				content = $( '<div id="articleFeedbackv5-settings-menu"></div>' ).append( $link );
				return $( '<div></div>' ).append( content ).html();
			},
			click: function ( e ) {
				e.preventDefault();
			}
		}

		// }}}

	};

	// }}}

	// }}}

}( jQuery, mediaWiki ) );
