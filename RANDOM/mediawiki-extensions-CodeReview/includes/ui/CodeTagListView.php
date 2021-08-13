<?php

/**
 * Special:Code/MediaWiki/tag
 */
class CodeTagListView extends CodeView {
	public function execute() {
		global $wgOut;
		$list = $this->mRepo->getTagList( true );

		if ( count( $list ) === 0 ) {
			$wgOut->addWikiMsg( 'code-tags-no-tags' );
		} else {
			# Show a cloud made of tags
			$tc = new WordCloud( $list, [ $this, 'linkCallback' ] );
			$wgOut->addHTML( $tc->getCloudHtml() );
		}
	}

	public function linkCallback( $tag, $weight ) {
		$query = $this->mRepo->getName() . '/tag/' . $tag;
		return Html::element( 'a', [
			'href' => SpecialPage::getTitleFor( 'Code', $query )->getFullURL(),
			'class' => 'plainlinks mw-wordcloud-size-' . $weight ], $tag ) . "\n";
	}
}
