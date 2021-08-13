<?php

class DPLListMode {

	/**
	 * @var string
	 */
	public $name;

	public $sListStart = '';
	public $sListEnd = '';
	public $sHeadingStart = '';
	public $sHeadingEnd = '';
	public $sItemStart = '';
	public $sItemEnd = '';
	public $sInline = '';
	public $sSectionTags = array();
	public $aMultiSecSeparators = array();
	public $iDominantSection = -1;

	public function __construct(
		$listMode,
		$secSeparators,
		$multiSecSeparators,
		$inlineText,
		$listAttr = '',
		$itemAttr = '',
		$listSeparators,
		$iOffset,
		$dominantSection
	) {
		// default for inlinetext (if not in mode=userformat)
		if ( ( $listMode != 'userformat' ) && ( $inlineText == '' ) ) {
			$inlineText = '&#160;-&#160;';
		}
		$this->name = $listMode;
		$_listattr = ( $listAttr == '' ) ? '' : ' ' . Sanitizer::fixTagAttributes( $listAttr, 'ul' );
		$_itemattr = ( $itemAttr == '' ) ? '' : ' ' . Sanitizer::fixTagAttributes( $itemAttr, 'li' );

		$this->sSectionTags = $secSeparators;
		$this->aMultiSecSeparators = $multiSecSeparators;
		$this->iDominantSection = $dominantSection - 1; // 0 based index

		switch ( $listMode ) {
			case 'inline':
				if ( stristr( $inlineText, '<BR />' ) ) { // one item per line (pseudo-inline)
					$this->sListStart = '<DIV' . $_listattr . '>';
					$this->sListEnd = '</DIV>';
				}
				$this->sItemStart = '<SPAN' . $_itemattr . '>';
				$this->sItemEnd = '</SPAN>';
				$this->sInline = $inlineText;
				break;
			case 'ordered':
				if ( $iOffset == 0 ) {
					$this->sListStart = '<OL start=1 ' . $_listattr . '>';
				} else {
					$this->sListStart = '<OL start=' . ( $iOffset + 1 ) . ' ' . $_listattr . '>';
				}
				$this->sListEnd = '</OL>';
				$this->sItemStart = '<LI' . $_itemattr . '>';
				$this->sItemEnd = '</LI>';
				break;
			case 'unordered':
				$this->sListStart = '<UL' . $_listattr . '>';
				$this->sListEnd = '</UL>';
				$this->sItemStart = '<LI' . $_itemattr . '>';
				$this->sItemEnd = '</LI>';
				break;
			case 'definition':
				$this->sListStart = '<DL' . $_listattr . '>';
				$this->sListEnd = '</DL>';
				// item HTML attributes on dt element or dd element?
				$this->sHeadingStart = '<DT>';
				$this->sHeadingEnd = '</DT><DD>';
				$this->sItemEnd = '</DD>';
				break;
			case 'H2':
			case 'H3':
			case 'H4':
				$this->sListStart = '<DIV' . $_listattr . '>';
				$this->sListEnd = '</DIV>';
				$this->sHeadingStart = '<' . $listMode . '>';
				$this->sHeadingEnd = '</' . $listMode . '>';
				break;
			case 'userformat':
				switch ( count( $listSeparators ) ) {
					case 4:
						$this->sListEnd = $listSeparators[3];
					case 3:
						$this->sItemEnd = $listSeparators[2];
					case 2:
						$this->sItemStart = $listSeparators[1];
					case 1:
						$this->sListStart = $listSeparators[0];
				}
				$this->sInline = $inlineText;
				break;
		}
	}

}
