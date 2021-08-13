<?php

class BibManagerPagerListAuthors extends AlphabeticPager {

	function getQueryInfo () {
		return array (
		    'tables' => 'bibmanager',
		    'fields' => 'bm_author, count(bm_author)',
		    'options' => array ( 'GROUP BY' => 'bm_author ASC' ),
		);
	}

	function getIndexField () {
		return 'bm_author';
	}

	/**
	 *
	 * @global User $wgUser
	 * @param type $row
	 * @return string 
	 */
	function formatRow ( $row ) {
		if ( empty( $row->bm_author ) )
			return false;
		foreach ( $row as $key => $val ) {
			$aData [$key] = $val;
		}
		$sLinkToList = SpecialPage::getTitleFor( 'BibManagerList' )->getLocalURL() . "?wpbm_list_search_select=author&wpbm_list_search_text=" . $aData['bm_author'];
		$sOutput = "";
		$sOutput .= "<tr>";
		$sOutput .= "	<td>";
		$sOutput .= "		<a href='" . $sLinkToList . "'>" . $aData['bm_author'] . "</a>";
		$sOutput .= "	</td>";
		$sOutput .= "	<td style='text-align:center;'>";
		$sOutput .= $aData['count(bm_author)'];
		$sOutput .= "	</td>";
		$sOutput .= "</tr>";
		return $sOutput;
	}

}