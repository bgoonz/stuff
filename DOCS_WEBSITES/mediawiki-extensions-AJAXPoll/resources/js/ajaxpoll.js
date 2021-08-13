/* eslint-disable no-implicit-globals */

var ajaxpollTmp;

var setupEventHandlers = function () {
	'use strict';
	$( '.ajaxpoll-answer-vote' ).on( 'mouseover', function () {
		var sp = $( this ).find( 'span' );
		ajaxpollTmp = sp.html();
		sp.text( sp.attr( 'title' ) );
		sp.attr( 'title', '' );
	} );

	$( '.ajaxpoll-answer-vote' ).on( 'mouseout', function () {
		var sp = $( this ).find( 'span' );
		sp.attr( 'title', sp.text() );
		sp.text( ajaxpollTmp );
	} );

	/* attach click handler */
	$( '.ajaxpoll-answer-name label' ).on( 'click', function ( event ) {
		var choice = $( this ).parent().parent(), poll, answer;
		event.preventDefault();
		event.stopPropagation();
		poll = choice.attr( 'poll' );

		if ( $( this ).attr( 'id' ) === 'ajaxpoll-label-disabled' ) {
			$( '#ajaxpoll-ajax-' + poll ).text( $( this ).attr( 'title' ) ).css( 'display', 'inline-block' );
			return;
		}

		answer = choice.attr( 'answer' );
		choice.find( '.ajaxpoll-hover-vote' ).addClass( 'ajaxpoll-checkevent' );
		choice.find( 'input' ).prop( 'checked', 'checked' );
		$( '#ajaxpoll-ajax-' + poll ).text( mw.message( 'ajaxpoll-submitting' ).text() ).css( 'display', 'inline-block' );

		( new mw.Api() ).postWithToken( 'csrf', {
			action: 'pollsubmitvote',
			format: 'json',
			poll: poll,
			answer: answer
		} ).done( function ( data ) {
			$( '#ajaxpoll-container-' + poll ).html( data.pollsubmitvote.result );
			setupEventHandlers();
		} );
	} );

	$( '.ajaxpoll-answer-name:not(.ajaxpoll-answer-name-revoke) label' ).on( 'mouseover', function () {
		$( this ).addClass( 'ajaxpoll-hover-vote' );
	} );
	$( '.ajaxpoll-answer-name:not(.ajaxpoll-answer-name-revoke) label' ).on( 'mouseout', function () {
		$( this ).removeClass( 'ajaxpoll-hover-vote' );
	} );

	$( '.ajaxpoll-answer-name-revoke label' ).on( 'mouseover', function () {
		$( this ).addClass( 'ajaxpoll-hover-revoke' );
	} );
	$( '.ajaxpoll-answer-name-revoke label' ).on( 'mouseout', function () {
		$( this ).removeClass( 'ajaxpoll-hover-revoke' );
	} );
};
setupEventHandlers();
