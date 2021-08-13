<?php
/**
 * @defgroup Templates Templates
 * @file
 * @ingroup Templates
 */

/**
 * HTML template for Special:Book/load_collection/ when overwriting an exisiting collection
 * @ingroup Templates
 */
class CollectionLoadOverwriteTemplate extends QuickTemplate {
	public function execute() {
		/**
		 * @see \SpecialCollection::renderLoadOverwritePage
		 * @var OutputPage $output
		 * @var Title $title
		 */
		$output = $this->get( 'output' );
		$title = $this->get( 'title' );

		echo $this->parseAsInterface( 'coll-load_overwrite_text', $output );

		?>

		<form action="<?php echo htmlspecialchars( SkinTemplate::makeSpecialUrl( 'Book' ) ) ?>" method="post">
			<input name="overwrite" type="submit" value="<?php $this->msg( 'coll-overwrite' ) ?>" />
			<input name="append" type="submit" value="<?php $this->msg( 'coll-append' ) ?>" />
			<input name="cancel" type="submit" value="<?php $this->msg( 'coll-cancel' ) ?>" />
			<input name="bookcmd" type="hidden" value="load_collection" />
			<input name="colltitle" type="hidden" value="<?php echo htmlspecialchars( $title->getPrefixedText() ) ?>" />
		</form>

		<?php
	}

	/**
	 * @param string $msgKey
	 * @param OutputPage $output
	 *
	 * @return string HTML
	 */
	private function parseAsInterface( $msgKey, OutputPage $output ) {
		return $output->parseAsInterface( wfMessage( $msgKey )->plain() );
	}

}
