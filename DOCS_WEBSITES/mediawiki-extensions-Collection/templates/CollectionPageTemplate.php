<?php
/**
 * @defgroup Templates Templates
 * @file
 * @ingroup Templates
 */

use MediaWiki\Extensions\Collection\MessageBoxHelper;

/**
 * HTML template for Special:Book
 * @ingroup Templates
 */
class CollectionPageTemplate extends QuickTemplate {
	/**
	 * Get the current stored collection or empty collection if none exists
	 *
	 * @return array
	 */
	protected function getCollection() {
		if ( isset( $this->data['collection'] ) && is_array( $this->data['collection'] ) ) {
			$collection = $this->data['collection'];
		} else {
			$collection = [];
		}
		// If undefined set title and subtitle to empty string (T189636)
		$collection += [
			'title' => '',
			'subtitle' => '',
			'settings' => [],
			'items' => [],
		];
		return $collection;
	}

	/**
	 * Create a download form which allows you to download the book as pdf
	 *
	 * @param ContextSource $context being rendered in
	 * @param array $writers A list of the available writers
	 * @return string
	 */
	public function getDownloadForm( $context, $writers ) {
		global $wgCollectionDisableDownloadSection;
		$defaultWriter = false;

		if ( count( $writers ) == 1 ) {
			$writer = current( $writers );
			$defaultWriter = [ 'writer' => key( $writers ) ];

			$description = wfMessage( 'coll-download_as_text', $writer )->parseAsBlock();
			$buttonLabel = wfMessage( 'coll-download_as', $writer )->escaped();
		} else {
			$description = $this->parseAsInterface( 'coll-download_text', $context );
			$buttonLabel = wfMessage( 'coll-download' )->escaped();
		}
		$templateParser = new TemplateParser( __DIR__ );
		// we need to map the template formats to an object that the template will be able to render
		$templateDataFormats = [];
		foreach ( $writers as $writerIdx => $writer ) {
			$templateDataFormats[] = [
				'name' => $writerIdx,
				'label' => wfMessage( 'coll-format-' . $writerIdx )->escaped(),
			];
		}

		$downloadDisabled = count( $this->getCollection()['items'] ) == 0
			|| $wgCollectionDisableDownloadSection;

		$downloadForm = $templateParser->processTemplate( 'download-box', [
			'headline' => wfMessage( 'coll-download_title' ),
			'sectionDisabled' => $wgCollectionDisableDownloadSection === true,
			'description' => $description,
			'formAction' => SkinTemplate::makeSpecialUrl( 'Book' ),
			'formats' => $templateDataFormats,
			'writer' => $defaultWriter,
			'formatSelectLabel' => wfMessage( 'coll-format_label' ),
			'returnTo' => SpecialPage::getTitleFor( 'Book' )->getPrefixedText(),
			'buttonLabel' => $buttonLabel,
			'downloadDisabled' => $downloadDisabled,
		] );
		return $downloadForm;
	}

	public function execute() {
		$collection = $this->getCollection();
		$data = [
			'collectionTitle' => $collection['title'],
			'collectionSubtitle' => $collection['subtitle'],
		];
		$fields = [
			'collectionTitle' => [
				'type' => 'text',
				'label-message' => 'coll-title',
				'id' => 'titleInput',
				'size' => '',
				'name' => 'collectionTitle',
			],
			'collectionSubtitle' => [
				'type' => 'text',
				'label-message' => 'coll-subtitle',
				'id' => 'subtitleInput',
				'size' => '',
				'name' => 'collectionSubtitle',
			],
		];
		foreach ( $this->data['settings'] as $fieldname => $descriptor ) {
			if ( isset( $descriptor['options'] ) && is_array( $descriptor['options'] ) ) {
				$options = [];
				foreach ( $descriptor['options'] as $msg => $value ) {
					$msg = wfMessage( $msg )->text();
					$options[$msg] = $value;
				}
				$descriptor['options'] = $options;
			}
			$descriptor['id'] = "coll-input-setting-$fieldname";
			$descriptor['name'] = $fieldname;
			$fields[$fieldname] = $descriptor;
			if ( isset( $collection['settings'][$fieldname] ) ) {
				$data[$fieldname] = $collection['settings'][$fieldname];
			}
		}

		$context = new DerivativeContext( $this->data['context'] );
		$context->setRequest( new FauxRequest( $data ) );

		?>
		<div class="mw-collection-container">
		<?php
		echo ( MessageBoxHelper::renderWarningBoxes() );

		$form = new HTMLForm( $fields, $context );
		$form->setMethod( 'post' )
			->addHiddenField( 'bookcmd', 'set_titles' )
			->suppressDefaultSubmit()
			->setTitle( SpecialPage::getTitleFor( 'Book' ) )
			->setId( 'mw-collection-title-form' )
			->setTableId( 'mw-collection-title-table' )
			->setFooterText(
				'<noscript>' .
				'<input type="submit" value="' . $this->msg( 'coll-update' ) . '" />' .
				'</noscript>'
			)
			->prepareForm();
		?>

		<div class="collection-column collection-column-left">

			<?php echo $form->getHTML( '' ) ?>

			<div id="collectionListContainer">
				<?php
				$listTemplate = new CollectionListTemplate();
				$listTemplate->set( 'collection', $collection );
				$listTemplate->execute();
				?>
			</div>
			<div style="display:none">
				<span id="newChapterText"><?php $this->msg( 'coll-new_chapter' ) ?></span>
				<span id="renameChapterText"><?php $this->msg( 'coll-rename_chapter' ) ?></span>
				<span id="clearCollectionConfirmText"><?php $this->msg( 'coll-clear_collection_confirm' ) ?></span>
			</div>

		</div>

		<div class="collection-column collection-column-right">
			<?php if ( $this->data['podpartners'] ) { ?>
				<div class="collection-column-right-box" id="coll-orderbox">
					<h2><span class="mw-headline"><?php $this->msg( 'coll-book_title' ) ?></span></h2>
					<?php
					echo $this->parseAsInterface( 'coll-book_text', $context );
					?>
					<ul>
						<?php
						foreach ( $this->data['podpartners'] as $partnerKey => $partnerData ) {
							'@phan-var array $partnerData';
							$infopage = false;
							$partnerClasses = "";
							$about_partner = wfMessage( 'coll-about_pp', $partnerData['name'] )->escaped();
							if ( isset( $partnerData['infopagetitle'] ) ) {
								$infopage = Title::newFromText( wfMessage( $partnerData['infopagetitle'] )->inContentLanguage()->text() );
								if ( $infopage && $infopage->exists() ) {
									$partnerClasses = " coll-more_info collapsed";
								}
							}
							?>
							<li class="collection-partner<?php echo $partnerClasses ?>">
								<div>
									<div><a class="coll-partnerlink" href="<?php echo htmlspecialchars( $partnerData['url'] ) ?>"><?php echo $about_partner; ?></a></div>
									<?php
									if ( $infopage && $infopage->exists() ) { ?>
										<div class="coll-order_info" style="display:none;">
											<?php
											echo $GLOBALS['wgOut']->parseAsContent( '{{:' . $infopage . '}}' );
											?>
										</div>
									<?php   }					?>
									<div class="collection-order-button">
										<form action="<?php echo htmlspecialchars( SkinTemplate::makeSpecialUrl( 'Book' ) ) ?>" method="post">
											<input type="hidden" name="bookcmd" value="post_zip" />
											<input type="hidden" name="partner" value="<?php echo htmlspecialchars( $partnerKey ) ?>" />
											<input type="submit" value="<?php echo wfMessage( 'coll-order_from_pp', $partnerData['name'] )->escaped() ?>" class="order" <?php if ( count( $collection['items'] ) == 0 ) { ?> disabled="disabled"<?php } ?> />
										</form>
									</div>
								</div>
							</li>
							<?php
						} /* foreach */
						?>
					</ul></div>
				<?php
			}
			echo $this->getDownloadForm( $context, $this->data['formats'] );
			$user = $context->getUser();
			if ( $user->isRegistered() ) {
				$canSaveUserPage = $user->isAllowed( 'collectionsaveasuserpage' );
				$canSaveCommunityPage = $user->isAllowed( 'collectionsaveascommunitypage' );
			} else {
				$canSaveUserPage = false;
				$canSaveCommunityPage = false;
			}
			if ( !$user->getBlock() && ( $canSaveUserPage || $canSaveCommunityPage ) ) {
				?>
				<div class="collection-column-right-box" id="coll-savebox">
					<h2><span class="mw-headline"><?php $this->msg( 'coll-save_collection_title' ) ?></span></h2>
					<?php
					echo $this->parseAsInterface( 'coll-save_collection_text', $context );
					?>
					<form id="saveForm" action="<?php echo htmlspecialchars( SkinTemplate::makeSpecialUrl( 'Book' ) ) ?>" method="post">
						<table style="width:100%; background-color: transparent;"><tbody>
							<?php if ( $canSaveUserPage ) { ?>
								<tr><td>
										<?php if ( $canSaveCommunityPage ) { ?>
											<input id="personalCollType" type="radio" name="colltype" value="personal" checked="checked" />
										<?php } else { ?>
											<input type="hidden" name="colltype" value="personal" />
										<?php } ?>
										<label for="personalCollTitle"><a href="<?php echo htmlspecialchars( SkinTemplate::makeSpecialUrl( 'Prefixindex', 'prefix=' . wfUrlencode( $this->data['user-book-prefix'] ) ) ) ?>"><?php echo htmlspecialchars( $this->data['user-book-prefix'] ) ?></a></label>
									</td>
									<td id="collection-save-input">
										<input id="personalCollTitle" type="text" name="pcollname" />
									</td></tr>
							<?php } // if ($canSaveUserPage) ?>
							<?php if ( $canSaveCommunityPage ) { ?>
								<tr><td>
										<?php if ( $canSaveUserPage ) { ?>
											<input id="communityCollType" type="radio" name="colltype" value="community" />
										<?php } else { ?>
											<input type="hidden" name="colltype" value="community" />
										<?php } ?>
										<label for="communityCollTitle"><a href="<?php echo htmlspecialchars( SkinTemplate::makeSpecialUrl( 'Prefixindex', 'prefix=' . wfUrlencode( $this->data['community-book-prefix'] ) ) ) ?>"><?php echo htmlspecialchars( $this->data['community-book-prefix'] ) ?></a></label>
									</td>
									<td id="collection-save-button">
										<input id="communityCollTitle" type="text" name="ccollname" disabled="disabled" />
									</td></tr>
							<?php } // if ($canSaveCommunityPage) ?>
							<tr><td>&#160;</td><td id="collection-save-button">
									<input id="saveButton" type="submit" value="<?php $this->msg( 'coll-save_collection' ) ?>"<?php if ( count( $collection['items'] ) == 0 ) { ?> disabled="disabled"<?php } ?> />
							</tr></tbody></table>
						<input name="token" type="hidden" value="<?php echo htmlspecialchars( $user->getEditToken() ) ?>" />
						<input name="bookcmd" type="hidden" value="save_collection" />
					</form>

					<?php
					if ( !wfMessage( 'coll-bookscategory' )->inContentLanguage()->isDisabled() ) {
						echo $this->parseAsInterface( 'coll-save_category', $context );
					}
					?>
				</div>
			<?php } ?>

		</div>
		</div> <!-- .mw-collection-container-->

		<?php
	}

	/**
	 * @param string $msgKey
	 * @param IContextSource $context
	 *
	 * @return string HTML
	 */
	private function parseAsInterface( $msgKey, IContextSource $context ) {
		return $context->getOutput()->parseAsInterface( wfMessage( $msgKey )->plain() );
	}

}
