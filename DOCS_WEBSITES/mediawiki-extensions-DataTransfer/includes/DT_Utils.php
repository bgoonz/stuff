<?php

/**
 * Utility functions for the Data Transfer extension.
 *
 * @author Yaron Koren
 */
class DTUtils {

	static function printImportingMessage() {
		return "\t" . Html::element( 'p', null, wfMessage( 'dt_import_importing' )->text() ) . "\n";
	}

	static function printFileSelector( $fileType ) {
		$text = "\n\t" . Html::element( 'p', null, wfMessage( 'dt_import_selectfile', $fileType )->text() ) . "\n";
		$text .= <<<END
	<p><input type="file" name="file_name" size="25" /></p>

END;
		$text .= "\t" . '<hr style="margin: 10px 0 10px 0" />' . "\n";
		return $text;
	}

	static function printImportRadioButton( $option, $optionMsg, $isChecked = false ) {
		$radioButtonAttrs = [];
		if ( $isChecked ) {
			$radioButtonAttrs['checked'] = true;
		}
		$text = "\t" . Html::input( 'pagesThatExist', $option, 'radio', $radioButtonAttrs ) .
			"\t" . wfMessage( $optionMsg )->text() . "<br />" . "\n";
		$text = Html::rawElement( 'label', null, $text ) . "\n";
		return $text;
	}

	static function printExistingPagesHandling() {
		$text = "\t" . Html::element( 'p', null, wfMessage( 'dt_import_forexisting' )->text() ) . "\n";
		$existingPagesText =
			self::printImportRadioButton( 'overwrite', 'dt_import_overwriteexisting', true ) .
			self::printImportRadioButton( 'merge', 'dt_import_mergeintoexisting' ) .
			self::printImportRadioButton( 'skip', 'dt_import_skipexisting' ) .
			self::printImportRadioButton( 'append', 'dt_import_appendtoexisting' );
		$text .= "\t" . Html::rawElement( 'p', null, $existingPagesText ) . "\n";
		$text .= "\t" . '<hr style="margin: 10px 0 10px 0" />' . "\n";
		return $text;
	}

	static function printImportSummaryInput( $fileType ) {
		$importSummaryText = "\t" . Html::input(
			'import_summary',
			wfMessage( 'dt_import_editsummary', $fileType )->inContentLanguage()->text(),
			'text',
			[
				'id' => 'wpSummary', // ID is necessary for CSS formatting
				'class' => 'mw-summary',
			]
		) . "\n";
		return "\t" . Html::rawElement( 'p', null,
			wfMessage( 'dt_import_summarydesc' )->text() . "\n" .
			$importSummaryText ) . "\n";
	}

	static function printSubmitButton() {
		$formSubmitText = Html::input(
			'import_file',
			wfMessage( 'import-interwiki-submit' )->text(),
			'submit'
		);
		return "\t" . Html::rawElement( 'p', null, $formSubmitText ) . "\n";
	}
}
