<?php
/**
 * This class provides the interface to the filters
 */
class AkismetKlik {
	public $previousFilter;

	/**
	 * @param array $settings
	 */
	function __construct( $settings = [] ) {
		foreach ( $settings as $name => $value ) {
			$this->$name = $value;
		}
	}

	/**
	 * Hook function for EditFilterMergedContent, replaces wfAkismetFilter
	 * @param IContextSource $context
	 * @param Content $content
	 * @param Status $status
	 * @return bool
	 */
	public static function onAkismetFilterMergedContent( $context, $content, $status ) {
		global $wgAKkey;
		if ( strlen( $wgAKkey ) == 0 ) {
			wfLogWarning( 'AkismetKlik is not enabled. Set $wgAKkey in LocalSettings.php.' );
			return true;
		}

		$spamObj = new AkismetKlik();
		$ret = $spamObj->filter(
			$context->getTitle(),
			$content,
			'',
			$context->getWikiPage(),
			$context->getUser()
		 );
		if ( $ret ) {
			// @todo Remove this line after this extension do not support mediawiki version 1.36 and before
			$status->value = EditPage::AS_HOOK_ERROR_EXPECTED;
		}

		return !$ret;
	}

	/**
	 * @param Title $title
	 * @param Content $content Content of section
	 * @param string $section Section number or name
	 * @param WikiPage $wikiPage WikiPage passed from EditFilterMergedContent
	 * @param User $user
	 * @throws MWException
	 * @return bool True if the edit should not be allowed, false otherwise
	 * If the return value is true, an error will have been sent to $wgOut
	 */
	function filter( $title, $content, $section, $wikiPage, User $user ) {
		global $wgAKSiteUrl, $wgAKkey;

		if ( strlen( $wgAKkey ) == 0 ) {
			throw new MWException( 'Set $wgAKkey in LocalSettings.php or relevant configuration file.' );
		}

		# Run parser to strip SGML comments and such out of the markup
		$text = ContentHandler::getContentText( $content );
		$editInfo = $wikiPage->prepareContentForEdit( $content );
		$out = $editInfo->output;
		$links = implode( "\n", array_keys( $out->getExternalLinks() ) );

		# Do the match
		$username = $user->getName();
		$akismet = new Akismet( $wgAKSiteUrl, $wgAKkey );
		$akismet->setCommentAuthor( $username );
		$akismet->setCommentAuthorEmail( $user->getEmail() );
		$akismet->setCommentAuthorURL( $links );
		$akismet->setCommentContent( $text );
		$akismet->setCommentType( 'wiki' );
		$akismet->setPermalink( $wgAKSiteUrl . '/wiki/' . $title );
		if ( $akismet->isCommentSpam() && !$user->isAllowed( 'bypassakismet' ) ) {
			wfDebugLog( 'AkismetKlik', "Match!\n" );
			$editInfo->spamPageWithContent( 'http://akismet.com spamlist error' );

			return true;
		}

		return false;
	}
}
