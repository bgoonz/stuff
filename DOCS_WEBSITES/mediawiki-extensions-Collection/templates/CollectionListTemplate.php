<?php
/**
 * @defgroup Templates Templates
 * @file
 * @ingroup Templates
 */

/**
 * HTML template for Special:Book collection item list
 * @ingroup Templates
 */
class CollectionListTemplate extends QuickTemplate {
	public function execute() {
		$mediapath = $GLOBALS['wgExtensionAssetsPath'] . '/Collection/images/';
		?>

		<div class="collection-create-chapter-links">
			<a class="makeVisible" style="<?php if ( !isset( $this->data['is_ajax'] ) ) { echo ' display:none;'; } ?>" onclick="return coll_create_chapter()" href="javascript:void(0);"><?php $this->msg( 'coll-create_chapter' ) ?></a>
			<?php if ( count( $this->data['collection']['items'] ) > 0 ) { ?>
				<a onclick="return coll_sort_items()" href="<?php echo htmlspecialchars( SkinTemplate::makeSpecialUrl( 'Book', [ 'bookcmd' => 'sort_items' ] ) ) ?>"><?php $this->msg( 'coll-sort_alphabetically' ) ?></a>
				<a onclick="return coll_clear_collection()" href="<?php echo htmlspecialchars( SkinTemplate::makeSpecialUrl( 'Book', [ 'bookcmd' => 'clear_collection' ] ) ) ?>"><?php $this->msg( 'coll-clear_collection' ) ?></a>
			<?php } ?>
		</div>

		<div class="collection-create-chapter-list">

			<?php
			if ( count( $this->data['collection']['items'] ) == 0 ) { ?>
				<em id="emptyCollection"><?php $this->msg( 'coll-empty_collection' ); ?></em>
			<?php } else { ?>
				<div style="collection-create-chapter-list-text">
					<em class="makeVisible" style="display:none; font-size: 95%"><?php $this->msg( 'coll-drag_and_drop' ) ?></em>
				</div>
			<?php } ?>

			<ul id="collectionList">

				<?php
				if ( !isset( $this->data['collection']['items'] ) ) {
					return;
				}
				foreach ( $this->data['collection']['items'] as $index => $item ) {
					if ( $item['type'] == 'article' ) { ?>
						<li id="item-<?php echo intval( $index ) ?>" class="article">
							<a onclick="return coll_remove_item(<?php echo intval( $index ) ?>)" href="<?php echo htmlspecialchars( SkinTemplate::makeSpecialUrl( 'Book', [ 'bookcmd' => 'remove_item', 'index' => $index ] ) ) ?>" title="<?php $this->msg( 'coll-remove' ) ?>"><img src="<?php echo htmlspecialchars( $mediapath . "remove.png" ) ?>" width="10" height="10" alt="<?php $this->msg( 'coll-remove' ) ?>" /></a><a>
								<noscript>
									<?php if ( $index == 0 ) { ?>
										<img src="<?php echo htmlspecialchars( $mediapath . "trans.png" ) ?>" width="10" height="10" alt="" />
									<?php } else { ?>
										<a onclick="return coll_move_item(<?php echo intval( $index ) . ', -1' ?>)" href="<?php echo htmlspecialchars( SkinTemplate::makeSpecialUrl( 'Book', [ 'bookcmd' => 'move_item', 'delta' => '-1', 'index' => $index ] ) ) ?>" title="<?php $this->msg( 'coll-move_up' ) ?>"><img src="<?php echo htmlspecialchars( $mediapath . "up.png" ) ?>" width="10" height="10" alt="<?php $this->msg( 'coll-move_up' ) ?>" /></a>
									<?php }
									if ( $index == count( $this->data['collection']['items'] ) - 1 ) { ?>
										<img src="<?php echo htmlspecialchars( $mediapath . "trans.png" ) ?>" width="10" height="10" alt="" />
									<?php } else { ?>
										<a onclick="return coll_move_item(<?php echo intval( $index ) . ', 1' ?>)" href="<?php echo htmlspecialchars( SkinTemplate::makeSpecialUrl( 'Book', [ 'bookcmd' => 'move_item', 'delta' => '1', 'index' => $index ] ) ) ?>" title="<?php $this->msg( 'coll-move_down' ) ?>"><img src="<?php echo htmlspecialchars( $mediapath . "down.png" ) ?>" width="10" height="10" alt="<?php $this->msg( 'coll-move_down' ) ?>" /></a>
									<?php } ?>
								</noscript>
								<?php if ( $item['currentVersion'] == 0 ) {
									$url = $item['url'] . '?oldid=' . $item['revision'];
								} else {
									$url = $item['url'];
								}
								?>
								<a href="<?php echo htmlspecialchars( $url ) ?>" title="<?php $this->msg( 'coll-show' ) ?>"><img src="<?php echo htmlspecialchars( $mediapath . "show.png" ) ?>" width="10" height="10" alt="<?php $this->msg( 'coll-show' ) ?>" /></a>
		<span class="title sortableitem">
		<?php if ( isset( $item['displaytitle'] ) && $item['displaytitle'] != '' ) {
			echo htmlspecialchars( $item['displaytitle'] );
		} else {
			echo htmlspecialchars( $item['title'] );
		} ?>
		</span>
						</li>
					<?php } elseif ( $item['type'] == 'chapter' ) { ?>
						<li id="item-<?php echo intval( $index ) ?>" class="chapter">
							<a onclick="return coll_remove_item(<?php echo intval( $index ) ?>)" href="<?php echo htmlspecialchars( SkinTemplate::makeSpecialUrl( 'Book', [ 'bookcmd' => 'remove_item', 'index=' => $index ] ) ) ?>" title="<?php $this->msg( 'coll-remove' ) ?>"><img src="<?php echo htmlspecialchars( $mediapath . "remove.png" ) ?>" width="10" height="10" alt="<?php $this->msg( 'coll-remove' ) ?>" /></a>
							<noscript>
								<?php if ( $index == 0 ) { ?>
									<img src="<?php echo htmlspecialchars( $mediapath . "trans.png" ) ?>" width="10" height="10" alt="" />
								<?php } else { ?>
									<a onclick="return coll_move_item(<?php echo intval( $index ) . ', -1' ?>)" href="<?php echo htmlspecialchars( SkinTemplate::makeSpecialUrl( 'Book', [ 'bookcmd' => 'move_item', 'delta' => '-1', 'index' => $index ] ) ) ?>" title="<?php $this->msg( 'coll-move_up' ) ?>"><img src="<?php echo htmlspecialchars( $mediapath . "up.png" ) ?>" width="10" height="10" alt="<?php $this->msg( 'coll-move_up' ) ?>" /></a>
								<?php }
								if ( $index == count( $this->data['collection']['items'] ) - 1 ) { ?>
									<img src="<?php echo htmlspecialchars( $mediapath . "trans.png" ) ?>" width="10" height="10" alt="" />
								<?php } else { ?>
									<a onclick="return coll_move_item(<?php echo intval( $index ) . ', 1' ?>)" href="<?php echo htmlspecialchars( SkinTemplate::makeSpecialUrl( 'Book', [ 'bookcmd' => 'move_item', 'delta' => '1', 'index' => $index ] ) ) ?>" title="<?php $this->msg( 'coll-move_down' ) ?>"><img src="<?php echo htmlspecialchars( $mediapath . "down.png" ) ?>" width="10" height="10" alt="<?php $this->msg( 'coll-move_down' ) ?>" /></a>
								<?php } ?>
							</noscript>
							<img src="<?php echo htmlspecialchars( $mediapath . "trans.png" ) ?>" width="10" height="10" alt="" />
							<strong class="title sortableitem" style="margin-left: 0.2em;"><?php echo htmlspecialchars( $item['title'] ) ?></strong>
							<a class="makeVisible" <?php if ( !isset( $this->data['is_ajax'] ) ) { echo 'style="display:none"'; } ?> onclick="<?php echo htmlspecialchars( 'return coll_rename_chapter(' . intval( $index ) . ', ' . Xml::encodeJsVar( $item['title'] ) . ')' ) ?>" href="javascript:void(0)">[<?php $this->msg( 'coll-rename' ) ?>]</a>
						</li>
					<?php }
				} ?>
			</ul>

		</div>

		<?php
	}
}
