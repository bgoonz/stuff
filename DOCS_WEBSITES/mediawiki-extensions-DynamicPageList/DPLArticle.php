<?php

/**
 * Simple Article/Page class with properties used in the DPL
 */
class DPLArticle {

	/**
	 * @var Title
	 */
	public $mTitle;

	/**
	 * @var int Namespace number
	 */
	public $mNamespace = -1;

	/**
	 * @var int Page ID
	 */
	public $mID = 0;

	/**
	 * @var string Selected title of initial page
	 */
	public $mSelTitle = '';

	/**
	 * @var int Selected namespace number of initial page
	 */
	public $mSelNamespace = -1;

	/**
	 * @var string Selected title of image
	 */
	public $mImageSelTitle = '';

	/**
	 * @var string Wikitext link to page
	 */
	public $mLink = '';

	/**
	 * @var string External link on the page
	 */
	public $mExternalLink = '';

	/**
	 * @var string Page title first char
	 */
	public $mStartChar = '';

	/**
	 * @var string Wikitext heading (link to the associated page) that page belongs to in the list.
	 *  Default '' means no heading.
	 */
	public $mParentHLink = '';

	/**
	 * @var string[] Wikitext links to category in the page
	 */
	public $mCategoryLinks = array();

	/**
	 * @var string[] Plain text category names (without link) in the page
	 */
	public $mCategoryTexts = array();

	/**
	 * @var int Number of times this page has been viewed
	 */
	public $mCounter = '';

	/**
	 * @var int Article length in bytes of wiki text
	 */
	public $mSize = '';

	/**
	 * @var int|string Timestamp depending on the user's request (can be first/last edit,
	 *  page_touched, …)
	 */
	public $mDate = '';

	/**
	 * @var string The same, based on user format definition
	 */
	public $myDate = '';

	/**
	 * @var int The revision number if specified
	 */
	public $mRevision = '';

	/**
	 * @var string Wikitext link to editor's (first/last, depending on user's request) page or
	 *  contributions if not registered
	 */
	public $mUserLink = '';

	/**
	 * @var string Name of editor (first/last, depending on user's request) or contributions if not
	 *  registered
	 */
	public $mUser = '';

	/**
	 * @var string Revision comment / edit summary
	 */
	public $mComment = '';

	/**
	 * @var int Number of bytes changed
	 */
	public $mContribution = '';

	/**
	 * @var string Short plain text string indicating the size of a contribution
	 */
	public $mContrib = '';

	/**
	 * @var string Name of the user who made the changes
	 */
	public $mContributor = '';

	/**
	 * @param Title $title
	 * @param int $namespace
	 */
	public function __construct( Title $title, $namespace ) {
		$this->mTitle     = $title;
		$this->mNamespace = $namespace;
	}

}
