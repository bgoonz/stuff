var CodeTooltipsInit = function () {
	$( 'a[href]' ).each( function () {
		if ( $( this ).parent().is( '.TablePager_col_cr_id' ) ) {
			// Tooltips are unnecessary and annoying in revision lists
			return;
		}
		var link = this.getAttribute( 'href' );
		if ( !link ) {
			return;
		}
		var matches = link.match( /^\/.*\/Special:Code\/([-A-Za-z\d_]*?)\/(\d+)(#.*)?$/ );
		if ( !matches ) {
			return;
		}

		function showTooltip() {
			var $el = $( this );
			if ( $el.data( 'codeTooltip' ) ) {
				return; // already processed
			}
			$el.data( 'codeTooltipLoading', true );
			var reqData = {
				format: 'json',
				action: 'query',
				list: 'coderevisions',
				crprop: 'revid|message|status|author',
				crrepo: matches[ 1 ],
				crrevs: matches[ 2 ],
				crlimit: '1'
			};
			$el.tipsy( { fade: true, gravity: 'sw', html: true } );
			$.getJSON(
				mw.config.get( 'wgScriptPath' ) + '/api.php',
				reqData,
				function ( data ) {
					if ( !data || !data.query || !data.query.coderevisions ) {
						return;
					}
					var rev = data.query.coderevisions[ 0 ],
						text = rev[ '*' ].length > 82 ? rev[ '*' ].substr( 0, 80 ) + '...' : rev[ '*' ];

					text = mw.html.escape( text );
					text = text.replace( /\n/g, '<br/>' );

					var status = mw.html.escape( rev.status ),
						author = mw.html.escape( rev.author ),
						tip = '<div class="mw-codereview-status-' + status + '" style="padding:5px 8px 4px; margin:-5px -8px -4px;">';

					if ( rev[ '*' ] ) {
						// Messages used here
						// * code-status-new
						// * code-status-fixme
						// * code-status-reverted
						// * code-status-resolved,
						// * code-status-ok
						// * code-status-deferred
						// * code-status-old
						tip += mw.msg( 'code-tooltip-withsummary', matches[ 2 ], mw.msg( 'code-status-' + status ), author, text );
					} else {
						// Messages used here
						// * code-status-new
						// * code-status-fixme
						// * code-status-reverted
						// * code-status-resolved,
						// * code-status-ok
						// * code-status-deferred
						// * code-status-old
						tip += mw.msg( 'code-tooltip-withoutsummary', matches[ 2 ], mw.msg( 'code-status-' + status ), author );
					}
					tip += '</div>';
					$el.attr( 'title', tip );
					$el.data( 'codeTooltip', true );
					if ( !$el.data( 'codeTooltipLeft' ) ) {
						$el.tipsy( 'show' );
					}
				}
			);
		}

		// We want to avoid doing API calls just because someone accidentally moves the mouse
		// over a link, so we only want to do an API call after the mouse has been on a link
		// for 250ms.
		$( this ).on( 'mouseenter', function () {
			var that = this,
				timerID = $( this ).data( 'codeTooltipTimer' );

			if ( typeof timerID !== 'undefined' ) {
				// Clear the running timer
				clearTimeout( timerID );
			}
			timerID = setTimeout( function () {
				showTooltip.apply( that );
			}, 250
			);
			$( this ).data( 'codeTooltipTimer', timerID );
		} );
		// take care of cases when louse leaves our link while we load stuff from API.
		// We shouldn't display the tooltip in such case.
		$( this ).on( 'mouseleave', function () {
			var $el = $( this ),
				timerID = $el.data( 'codeTooltipTimer' );

			if ( typeof timerID !== 'undefined' ) {
				// Clear the running timer
				clearTimeout( timerID );
			}

			if ( $el.data( 'codeTooltip' ) || !$el.data( 'codeTooltipLoading' ) ) {
				return;
			}
			$el.data( 'codeTooltipLeft', true );
		} );
	} );
};

$( CodeTooltipsInit );
