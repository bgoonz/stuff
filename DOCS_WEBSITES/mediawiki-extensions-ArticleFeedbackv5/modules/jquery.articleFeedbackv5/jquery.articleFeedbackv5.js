/*
 * ArticleFeedback form plugin
 *
 * This file creates the plugin that will be used to build the Article Feedback
 * form.  The flow goes like this:
 *
 * User arrives at page -> build appropriate form and trigger link(s)
 *  -> User clicks trigger link -> scroll down to bottom form & briefly highlight
 *  -> User scrolls to end of article -> open form below article
 *  -> User submits form -> submit to API
 *      -> has errors -> show errors
 *      -> has no errors -> select random CTA and display
 *
 * This plugin supports a choice of forms, trigger links, and CTAs.  Each form
 * option is called a "bucket" because users are sorted into buckets and each
 * bucket gets a different form option.
 *
 * Right now, these buckets are:
 *   0. No Feedback
 *   	Shows nothing at all.
 *   1. Share Your Feedback
 *   	Has a yes/no toggle on "Did you find what you were looking for?" and a
 *   	text area for comments.
 *   2. Make A Suggestion
 *   	Modeled after getsatisfaction.com; users can say that their comment is a
 *   	suggestion, question, problem, or praise.
 *   3. Review This Page
 *   	Has a single star rating field and a comment box.
 *   4. Help Edit This Page
 *   	Has no input fields; just links to the Edit page.
 *   5. Rate This Page
 *   	The existing article feedback tool, except that it can use any of the
 *   	CTA types.
 *   6. Share Your Feedback, 2-step
 *   	Pretty much the same at bucket 1, but split in 2 steps: first presenting
 *      Y/N selection, than asking for textual feedback.
 *
 * The available trigger links are:
 *   A.   After the site tagline (below the article title)
 *   B.   Below the titlebar on the right
 *   C.   Button fixed to right side
 *   D.   Button fixed to bottom right
 *   E.   Same as D, with other colors
 *   F.   Button fixed to left side -- NOT IMPLEMENTED
 *   G.   Button below logo -- NOT IMPLEMENTED
 *   H.   Link on each section bar
 *   TBX. In the toolbox section (always added)
 *
 * The available CTAs are:
 *   0. Just a confirmation notice
 *   1. Edit this page
 *   	Just a big glossy button to send the user to the edit page.
 *   2. Learn More
 *   	Just a big glossy button to tell the user about how the wiki works
 *   	(used if the user doesn't have edit privileges on the article).
 *   3. Take a survey
 *      Asks the user to take an external survey, which will pop up in a new
 *      window.
 *   5. View feedback
 *      Just a big glossy button to send the user to the feedback page.
 *
 * This file is really long, so it's commented with manual fold markers.  To use
 * folds this way in vim:
 *   set foldmethod=marker
 *   set foldlevel=0
 *   set foldcolumn=0
 *
 * @package    ArticleFeedback
 * @subpackage Resources
 * @author     Reha Sterbin <reha@omniti.com>
 * @author     Matthias Mullie <mmullie@wikimedia.org>
 */

/* eslint quote-props: ["error", "as-needed", { "numbers": true }] */
( function ( $, mw ) {

	// {{{ articleFeedbackv5 definition

	$.articleFeedbackv5 = {};

	// {{{ Properties

	/**
	 * Are we in debug mode?
	 */
	$.articleFeedbackv5.debug = mw.config.get( 'wgArticleFeedbackv5Debug' );

	/**
	 * Has the form been loaded yet?
	 */
	$.articleFeedbackv5.isLoaded = false;

	/**
	 * Is form submission enabled?
	 */
	$.articleFeedbackv5.submissionEnabled = false;

	/**
	 * The bucket ID is the variation of the Article Feedback form chosen for this
	 * particualar user.  It set at load time, but if all else fails, default to
	 * Bucket 6 (no form).
	 *
	 * @see https://www.mediawiki.org/wiki/Article_feedback/Version_5/Feature_Requirements#Feedback_form_interface
	 */
	$.articleFeedbackv5.bucketId = '0';

	/**
	 * The CTA is the view presented to a user who has successfully submitted
	 * feedback.
	 *
	 * @see https://www.mediawiki.org/wiki/Article_feedback/Version_5/Feature_Requirements#Calls_to_Action
	 */
	$.articleFeedbackv5.ctaId = '1';

	/**
	 * The selected trigger links are the ones chosen to be loaded onto the
	 * page. Options are "-" or A-H
	 *
	 * @see $wgArticleFeedbackv5LinkBuckets
	 * @see https://www.mediawiki.org/wiki/Article_feedback/Version_5/Feature_Requirements#Feedback_links_on_article_pages
	 */
	$.articleFeedbackv5.selectedLinks = [];

	/**
	 * The floating link ID indicates the trigger link chosen to be added to the
	 * page, in addition to the toolbox link.  Options are "X" or A-H.
	 *
	 * @see $wgArticleFeedbackv5LinkBuckets
	 * @see https://www.mediawiki.org/wiki/Article_feedback/Version_5/Feature_Requirements#Feedback_links_on_article_pages
	 */
	$.articleFeedbackv5.floatingLinkId = 'X';

	/**
	 * The submitted link ID indicates where the user clicked (or not) to get to
	 * the feedback form.  Options are "X" or A-H
	 *
	 * @see $wgArticleFeedbackv5LinkBuckets
	 * @see https://www.mediawiki.org/wiki/Article_feedback/Version_5/Feature_Requirements#Feedback_links_on_article_pages
	 */
	$.articleFeedbackv5.submittedLinkId = 'X';

	/**
	 * Use the mediawiki util resource's config method to find the correct url to
	 * call for all ajax requests.
	 */
	$.articleFeedbackv5.apiUrl = mw.util.wikiScript( 'api' );

	/**
	 * Is this an anonymous user?
	 */
	$.articleFeedbackv5.anonymous = mw.user.isAnon();

	/**
	 * If not, what's their user id?
	 */
	$.articleFeedbackv5.userId = mw.user.id();

	/**
	 * The page ID
	 */
	$.articleFeedbackv5.pageId = mw.config.get( 'wgArticleId' );

	/**
	 * The revision ID
	 */
	$.articleFeedbackv5.revisionId = mw.config.get( 'wgCurRevisionId' );

	/**
	 * What we're meant to be showing: a form, a CTA, a showstopper error, or nothing
	 */
	$.articleFeedbackv5.toDisplay = 'form';

	/**
	 * What we're actually showing
	 */
	$.articleFeedbackv5.nowShowing = 'none';

	/**
	 * The new feedback's permalink (collected on submit, for use in CTA5)
	 */
	$.articleFeedbackv5.permalink = undefined;

	/**
	 * The link to the special page (collected on submit, for use in CTA5)
	 */
	$.articleFeedbackv5.specialUrl = undefined;

	/**
	 * How many feedback posts per hour a given user should be allowed (site-wide).
	 */
	$.articleFeedbackv5.throttleThresholdPostsPerHour = mw.config.get( 'wgArticleFeedbackv5ThrottleThresholdPostsPerHour' );

	// }}}
	// {{{ Bucket UI objects

	/**
	 * Set up the buckets' UI objects
	 */
	$.articleFeedbackv5.buckets = {

		// {{{ Bucket 0

		/**
		 * Bucket 0: No form
		 */
		'0': {},

		// }}}
		// {{{ Bucket 1

		/**
		 * Bucket 1: Share Your Feedback
		 */
		'1': {

			/**
			 * Currently displayed placeholder text. This is a workaround for Chrome/FF
			 * automatic focus in overlays.
			 */
			currentDefaultText: '',

			// {{{ getTitle

			/**
			 * Gets the title
			 *
			 * @return {string} the title
			 */
			getTitle: function () {
				return mw.msg( 'articlefeedbackv5-bucket1-title' );
			},

			// }}}
			// {{{ buildForm

			/**
			 * Builds the empty form
			 *
			 * @return {jQuery} the form
			 */
			buildForm: function () {
				var $block, message;

				// Start up the block to return
				$block = mw.template.get( 'jquery.articleFeedbackv5', 'bucket1.mustache' ).render( {
					'articlefeedbackv5-bucket1-question-toggle': mw.msg( 'articlefeedbackv5-bucket1-question-toggle' ),
					'articlefeedbackv5-bucket1-toggle-found-yes-full': mw.msg( 'articlefeedbackv5-bucket1-toggle-found-yes-full' ),
					'articlefeedbackv5-bucket1-toggle-found-yes': mw.msg( 'articlefeedbackv5-bucket1-toggle-found-yes' ),
					'articlefeedbackv5-bucket1-toggle-found-no-full': mw.msg( 'articlefeedbackv5-bucket1-toggle-found-no-full' ),
					'articlefeedbackv5-bucket1-toggle-found-no': mw.msg( 'articlefeedbackv5-bucket1-toggle-found-no' ),
					'articlefeedbackv5-bucket1-form-submit': mw.msg( 'articlefeedbackv5-bucket1-form-submit' )
				} );

				// Fill in the disclosure text
				message = 'articlefeedbackv5-help-transparency-terms';
				if ( $.articleFeedbackv5.anonymous ) {
					message = 'articlefeedbackv5-help-transparency-terms-anon';
				}
				$block.find( '.articlefeedbackv5-help-transparency-terms' ).msg( message );

				// Turn the submit into a slick button
				$block.find( '.articleFeedbackv5-submit' )
					.button()
					.addClass( 'ui-button-blue' );

				return $block;
			},

			// }}}
			// {{{ bindEvents

			/**
			 * Binds any events
			 *
			 * @param {jQuery} $block the form block
			 */
			bindEvents: function ( $block ) {
				// Enable submission and switch out the comment default on toggle selection
				$block.find( '.articleFeedbackv5-button-placeholder' )
					.button()
					.click( function ( e ) {
						var newVal, oldVal, $wrap, $otherWrap, $txt, defMsgYes, defMsgNo;

						e.preventDefault();

						newVal = $( this ).parents( '[data-value]' ).data( 'value' );
						oldVal = ( newVal === 'yes' ? 'no' : 'yes' );
						$wrap = $.articleFeedbackv5.$holder.find( '#articleFeedbackv5-bucket1-toggle-wrapper-' + newVal );
						$otherWrap = $.articleFeedbackv5.$holder.find( '#articleFeedbackv5-bucket1-toggle-wrapper-' + oldVal );

						// make the button blue
						$( '.articleFeedbackv5-button-placeholder.ui-button-blue' ).removeClass( 'ui-button-blue' );
						$( this ).addClass( 'ui-button-blue' );

						// check/uncheck radio buttons
						$wrap.find( 'input' ).attr( 'checked', 'checked' );
						$otherWrap.find( 'input' ).removeAttr( 'checked' );

						// set default comment message
						$txt = $.articleFeedbackv5.$holder.find( '.articleFeedbackv5-comment textarea' );
						defMsgYes = mw.msg( 'articlefeedbackv5-bucket1-question-placeholder-yes' );
						defMsgNo = mw.msg( 'articlefeedbackv5-bucket1-question-placeholder-no' );
						if ( $txt.val() === '' || $txt.val() === defMsgYes || $txt.val() === defMsgNo ) {
							$txt.val( newVal === 'yes' ? defMsgYes : defMsgNo );
							$.articleFeedbackv5.currentBucket().currentDefaultText = $txt.val();
						}

						// enable submission
						$.articleFeedbackv5.enableSubmission( true );
					} );

				// Clear out the question on focus
				$block.find( '.articleFeedbackv5-comment textarea' )
					.focus( function () {
						if ( $( this ).val() === $.articleFeedbackv5.currentBucket().currentDefaultText ) {
							$( this ).val( '' );
							$( this ).removeClass( 'inactive' );
						}
					} )
					.keyup( function () {
						if ( $( this ).val().length > 0 ) {
							$.articleFeedbackv5.enableSubmission( true );
						}
					} )
					.blur( function () {
						var defMsg = '',
							val = $.articleFeedbackv5.$holder.find( '.articleFeedbackv5-bucket1-toggle input[checked]' ).val();

						if ( val === 'yes' ) {
							defMsg = mw.msg( 'articlefeedbackv5-bucket1-question-placeholder-yes' );
						} else if ( val === 'no' ) {
							defMsg = mw.msg( 'articlefeedbackv5-bucket1-question-placeholder-no' );
						}
						if ( $( this ).val() === '' ) {
							$( this ).val( defMsg );
							$( this ).addClass( 'inactive' );
						} else {
							$.articleFeedbackv5.enableSubmission( true );
						}
					} );

				// Attach the submit
				$block.find( '.articleFeedbackv5-submit' )
					.click( function ( e ) {
						e.preventDefault();
						$.articleFeedbackv5.submitForm();
					} );
			},

			// }}}
			// {{{ getFormData

			/**
			 * Pulls down form data
			 *
			 * @return {Object} the form data
			 */
			getFormData: function () {
				var $check, defMsgYes, defMsgNo, data = {};

				$check = $.articleFeedbackv5.$holder.find( '.articleFeedbackv5-bucket1-toggle input[checked]' );
				if ( $check.val() === 'yes' ) {
					data.found = 1;
				} else if ( $check.val() === 'no' ) {
					data.found = 0;
				}
				data.comment = $.articleFeedbackv5.$holder.find( '.articleFeedbackv5-comment textarea' ).val();
				defMsgYes = mw.msg( 'articlefeedbackv5-bucket1-question-placeholder-yes' );
				defMsgNo = mw.msg( 'articlefeedbackv5-bucket1-question-placeholder-no' );
				if ( data.comment === defMsgYes || data.comment === defMsgNo ) {
					data.comment = '';
				}
				return data;
			},

			// }}}
			// {{{ localValidation

			/**
			 * Performs any local validation
			 *
			 * @param {Object} formdata the form data
			 * @return {false|string} if ok, false; otherwise, an object as { 'field name' : 'message' }
			 */
			localValidation: function ( formdata ) {
				if ( ( !( 'comment' in formdata ) || formdata.comment === '' ) &&
					!( 'found' in formdata )
				) {
					$.articleFeedbackv5.enableSubmission( false );
					return mw.msg( 'articlefeedbackv5-error-nofeedback' );
				}
				return false;
			}

			// }}}

		},

		// }}}
		// {{{ Bucket 4

		/**
		 * Bucket 4: Help Improve This Article
		 */
		'4': {

			// {{{ getTitle

			/**
			 * Gets the title
			 *
			 * @return {string} the title
			 */
			getTitle: function () {
				return mw.msg( 'articlefeedbackv5-bucket4-title' );
			},

			// }}}
			// {{{ buildForm

			/**
			 * Builds the empty form
			 *
			 * @return {jQuery} the form
			 */
			buildForm: function () {
				var $block, url, templateName, templateVars;

				// Start up the block to return
				if ( $.articleFeedbackv5.editable ) {
					templateName = 'bucket4-editable.mustache';
					templateVars = {
						'articlefeedbackv5-bucket4-subhead': mw.msg( 'articlefeedbackv5-bucket4-subhead' ),
						'articlefeedbackv5-bucket4-teaser-line1': mw.message( 'articlefeedbackv5-bucket4-teaser-line1' ).text(), // uses {{SITENAME}},
						'articlefeedbackv5-bucket4-teaser-line2': mw.msg( 'articlefeedbackv5-bucket4-teaser-line2' ),
						'articlefeedbackv5-bucket4-learn-to-edit': mw.msg( 'articlefeedbackv5-bucket4-learn-to-edit' ),
						'articlefeedbackv5-bucket4-form-submit': mw.msg( 'articlefeedbackv5-bucket4-form-submit' )
					};
				} else {
					templateName = 'bucket4-noneditable.mustache';
					templateVars = {
						'articlefeedbackv5-bucket4-noedit-teaser-line1': mw.msg( 'articlefeedbackv5-bucket4-noedit-teaser-line1' ),
						'articlefeedbackv5-bucket4-noedit-teaser-line2': mw.msg( 'articlefeedbackv5-bucket4-noedit-teaser-line2' ),
						'articlefeedbackv5-bucket4-noedit-form-submit': mw.msg( 'articlefeedbackv5-bucket4-noedit-form-submit' )
					};
				}

				$block = mw.template.get( 'jquery.articleFeedbackv5', templateName ).render( templateVars );

				// Fill in the learn to edit link
				$block.find( '.articleFeedbackv5-learn-to-edit' )
					.attr( 'href', mw.msg( 'articlefeedbackv5-cta1-learn-how-url' ) );

				// Fill in the button link
				if ( $.articleFeedbackv5.editable ) {
					url = $.articleFeedbackv5.editUrl();
				} else {
					url = mw.msg( 'articlefeedbackv5-cta1-learn-how-url' );
				}

				$block.find( '.articleFeedbackv5-cta-button' )
					.attr( 'href', url );

				// Turn the submit into a slick button
				$block.find( '.articleFeedbackv5-cta-button' )
					.button()
					.addClass( 'ui-button-blue' );

				return $block;
			},

			// }}}
			// {{{ afterBuild

			/**
			 * Handles any setup that has to be done once the markup is in the
			 * holder
			 */
			afterBuild: function () {
				// Set a custom message
				$.articleFeedbackv5.$holder
					.find( '.articleFeedbackv5-tooltip-info' )
					.text( mw.msg( 'articlefeedbackv5-bucket4-help-tooltip-info' ) );
				// Add a class so we can drop the tooltip down a bit for the
				// learn-more version
				if ( !$.articleFeedbackv5.editable ) {
					$.articleFeedbackv5.$holder.find( '.articleFeedbackv5-ui' )
						.addClass( 'articleFeedbackv5-option-4-noedit' );
				}
			}

			// }}}

		},

		// }}}
		// {{{ Bucket 6

		/**
		 * Bucket 6: Share Your Feedback, 2-step
		 */
		'6': {

			// {{{ getTitle

			/**
			 * Gets the title
			 *
			 * @return {string} the title
			 */
			getTitle: function () {
				return mw.msg( 'articlefeedbackv5-bucket6-title' );
			},

			// }}}
			// {{{ buildForm

			/**
			 * Builds the empty form
			 *
			 * @return {jQuery} the form
			 */
			buildForm: function () {
				var $block, message;

				// Start up the block to return
				$block = mw.template.get( 'jquery.articleFeedbackv5', 'bucket6.mustache' ).render( {
					'articlefeedbackv5-bucket6-question-toggle': mw.msg( 'articlefeedbackv5-bucket6-question-toggle' ),
					'articlefeedbackv5-bucket6-toggle-found-yes-full': mw.msg( 'articlefeedbackv5-bucket6-toggle-found-yes-full' ),
					'articlefeedbackv5-bucket6-toggle-found-yes': mw.msg( 'articlefeedbackv5-bucket6-toggle-found-yes' ),
					'articlefeedbackv5-bucket6-toggle-found-no-full': mw.msg( 'articlefeedbackv5-bucket6-toggle-found-no-full' ),
					'articlefeedbackv5-bucket6-toggle-found-no': mw.msg( 'articlefeedbackv5-bucket6-toggle-found-no' ),
					'articlefeedbackv5-bucket6-form-submit': mw.msg( 'articlefeedbackv5-bucket6-form-submit' )
				} );

				// Fill in the disclosure text
				message = 'articlefeedbackv5-help-transparency-terms';
				if ( $.articleFeedbackv5.anonymous ) {
					message = 'articlefeedbackv5-help-transparency-terms-anon';
				}
				$block.find( '.articlefeedbackv5-help-transparency-terms' ).msg( message );

				// Turn the submit into a slick button
				$block.find( '.articleFeedbackv5-submit' )
					.button()
					.addClass( 'ui-button-blue' );

				// Show only step 1
				$.articleFeedbackv5.currentBucket().displayStep1( $block );

				return $block;
			},

			// }}}
			// {{{ bindEvents

			/**
			 * Binds any events
			 *
			 * @param {jQuery} $block the form block
			 */
			bindEvents: function ( $block ) {
				// enable submission and switch out the comment default on toggle selection
				$block.find( '.articleFeedbackv5-button-placeholder' )
					.button()
					.click( function ( e ) {
						var newVal, $wrap, $element, text;

						e.preventDefault();

						newVal = $( this ).parents( '[data-value]' ).data( 'value' );

						$wrap = $.articleFeedbackv5.$holder.find( '#articleFeedbackv5-bucket6-toggle-wrapper-' + newVal );

						// move on to step 2
						$.articleFeedbackv5.currentBucket().displayStep2( $block );

						// add instructional text for feedback
						// Give grep a chance to find the usages:
						// articlefeedbackv5-bucket6-question-instructions-yes, articlefeedbackv5-bucket6-question-instructions-no
						$( '.articleFeedbackv5-title' ).text( mw.msg( 'articlefeedbackv5-bucket6-question-instructions-' + newVal ) );

						// make the button blue
						$( '.articleFeedbackv5-button-placeholder.ui-button-blue' ).removeClass( 'ui-button-blue' );
						$( this ).addClass( 'ui-button-blue' );

						// check/uncheck radio buttons
						$wrap.find( 'input' ).trigger( 'click' ).attr( 'checked', true );

						// set default comment message
						// Give grep a chance to find the usages:
						// articlefeedbackv5-bucket6-question-placeholder-yes, articlefeedbackv5-bucket6-question-placeholder-no
						$element = $.articleFeedbackv5.$holder.find( '.articleFeedbackv5-comment textarea' );
						text = mw.msg( 'articlefeedbackv5-bucket6-question-placeholder-' + newVal );
						$element.attr( 'placeholder', text );

						// allow feedback submission if there is feedback (or if Y/N was positive)
						$.articleFeedbackv5.enableSubmission( true );
					} );

				// add character-countdown on feedback-field
				$( document )
					.on( 'keyup', '.articleFeedbackv5-comment textarea', function () {

						/*
						 * If people have started writing feedback, inform them
						 * that leaving the page will result in lost data.
						 */
						if ( typeof window.onbeforeunload !== 'function' ) {
							$( window ).on( 'beforeunload', function () {
								// Only show the warning message if the user
								// actually entered some feedback into the
								// textarea (T146536)
								if ( $( '#articleFeedbackv5-find-feedback' ).val() !== '' ) {
									return mw.msg( 'articlefeedbackv5-leave-warning' );
								}
							} );
						}

						$.articleFeedbackv5.unlockForm();
						$.articleFeedbackv5.currentBucket().countdown( $( this ) );
					} );

				// clicking the back-link on step 2 should show step 1 again
				$( document )
					.on( 'click', '.articleFeedbackv5-arrow-back', function ( e ) {
						e.preventDefault();
						$.articleFeedbackv5.currentBucket().displayStep1( $block );
					} );

				// attach the submit
				$block.find( '.articleFeedbackv5-submit' )
					.click( function ( e ) {
						e.preventDefault();
						$.articleFeedbackv5.submitForm();

						// unbind confirmation message before leaving page
						$( window ).off( 'beforeunload' );
					} );
			},

			// }}}
			// {{{ getFormData

			/**
			 * Pulls down form data
			 *
			 * @return {Object} the form data
			 */
			getFormData: function () {
				var $check, defMsgYes, defMsgNo, data = {};

				$check = $.articleFeedbackv5.$holder.find( '.articleFeedbackv5-bucket6-toggle input[checked]' );
				if ( $check.val() === 'yes' ) {
					data.found = 1;
				} else if ( $check.val() === 'no' ) {
					data.found = 0;
				}
				data.comment = $.articleFeedbackv5.$holder.find( '.articleFeedbackv5-comment textarea' ).val();
				defMsgYes = mw.msg( 'articlefeedbackv5-bucket6-question-placeholder-yes' );
				defMsgNo = mw.msg( 'articlefeedbackv5-bucket6-question-placeholder-no' );
				if ( data.comment === defMsgYes || data.comment === defMsgNo ) {
					data.comment = '';
				}
				return data;
			},

			// }}}
			// {{{ localValidation

			/**
			 * Performs any local validation
			 *
			 * @param {Object} formdata the form data
			 * @return {false|string} if ok, false; otherwise, an object as { 'field name' : 'message' }
			 */
			localValidation: function ( formdata ) {
				if ( ( !( 'comment' in formdata ) || formdata.comment === '' ) &&
					!( 'found' in formdata ) && !$( '#articleFeedbackv5-bucket6-toggle-yes' ).is( ':checked' ) ) {
					$.articleFeedbackv5.enableSubmission( false );
					return mw.msg( 'articlefeedbackv5-error-nofeedback' );
				}
				return false;
			},

			// }}}
			// {{{ displayStep1

			/**
			 * Display step 1
			 *
			 * @param {jQuery} $block
			 */
			displayStep1: function ( $block ) {
				var $step1, $step2;

				$step1 = $( '.form-row', $block );
				$step2 = $( '.articleFeedbackv5-comment, .articleFeedbackv5-disclosure, .articleFeedbackv5-submit', $block );

				// hide comment, disclosure & submit first (should only show after clicking Y/N)
				$step1.show();
				$step2.hide();

				// remove back-arrow from title (if present)
				$( '.articleFeedbackv5-arrow-back' ).remove();

				// reset regular title
				$( '.articleFeedbackv5-title' ).html( $.articleFeedbackv5.currentBucket().getTitle() );
			},

			// }}}
			// {{{ displayStep2

			/**
			 * Display step 2
			 *
			 * @param {jQuery} $block
			 */
			displayStep2: function ( $block ) {
				var $backLink,
					$step1 = $( '.form-row', $block ),
					$step2 = $( '.articleFeedbackv5-comment, .articleFeedbackv5-disclosure, .articleFeedbackv5-submit', $block );

				// show comment, disclosure & submit; hide Y/N buttons
				$step2.show();
				$step1.hide();

				// spoof a keyup on the textarea, to init the character countdown
				$( '#articleFeedbackv5-find-feedback' ).trigger( 'keyup' );

				// add back-arrow in front of title
				$backLink = $( '<a href="#" class="articleFeedbackv5-arrow-back"></a>' );
				$backLink.text( mw.msg( 'articlefeedbackv5-bucket6-backlink-text' ) );
				$backLink.attr( 'title', mw.msg( 'articlefeedbackv5-bucket6-backlink-text' ) );
				$( '.articleFeedbackv5-title' ).before( $backLink );
			},

			// }}}
			// {{{ countdown

			/**
			 * Character countdown
			 *
			 * Note: will not do server-side check: this is only used to encourage people to keep their
			 * feedback concise, there's no technical reason not to allow more
			 *
			 * @param {jQuery} $element the form element to count the characters down for
			 */
			countdown: function ( $element ) {
				var displayLength = 500, maxLength, $countdown, length, message;

				maxLength = mw.config.get( 'wgArticleFeedbackv5MaxCommentLength' );
				if ( maxLength === 0 ) {
					return;
				}

				$countdown = $( '#articlefeedbackv5-feedback-countdown' );

				// grab the current length of the form element (or set to 0 if the current text is bogus placeholder)
				length = maxLength - $element.val().length;

				// display the amount of characters
				message = mw.msg( 'articlefeedbackv5-bucket6-feedback-countdown', length );
				$countdown.text( message );

				// remove excessive characters
				if ( length < 0 ) {
					$element.val( $element.val().substr( 0, maxLength ) );
				}

				// only display the countdown for the last X characters
				$countdown.hide();
				if ( length < displayLength ) {
					$countdown.show();
				}
			}

			// }}}

		}

		// }}}

	};

	// }}}
	// {{{ CTA objects

	/**
	 * Set up the CTA options' UI objects
	 */
	$.articleFeedbackv5.ctas = {

		// {{{ CTA 0: Just a confirmation message

		'0': {

			// {{{ build

			/**
			 * Builds the CTA
			 *
			 * @return {jQuery} the form
			 */
			build: function () {
				return $( '<div></div>' );
			},

			// }}}
			// {{{ afterBuild

			/**
			 * Handles any setup that has to be done once the markup is in the
			 * holder
			 */
			afterBuild: function () {
				// Drop the tooltip trigger
				$.articleFeedbackv5.$holder
					.find( '.articleFeedbackv5-tooltip-trigger' ).hide();
			}

			// }}}

		},

		// }}}
		// {{{ CTA 1: Enticement to edit

		'1': {

			// {{{ verify

			/**
			 * Verifies that this CTA can be displayed
			 *
			 * @return {boolean} whether the CTA can be displayed
			 */
			verify: function () {
				return $.articleFeedbackv5.editable && !mw.config.get( 'wgArticleFeedbackv5Permissions' )[ 'aft-editor' ];
			},

			// }}}
			// {{{ build

			/**
			 * Builds the CTA
			 *
			 * @return {jQuery} the form
			 */
			build: function () {
				// Start up the block to return
				var $block = mw.template.get( 'jquery.articleFeedbackv5', 'cta1.mustache' ).render( {
					'articlefeedbackv5-cta1-confirmation-title': mw.msg( 'articlefeedbackv5-cta1-confirmation-title' ),
					'articlefeedbackv5-cta1-confirmation-call': mw.message( 'articlefeedbackv5-cta1-confirmation-call' ).text(), // uses {{SITENAME}}
					'articlefeedbackv5-cta1-edit-linktext': mw.msg( 'articlefeedbackv5-cta1-edit-linktext' )
				} );

				// Fill in the link
				$block.find( '.articleFeedbackv5-cta-button' )
					.attr( 'href', $.articleFeedbackv5.editUrl() )
					.button()
					.addClass( 'ui-button-blue' );

				return $block;
			},

			// }}}
			// {{{ afterBuild

			/**
			 * Perform adjustments after build
			 */
			afterBuild: function () {
				$( '.articleFeedbackv5-tooltip-trigger' ).remove();
			}

			// }}}

		},

		// }}}
		// {{{ CTA 2: Learn more

		'2': {

			// {{{ build

			/**
			 * Builds the CTA
			 *
			 * @return {jQuery} the form
			 */
			build: function () {
				// Start up the block to return
				var $block = mw.template.get( 'jquery.articleFeedbackv5', 'cta2.mustache' ).render( {
					'articlefeedbackv5-cta2-confirmation-title': mw.msg( 'articlefeedbackv5-cta2-confirmation-title' ),
					'articlefeedbackv5-cta2-confirmation-call': mw.message( 'articlefeedbackv5-cta2-confirmation-call' ).text(), // uses {{SITENAME}}
					'articlefeedbackv5-cta2-button-text': mw.msg( 'articlefeedbackv5-cta2-button-text' )
				} );

				// Fill in the button link
				$block
					.find( '.articleFeedbackv5-cta-button' )
					.attr( 'href', mw.msg( 'articlefeedbackv5-cta1-learn-how-url' ) )
					.button()
					.addClass( 'ui-button-blue' );

				return $block;
			},

			// }}}
			// {{{ verify

			/**
			 * Verifies that this CTA can be displayed
			 *
			 * @return {boolean} whether the CTA can be displayed
			 */
			verify: function () {
				return !mw.config.get( 'wgArticleFeedbackv5Permissions' )[ 'aft-editor' ];
			},

			// }}}
			// {{{ afterBuild

			/**
			 * Perform adjustments after build
			 */
			afterBuild: function () {
				$( '.articleFeedbackv5-tooltip-trigger' ).remove();
			}

			// }}}

		},

		// }}}
		// {{{ CTA 3: Take a survey

		'3': {

			// {{{ verify

			/**
			 * Verifies that this CTA can be displayed
			 *
			 * @return {boolean} whether the CTA can be displayed
			 */
			verify: function () {
				return $.articleFeedbackv5.ctas[ '3' ].getSurveyUrl() !== false;
			},

			// }}}
			// {{{ build

			/**
			 * Builds the CTA
			 *
			 * @return {jQuery} the form
			 */
			build: function () {
				var $block, surveyUrl;

				// Start up the block to return
				$block = mw.template.get( 'jquery.articleFeedbackv5', 'cta3.mustache' ).render( {
					'articlefeedbackv5-cta3-confirmation-title': mw.msg( 'articlefeedbackv5-cta3-confirmation-title' ),
					'articlefeedbackv5-cta3-confirmation-call': mw.message( 'articlefeedbackv5-cta3-confirmation-call' ).text(), // uses {{SITENAME}}
					'articlefeedbackv5-cta3-button-text': mw.msg( 'articlefeedbackv5-cta3-button-text' )
				} );

				// Fill in the go-to-survey link
				surveyUrl = $.articleFeedbackv5.currentCTA().getSurveyUrl();
				if ( surveyUrl ) {
					$block
						.find( '.articleFeedbackv5-cta-button' )
						.attr( 'href', surveyUrl + '?c=' + $.articleFeedbackv5.feedbackId )
						.button()
						.addClass( 'ui-button-blue' );
				}

				return $block;
			},

			// }}}
			// {{{ getSurveyUrl

			/**
			 * Gets the appropriate survey URL, or returns false if none was
			 * found
			 *
			 * @return {false|string} the URL, if one is available, or false if not
			 */
			getSurveyUrl: function () {
				var base = mw.config.get( 'wgArticleFeedbackv5SurveyUrls' );
				if ( typeof base !== 'object' || !( $.articleFeedbackv5.bucketId in base ) ) {
					return false;
				}
				return base[ $.articleFeedbackv5.bucketId ];
			},

			// }}}
			// {{{ bindEvents

			/**
			 * Binds any events
			 *
			 * @param {jQuery} $block the form block
			 */
			bindEvents: function ( $block ) {

				// Make the link work as a popup
				$block.find( '.articleFeedbackv5-cta-button' )
					.click( function ( e ) {
						var link, params;

						e.preventDefault();
						link = $( this ).attr( 'href' );
						params = 'status=0,\
							toolbar=0,\
							location=0,\
							menubar=0,\
							directories=0,\
							resizable=1,\
							scrollbars=1,\
							height=800,\
							width=600';
						window.open( link, 'survey', params );
						$.articleFeedbackv5.clear();
					} );

			},

			// }}}
			// {{{ afterBuild

			/**
			 * Perform adjustments after build
			 */
			afterBuild: function () {
				$( '.articleFeedbackv5-tooltip-trigger' ).remove();
			}

			// }}}

		},

		// }}}
		// {{{ CTA 4: Sign up or login

		'4': {

			// {{{ verify

			/**
			 * Verifies that this CTA can be displayed
			 *
			 * @return {boolean} whether the CTA can be displayed
			 */
			verify: function () {
				return $.articleFeedbackv5.anonymous;
			},

			// }}}
			// {{{ build

			/**
			 * Builds the CTA
			 *
			 * @return {jQuery} the form
			 */
			build: function () {
				var $block, signupUrl, loginUrl;

				// Start up the block to return
				$block = mw.template.get( 'jquery.articleFeedbackv5', 'cta4.mustache' ).render( {
					'articlefeedbackv5-cta4-confirmation-title': mw.msg( 'articlefeedbackv5-cta4-confirmation-title' ),
					'articlefeedbackv5-cta4-confirmation-call-line1': mw.msg( 'articlefeedbackv5-cta4-confirmation-call-line1' ),
					'articlefeedbackv5-cta4-confirmation-call-line2': mw.msg( 'articlefeedbackv5-cta4-confirmation-call-line2' ),
					'articlefeedbackv5-cta4-button-text-signup': mw.msg( 'articlefeedbackv5-cta4-button-text-signup' ),
					'articlefeedbackv5-cta4-button-text-or': mw.msg( 'articlefeedbackv5-cta4-button-text-or' ),
					'articlefeedbackv5-cta4-button-text-login': mw.msg( 'articlefeedbackv5-cta4-button-text-login' ),
					// This one's actually commented out in the HTML template file...
					'articlefeedbackv5-cta4-button-text-later': mw.msg( 'articlefeedbackv5-cta4-button-text-later' )
				} );

				// Fill in the signup & login link
				signupUrl = mw.util.getUrl( 'Special:UserLogin', {
					returnto: mw.config.get( 'wgPageName' ),
					type: 'signup',
					campaign: 'aftv5_cta4',
					c: $.articleFeedbackv5.feedbackId
				} );
				$block.find( '.articleFeedbackv5-cta-button-signup' )
					.attr( 'href', signupUrl );

				loginUrl = mw.util.getUrl( 'Special:UserLogin', {
					returnto: mw.config.get( 'wgPageName' ),
					c: $.articleFeedbackv5.feedbackId
				} );
				$block.find( '.articleFeedbackv5-cta-button-login' )
					.attr( 'href', loginUrl );

				$block.find( '.articleFeedbackv5-cta-button' )
					.button()
					.addClass( 'ui-button-blue' );

				return $block;
			},

			// }}}
			// {{{ getSurveyUrl

			/**
			 * Gets the appropriate survey URL, or returns false if none was
			 * found
			 *
			 * @return {false|string} the URL, if one is available, or false if not
			 */
			getSurveyUrl: function () {
				var base = mw.config.get( 'wgArticleFeedbackv5SurveyUrls' );
				if ( typeof base !== 'object' || !( $.articleFeedbackv5.bucketId in base ) ) {
					return false;
				}
				return base[ $.articleFeedbackv5.bucketId ];
			},

			// }}}
			// {{{ bindEvents

			/**
			 * Binds any events
			 *
			 * @param {jQuery} $block the form block
			 */
			bindEvents: function ( $block ) {

				$block.find( '.articleFeedbackv5-cta-button-later' )
					.click( function ( e ) {
						e.preventDefault();
						$.articleFeedbackv5.clear();
					} );
			},

			// }}}
			// {{{ afterBuild

			/**
			 * Perform adjustments after build
			 */
			afterBuild: function () {
				$( '.articleFeedbackv5-tooltip-trigger' ).remove();
			}

			// }}}

		},

		// }}}
		// {{{ CTA 5: View feedback

		'5': {

			// {{{ build

			/**
			 * Builds the CTA
			 *
			 * @return {jQuery} the form
			 */
			build: function () {
				// Start up the block to return
				var $block = mw.template.get( 'jquery.articleFeedbackv5', 'cta5.mustache' ).render( {
					'articlefeedbackv5-cta5-confirmation-title': mw.msg( 'articlefeedbackv5-cta5-confirmation-title' ),
					'articlefeedbackv5-cta5-confirmation-call': mw.msg( 'articlefeedbackv5-cta5-confirmation-call' ),
					'articlefeedbackv5-cta5-button-text': mw.msg( 'articlefeedbackv5-cta5-button-text' )
				} );

				// Fill in the link
				$block.find( '.articleFeedbackv5-cta-button' )
					.attr( 'href', $.articleFeedbackv5.specialUrl + '#' + $.articleFeedbackv5.feedbackId )
					.button()
					.addClass( 'ui-button-blue' );

				return $block;
			},

			// }}}
			// {{{ verify

			/**
			 * Verifies that this CTA can be displayed
			 *
			 * @return {boolean} whether the CTA can be displayed
			 */
			verify: function () {
				/*
				 * @todo: This will disable CTA5 for anonymous users; I think this will be only
				 * temporarily, so this method can probably be removed again at some point.
				 */
				return mw.config.get( 'wgArticleFeedbackv5Permissions' )[ 'aft-editor' ];
			},

			// }}}
			// {{{ afterBuild

			/**
			 * Perform adjustments after build
			 */
			afterBuild: function () {
				$( '.articleFeedbackv5-tooltip-trigger' ).remove();
			}

			// }}}

		},

		// }}}
		// {{{ CTA 6: Visit Teahouse

		'6': {

			// {{{ build

			/**
			 * Builds the CTA
			 *
			 * @return {jQuery} the form
			 */
			build: function () {
				// Start up the block to return
				var $block = mw.template.get( 'jquery.articleFeedbackv5', 'cta6.mustache' ).render( {
					'articlefeedbackv5-cta6-confirmation-title': mw.message( 'articlefeedbackv5-cta6-confirmation-title' ).text(), // uses {{SITENAME}}
					'articlefeedbackv5-cta6-confirmation-call': mw.message( 'articlefeedbackv5-cta6-confirmation-call' ).text(), // uses {{SITENAME}}
					'articlefeedbackv5-cta6-button-text': mw.msg( 'articlefeedbackv5-cta6-button-text' )
				} );

				// Fill in the link
				$block.find( '.articleFeedbackv5-cta-button' )
					.attr( 'href', mw.msg( 'articlefeedbackv5-cta6-button-link' ) )
					.button()
					.addClass( 'ui-button-blue' );

				return $block;
			},

			// }}}
			// {{{ verify

			/**
			 * Verifies that this CTA can be displayed
			 *
			 * @return {boolean} whether the CTA can be displayed
			 */
			verify: function () {
				return mw.config.get( 'wgArticleFeedbackv5Permissions' )[ 'aft-editor' ];
			},

			// }}}
			// {{{ afterBuild

			/**
			 * Perform adjustments after build
			 */
			afterBuild: function () {
				$( '.articleFeedbackv5-tooltip-trigger' ).remove();
			}

			// }}}

		}

		// }}}

	};

	// }}}
	// {{{ Trigger link objects

	/**
	 * Set up the trigger link options
	 */
	$.articleFeedbackv5.triggerLinks = {

		// {{{ A: After the site tagline (below the article title)

		A: {

			// {{{ templates

			/**
			 * Pull out the markup so it's easy to find
			 */
			templates: {

				/**
				 * The link template, when it does not include a close button
				 */
				basic: '<span><a href="#mw-articleFeedbackv5" id="articleFeedbackv5-sitesublink"></a></span>',

				/**
				 * The link template, when it includes a close button
				 */
				closeable: '\
					<span>\
						<a href="#mw-articleFeedbackv5" id="articleFeedbackv5-sitesublink"></a>\
						<a href="#" class="articleFeedbackv5-close-trigger-link">[X]</a>\
					</span>\
					'

			},

			// }}}
			// {{{ closeable

			/**
			 * Returns whether the link includes a close button
			 *
			 * @return {boolean}
			 */
			closeable: function () {
				return !mw.user.isAnon();
			},

			// }}}
			// {{{ build

			/**
			 * Builds the trigger link
			 *
			 * @return {jQuery} the link
			 */
			build: function () {
				var self, $link;

				self = $.articleFeedbackv5.triggerLinks.A;
				$link = $( self.closeable() ? self.templates.closeable : self.templates.basic );
				$link.find( '#articleFeedbackv5-sitesublink' )
					.data( 'linkId', 'A' )
					.text( mw.msg( 'articlefeedbackv5-sitesub-linktext' ) )
					.click( function ( e ) {
						e.preventDefault();
						$.articleFeedbackv5.highlightForm();
					} );
				return $link;
			},

			// }}}
			// {{{ insert

			/**
			 * Inserts the link into the page
			 *
			 * @param {jQuery} $link the link
			 */
			insert: function ( $link ) {
				// The link is going to be at different markup locations on different skins,
				// and it needs to show up if the site subhead (e.g., "From Wikipedia, the free
				// encyclopedia") is not visible for any reason.
				if ( $( '#siteSub' ).filter( ':visible' ).length ) {
					$link.prepend( ' &nbsp; ' + mw.msg( 'pipe-separator' ) + ' &nbsp; ' );
					$( '#siteSub' ).append( $link );
				} else if ( $( 'h1.pagetitle + p.subtitle' ).filter( ':visible' ).length ) {
					$link.prepend( ' &nbsp; ' + mw.msg( 'pipe-separator' ) + ' &nbsp; ' );
					$( 'h1.pagetitle + p.subtitle' ).append( $link );
				} else if ( $( '#mw_contentholder .mw-topboxes' ).length ) {
					$( '#mw_contentholder .mw-topboxes' ).after( $link );
				} else if ( $( '#bodyContent' ).length ) {
					$( '#bodyContent' ).prepend( $link );
				}
			}

			// }}}

		},

		// }}}
		// {{{ B: Below the titlebar on the right

		B: {

			// {{{ closeable

			/**
			 * Returns whether the link includes a close button
			 *
			 * @return {boolean}
			 */
			closeable: function () {
				return false;
			},

			// }}}
			// {{{ build

			/**
			 * Builds the trigger link
			 *
			 * @return {jQuery} the link
			 */
			build: function () {
				var $link = $( '<a href="#mw-articleFeedbackv5" id="articleFeedbackv5-titlebarlink"></a>' )
					.data( 'linkId', 'B' )
					.text( mw.msg( 'articlefeedbackv5-titlebar-linktext' ) )
					.click( function ( e ) {
						e.preventDefault();
						$.articleFeedbackv5.highlightForm();
					} );
				if ( $( '#coordinates' ).length ) {
					$link.css( 'margin-top: 2.5em' );
				}
				return $link;
			}

			// }}}

		},

		// }}}
		// {{{ C: Button fixed to right side

		C: {

			// {{{ templates

			/**
			 * Pull out the markup so it's easy to find
			 */
			templates: {

				/**
				 * The link template
				 */
				block: '\
					<div id="articleFeedbackv5-fixedtab" class="articleFeedbackv5-fixedtab">\
						<div id="articleFeedbackv5-fixedtabbox" class="articleFeedbackv5-fixedtabbox">\
							<a href="#mw-articleFeedbackv5" id="articleFeedbackv5-fixedtablink" class="articleFeedbackv5-fixedtablink"></a>\
						</div>\
					</div>'

			},

			// }}}
			// {{{ closeable

			/**
			 * Returns whether the link includes a close button
			 *
			 * @return {boolean}
			 */
			closeable: function () {
				return false;
			},

			// }}}
			// {{{ build

			/**
			 * Builds the trigger link
			 *
			 * @return {jQuery} the link
			 */
			build: function () {
				var $link = $( $.articleFeedbackv5.triggerLinks.C.templates.block );
				$link.find( '#articleFeedbackv5-fixedtablink' )
					.data( 'linkId', 'C' )
					.attr( 'title', mw.msg( 'articlefeedbackv5-fixedtab-linktext' ) )
					.click( function ( e ) {
						e.preventDefault();
						$.articleFeedbackv5.highlightForm();
					} );
				return $link;
			}

			// }}}

		},

		// }}}
		// {{{ D: Button fixed to bottom right

		D: {

			// {{{ templates

			/**
			 * Pull out the markup so it's easy to find
			 */
			templates: {

				/**
				 * The link template
				 */
				block: '\
					<div id="articleFeedbackv5-bottomrighttab" class="articleFeedbackv5-bottomrighttab">\
						<div id="articleFeedbackv5-bottomrighttabbox" class="articleFeedbackv5-bottomrighttabbox">\
							<a href="#mw-articleFeedbackv5" id="articleFeedbackv5-bottomrighttablink" class="articleFeedbackv5-bottomrighttablink"></a>\
						</div>\
					</div>'

			},

			// }}}
			// {{{ closeable

			/**
			 * Returns whether the link includes a close button
			 *
			 * @return {boolean}
			 */
			closeable: function () {
				return false;
			},

			// }}}
			// {{{ build

			/**
			 * Builds the trigger link
			 *
			 * @return {jQuery} the link
			 */
			build: function () {
				var $link = $( $.articleFeedbackv5.triggerLinks.D.templates.block );
				$link.find( '#articleFeedbackv5-bottomrighttablink' )
					.data( 'linkId', 'D' )
					.text( mw.msg( 'articlefeedbackv5-bottomrighttab-linktext' ) )
					.click( function ( e ) {
						e.preventDefault();
						$.articleFeedbackv5.highlightForm();
					} );
				return $link;
			}

			// }}}

		},

		// }}}
		// {{{ E: Same as D, with other colors

		E: {

			// {{{ templates

			/**
			 * Pull out the markup so it's easy to find
			 */
			templates: {

				/**
				 * The link template, when it does not include a close button
				 */
				basic: '\
					<div id="articleFeedbackv5-bottomrighttab" class="articleFeedbackv5-bottomrighttab">\
						<div id="articleFeedbackv5-bottomrighttabbox" class="articleFeedbackv5-bottomrighttabbox">\
							<div class="articleFeedbackv5-bottomrighttablink">\
								<a href="#mw-articleFeedbackv5" id="articleFeedbackv5-bottomrighttablink"></a>\
							</div>\
						</div>\
					</div>\
					',

				/**
				 * The link template, when it includes a close button
				 */
				closeable: '\
					<div id="articleFeedbackv5-bottomrighttab" class="articleFeedbackv5-bottomrighttab articleFeedbackv5-trigger-link">\
						<div id="articleFeedbackv5-bottomrighttabbox" class="articleFeedbackv5-bottomrighttabbox">\
							<div class="articleFeedbackv5-bottomrighttablink articleFeedbackv5-closeable">\
								<a href="#mw-articleFeedbackv5" id="articleFeedbackv5-bottomrighttablink"></a>\
								<a href="#" class="articleFeedbackv5-close-trigger-link"></a>\
							</div>\
						</div>\
					</div>\
					'

			},

			// }}}
			// {{{ closeable

			/**
			 * Returns whether the link includes a close button
			 *
			 * @return {boolean}
			 */
			closeable: function () {
				return !mw.user.isAnon();
			},

			// }}}
			// {{{ build

			/**
			 * Builds the trigger link
			 *
			 * @return {jQuery} the link
			 */
			build: function () {
				var self, $link;

				self = $.articleFeedbackv5.triggerLinks.E;
				$link = $( self.closeable() ? self.templates.closeable : self.templates.basic );
				$link.find( '#articleFeedbackv5-bottomrighttablink' )
					.data( 'linkId', 'E' )
					.text( mw.msg( 'articlefeedbackv5-bottomrighttab-linktext' ) )
					.click( function ( e ) {
						e.preventDefault();
						$.articleFeedbackv5.highlightForm();
					} );
				return $link;
			}

			// }}}

		},

		// }}}
		// {{{ F: Button fixed to left side -- NOT IMPLEMENTED

		F: {

			// {{{ closeable

			/**
			 * Returns whether the link includes a close button
			 *
			 * @return {boolean}
			 */
			closeable: function () {
				return false;
			},

			// }}}
			// {{{ build

			/**
			 * Builds the trigger link
			 */
			build: function () {
			}

			// }}}

		},

		// }}}
		// {{{ G: Button below logo -- NOT IMPLEMENTED

		G: {

			// {{{ closeable

			/**
			 * Returns whether the link includes a close button
			 *
			 * @return {boolean}
			 */
			closeable: function () {
				return false;
			},

			// }}}
			// {{{ build

			/**
			 * Builds the trigger link
			 *
			 */
			build: function () {
			}

			// }}}

		},

		// }}}
		// {{{ H: Link on each section bar

		H: {

			// {{{ closeable

			/**
			 * Returns whether the link includes a close button
			 *
			 * @return {boolean}
			 */
			closeable: function () {
				return false;
			},

			// }}}
			// {{{ build

			/**
			 * Builds the trigger link
			 *
			 * @return {jQuery} the link
			 */
			build: function () {
				var $wrap = $( '<span class="articleFeedbackv5-sectionlink-wrap"></span>' )
					.html( '&nbsp;[<a href="#mw-articlefeedbackv5" class="articleFeedbackv5-sectionlink"></a>]' );
				$wrap.find( 'a.articleFeedbackv5-sectionlink' )
					.data( 'linkId', 'H' )
					.text( mw.msg( 'articlefeedbackv5-section-linktext' ) )
					.click( function ( e ) {
						e.preventDefault();
						$.articleFeedbackv5.highlightForm();
					} );
				return $wrap;
			},

			// }}}
			// {{{ insert

			/**
			 * Inserts the link into the page
			 *
			 * @param {jQuery} $link the link
			 */
			insert: function ( $link ) {
				$( 'span.editsection' ).append( $link );
			}

			// }}}

		},

		// }}}
		// {{{ TBX: In the toolbox section (always added)

		TBX: {

			// {{{ closeable

			/**
			 * Returns whether the link includes a close button
			 *
			 * @return {boolean}
			 */
			closeable: function () {
				return false;
			},

			// }}}
			// {{{ build

			/**
			 * Builds the trigger link
			 *
			 * @return {jQuery} the link
			 */
			build: function () {
				var $linkAdd, $linkView;

				// build link to "add feedback" form
				$linkAdd = $( '<li id="t-articlefeedbackv5-add"><a href="#"></a></li>' );
				$linkAdd.find( 'a' ).text( mw.msg( 'articlefeedbackv5-toolbox-add' ) );

				if ( $.articleFeedbackv5.bucketId === '5' ) {
					$linkAdd.find( 'a' )
						.click( function ( e ) {
							e.preventDefault();
							// Just set the link ID -- this should act just like AFTv4
							$.articleFeedbackv5.setLinkId( 'TBX' );
						} );
				} else {
					$linkAdd.find( 'a' )
						.data( 'linkId', 'TBX' )
						.click( function ( e ) {
							e.preventDefault();
							$.articleFeedbackv5.highlightForm();
						} );
				}

				// build link to article feedback page
				$( '<div></div>' )
					.html( mw.template.get( 'jquery.articleFeedbackv5', 'cta-title-confirm.mustache' ).render( {
						'articlefeedbackv5-cta-thanks': mw.msg( 'articlefeedbackv5-cta-thanks' )
					} ) );

				$linkView = $( '<li id="t-articlefeedbackv5-view"><a href="#"></a></li>' );
				$linkView.find( 'a' )
					.text( mw.msg( 'articlefeedbackv5-toolbox-view' ) )
					.attr( 'href', mw.config.get( 'wgArticleFeedbackv5SpecialUrl' ) + '/' + mw.config.get( 'wgPageName' ) );

				return $linkAdd.add( $linkView );
			},

			// }}}
			// {{{ insert

			/**
			 * Inserts the links into the page
			 *
			 * @param {jQuery} $links the links
			 */
			insert: function ( $links ) {
				$( '#p-tb' ).find( 'ul' ).append( $links );
			}

			// }}}

		}

		// }}}

	};

	// }}}
	// {{{ Initialization

	// {{{ init

	/**
	 * Initializes the object
	 *
	 * The init method sets up the object once the plugin has been called.  Note
	 * that this plugin is only intended be used on one element at a time.  Further
	 * calls to it will overwrite the existing object, so don't do it.
	 *
	 * @param {jQuery} $el the element on which this plugin was called (already
	 *                       jQuery-ized)
	 * @param {Object} config the config object
	 */
	$.articleFeedbackv5.init = function ( $el, config ) {
		var reqDebug;

		// Can the user edit the page?
		$.articleFeedbackv5.editable = $.articleFeedbackv5.userCanEdit();

		$.articleFeedbackv5.$holder = $el;
		$.articleFeedbackv5.config = config;
		// Debug mode
		reqDebug = mw.util.getParamValue( 'debug' );
		if ( reqDebug ) {
			$.articleFeedbackv5.debug = reqDebug !== 'false';
		}
		// Go ahead and bucket right away
		$.articleFeedbackv5.selectBucket();
		$.articleFeedbackv5.selectCTA();
		// Select the trigger link(s)
		$.articleFeedbackv5.selectTriggerLinks();
		// Anything the bucket needs to do?
		if ( 'init' in $.articleFeedbackv5.currentBucket() ) {
			$.articleFeedbackv5.currentBucket().init();
		}
		// When the tool is visible, load the form
		$.articleFeedbackv5.$holder.appear( function () {
			if ( !$.articleFeedbackv5.isLoaded ) {
				$.articleFeedbackv5.load( 'auto' );
			}
		} );

		// Keep track of links that must be removed after a successful submission
		$.articleFeedbackv5.$toRemove = $( [] );

		// Add them
		$.articleFeedbackv5.addTriggerLinks();
		// Adding hash in url will not scroll down to this id, because the element
		// won't exist until .appear is triggered. Let's just simulate this ourselves.
		if ( '#' + $el.attr( 'id' ) === window.location.hash ) {
			$.articleFeedbackv5.highlightForm();
		}
	};

	// }}}
	// {{{ bucket

	/**
	 * Get the user's bucket (place them in one if not done already)
	 *
	 *     $.articleFeedbackv5.bucket( 'test', {
	 *         buckets: { ignored: 50, control: 25, test: 25 },
	 *         version: 1,
	 *         expires: 7
	 *     } );
	 *
	 * @param {string} key Name of bucket
	 * @param {Object} options Bucket configuration options
	 * @param {Object} options.buckets List of bucket-name/relative-probability pairs (required,
	 *  must have at least one pair)
	 * @param {number} [options.version=0] Version of bucket test, changing this forces
	 *  rebucketing
	 * @param {number} [options.expires=30] Length of time (in days) until the user gets
	 *  rebucketed
	 * @return {string} Bucket name - the randomly chosen key of the `options.buckets` object
	 */
	$.articleFeedbackv5.bucket = function ( key, options ) {
		var cookie, parts, version, bucket,
			range, k, rand, total;

		options = $.extend( {
			buckets: {},
			version: 0,
			expires: 30
		}, options || {} );

		cookie = mw.cookie.get( 'mwuser-bucket:' + key );

		// Bucket information is stored as 2 integers, together as version:bucket like: "1:2"
		if ( typeof cookie === 'string' && cookie.length > 2 && cookie.indexOf( ':' ) !== -1 ) {
			parts = cookie.split( ':' );
			if ( parts.length > 1 && Number( parts[ 0 ] ) === options.version ) {
				version = Number( parts[ 0 ] );
				bucket = String( parts[ 1 ] );
			}
		}

		if ( bucket === undefined ) {
			if ( !$.isPlainObject( options.buckets ) ) {
				throw new Error( 'Invalid bucket. Object expected for options.buckets.' );
			}

			version = Number( options.version );

			// Find range
			range = 0;
			for ( k in options.buckets ) {
				range += options.buckets[ k ];
			}

			// Select random value within range
			rand = Math.random() * range;

			// Determine which bucket the value landed in
			total = 0;
			for ( k in options.buckets ) {
				bucket = k;
				total += options.buckets[ k ];
				if ( total >= rand ) {
					break;
				}
			}

			mw.cookie.set(
				'mwuser-bucket:' + key,
				version + ':' + bucket,
				{ expires: Number( options.expires ) * 86400 }
			);
		}

		return bucket;
	};

	// }}}
	// {{{ selectBucket

	/**
	 * Chooses a bucket
	 *
	 * If the plugin is in debug mode, you'll be able to pass in a particular
	 * bucket in the url.  Otherwise, it will use the core bucketing
	 * (configuration for this module passed in) to choose a bucket.
	 */
	$.articleFeedbackv5.selectBucket = function () {
		var requested, cfg, key;

		// Find out which display bucket they go in:
		// 1. Requested in query string (debug only)
		// 2. Core bucketing
		requested = mw.util.getParamValue( 'aftv5_form' );
		cfg = mw.config.get( 'wgArticleFeedbackv5DisplayBuckets' );

		if ( requested in cfg.buckets && cfg.buckets[ requested ] > 0 ) {
			$.articleFeedbackv5.bucketId = requested;
		} else {
			key = 'ext.articleFeedbackv5@' + cfg.version + '-form';
			$.articleFeedbackv5.bucketId = $.articleFeedbackv5.bucket( key, cfg );
		}
	};

	// }}}
	// {{{ selectTriggerLinks

	/**
	 * Chooses the trigger link(s) to add
	 *
	 * If the plugin is in debug mode, you'll be able to pass in a particular
	 * link in the url.  Otherwise, it will use the core bucketing
	 * (configuration for this module passed in) to choose a trigger link.
	 */
	$.articleFeedbackv5.selectTriggerLinks = function () {
		var bucketedLink, cfg, knownBuckets, requested, key;

		// The bucketed link:
		//   1. Display bucket 0 or 4-not-editable?  Always no link.
		//   2. Requested in query string (debug only)
		//   3. Random bucketing
		bucketedLink = 'X';
		if ( !( $.articleFeedbackv5.bucketId === '0' ||
			( $.articleFeedbackv5.bucketId === '4' && !$.articleFeedbackv5.editable ) ) ) {
			cfg = mw.config.get( 'wgArticleFeedbackv5LinkBuckets' );
			if ( 'buckets' in cfg ) {
				knownBuckets = cfg.buckets;
				requested = mw.util.getParamValue( 'aftv5_link' );
				if ( requested in knownBuckets || requested === 'X' ) {
					bucketedLink = requested;
				} else {
					key = 'ext.articleFeedbackv5@' + cfg.version + '-links';
					bucketedLink = $.articleFeedbackv5.bucket( key, cfg );
				}
			}
		}
		$.articleFeedbackv5.floatingLinkId = bucketedLink;
		if ( bucketedLink !== 'X' ) {
			$.articleFeedbackv5.selectedLinks.push( bucketedLink );
		}
		// Always add the toolbox link
		$.articleFeedbackv5.selectedLinks.push( 'TBX' );
	};

	// }}}
	// {{{ userCanEdit

	/**
	 * Returns whether the user can edit the article
	 *
	 * @return {boolean}
	 */
	$.articleFeedbackv5.userCanEdit = function () {
		var restrictions, groups, i;

		// An empty restrictions array means anyone can edit
		restrictions = mw.config.get( 'wgRestrictionEdit', [] );
		groups = mw.config.get( 'wgUserGroups' );
		// Verify that each restriction exists in the user's groups
		for ( i = 0; i < restrictions.length; i++ ) {
			if ( groups.indexOf( restrictions[ i ] ) < 0 ) {
				return false;
			}
		}
		return true;
	};

	// }}}

	// }}}
	// {{{ Utility methods

	// {{{ currentBucket

	/**
	 * Utility method: Get the current bucket
	 *
	 * @return {Object} the bucket
	 */
	$.articleFeedbackv5.currentBucket = function () {
		return $.articleFeedbackv5.buckets[ $.articleFeedbackv5.bucketId ];
	};

	// }}}
	// {{{ currentCTA

	/**
	 * Utility method: Get the current CTA
	 *
	 * @return {Object} the cta
	 */
	$.articleFeedbackv5.currentCTA = function () {
		return $.articleFeedbackv5.ctas[ $.articleFeedbackv5.ctaId ];
	};

	// }}}
	// {{{ buildLink

	/**
	 * Utility method: Build a link from a href and message keys for the full
	 * text (with $1 where the link goes) and link text
	 *
	 * Can't use .text() with mw.message(, \/* $1 *\/ link).toString(),
	 * because 'link' should not be re-escaped (which would happen if done by mw.message)
	 *
	 * @param {string} fulltext the message key for the full text
	 * @return {string} the html
	 */
	$.articleFeedbackv5.buildLink = function ( fulltext ) {
		var full, args, i, sub, replacement;

		full = mw.html.escape( mw.msg( fulltext ) );
		args = arguments;
		return full.replace( /\$(\d+)/g, function ( str, number ) {
			i = parseInt( number, 10 );
			sub = args[ i ];
			replacement = '';
			if ( sub.tag === 'quotes' ) {
				replacement = '&quot;' + mw.msg( sub.text ) + '&quot';
			} else {
				replacement = mw.html.element(
					'tag' in sub ? sub.tag : 'a',
					$.articleFeedbackv5.attribs( sub ),
					mw.msg( sub.text )
				).toString();
			}
			return replacement;
		} );
	};

	// }}}
	// {{{ attribs

	/**
	 * Utility method: Set up the attributes for a link (works with
	 * buildLink())
	 *
	 * @param {Object} link the first link, as { href: '#', text: 'click here'.
	 *                     other-attrib: 'whatever'}
	 * @return {Object} the attributes
	 */
	$.articleFeedbackv5.attribs = function ( link ) {
		var k, attr = {};

		for ( k in link ) {
			if ( k !== 'text' && k !== 'tag' ) {
				attr[ k ] = link[ k ];
			}
		}
		return attr;
	};

	// }}}
	// {{{ enableSubmission

	/**
	 * Utility method: Enables or disables submission of the form
	 *
	 * @param {boolean} state true to enable; false to disable
	 */
	$.articleFeedbackv5.enableSubmission = function ( state ) {
		var bucket;

		// this is actually required to resolve jQuery behavior of not triggering the
		// click event when .blur() occurs on the textarea and .click() is supposed to
		// be triggered on the button.
		if ( $.articleFeedbackv5.submissionEnabled === state ) {
			return;
		}

		if ( state ) {
			$.articleFeedbackv5.$holder.find( '.articleFeedbackv5-submit' ).button( 'enable' );
		} else {
			$.articleFeedbackv5.$holder.find( '.articleFeedbackv5-submit' ).button( 'disable' );
		}
		bucket = $.articleFeedbackv5.currentBucket();
		if ( 'enableSubmission' in bucket ) {
			bucket.enableSubmission( state );
		}
		$.articleFeedbackv5.submissionEnabled = state;
		$( '#articleFeedbackv5-submit-bttn span' ).text( mw.msg( 'articlefeedbackv5-bucket1-form-submit' ) );
	};

	// }}}
	// {{{ experiment

	/**
	 * Utility method: Gets the name of the current experiment
	 *
	 * @return {string} the experiment (e.g. "optionM5_1_edit")
	 */
	$.articleFeedbackv5.experiment = function () {
		return 'option' + $.articleFeedbackv5.bucketId + $.articleFeedbackv5.submittedLinkId;
	};

	// }}}
	// {{{ ctaName

	/**
	 * Utility method: Gets the name of the current CTA
	 *
	 * @return {string} the CTA name
	 */
	$.articleFeedbackv5.ctaName = function () {
		var ctas = [
			'none',
			'edit',
			'learn_more',
			'survey',
			'signup_login',
			'view_feedback',
			'teahouse'
		];

		return 'cta_' + ( ctas[ $.articleFeedbackv5.ctaId ] || 'unknown' );
	};

	// }}}
	// {{{ editUrl

	/**
	 * Builds the edit URL
	 *
	 * @return {string} URL
	 */
	$.articleFeedbackv5.editUrl = function () {
		return mw.util.getUrl( null, { action: 'edit' } );
	};

	// }}}

	// }}}
	// {{{ Process methods

	// {{{ load

	/**
	 * Loads the tool onto the page
	 *
	 * @param {string} display what to load ("form", "cta", or "auto")
	 */
	$.articleFeedbackv5.load = function ( display ) {
		var bucket, cta;

		if ( display && display !== 'auto' ) {
			$.articleFeedbackv5.toDisplay = ( display === 'cta' ? 'cta' : 'form' );
		}

		$.articleFeedbackv5.clearContainers();
		$.articleFeedbackv5.nowShowing = 'none';

		if ( $.articleFeedbackv5.toDisplay === 'form' ) {
			bucket = $.articleFeedbackv5.currentBucket();
			if ( !( 'buildForm' in bucket ) ) {
				$.articleFeedbackv5.isLoaded = true;
				return;
			}
			$.articleFeedbackv5.loadContainers();
			$.articleFeedbackv5.showForm();
		} else if ( $.articleFeedbackv5.toDisplay === 'cta' ) {
			cta = $.articleFeedbackv5.currentCTA();
			if ( !( 'build' in cta ) ) {
				$.articleFeedbackv5.isLoaded = true;
				return;
			}
			$.articleFeedbackv5.loadContainers();
			$.articleFeedbackv5.showCTA();
		}

		$.articleFeedbackv5.isLoaded = true;
	};

	// }}}
	// {{{ loadContainers

	/**
	 * Builds containers and loads them onto the page
	 */
	$.articleFeedbackv5.loadContainers = function () {
		// Set up the panel
		var $wrapper = mw.template.get( 'jquery.articleFeedbackv5', 'panel-outer.mustache' ).render( {
			'articlefeedbackv5-help-tooltip-title': mw.msg( 'articlefeedbackv5-help-tooltip-title' ),
			'articlefeedbackv5-help-tooltip-info': mw.msg( 'articlefeedbackv5-help-tooltip-info' ),
			'articlefeedbackv5-help-tooltip-linktext': mw.msg( 'articlefeedbackv5-help-tooltip-linktext' )
		} );

		// Add the help tooltip
		$wrapper.find( '.articleFeedbackv5-tooltip-link' )
			.click( function ( e ) {
				e.preventDefault();
				window.open( $( e.target ).attr( 'href' ) );
			} );
		$wrapper.find( '.articleFeedbackv5-tooltip-close' ).click( function () {
			$.articleFeedbackv5.$holder.find( '.articleFeedbackv5-tooltip' ).toggle();
		} );
		$wrapper.find( '.articleFeedbackv5-tooltip' ).hide();

		// Set up the tooltip trigger for the panel version
		$wrapper.find( '.articleFeedbackv5-title-wrap' ).append(
			mw.template.get( 'jquery.articleFeedbackv5', 'help-tooltip-trigger.mustache' ).render( {
				'articlefeedbackv5-help-tooltip-title': mw.msg( 'articlefeedbackv5-help-tooltip-title' )
			} )
		);
		$wrapper.find( '.articleFeedbackv5-tooltip-trigger' ).click( function ( e ) {
			e.preventDefault();
			$.articleFeedbackv5.$holder.find( '.articleFeedbackv5-tooltip' ).toggle();
		} );

		// Add it to the page
		$.articleFeedbackv5.$holder
			.html( $wrapper )
			.addClass( 'articleFeedbackv5' )
			.append( mw.template.get( 'jquery.articleFeedbackv5', 'error-panel.mustache' ).render() )
			.append( '<div class="articleFeedbackv5-lock"></div>' );
	};

	// }}}
	// {{{ showForm

	/**
	 * Builds the form and loads it into the document
	 */
	$.articleFeedbackv5.showForm = function () {
		var bucket, $block, helpLink;

		// Build the form
		bucket = $.articleFeedbackv5.currentBucket();
		$block = bucket.buildForm();
		if ( 'bindEvents' in bucket ) {
			bucket.bindEvents( $block );
		}

		// Add it to the appropriate container
		$.articleFeedbackv5.$holder.find( '.articleFeedbackv5-ui-inner' )
			.append( $block );

		// Set the appropriate class on the ui block
		$.articleFeedbackv5.$holder.find( '.articleFeedbackv5-ui' )
			.addClass( 'articleFeedbackv5-option-' + $.articleFeedbackv5.bucketId )
			.removeClass( 'articleFeedbackv5-cta-' + $.articleFeedbackv5.ctaId );

		// Set the title
		if ( 'getTitle' in bucket ) {
			$.articleFeedbackv5.$holder.find( '.articleFeedbackv5-title' ).html( bucket.getTitle() );
		}

		// Link to help is dependent on the group the user belongs to
		helpLink = mw.msg( 'articlefeedbackv5-help-form-linkurl' );
		if ( mw.config.get( 'wgArticleFeedbackv5Permissions' )[ 'aft-oversighter' ] ) {
			helpLink = mw.msg( 'articlefeedbackv5-help-form-linkurl-oversighters' );
		} else if ( mw.config.get( 'wgArticleFeedbackv5Permissions' )[ 'aft-monitor' ] ) {
			helpLink = mw.msg( 'articlefeedbackv5-help-form-linkurl-monitors' );
		} else if ( mw.config.get( 'wgArticleFeedbackv5Permissions' )[ 'aft-editor' ] ) {
			helpLink = mw.msg( 'articlefeedbackv5-help-form-linkurl-editors' );
		}

		// Set the tooltip link
		$.articleFeedbackv5.$holder.find( '.articleFeedbackv5-tooltip-link' )
			.attr( 'href', helpLink );

		// Do anything special the bucket requires
		if ( 'afterBuild' in bucket ) {
			bucket.afterBuild();
		}

		$.articleFeedbackv5.nowShowing = 'form';
	};

	// }}}
	// {{{ submitForm

	/**
	 * Submits the form
	 *
	 * This calls the Article Feedback API method, which stores the user's
	 * responses and returns the name of the CTA to be displayed, if the input
	 * passes local validation.  Local validation is defined by the bucket UI
	 * object.
	 *
	 * @return {boolean}
	 */
	$.articleFeedbackv5.submitForm = function () {
		var bucket, formdata, errors, now, msInHour, timestampsCookieName, priorTimestamps,
			savedTimestamps, priorCookieValue, i, postsInLastHour, message, data;

		// Are we allowed to do this?
		if ( !$.articleFeedbackv5.submissionEnabled ) {
			return false;
		}

		// Get the form data
		bucket = $.articleFeedbackv5.currentBucket();
		formdata = {};
		if ( 'getFormData' in bucket ) {
			formdata = bucket.getFormData();
		}

		// Perform any local validation
		if ( 'localValidation' in bucket ) {
			errors = bucket.localValidation( formdata );
			if ( errors ) {
				$.articleFeedbackv5.markFormErrors( errors );
				return;
			}
		}

		// check throttling
		if ( $.articleFeedbackv5.throttleThresholdPostsPerHour !== -1 ) {
			// MSIE<9 does not support Date.now(), hence the workaround
			now = ( new Date() ).getTime();
			msInHour = 3600000;

			timestampsCookieName = mw.config.get( 'wgCookiePrefix' ) + $.aftUtils.getCookieName( 'submission_timestamps' );

			priorTimestamps = [];
			savedTimestamps = [];

			priorCookieValue = $.cookie( timestampsCookieName );
			if ( priorCookieValue ) {
				priorTimestamps = priorCookieValue.split( ',' );
			}

			for ( i = 0; i < priorTimestamps.length; i++ ) {
				if ( now - priorTimestamps[ i ] <= msInHour ) {
					savedTimestamps.push( priorTimestamps[ i ] );
				}
			}

			postsInLastHour = savedTimestamps.length;

			if ( postsInLastHour >= $.articleFeedbackv5.throttleThresholdPostsPerHour ) {
				// display throttling message
				message = $( '<span />' ).msg( 'articlefeedbackv5-error-throttled' ).text();
				$.articleFeedbackv5.markTopError( message );

				// re-store pruned post timestamp list
				$.cookie( timestampsCookieName, savedTimestamps.join( ',' ), { expires: 1, path: '/' } );

				return;
			}

			// if we get this far, they haven't been throttled, so update the post timestamp list with the current time and re-store it
			savedTimestamps.push( now );
			$.cookie( timestampsCookieName, savedTimestamps.join( ',' ), { expires: 1, path: '/' } );
		}

		// Lock the form
		$.articleFeedbackv5.lockForm();

		// this is a good time to hide the help box, if its displayed
		$( '.articleFeedbackv5-tooltip' ).hide();

		// Request data
		data = $.extend( formdata, {
			action: 'articlefeedbackv5',
			format: 'json',
			anontoken: $.articleFeedbackv5.userId,
			pageid: $.articleFeedbackv5.pageId,
			revid: $.articleFeedbackv5.revisionId,
			bucket: $.articleFeedbackv5.bucketId,
			cta: $.articleFeedbackv5.ctaId,
			link: $.articleFeedbackv5.submittedLinkId
		} );

		// inject alternative language to get correct localized error messages for ?uselang=XY
		if ( typeof mw.Uri().query.uselang !== 'undefined' ) {
			data = $.extend( data, {
				uselang: mw.Uri().query.uselang
			} );
		}

		// Send off the ajax request
		$.ajax( {
			url: $.articleFeedbackv5.apiUrl,
			type: 'POST',
			dataType: 'json',
			data: data,
			success: function ( data ) {
				var feedbackIdsCookieName, feedbackIds, msg;

				if ( 'articlefeedbackv5' in data &&
					'feedback_id' in data.articlefeedbackv5 &&
					'aft_url' in data.articlefeedbackv5
				) {
					$.articleFeedbackv5.feedbackId = data.articlefeedbackv5.feedback_id;
					$.articleFeedbackv5.specialUrl = data.articlefeedbackv5.aft_url;
					$.articleFeedbackv5.permalink = data.articlefeedbackv5.permalink;

					$.articleFeedbackv5.unlockForm();
					$.articleFeedbackv5.showCTA();

					feedbackIdsCookieName = mw.config.get( 'wgCookiePrefix' ) + $.aftUtils.getCookieName( 'feedback-ids' );

					// save add feedback id to cookie (only most recent 20)
					feedbackIds = JSON.parse( $.cookie( feedbackIdsCookieName ) );
					if ( !Array.isArray( feedbackIds ) ) {
						feedbackIds = [];
					}
					feedbackIds.unshift( data.articlefeedbackv5.feedback_id );
					$.cookie(
						feedbackIdsCookieName,
						JSON.stringify( feedbackIds.splice( 0, 20 ) ),
						{ expires: 30, path: '/' }
					);

					// Clear out anything that needs removing (usually trigger links)
					$.articleFeedbackv5.$toRemove.remove();
					$.articleFeedbackv5.$toRemove = $( [] );

				} else {
					msg = mw.msg( 'articlefeedbackv5-error-unknown' );

					// fetch error information
					if ( 'error' in data ) {
						msg = data.error.info;
					} else if ( 'warning' in data ) {
						msg = data.warning.info;
					}

					// Set up error state
					$.articleFeedbackv5.markFormErrors( msg );
				}
			},
			error: function () {
				var msg = mw.msg( 'articlefeedbackv5-error-submit' );

				// Set up error state
				$.articleFeedbackv5.markFormErrors( msg );
				$.articleFeedbackv5.unlockForm();
			}
		} );

		// Does the bucket need to do anything else on submit (alongside the
		// ajax request, not as a result of it)?
		if ( 'onSubmit' in bucket ) {
			bucket.onSubmit( formdata );
		}
	};

	// }}}
	// {{{ selectCTA

	/**
	 * Chooses a bucket
	 *
	 * If the plugin is in debug mode, you'll be able to pass in a particular
	 * bucket in the url.  Otherwise, it will use the core bucketing
	 * (configuration for this module passed in) to choose a bucket.
	 */
	$.articleFeedbackv5.selectCTA = function () {
		var valid, cfg, requested, key, i;

		cfg = mw.config.get( 'wgArticleFeedbackv5CTABuckets' );

		// the check to verify a CTA is valid and can be shown
		valid = function ( requested ) {
			if (
				// check if the CTA is bucketed
				requested in cfg.buckets && cfg.buckets[ requested ] > 0 &&
				// check if CTA exists
				requested in $.articleFeedbackv5.ctas &&
				// check if there's validation for this CTA
				( !( 'verify' in $.articleFeedbackv5.ctas[ requested ] ) ||
				// check if we pass validation
				$.articleFeedbackv5.ctas[ requested ].verify() )
			) {
				return true;
			}

			return false;
		};

		// default = no CTA
		$.articleFeedbackv5.ctaId = '0';

		// Find out which CTA bucket they go in:
		// 1. Requested in query string (debug only)
		// 2. Core bucketing
		requested = mw.util.getParamValue( 'aftv5_cta' );
		if ( requested && valid( requested ) ) {
			$.articleFeedbackv5.ctaId = requested;
		} else {
			key = 'ext.articleFeedbackv5@' + cfg.version + '-cta';
			requested = $.articleFeedbackv5.bucket( key, cfg );

			if ( valid( requested ) ) {
				$.articleFeedbackv5.ctaId = requested;
			} else {
				// if the selected CTA is invalid, let's loop the rest for a fallback
				for ( i in cfg.buckets ) {
					if ( valid( i ) ) {
						$.articleFeedbackv5.ctaId = i;
						break;
					}
				}
			}
		}
	};

	// }}}
	// {{{ showCTA

	/**
	 * Shows a CTA
	 */
	$.articleFeedbackv5.showCTA = function () {
		var cta, $block, title, $close;

		// Build the cta
		cta = $.articleFeedbackv5.currentCTA();
		if ( !( 'build' in cta ) ) {
			return;
		}
		$block = cta.build();
		if ( 'bindEvents' in cta ) {
			cta.bindEvents( $block );
		}

		// Add it to the appropriate container
		$.articleFeedbackv5.$holder.find( '.articleFeedbackv5-ui-inner' ).empty();
		$.articleFeedbackv5.$holder.find( '.articleFeedbackv5-ui-inner' )
			.append( $block );

		// Set the appropriate class on the UI block
		$.articleFeedbackv5.$holder.find( '.articleFeedbackv5-ui' )
			.removeClass( 'articleFeedbackv5-option-' + $.articleFeedbackv5.bucketId )
			.addClass( 'articleFeedbackv5-cta-' + $.articleFeedbackv5.ctaId );

		// remove back-arrow from title (if present)
		$( '.articleFeedbackv5-arrow-back' ).remove();

		// Set the title in both places
		if ( 'getTitle' in cta ) {
			title = cta.getTitle();
		} else {
			title = $( '<div></div>' )
				.html( mw.template.get( 'jquery.articleFeedbackv5', 'cta-title-confirm.mustache' ).render( {
					'articlefeedbackv5-cta-thanks': mw.msg( 'articlefeedbackv5-cta-thanks' )
				} ) );

			title
				.find( '.articleFeedbackv5-confirmation-follow-up' )
				.msg(
					'articlefeedbackv5-cta-confirmation-message',
					$.articleFeedbackv5.specialUrl + '#' + $.articleFeedbackv5.feedbackId
				);
		}
		$.articleFeedbackv5.$holder.find( '.articleFeedbackv5-title' )
			.empty()
			.append( title );

		// Set the tooltip link
		$.articleFeedbackv5.$holder.find( '.articleFeedbackv5-tooltip-link' )
			.attr( 'href', mw.config.get( 'wgArticleFeedbackv5LearnToEdit' ) );

		// Add a close button to clear out the panel
		$close = $( '<a class="articleFeedbackv5-clear-trigger">x</a>' )
			.click( function ( e ) {
				e.preventDefault();
				$.articleFeedbackv5.clear();
			} );
		$.articleFeedbackv5.$holder.find( '.articleFeedbackv5-title-wrap .articleFeedbackv5-tooltip-trigger' )
			.before( $close );

		// Do anything special the CTA requires
		if ( 'afterBuild' in cta ) {
			cta.afterBuild();
		}

		// The close element needs to be created anyway, to serve as an anchor, but needs to be hidden
		$close.hide();

		$.articleFeedbackv5.nowShowing = 'cta';
	};

	// }}}
	// {{{ clear

	/**
	 * Clears out the panel
	 */
	$.articleFeedbackv5.clear = function () {
		$.articleFeedbackv5.isLoaded = false;
		$.articleFeedbackv5.submissionEnabled = false;
		$.articleFeedbackv5.feedbackId = 0;
		$.articleFeedbackv5.clearContainers();
		$.articleFeedbackv5.nowShowing = 'none';
	};

	// }}}
	// {{{ clearContainers

	/**
	 * Wipes the containers from the page
	 */
	$.articleFeedbackv5.clearContainers = function () {
		$.articleFeedbackv5.$holder.empty();
	};

	// }}}
	// {{{ addTriggerLinks

	/**
	 * Adds the trigger links to the page
	 */
	$.articleFeedbackv5.addTriggerLinks = function () {
		var i, linkId, option, $link, hasTipsy = false;

		for ( i in $.articleFeedbackv5.selectedLinks ) {
			linkId = $.articleFeedbackv5.selectedLinks[ i ];
			if ( linkId in $.articleFeedbackv5.triggerLinks ) {
				option = $.articleFeedbackv5.triggerLinks[ linkId ];
				$link = option.build();
				if ( 'insert' in option ) {
					option.insert( $link );
				} else {
					$link.insertBefore( $.articleFeedbackv5.$holder );
				}
				if ( option.closeable ) {
					$.articleFeedbackv5.buildDisableFlyover( linkId, $link );
					hasTipsy = true;
				}
				if ( linkId !== 'TBX' && $.articleFeedbackv5.bucketId !== '5' ) {
					$.articleFeedbackv5.addToRemovalQueue( $link );
				}
			}
		}
		if ( hasTipsy ) {
			$( '.articleFeedbackv5-form-flyover-closebutton' ).on( 'click', function ( e ) {
				var $host;

				e.preventDefault();
				$host = $( '.articleFeedbackv5-trigger-link-' + $( e.target ).attr( 'rel' ) );
				$host.tipsy( 'hide' );
				$host.closest( '.articleFeedbackv5-trigger-link-holder' )
					.removeClass( 'articleFeedbackv5-tipsy-active' );
			} );
		}
	};

	// }}}
	// {{{ buildDisableFlyover

	/**
	 * Builds a disable flyover for a link
	 *
	 * @param {string} linkId the name of the link (A-H, TBX)
	 * @param {jQuery} $link  the link object
	 */
	$.articleFeedbackv5.buildDisableFlyover = function ( linkId, $link ) {
		var gravity = 'se';

		$link.addClass( 'articleFeedbackv5-trigger-link-holder' );
		$link.addClass( 'articleFeedbackv5-trigger-link-holder-' + linkId );
		if ( linkId === 'A' ) {
			gravity = 'nw';
		}
		$link.find( '.articleFeedbackv5-close-trigger-link' )
			.addClass( 'articleFeedbackv5-trigger-link-' + linkId )
			.tipsy( {
				delayIn: 0,
				delayOut: 0,
				fade: false,
				fallback: '',
				gravity: gravity,
				html: true,
				live: false,
				offset: 10,
				opacity: 1.0,
				trigger: 'manual',
				className: 'articleFeedbackv5-disable-flyover-tip-' + linkId,
				title: function () {
					var $flyover, prefLink;

					$flyover = mw.template.get( 'jquery.articleFeedbackv5', 'disable-flyover.mustache' ).render( {
						'articlefeedbackv5-disable-flyover-title': mw.msg( 'articlefeedbackv5-disable-flyover-title' ),
						'articlefeedbackv5-disable-flyover-prefbutton': mw.msg( 'articlefeedbackv5-disable-flyover-prefbutton' )
					} );
					$flyover.find( '.articleFeedbackv5-disable-flyover' )
						.addClass( 'articleFeedbackv5-disable-flyover-' + linkId );

					$flyover.find( '.articleFeedbackv5-disable-flyover-help' )
						.html( $.articleFeedbackv5.buildLink(
							'articlefeedbackv5-disable-flyover-help-message', {
								tag: 'quotes',
								text: 'prefs-rendering'
							}, {
								tag: 'quotes',
								text: 'mypreferences'
							}, {
								tag: 'quotes',
								text: 'articlefeedbackv5-disable-preference'
							} ) );

					prefLink = mw.util.getUrl( 'Special:Preferences#mw-prefsection-rendering' );
					$flyover.find( '.articleFeedbackv5-disable-flyover-button' )
						.attr( 'href', prefLink )
						.button()
						.addClass( 'ui-button-blue' );

					$flyover.find( '.articleFeedbackv5-form-flyover-closebutton' )
						.attr( 'href', '#hello' )
						.attr( 'rel', linkId );

					return $flyover.html();
				}
			} )
			.click( function ( e ) {
				var $host, $wrap;

				e.preventDefault();
				$host = $( e.target );
				$wrap = $host.closest( '.articleFeedbackv5-trigger-link-holder' );
				if ( $wrap.hasClass( 'articleFeedbackv5-tipsy-active' ) ) {
					$host.tipsy( 'hide' );
					$wrap.removeClass( 'articleFeedbackv5-tipsy-active' );
				} else {
					$host.tipsy( 'show' );
					$wrap.addClass( 'articleFeedbackv5-tipsy-active' );
				}
			} );
	};

	// }}}

	// }}}
	// {{{ UI methods

	// {{{ markShowstopperError

	/**
	 * Marks a showstopper error
	 *
	 * @param {string} message the message to display, if in dev
	 */
	$.articleFeedbackv5.markShowstopperError = function ( message ) {
		var $veil, $box, $err;

		$veil = $.articleFeedbackv5.$holder.find( '.articleFeedbackv5-error' );
		$box = $.articleFeedbackv5.$holder.find( '.articleFeedbackv5-panel' );
		$veil.css( {
			top: '-' + $box.height(),
			width: $box.width(),
			height: $box.height()
		} );
		$veil.show();
		$box.css( {
			width: $box.width(),
			height: $box.height()
		} );
		$box.html( '' );

		$err = $.articleFeedbackv5.$holder.find( '.articleFeedbackv5-error-message' );
		$err.text( $.articleFeedbackv5.debug && message ? message : mw.msg( 'articlefeedbackv5-error' ) );
		$err.html( $err.html().replace( '\n', '<br />' ) );
		$.articleFeedbackv5.$toRemove.remove();
		$.articleFeedbackv5.$toRemove = $( [] );
		$.articleFeedbackv5.nowShowing = 'error';
	};

	// }}}
	// {{{ markTopError

	/**
	 * Marks an error at the top of the form
	 *
	 * @param {string} msg the error message
	 */
	$.articleFeedbackv5.markTopError = function ( msg ) {
		$.articleFeedbackv5.$holder.find( '.articleFeedbackv5-top-error' ).html( msg );
	};

	// }}}
	// {{{ markFormErrors

	/**
	 * Marks any errors on the form
	 *
	 * @param {Object} error errors, indexed by field name
	 */
	$.articleFeedbackv5.markFormErrors = function ( error ) {
		mw.log( error );
		$.articleFeedbackv5.markTopError( error );

		if ( 'markFormErrors' in $.articleFeedbackv5.currentBucket() ) {
			$.articleFeedbackv5.currentBucket().markFormErrors( error );
		}
	};

	// }}}
	// {{{ lockForm

	/**
	 * Locks the form
	 */
	$.articleFeedbackv5.lockForm = function () {
		$.articleFeedbackv5.enableSubmission( false );
		$.articleFeedbackv5.$holder.find( '.articleFeedbackv5-lock' ).show();
	};

	// }}}
	// {{{ unlockForm

	/**
	 * Unlocks the form
	 */
	$.articleFeedbackv5.unlockForm = function () {
		$.articleFeedbackv5.enableSubmission( true );
		$.articleFeedbackv5.$holder.find( '.articleFeedbackv5-lock' ).hide();
	};

	// }}}

	// }}}
	// {{{ Outside interaction methods

	// {{{ addToRemovalQueue

	/**
	 * Adds an element (usually a trigger link) to the collection that will be
	 * removed after a successful submission
	 *
	 * @param {jQuery} $el the element
	 */
	$.articleFeedbackv5.addToRemovalQueue = function ( $el ) {
		$.articleFeedbackv5.$toRemove = $.articleFeedbackv5.$toRemove.add( $el );
	};

	// }}}
	// {{{ setLinkId

	/**
	 * Sets the link ID
	 *
	 * @param {number} linkId the link ID
	 */
	$.articleFeedbackv5.setLinkId = function ( linkId ) {
		$.articleFeedbackv5.submittedLinkId = linkId;
	};

	// }}}
	// {{{ inDebug

	/**
	 * Returns whether the plugin is in debug mode
	 *
	 * @return {number} whether the plugin is in debug mode
	 */
	$.articleFeedbackv5.inDebug = function () {
		return $.articleFeedbackv5.debug;
	};

	// }}}
	// {{{ getBucketId

	/**
	 * Gets the bucket ID
	 *
	 * @return {number} the bucket ID
	 */
	$.articleFeedbackv5.getBucketId = function () {
		return $.articleFeedbackv5.bucketId;
	};

	// }}}
	// {{{ getShowing

	/**
	 * Returns which is showing: the form, the cta, or nothing
	 *
	 * @return {string} "form", "cta", or "none"
	 */
	$.articleFeedbackv5.getShowing = function () {
		return $.articleFeedbackv5.nowShowing;
	};

	// }}}
	// {{{ highlightForm

	/**
	 * Scroll to & highlight the feedback form
	 */
	$.articleFeedbackv5.highlightForm = function () {
		var $panel;

		// trigger the form to appear (if it's not loaded already)
		if ( !$.articleFeedbackv5.isLoaded ) {
			$.articleFeedbackv5.$holder.trigger( 'appear' );
		}

		// scroll to & highlight the panel
		$panel = $( '#articleFeedbackv5-panel' );
		if ( !$panel.is( ':animated' ) ) {
			$panel
				.effect( 'highlight', {}, 2000 )
				.get( 0 ).scrollIntoView();
		}
	};

	// }}}

	// }}}
	// {{{ articleFeedbackv5 plugin

	/**
	 * Right now there are no options for this plugin, but there will be in the
	 * future, so allow them to be passed in.
	 *
	 * If a string is passed in, it's considered a public function
	 *
	 * @param {undefined|Object|string} opts
	 * @param {undefined|number|jQuery} arg
	 * @return {jQuery}
	 */
	$.fn.articleFeedbackv5 = function ( opts, arg ) {
		var r, publicFunction;

		if ( typeof opts === 'undefined' || typeof opts === 'object' ) {
			$.articleFeedbackv5.init( $( this ), opts );
			return $( this );
		}

		publicFunction = {
			setLinkId: { args: 1, ret: false },
			getBucketId: { args: 0, ret: true },
			inDebug: { args: 0, ret: true },
			nowShowing: { args: 0, ret: true },
			experiment: { args: 0, ret: true },
			addToRemovalQueue: { args: 1, ret: false }
		};
		if ( opts in publicFunction ) {
			if ( publicFunction[ opts ].args === 1 ) {
				r = $.articleFeedbackv5[ opts ]( arg );
			} else if ( publicFunction[ opts ].args === 0 ) {
				r = $.articleFeedbackv5[ opts ]();
			}
			if ( publicFunction[ opts ].ret ) {
				return r;
			}
		}
		return $( this );
	};

	// }}}

}( jQuery, mediaWiki ) );
