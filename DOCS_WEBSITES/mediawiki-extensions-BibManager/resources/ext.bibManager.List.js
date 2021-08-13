$( function () {
	var d = document, i, j,
		table = d.getElementById( 'bm_table' ),
		inputs = table.getElementsByTagName( 'input' ),
		bmExportCheckboxes,

		// Get the checkbox
		$exportAllCheckbox = $( '.bm-list-table-export-checkbox input' );

	bmExportCheckboxes = [];
	for ( i = 0; i < inputs.length; i++ ) {
		if ( inputs[ i ].type === 'checkbox' ) {
			bmExportCheckboxes.push( inputs[ i ] );
		}
	}

	$exportAllCheckbox.on( 'click', function () {
		for ( j = 0; j < bmExportCheckboxes.length; j++ ) {
			bmExportCheckboxes[ j ].checked = this.checked;
		}
	} );
} );
