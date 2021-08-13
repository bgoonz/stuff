<?php
/**
 * @defgroup Templates Templates
 * @file
 * @ingroup Templates
 */

/**
 * Template for suggest feature
 *
 * It needs the two methods getProposalList() and getMemberList()
 * to run with Ajax
 */
class CollectionSuggestTemplate extends QuickTemplate {
	public function execute() {
		?>
		<div>
			<?php $this->msg( 'coll-suggest_intro_text' ) ?>
			<div id="collectionSuggestStatus" style="text-align: center; margin: 5px auto 10px auto; padding: 0 4px; border: 1px solid #ed9; background-color: #fea; visibility: hidden;">&#160;</div>
			<table style="width: 100%; border-spacing: 10px;"><tbody><tr>
					<td style="padding: 10px; vertical-align: top;">
						<form method="post" action="<?php echo htmlspecialchars( SkinTemplate::makeSpecialUrl( 'Book', [ 'bookcmd' => 'suggest' ] ) ) ?>">
							<strong style="font-size: 1.2em;"><?php $this->msg( 'coll-suggested_articles' ) ?></strong>
							(<a href="<?php echo htmlspecialchars( SkinTemplate::makeSpecialUrl( 'Book', [ 'bookcmd' => 'suggest', 'resetbans' => '1' ] ) ) ?>" title="<?php $this->msg( 'coll-suggest_reset_bans_tooltip' ) ?>"><?php $this->msg( 'coll-suggest_reset_bans' ) ?></a>)
							<?php if ( count( $this->data['proposals'] ) > 0 ) { ?>
								<noscript>
									<div id="collection-suggest-add">
										<input type="submit" value="<?php $this->msg( 'coll-suggest_add_selected' ) ?>" name="addselected" />
									</div>
								</noscript>
							<?php } ?>
							<ul id="collectionSuggestions" style="list-style: none; margin-left: 0;">
								<?php echo $this->getProposalList() ?>
							</ul>
						</form>
					</td>
					<td style="width: 45%; vertical-align: top;">
						<div style="padding: 10px; border: 1px solid #aaa; background-color: #f9f9f9;">
							<strong style="font-size: 1.2em;"><?php $this->msg( 'coll-suggest_your_book' ) ?></strong>
							(<span id="coll-num_pages"><?php echo wfMessage( 'coll-n_pages' )->numParams( $this->data['num_pages'] )->escaped() ?></span><?php echo wfMessage( 'pipe-separator' )->escaped() ?><a href="<?php echo htmlspecialchars( SkinTemplate::makeSpecialUrl( 'Book' ) ) ?>" title="<?php $this->msg( 'coll-show_collection_tooltip' ) ?>"><?php $this->msg( 'coll-suggest_show' ) ?></a>)
							<ul id="collectionMembers" style="list-style: none; margin-left: 0;">
								<?php echo $this->getMemberList(); ?>
							</ul>
						</div>
					</td>
				</tr></tbody></table>
		</div>
		<?php
	}

	/**
	 * needed for Ajax functions
	 * @return string
	 */
	public function getProposalList() {
		global $wgScript, $wgExtensionAssetsPath;

		if ( !isset( $this->data['proposals'] ) || count( $this->data['proposals'] ) === 0 ) {
			return "<li>" . wfMessage( 'coll-suggest_empty' )->escaped() . "</li>";
		}

		$mediapath = $wgExtensionAssetsPath . '/Collection/images/';
		$baseUrl = $wgScript . "/";

		$prop = $this->data['proposals'];

		$artName = $prop[0]['name'];
		$title = Title::newFromText( $artName );
		$url = $title->getLocalUrl();

		$out = '<li style="margin-bottom: 10px; padding: 4px 4px; background-color: #ddddff; font-size: 1.4em; font-weight: bold;">';
		$out .= '<noscript><input type="checkbox" value="' . htmlspecialchars( $artName ) . '" name="articleList[]" /></noscript>';
		$out .= '<a onclick="' . htmlspecialchars( 'collectionSuggestCall("AddArticle", ' . Xml::encodeJsVar( [ $artName ] ) . '); return false;' ) . '" href="' . htmlspecialchars( SkinTemplate::makeSpecialUrl( 'Book', [ 'bookcmd' => 'suggest', 'add' => $artName ] ) ) . '" title="' . wfMessage( 'coll-add_page_tooltip' )->escaped() . '"><img src="' . htmlspecialchars( $mediapath . 'silk-add.png' ) . '" width="16" height="16" alt=""></a> ';
		$out .= '<a onclick="' . htmlspecialchars( 'collectionSuggestCall("BanArticle", ' . Xml::encodeJsVar( [ $artName ] ) . '); return false;' ) . '" href="' . htmlspecialchars( SkinTemplate::makeSpecialUrl( 'Book', [ 'bookcmd' => 'suggest', 'ban' => $artName ] ) ) . '" title="' . wfMessage( 'coll-suggest_ban_tooltip' )->escaped() . '"><img src="' . htmlspecialchars( $mediapath . 'silk-cancel.png' ) . '" width="16" height="16" alt=""></a> ';
		$out .= '<a href="' . htmlspecialchars( $url ) . '" title="' . htmlspecialchars( $artName ) . '">' . htmlspecialchars( $artName ) . '</a>';
		$out .= '</li>';

		$num = count( $prop );
		for ( $i = 1; $i < $num; $i++ ) {
			$artName = $prop[$i]['name'];
			$url = $baseUrl . $artName;
			$url = str_replace( " ", "_", $url );
			$out .= '<li style="padding-left: 4px;">';
			$out .= '<noscript><input type="checkbox" value="' . htmlspecialchars( $artName ) . '" name="articleList[]" /></noscript>';
			$out .= '<a onclick="' . htmlspecialchars( 'collectionSuggestCall("AddArticle", ' . Xml::encodeJsVar( [ $artName ] ) . '); return false;' ) . '" href="' . htmlspecialchars( SkinTemplate::makeSpecialUrl( 'Book', [ 'bookcmd' => 'suggest', 'add' => $artName ] ) ) . '" title="' . wfMessage( 'coll-add_page_tooltip' )->escaped() . '"><img src="' . htmlspecialchars( $mediapath . 'silk-add.png' ) . '" width="16" height="16" alt=""></a> ';
			$out .= '<a href="' . htmlspecialchars( $url ) . '" title="' . htmlspecialchars( $artName ) . '">' . htmlspecialchars( $artName ) . '</a>';
			$out .= '</li>';
		}

		return $out;
	}

	/**
	 * needed for Ajax functions
	 * @return string
	 */
	public function getMemberList() {
		global $wgExtensionAssetsPath;
		$coll = $this->data['collection'];

		if ( !isset( $coll['items'] ) || count( $coll['items'] ) === 0 ) {
			return "<li>" . wfMessage( 'coll-suggest_empty' )->escaped() . "</li>";
		}

		$mediapath = $wgExtensionAssetsPath . '/Collection/images/';
		$out = '';

		foreach ( $coll['items'] as $value ) {
			if ( $value['type'] === 'article' ) {
				$artName = $value['title'];
				$out .= '<li><a href="' . htmlspecialchars( SkinTemplate::makeSpecialUrl( 'Book', [ 'bookcmd' => 'suggest', 'remove' => $artName ] ) ) . '" onclick="' . htmlspecialchars( 'collectionSuggestCall("RemoveArticle", ' . Xml::encodeJsVar( [ $artName ] ) . '); return false;' ) . '" title="' . wfMessage( 'coll-remove_this_page' )->escaped() . '"><img src="' . htmlspecialchars( $mediapath . 'remove.png' ) . '" width="10" height="10" alt=""></a> ';
				$out .= '<a href="' . htmlspecialchars( $value['url'] ) . '" title="' . htmlspecialchars( $artName ) . '">' . htmlspecialchars( $artName ) . '</a></li>';
			}
		}

		return $out;
	}
}
