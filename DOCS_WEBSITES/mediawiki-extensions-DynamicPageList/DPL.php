<?php

use MediaWiki\MediaWikiServices;

class DPL {

	/**
	 * @var DPLArticle[]
	 */
	public $mArticles;

	/**
	 * @var string Type of heading: category, user, etc. (depends on 'ordermethod' param)
	 */
	public $mHeadingType;

	/**
	 * @var DPLListMode HTML list mode for headings
	 */
	public $mHListMode;

	/**
	 * @var DPLListMode HTML list mode for pages
	 */
	public $mListMode;

	/**
	 * @var bool Whether to escape img/cat or not
	 */
	public $mEscapeLinks;

	/**
	 * @var bool Whether to add the text of an external link or not
	 */
	public $mAddExternalLink;

	/**
	 * @var bool True only if page transclusion is enabled
	 */
	public $mIncPage;

	/**
	 * @var int Limit for text to include
	 */
	public $mIncMaxLen;

	/**
	 * @var string[] Array of labels of sections to transclude
	 */
	public $mIncSecLabels = array();

	/**
	 * @var string[] Array of matching regular expression patterns for sections to transclude
	 */
	public $mIncSecLabelsMatch = array();

	/**
	 * @var string[] Array of *not* matching regular expression patterns for sections to transclude
	 */
	public $mIncSecLabelsNotMatch = array();

	/**
	 * @var bool Whether to match raw parameters or parsed contents
	 */
	public $mIncParsed;

	/**
	 * @var Parser
	 */
	public $mParser;

	/**
	 * @var ParserOptions
	 */
	public $mParserOptions;

	/**
	 * @var Title
	 */
	public $mParserTitle;

	/**
	 * @var DPLLogger
	 */
	public $mLogger;

	/**
	 * @var string Wikitext
	 */
	public $mOutput;

	/**
	 * @var string[]
	 */
	public $mReplaceInTitle;

	/**
	 * @var int Number of (filtered) row count
	 */
	public $filteredCount = 0;

	/**
	 * @var string[] List of localized namespace names, indexed by numeric namespace ID.
	 */
	public $nameSpaces;

	/**
	 * @var string[] Formatting rules for table fields
	 */
	public $mTableRow;

	public function __construct(
		$headings,
		$bHeadingCount,
		$iColumns,
		$iRows,
		$iRowSize,
		$sRowColFormat,
		$articles,
		$headingtype,
		$hlistmode,
		$listmode,
		$bescapelinks,
		$baddexternallink,
		$includepage,
		$includemaxlen,
		$includeseclabels,
		$includeseclabelsmatch,
		$includeseclabelsnotmatch,
		$includematchparsed,
		Parser $parser,
		$logger,
		$replaceInTitle,
		$iTitleMaxLen,
		$defaultTemplateSuffix,
		$aTableRow,
		$bIncludeTrim,
		$iTableSortCol,
		$updateRules,
		$deleteRules
	) {
		global $wgHooks;
		$this->nameSpaces = MediaWikiServices::getInstance()->getContentLanguage()->getNamespaces();
		$this->mArticles = $articles;
		$this->mListMode = $listmode;
		$this->mEscapeLinks = $bescapelinks;
		$this->mAddExternalLink = $baddexternallink;
		$this->mIncPage = $includepage;
		if ( $includepage ) {
			$this->mIncSecLabels         = $includeseclabels;
			$this->mIncSecLabelsMatch    = $includeseclabelsmatch;
			$this->mIncSecLabelsNotMatch = $includeseclabelsnotmatch;
			$this->mIncParsed            = $includematchparsed;
		}

		if ( isset( $includemaxlen ) ) {
			$this->mIncMaxLen = $includemaxlen + 1;
		} else {
			$this->mIncMaxLen = 0;
		}
		$this->mLogger = $logger;
		$this->mReplaceInTitle = $replaceInTitle;
		$this->mTableRow = $aTableRow;

		$this->mParser = clone $parser;
		// clear state of cloned parser; if the above patch of LinkHoldersArray is not made this
		// can lead to links not being shown in the original document (probably the UIQ_QINU-tags no longer
		// get replaced properly; in combination with the patch however, it does not do any harm.

		// The CITE extension registers a hook on parser->clearState
		// We must UNDO the effect of that call (Cite->clearState) because otherwise all Citations would be lost
		// that were made before a DPL call

		$clearStateHooks = $wgHooks['ParserClearState'];
		$wgHooks['ParserClearState'] = array();
		$this->mParser->clearState(); // eliminated to avoid conflict with CITE extension
		$wgHooks['ParserClearState'] = $clearStateHooks;

		$this->mParserOptions = $parser->getOptions();
		$this->mParserTitle = $parser->getTitle();

		if ( !empty( $headings ) ) {
			if ( $iColumns != 1 || $iRows != 1 ) {
				$hspace = 2; // the extra space for headings
				// repeat outer tags for each of the specified columns / rows in the output
				// we assume that a heading roughly takes the space of two articles
				$count = count( $articles ) + $hspace * count( $headings );
				if ( $iColumns != 1 ) {
					$iGroup = $iColumns;
				} else {
					$iGroup = $iRows;
				}
				$nsize = floor( $count / $iGroup );
				$rest = $count - ( floor( $nsize ) * floor( $iGroup ) );
				if ( $rest > 0 ) {
					$nsize += 1;
				}
				$this->mOutput .= '{|' . $sRowColFormat . "\n|\n";
				if ( $nsize < $hspace + 1 ) {
					$nsize = $hspace + 1; // correction for result sets with one entry
				}
				$this->mHeadingType = $headingtype;
				$this->mHListMode = $hlistmode;
				$this->mOutput .= $hlistmode->sListStart;
				$nstart = 0;
				$greml = $nsize; // remaining lines in current group
				$g = 0;
				$offset = 0;
				foreach ( $headings as $headingCount ) {
					$headingLink = $articles[$nstart - $offset]->mParentHLink;
					$this->mOutput .= $hlistmode->sItemStart;
					$this->mOutput .= $hlistmode->sHeadingStart . $headingLink . $hlistmode->sHeadingEnd;
					if ( $bHeadingCount ) {
						$this->mOutput .= $this->formatCount( $headingCount );
					}
					$offset += $hspace;
					$nstart += $hspace;
					$portion = $headingCount;
					$greml -= $hspace;
					do {
						$greml -= $portion;
						// $this->mOutput .= "nsize=$nsize, portion=$portion, greml=$greml";
						if ( $greml > 0 ) {
							$this->mOutput .= $this->formatList( $nstart - $offset, $portion, $iTitleMaxLen, $defaultTemplateSuffix, $bIncludeTrim, $iTableSortCol, $updateRules, $deleteRules );
							$nstart += $portion;
							break;
						} else {
							$this->mOutput .= $this->formatList( $nstart - $offset, $portion + $greml, $iTitleMaxLen, $defaultTemplateSuffix, $bIncludeTrim, $iTableSortCol, $updateRules, $deleteRules );
							$nstart += ( $portion + $greml );
							$portion = ( -$greml );
							if ( $iColumns != 1 ) {
								$this->mOutput .= "\n|valign=top|\n";
							} else {
								$this->mOutput .= "\n|-\n|\n";
							}
							++$g;
							// if ($rest != 0 && $g==$rest) $nsize -= 1;
							if ( $nstart + $nsize > $count ) {
								$nsize = $count - $nstart;
							}
							$greml = $nsize;
							if ( $greml <= 0 ) {
								break;
							}
						}
					} while ( $portion > 0 );
					$this->mOutput .= $hlistmode->sItemEnd;
				}
				$this->mOutput .= $hlistmode->sListEnd;
				$this->mOutput .= "\n|}\n";
			} else {
				$this->mHeadingType = $headingtype;
				$this->mHListMode = $hlistmode;
				$this->mOutput .= $hlistmode->sListStart;
				$headingStart = 0;
				foreach ( $headings as $headingCount ) {
					$headingLink = $articles[$headingStart]->mParentHLink;
					$this->mOutput .= $hlistmode->sItemStart;
					$this->mOutput .= $hlistmode->sHeadingStart . $headingLink . $hlistmode->sHeadingEnd;
					if ( $bHeadingCount ) {
						$this->mOutput .= $this->formatCount( $headingCount );
					}
					$this->mOutput .= $this->formatList( $headingStart, $headingCount, $iTitleMaxLen, $defaultTemplateSuffix, $bIncludeTrim, $iTableSortCol, $updateRules, $deleteRules );
					$this->mOutput .= $hlistmode->sItemEnd;
					$headingStart += $headingCount;
				}
				$this->mOutput .= $hlistmode->sListEnd;
			}
		} elseif ( $iColumns != 1 || $iRows != 1 ) {
			// repeat outer tags for each of the specified columns / rows in the output
			$nstart = 0;
			$count = count( $articles );
			if ( $iColumns != 1 ) {
				$iGroup = $iColumns;
			} else {
				$iGroup = $iRows;
			}
			$nsize = floor( $count / $iGroup );
			$rest = $count - ( floor( $nsize ) * floor( $iGroup ) );
			if ( $rest > 0 ) {
				$nsize += 1;
			}
			$this->mOutput .= '{|' . $sRowColFormat . "\n|\n";
			for ( $g = 0; $g < $iGroup; $g++ ) {
				$this->mOutput .= $this->formatList(
					$nstart, $nsize, $iTitleMaxLen, $defaultTemplateSuffix,
					$bIncludeTrim, $iTableSortCol, $updateRules, $deleteRules
				);
				if ( $iColumns != 1 ) {
					$this->mOutput .= "\n|valign=top|\n";
				} else {
					$this->mOutput .= "\n|-\n|\n";
				}
				$nstart = $nstart + $nsize;
				// if ($rest != 0 && $g+1==$rest) $nsize -= 1;
				if ( $nstart + $nsize > $count ) {
					$nsize = $count - $nstart;
				}
			}
			$this->mOutput .= "\n|}\n";
		} elseif ( $iRowSize > 0 ) {
			// repeat row header after n lines of output
			$nstart = 0;
			$nsize = $iRowSize;
			$count = count( $articles );
			$this->mOutput .= '{|' . $sRowColFormat . "\n|\n";
			do {
				if ( $nstart + $nsize > $count ) {
					$nsize = $count - $nstart;
				}
				$this->mOutput .= $this->formatList(
					$nstart, $nsize, $iTitleMaxLen, $defaultTemplateSuffix,
					$bIncludeTrim, $iTableSortCol, $updateRules, $deleteRules
				);
				$this->mOutput .= "\n|-\n|\n";
				$nstart = $nstart + $nsize;
				if ( $nstart >= $count ) {
					break;
				}
			} while ( true );
			$this->mOutput .= "\n|}\n";
		} else {
			$this->mOutput .= $this->formatList(
				0, count( $articles ), $iTitleMaxLen, $defaultTemplateSuffix,
				$bIncludeTrim, $iTableSortCol, $updateRules, $deleteRules
			);
		}
	}

	function formatCount( $numart ) {
		if ( $this->mHeadingType == 'category' ) {
			$message = 'categoryarticlecount';
		} else {
			$message = 'dpl_articlecount';
		}
		return '<p>' . $this->msgExt( $message, array(), $numart ) . '</p>';
	}

	/**
	 * Substitute symbolic names within a user defined format tag
	 *
	 * @param string $tag
	 * @param string $pagename
	 * @param DPLArticle $article
	 * @param string $imageUrl
	 * @param int|string $nr
	 * @param int|null $titleMaxLength
	 * @return string
	 */
	function substTagParm( $tag, $pagename, $article, $imageUrl, $nr, $titleMaxLength ) {
		global $wgLang;

		if ( strstr( $tag, '%' ) < 0 ) {
			return $tag;
		}

		$sTag = str_replace( '%PAGE%', $pagename, $tag );
		$sTag = str_replace( '%PAGEID%', $article->mID, $sTag );
		$sTag = str_replace( '%NAMESPACE%', $this->nameSpaces[$article->mNamespace], $sTag );
		$sTag = str_replace( '%IMAGE%', $imageUrl, $sTag );
		$sTag = str_replace( '%EXTERNALLINK%', $article->mExternalLink, $sTag );
		$sTag = str_replace( '%EDITSUMMARY%', $article->mComment, $sTag );

		$title = $article->mTitle->getText();
		if ( strpos( $title, '%TITLE%' ) >= 0 ) {
			if ( $this->mReplaceInTitle[0] != '' ) {
				$title = preg_replace( $this->mReplaceInTitle[0], $this->mReplaceInTitle[1], $title );
			}
			if ( isset( $titleMaxLength ) && ( strlen( $title ) > $titleMaxLength ) ) {
				$title = substr( $title, 0, $titleMaxLength ) . '...';
			}
			$sTag = str_replace( '%TITLE%', $title, $sTag );
		}

		$sTag = str_replace( '%NR%', $nr, $sTag );
		if ( $article->mCounter != '' ) {
			$sTag = str_replace( '%COUNT%', $article->mCounter, $sTag );
		}
		if ( $article->mCounter != '' ) {
			$sTag = str_replace( '%COUNTFS%', floor( log( $article->mCounter ) * 0.7 ), $sTag );
		}
		if ( $article->mCounter != '' ) {
			$sTag = str_replace( '%COUNTFS2%', floor( sqrt( log( $article->mCounter ) ) ), $sTag );
		}
		if ( $article->mSize != '' ) {
			$sTag = str_replace( '%SIZE%', $article->mSize, $sTag );
		}
		if ( $article->mSize != '' ) {
			$sTag = str_replace( '%SIZEFS%', floor( sqrt( log( $article->mSize ) ) * 2.5 - 5 ), $sTag );
		}
		if ( $article->mDate != '' ) {
			// note: we must avoid literals in the code which could create confusion when
			// transferred via HTTP therefore we write '%'.'DA...'
			if ( $article->myDate != '' ) {
				$sTag = str_replace( '%' . 'DATE%', $article->myDate, $sTag );
			} else {
				$sTag = str_replace( '%' . 'DATE%', $wgLang->timeanddate( $article->mDate, true ), $sTag );
			}
		}
		if ( $article->mRevision != '' ) {
			$sTag = str_replace( '%REVISION%', $article->mRevision, $sTag );
		}
		if ( $article->mContribution != '' ) {
			$sTag = str_replace( '%CONTRIBUTION%', $article->mContribution, $sTag );
			$sTag = str_replace( '%CONTRIB%', $article->mContrib, $sTag );
			$sTag = str_replace( '%CONTRIBUTOR%', $article->mContributor, $sTag );
		}
		if ( $article->mUserLink != '' ) {
			$sTag = str_replace( '%USER%', $article->mUser, $sTag );
		}
		if ( $article->mSelTitle != '' ) {
			if ( $article->mSelNamespace == 0 ) {
				$sTag = str_replace( '%PAGESEL%', str_replace( '_', ' ', $article->mSelTitle ), $sTag );
			} else {
				$sTag = str_replace( '%PAGESEL%', $this->nameSpaces[$article->mSelNamespace] . ':' . str_replace( '_', ' ', $article->mSelTitle ), $sTag );
			}
		}
		if ( $article->mImageSelTitle != '' ) {
			$sTag = str_replace( '%IMAGESEL%', str_replace( '_', ' ', $article->mImageSelTitle ), $sTag );
		}
		if ( strpos( $sTag, '%CAT' ) >= 0 ) {
			if ( !empty( $article->mCategoryLinks ) ) {
				$sTag = str_replace( '%' . 'CATLIST%', implode( ', ', $article->mCategoryLinks ), $sTag );
				$sTag = str_replace( '%' . 'CATBULLETS%', '* ' . implode( "\n* ", $article->mCategoryLinks ), $sTag );
				$sTag = str_replace( '%' . 'CATNAMES%', implode( ', ', $article->mCategoryTexts ), $sTag );
			} else {
				$sTag = str_replace( '%' . 'CATLIST%', '', $sTag );
				$sTag = str_replace( '%' . 'CATBULLETS%', '', $sTag );
				$sTag = str_replace( '%' . 'CATNAMES%', '', $sTag );
			}
		}

		return $sTag;
	}

	function formatList( $iStart, $iCount, $iTitleMaxLen, $defaultTemplateSuffix, $bIncludeTrim, $iTableSortCol, $updateRules, $deleteRules ) {
		global $wgLang;

		$mode = $this->mListMode;
		// categorypage-style list output mode
		if ( $mode->name == 'category' ) {
			return $this->formatCategoryList( $iStart, $iCount );
		}

		// process results of query, outputing equivalent of <li>[[Article]]</li> for each result,
		// or something similar if the list uses other startlist/endlist;
		$rBody = '';
		if ( method_exists( MediaWikiServices::class, 'getRepoGroup' ) ) {
			// MediaWiki 1.34+
			$repo = MediaWikiServices::getInstance()->getRepoGroup();
		} else {
			$repo = RepoGroup::singleton();
		}
		// the following statement caused a problem with multiple columns:  $this->filteredCount = 0;
		for ( $i = $iStart; $i < $iStart + $iCount; $i++ ) {
			$article = $this->mArticles[$i];
			$pagename = $article->mTitle->getPrefixedText();
			$imageUrl = '';
			if ( $article->mNamespace == NS_FILE ) {
				// calculate URL for existing images
				$img = $repo->findFile( Title::makeTitle( NS_FILE, $article->mTitle->getText() ) );
				if ( $img && $img->exists() ) {
					$imageUrl = $img->getUrl();
					$imageUrl = preg_replace( '~^.*images/(.*)~', '\1', $imageUrl );
				} else {
					$iTitle = Title::makeTitleSafe( NS_FILE, $article->mTitle->getDBkey() );
					$imageUrl = preg_replace( '~^.*images/(.*)~', '\1', $repo->getLocalRepo()->newFile( $iTitle )->getPath() );
				}
			}
			if ( $this->mEscapeLinks && ( $article->mNamespace == NS_CATEGORY
					|| $article->mNamespace == NS_FILE
				) ) {
				// links to categories or images need an additional ":"
				$pagename = ':' . $pagename;
			}

			// Page transclusion: get contents and apply selection criteria based on that contents

			if ( $this->mIncPage ) {
				$matchFailed = false;
				if ( empty( $this->mIncSecLabels ) || $this->mIncSecLabels[0] == '*' ) { // include whole article
					$title = $article->mTitle->getPrefixedText();
					if ( $mode->name == 'userformat' ) {
						$incwiki = '';
					} else {
						$incwiki = '<br/>';
					}
					$text = $this->mParser->fetchTemplateAndTitle( Title::newFromText( $title ) )[0];
					if (
						( count( $this->mIncSecLabelsMatch ) <= 0 || $this->mIncSecLabelsMatch[0] == '' ||
							!preg_match( $this->mIncSecLabelsMatch[0], $text ) == false ) &&
						( count( $this->mIncSecLabelsNotMatch ) <= 0 || $this->mIncSecLabelsNotMatch[0] == '' ||
							preg_match( $this->mIncSecLabelsNotMatch[0], $text ) == false )
					) {
						if ( $this->mIncMaxLen > 0 && ( strlen( $text ) > $this->mIncMaxLen ) ) {
							$text = DPLInclude::limitTranscludedText( $text, $this->mIncMaxLen, ' [[' . $title . '|..→]]' );
						}
						$this->filteredCount = $this->filteredCount + 1;

						// update article if include=* and updaterules are given
						if ( $updateRules != '' ) {
							$message = $this->updateArticleByRule( $title, $text, $updateRules );
							// append update message to output
							$incwiki .= $message;
						} elseif ( $deleteRules != '' ) {
							$message = $this->deleteArticleByRule( $title, $text, $deleteRules );
							// append delete message to output
							$incwiki .= $message;
						} else {
							// append full text to output
							if ( isset( $mode->sSectionTags[0] ) ) {
								$incwiki .= $this->substTagParm( $mode->sSectionTags[0], $pagename, $article, $imageUrl, $this->filteredCount, $iTitleMaxLen );
								$pieces = array( 0 => $text );
								$this->formatSingleItems( $pieces, 0, $article );
								$incwiki .= $pieces[0];
							} else {
								$incwiki .= $text;
							}
						}
					} else {
						continue;
					}

				} else {
					// identify section pieces
					$secPiece = array();
					$dominantPieces = false;
					// ONE section can be marked as "dominant"; if this section contains multiple entries
					// we will create a separate output row for each value of the dominant section
					// the values of all other columns will be repeated

					foreach ( $this->mIncSecLabels as $s => $sSecLabel ) {
						$sSecLabel = trim( $sSecLabel );
						if ( $sSecLabel == '' ) {
							break;
						}

						// if sections are identified by number we have a % at the beginning
						if ( $sSecLabel[0] == '%' ) {
							$sSecLabel = '#' . $sSecLabel;
						}

						$maxlen = -1;
						if ( $sSecLabel == '-' ) {
							// '-' is used as a dummy parameter which will produce no output
							// if maxlen was 0 we suppress all output; note that for matching we used the full text
							$secPieces = array( '' );
							$this->formatSingleItems( $secPieces, $s, $article );
						} elseif ( $sSecLabel[0] != '{' ) {
							$limpos = strpos( $sSecLabel, '[' );
							$cutLink = 'default';
							$skipPattern = array();
							if ( $limpos > 0 && $sSecLabel[strlen( $sSecLabel ) - 1] == ']' ) {
								// regular expressions which define a skip pattern may precede the text
								$fmtSec = explode( '~', substr( $sSecLabel, $limpos + 1, strlen( $sSecLabel ) - $limpos - 2 ) );
								$sSecLabel = substr( $sSecLabel, 0, $limpos );
								$cutInfo = explode( ' ', array_pop( $fmtSec ), 2 );
								$maxlen = intval( $cutInfo[0] );
								if ( isset( $cutInfo[1] ) ) {
									$cutLink = $cutInfo[1];
								}
								foreach ( $fmtSec as $skipKey => $skipPat ) {
									$skipPattern[] = $skipPat;
								}
							}
							if ( $maxlen < 0 ) {
								$maxlen = -1; // without valid limit include whole section
							}
						}

						// find out if the user specified an includematch / includenotmatch condition
						if ( count( $this->mIncSecLabelsMatch ) > $s && $this->mIncSecLabelsMatch[$s] != '' ) {
							$mustMatch = $this->mIncSecLabelsMatch[$s];
						} else {
							$mustMatch = '';
						}
						if ( count( $this->mIncSecLabelsNotMatch ) > $s && $this->mIncSecLabelsNotMatch[$s] != '' ) {
							$mustNotMatch = $this->mIncSecLabelsNotMatch[$s];
						} else {
							$mustNotMatch = '';
						}

						// if chapters are selected by number, text or regexp we get the heading from DPLInclude::includeHeading
						$sectionHeading[0] = '';
						if ( $sSecLabel == '-' ) {
							$secPiece[$s] = $secPieces[0];
						} elseif ( $sSecLabel[0] == '#' || $sSecLabel[0] == '@' ) {
							$sectionHeading[0] = substr( $sSecLabel, 1 );
							// Uses DPLInclude::includeHeading() from LabeledSectionTransclusion extension to include headings from the page
							$secPieces = DPLInclude::includeHeading( $this->mParser, $article->mTitle->getPrefixedText(), substr( $sSecLabel, 1 ), '',
																$sectionHeading, false, $maxlen, $cutLink, $bIncludeTrim, $skipPattern );
							if ( $mustMatch != '' || $mustNotMatch != '' ) {
								$secPiecesTmp = $secPieces;
								$offset = 0;
								foreach ( $secPiecesTmp as $nr => $onePiece ) {
									if (
										( $mustMatch != '' && preg_match( $mustMatch, $onePiece ) == false ) ||
										( $mustNotMatch != '' && preg_match( $mustNotMatch, $onePiece ) != false )
									) {
										array_splice( $secPieces, $nr - $offset, 1 );
										$offset++;
									}
								}
							}
							// if maxlen was 0 we suppress all output; note that for matching we used the full text
							if ( $maxlen == 0 ) {
								$secPieces = array( '' );
							}

							$this->formatSingleItems( $secPieces, $s, $article );
							if ( !array_key_exists( 0, $secPieces ) ) {
								// avoid matching against a non-existing array element
								// and skip the article if there was a match condition
								if ( $mustMatch != '' || $mustNotMatch != '' ) {
									$matchFailed = true;
								}
								break;
							}
							$secPiece[$s] = $secPieces[0];
							for ( $sp = 1; $sp < count( $secPieces ); $sp++ ) {
								if ( isset( $mode->aMultiSecSeparators[$s] ) ) {
									$secPiece[$s] .= str_replace(
										'%SECTION%',
										$sectionHeading[$sp],
										$this->substTagParm(
											$mode->aMultiSecSeparators[$s], $pagename, $article, $imageUrl,
											$this->filteredCount, $iTitleMaxLen
										)
									);
								}
								$secPiece[$s] .= $secPieces[$sp];
							}
							if ( $mode->iDominantSection >= 0 &&
								$s == $mode->iDominantSection &&
								count( $secPieces ) > 1
							) {
								$dominantPieces = $secPieces;
							}
							if ( ( $mustMatch != '' || $mustNotMatch != '' ) && count( $secPieces ) <= 0 ) {
								$matchFailed = true;
								break;
							}

						} elseif ( $sSecLabel[0] == '{' ) {
							// Uses DPLInclude::includeTemplate() from LabeledSectionTransclusion extension to include templates from the page
							// primary syntax {template}suffix
							$template1 = trim( substr( $sSecLabel, 1, strpos( $sSecLabel, '}' ) - 1 ) );
							$template2 = trim( str_replace( '}', '', substr( $sSecLabel, 1 ) ) );
							// alternate syntax: {template|surrogate}
							if ( $template2 == $template1 && strpos( $template1, '|' ) > 0 ) {
								list( $template1, $template2 ) = explode( '|', $template1, 2 );
							}
							$secPieces = DPLInclude::includeTemplate(
								$this->mParser, $this, $s, $article, $template1,
								$template2, $template2 . $defaultTemplateSuffix, $mustMatch,
								$mustNotMatch, $this->mIncParsed, $iTitleMaxLen,
								implode( ', ', $article->mCategoryLinks )
							);
							$secPiece[$s] = implode(
								isset( $mode->aMultiSecSeparators[$s] ) ? $this->substTagParm(
									$mode->aMultiSecSeparators[$s],
									$pagename,
									$article,
									$imageUrl,
									$this->filteredCount,
									$iTitleMaxLen
								) : '',
								$secPieces
							);
							if ( $mode->iDominantSection >= 0 &&
								$s == $mode->iDominantSection &&
								count( $secPieces ) > 1
							) {
								$dominantPieces = $secPieces;
							}
							if ( ( $mustMatch != '' || $mustNotMatch != '' ) && count( $secPieces ) <= 1 && $secPieces[0] == '' ) {
								$matchFailed = true;
								break;
							}
						} else {
							// Uses DPLInclude::includeSection() from LabeledSectionTransclusion extension to include labeled sections from the page
							$secPieces = DPLInclude::includeSection( $this->mParser, $article->mTitle->getPrefixedText(), $sSecLabel, '', false, $bIncludeTrim, $skipPattern );
							$secPiece[$s] = implode(
								isset( $mode->aMultiSecSeparators[$s] ) ? $this->substTagParm(
									$mode->aMultiSecSeparators[$s],
									$pagename,
									$article,
									$imageUrl,
									$this->filteredCount,
									$iTitleMaxLen
								) : '',
								$secPieces
							);
							if ( $mode->iDominantSection >= 0 &&
								$s == $mode->iDominantSection &&
								count( $secPieces ) > 1
							) {
								$dominantPieces = $secPieces;
							}
							if (
								( $mustMatch != '' && preg_match( $mustMatch, $secPiece[$s] ) == false ) ||
								( $mustNotMatch != '' && preg_match( $mustNotMatch, $secPiece[$s] ) != false )
							) {
								$matchFailed = true;
								break;
							}
						}

						// separator tags
						if ( count( $mode->sSectionTags ) == 1 ) {
							// If there is only one separator tag use it always
							$septag[$s * 2] = str_replace(
								'%SECTION%',
								$sectionHeading[0],
								$this->substTagParm( $mode->sSectionTags[0], $pagename, $article, $imageUrl, $this->filteredCount, $iTitleMaxLen )
							);
						} elseif ( isset( $mode->sSectionTags[$s * 2] ) ) {
							$septag[$s * 2] = str_replace(
								'%SECTION%',
								$sectionHeading[0],
								$this->substTagParm( $mode->sSectionTags[$s * 2], $pagename, $article, $imageUrl, $this->filteredCount, $iTitleMaxLen )
							);
						} else {
							$septag[$s * 2] = '';
						}
						if ( isset( $mode->sSectionTags[$s * 2 + 1] ) ) {
							$septag[$s * 2 + 1] = str_replace(
								'%SECTION%',
								$sectionHeading[0],
								$this->substTagParm( $mode->sSectionTags[$s * 2 + 1], $pagename, $article, $imageUrl, $this->filteredCount, $iTitleMaxLen )
							);
						} else {
							$septag[$s * 2 + 1] = '';
						}
					}

					// if there was a match condition on included contents which failed we skip the whole page
					if ( $matchFailed ) {
						continue;
					}
					$this->filteredCount = $this->filteredCount + 1;

					// assemble parts with separators
					$incwiki = '';
					if ( $dominantPieces != false ) {
						foreach ( $dominantPieces as $dominantPiece ) {
							foreach ( $secPiece as $s => $piece ) {
								if ( $s == $mode->iDominantSection ) {
									$incwiki .= $this->formatItem( $dominantPiece, $septag[$s * 2], $septag[$s * 2 + 1] );
								} else {
									$incwiki .= $this->formatItem( $piece, $septag[$s * 2], $septag[$s * 2 + 1] );
								}
							}
						}
					} else {
						foreach ( $secPiece as $s => $piece ) {
							$incwiki .= $this->formatItem( $piece, $septag[$s * 2], $septag[$s * 2 + 1] );
						}
					}
				}
			} else {
				$this->filteredCount = $this->filteredCount + 1;
			}

			if ( $i > $iStart ) {
				$rBody .= $mode->sInline; // If mode is not 'inline', sInline attribute is empty, so does nothing
			}

			// symbolic substitution of %PAGE% by the current article's name
			if ( $mode->name == 'userformat' ) {
				$rBody .= $this->substTagParm( $mode->sItemStart, $pagename, $article, $imageUrl, $this->filteredCount, $iTitleMaxLen );
			} else {
				$rBody .= $mode->sItemStart;
				if ( $article->mDate != '' ) {
					if ( $article->myDate != '' ) {
						$rBody .= $article->myDate . ' ';
					} else {
						$rBody .= $wgLang->timeanddate( $article->mDate, true ) . ' ';
					}
					if ( $article->mRevision != '' ) {
						$rBody .= '[{{fullurl:' . $article->mTitle . '|oldid=' . $article->mRevision . '}} ' . htmlspecialchars( $article->mTitle ) . ']';
					} else {
						$rBody .= $article->mLink;
					}
				} else {
					// output the link to the article
					$rBody .= $article->mLink;
				}
				if ( $article->mSize != '' && $mode->name != 'userformat' ) {
					if ( strlen( $article->mSize ) > 3 ) {
						$rBody .= ' [' . substr( $article->mSize, 0, strlen( $article->mSize ) - 3 ) . ' kB]';
					} else {
						$rBody .= ' [' . $article->mSize . ' B]';
					}
				}
				if ( $article->mCounter != '' && $mode->name != 'userformat' ) {
					// Adapted from SpecialPopularPages::formatResult()
					$nv = $this->msgExt( 'dpl-nviews', array( 'escape' ), $wgLang->formatNum( $article->mCounter ) );
					$rBody .= ' ' . MediaWikiServices::getInstance()->getContentLanguage()->getDirMark() . '(' . $nv . ')';
				}
				if ( $article->mUserLink != '' ) {
					$rBody .= ' . . [[User:' . $article->mUser . '|' . $article->mUser . ']]';
					if ( $article->mComment != '' ) {
						$rBody .= ' { ' . $article->mComment . ' }';
					}
				}
				if ( $article->mContributor != '' ) {
					$rBody .= ' . . [[User:' . $article->mContributor . '|' . $article->mContributor . " $article->mContrib]]";
				}

				if ( !empty( $article->mCategoryLinks ) ) {
					$rBody .= ' . . <SMALL>' . wfMessage( 'categories' )->text() . ': ' . implode( ' | ', $article->mCategoryLinks ) . '</SMALL>';
				}
				if ( $this->mAddExternalLink && $article->mExternalLink != '' ) {
					$rBody .= ' → ' . $article->mExternalLink;
				}
			}

			// add included contents

			if ( $this->mIncPage ) {
				DPLInclude::open( $this->mParser, $this->mParserTitle->getPrefixedText() );
				$rBody .= $incwiki;
				DPLInclude::close( $this->mParser, $this->mParserTitle->getPrefixedText() );
			}

			if ( $mode->name == 'userformat' ) {
				$rBody .= $this->substTagParm( $mode->sItemEnd, $pagename, $article, $imageUrl, $this->filteredCount, $iTitleMaxLen );
			} else {
				$rBody .= $mode->sItemEnd;
			}
		}
		// if requested we sort the table by the contents of a given column
		if ( $iTableSortCol != 0 ) {
			$sortcol = abs( $iTableSortCol );
			$rows = explode( "\n|-", $rBody );
			foreach ( $rows as $index => $row ) {
				if ( strlen( $row ) > 0 ) {
					if ( ( ( $word = explode( "\n|", $row, $sortcol + 2 ) ) !== false ) && ( count( $word ) > $sortcol ) ) {
						$rowsKey[$index] = $word[$sortcol];
					} else {
						$rowsKey[$index] = $row;
					}
				}
			}
			if ( $iTableSortCol < 0 ) {
				arsort( $rowsKey );
			} else {
				asort( $rowsKey );
			}
			$rBody = '';
			foreach ( $rowsKey as $index => $val ) {
				$rBody .= "\n|-" . $rows[$index];
			}
		}
		// increase start value of ordered lists at multi-column output
		$actStart = $mode->sListStart;
		$mode->sListStart = preg_replace_callback(
			'/(?<=\bstart=)\d+\b/',
			static function ( $matches ) use ( $iCount ) {
				return (int)$matches[0] + $iCount;
			},
			$actStart
		);

		return $actStart . $rBody . $mode->sListEnd;
	}

	/**
	 * this function has three tasks (depending on $exec):
	 * (1) show an edit dialogue for template fields (exec = edit)
	 * (2) set template parameters to values specified in the query (exec=set)
	 * (2) preview the source code including any changes of these parameters made in the edit form or with other changes (exec=preview)
	 * (3) save the article with the changed value set or with other changes (exec=save)
	 *
	 * "other changes" means that a regexp can be applied to the source text or arbitrary text can be
	 * inserted before or after a pattern occuring in the text
	 *
	 * @param string $title
	 * @param string $text
	 * @param string $rulesText
	 * @return string
	 */
	function updateArticleByRule( $title, $text, $rulesText ) {
		// we use ; as command delimiter; \; stands for a semicolon
		// \n is translated to a real linefeed
		$rulesText = str_replace( ";", '°', $rulesText );
		$rulesText = str_replace( '\°', ';', $rulesText );
		$rulesText = str_replace( "\\n", "\n", $rulesText );
		$rules = explode( '°', $rulesText );
		$exec = 'edit';
		$replaceThis = '';
		$replacement = '';
		$after = '';
		$insertionAfter = '';
		$before = '';
		$insertionBefore = '';
		$template = '';
		$parameter = array();
		$value = array();
		$afterparm = array();
		$format = array();
		$preview = array();
		$save = array();
		$tooltip = array();
		$optional = array();

		$lastCmd = '';
		$summary = '';
		$editForm = false;
		$action = '';
		$hidden = array();
		$legendPage = '';
		$instructionPage = '';
		$table = '';
		$fieldFormat = '';

		$nr = -1;
		foreach ( $rules as $rule ) {
			if ( preg_match( '/^\s*#/', $rule ) > 0 ) {
				continue; // # is comment symbol
			}

			$rule = preg_replace( '/^\s+/', '', $rule ); // strip leading white space
			$cmd = preg_split( '/ +/', $rule, 2 );
			if ( count( $cmd ) > 1 ) {
				$arg = $cmd[1];
			} else {
				$arg = '';
			}
			$cmd[0] = trim( $cmd[0] );

			// after ... insert ...     ,   before ... insert ...
			if ( $cmd[0] == 'before' ) {
				$before = $arg;
				$lastCmd = 'B';
			}
			if ( $cmd[0] == 'after' ) {
				$after = $arg;
				$lastCmd = 'A';
			}
			if ( $cmd[0] == 'insert' && $lastCmd != '' ) {
				if ( $lastCmd == 'A' ) {
					$insertionAfter = $arg;
				}
				if ( $lastCmd == 'B' ) {
					$insertionBefore = $arg;
				}
			}
			if ( $cmd[0] == 'template' ) {
				$template = $arg;
			}

			if ( $cmd[0] == 'parameter' ) {
				$nr++;
				$parameter[$nr] = $arg;
				if ( $nr > 0 ) {
					$afterparm[$nr] = array( $parameter[$nr - 1] );
					$n = $nr - 1;
					while ( $n > 0 && array_key_exists( $n, $optional ) ) {
						$n--;
						$afterparm[$nr][] = $parameter[$n];
					}
				}
			}
			if ( $cmd[0] == 'value' ) {
				$value[$nr] = $arg;
			}
			if ( $cmd[0] == 'format' ) {
				$format[$nr] = $arg;
			}
			if ( $cmd[0] == 'tooltip' ) {
				$tooltip[$nr] = $arg;
			}
			if ( $cmd[0] == 'optional' ) {
				$optional[$nr] = true;
			}
			if ( $cmd[0] == 'afterparm' ) {
				$afterparm[$nr] = array( $arg );
			}
			if ( $cmd[0] == 'legend' ) {
				$legendPage = $arg;
			}
			if ( $cmd[0] == 'instruction' ) {
				$instructionPage = $arg;
			}
			if ( $cmd[0] == 'table' ) {
				$table = $arg;
			}
			if ( $cmd[0] == 'field' ) {
				$fieldFormat = $arg;
			}

			if ( $cmd[0] == 'replace' ) {
				$replaceThis = $arg;
			}
			if ( $cmd[0] == 'by' ) {
				$replacement = $arg;
			}

			if ( $cmd[0] == 'editform' ) {
				$editForm = $arg;
			}
			if ( $cmd[0] == 'action' ) {
				$action = $arg;
			}
			if ( $cmd[0] == 'hidden' ) {
				$hidden[] = $arg;
			}
			if ( $cmd[0] == 'preview' ) {
				$preview[] = $arg;
			}
			if ( $cmd[0] == 'save' ) {
				$save[] = $arg;
			}

			if ( $cmd[0] == 'summary' ) {
				$summary = $arg;
			}
			if ( $cmd[0] == 'exec' ) {
				$exec = $arg; 	// desired action (set or edit or preview)
			}
		}

		if ( $summary == '' ) {
			$summary .= "\nbulk update:";
			if ( $replaceThis != '' ) {
				$summary .= "\n replace $replaceThis\n by $replacement";
			}
			if ( $before != '' ) {
				$summary .= "\n before  $before\n insertionBefore";
			}
			if ( $after != '' ) {
				$summary .= "\n after   $after\n insertionAfter";
			}
		}

		// perform changes to the wiki source text =======================================

		if ( $replaceThis != '' ) {
			$text = preg_replace( "$replaceThis", $replacement, $text );
		}

		if ( $insertionBefore != '' && $before != '' ) {
			$text = preg_replace( "/($before)/", $insertionBefore . '\1', $text );
		}

		if ( $insertionAfter != '' && $after != '' ) {
			$text = preg_replace( "/($after)/", '\1' . $insertionAfter, $text );
		}

		// deal with template parameters =================================================

		global $wgRequest, $wgUser;

		if ( $template != '' ) {
			if ( $exec == 'edit' ) {
				$tpv = $this->getTemplateParmValues( $text, $template );
				$legendText = '';
				if ( $legendPage != '' ) {
					global $wgUser;
					$parser = MediaWikiServices::getInstance()->getParser();
					$legendText = DPLInclude::text( $parser, $legendPage );
					$legendText = preg_replace( '/^.*?\<section\s+begin\s*=\s*legend\s*\/\>/s', '', $legendText );
					$legendText = preg_replace( '/\<section\s+end\s*=\s*legend\s*\/\>.*/s', '', $legendText );
				}
				$instructions = array();
				if ( $instructionPage != '' ) {
					global $wgUser;
					$parser = MediaWikiServices::getInstance()->getParser();
					$instructionText = DPLInclude::text( $parser, $instructionPage );
					$instructions = $this->getTemplateParmValues( $instructionText, 'Template field' );
				}
				// construct an edit form containing all template invocations
				$form = "<html><form method=post action=\"$action\" $editForm>\n";
				foreach ( $tpv as $call => $tplValues ) {
					$form .= "<table $table>\n";
					foreach ( $parameter as $nr => $parm ) {
						// try to extract legend from the docs of the template
						$myToolTip = '';
						if ( array_key_exists( $nr, $tooltip ) ) {
							$myToolTip = $tooltip[$nr];
						}
						$myInstruction = '';
						$myType = '';
						foreach ( $instructions as $instruct ) {
							if ( array_key_exists( 'field', $instruct ) && $instruct['field'] == $parm ) {
								if ( array_key_exists( 'doc', $instruct ) ) {
									$myInstruction = $instruct['doc'];
								}
								if ( array_key_exists( 'type', $instruct ) ) {
									$myType = $instruct['type'];
								}
								break;
							}
						}
						$myFormat = '';
						if ( array_key_exists( $nr, $format ) ) {
							$myFormat = $format[$nr];
						}
						$myOptional = array_key_exists( $nr, $optional );
						if ( $legendText != '' && $myToolTip == '' ) {
							$myToolTip = preg_replace( '/^.*\<section\s+begin\s*=\s*' . preg_quote( $parm, '/' ) . '\s*\/\>/s', '', $legendText );
							if ( strlen( $myToolTip ) == strlen( $legendText ) ) {
								$myToolTip = '';
							} else {
								$myToolTip = preg_replace( '/\<section\s+end\s*=\s*' . preg_quote( $parm, '/' ) . '\s*\/\>.*/s', '', $myToolTip );
							}
						}
						$myValue = '';
						if ( array_key_exists( $parm, $tpv[$call] ) ) {
							$myValue = $tpv[$call][$parm];
						}
						$form .= $this->editTemplateCall(
							$text, $template, $call, $parm, $myType, $myValue,
							$myFormat, $myToolTip, $myInstruction, $myOptional,
							$fieldFormat
						);
					}
					$form .= "</table>\n<br/><br/>";
				}
				foreach ( $hidden as $hide ) {
					$form .= "<input type=hidden " . $hide . " />";
				}
				$form .= "<input type=hidden name=\"token\" value=\"" . $wgUser->getEditToken() . "\" />";
				foreach ( $preview as $prev ) {
					$form .= "<input type=submit " . $prev . " /> ";
				}
				$form .= "</form></html>\n";
				return $form;
			} elseif ( $exec == 'set' || $exec == 'preview' ) {
				// loop over all invocations and parameters, this could be improved to enhance performance
				$matchCount = 10;
				for ( $call = 0; $call < 10; $call++ ) {
					foreach ( $parameter as $nr => $parm ) {
						// set parameters to values specified in the dpl source or get them from the HTTP request
						if ( $exec == 'set' ) {
							$myValue = $value[$nr];
						} else {
							if ( $call >= $matchCount ) {
								break;
							}
							$myValue = $wgRequest->getVal( urlencode( $call . '_' . $parm ), '' );
						}
						$myOptional = array_key_exists( $nr, $optional );
						$myAfterParm = array();
						if ( array_key_exists( $nr, $afterparm ) ) {
							$myAfterParm = $afterparm[$nr];
						}
						$text = $this->updateTemplateCall(
							$matchCount, $text, $template, $call, $parm,
							$myValue, $myAfterParm, $myOptional
						);
					}
					if ( $exec == 'set' ) {
						break; // values taken from dpl text only populate the first invocation
					}
				}
			}
		}

		if ( $exec == 'set' ) {
			return $this->updateArticle( $title, $text, $summary );
		} elseif ( $exec == 'preview' ) {
			global $wgScriptPath, $wgRequest;
			$titleX = Title::newFromText( $title );
			$articleX = new Article( $titleX );
			$form = '<html><form id="editform" name="editform" method="post" action="' . $wgScriptPath . '/index.php?title=' . urlencode( $title ) . '&action=submit" '
			. 'enctype="multipart/form-data">' . "\n"
			. '<input type="hidden" value="" name="wpSection" />' . "\n"
			. '<input type="hidden" value="' . wfTimestampNow() . '" name="wpStarttime" />' . "\n"
			. '<input type="hidden" value="' . $articleX->getTimestamp() . '" name="wpEdittime" />' . "\n"
			. '<input type="hidden" value="" name="wpScrolltop" id="wpScrolltop" />' . "\n"
			. '<textarea tabindex="1" accesskey="," name="wpTextbox1" id="wpTextbox1" rows="25" cols="80" >'
			. htmlspecialchars( $text )
			. '</textarea>' . "\n"
			. '<input type="hidden" name="wpSummary value="' . $summary . '" id="wpSummary" />'
			. '<input name="wpAutoSummary" type="hidden" value="" />'
			. '<input id="wpSave" name="wpSave" type="submit" value="Save page" accesskey="s" title="Save your changes [s]" />'
			. '<input type="hidden" value="' . $wgRequest->getVal( 'token' ) . '" name="wpEditToken" />' . "\n"
			. '</form></html>' . "\n";
			return $form;
		}

		return 'exec must be one of the following: edit, preview, set';
	}

	function updateArticle( $title, $text, $summary ) {
		global $wgUser, $wgRequest, $wgOut;

		if ( !$wgUser->matchEditToken( $wgRequest->getVal( 'token' ) ) ) {
			$wgOut->addWikiMsg( 'sessionfailure' );
			return 'session failure';
		}

		$titleX = Title::newFromText( $title );
		$permissionErrors = MediaWikiServices::getInstance()->getPermissionManager()
			->getPermissionErrors( 'edit', $wgUser, $titleX );
		if ( count( $permissionErrors ) == 0 ) {
			$pageX = WikiPage::factory( $titleX );
			$pageXContent = ContentHandler::makeContent( $text, $pageX->getTitle() );
			$pageX->doEditContent(
				$pageXContent,
				$summary,
				EDIT_UPDATE | EDIT_DEFER_UPDATES | EDIT_AUTOSUMMARY
			);
			$wgOut->redirect( $titleX->getFullURL( $pageX->isRedirect() ? 'redirect=no' : '' ) );
			return '';
		} else {
			$wgOut->showPermissionsErrorPage( $permissionErrors );
			return 'permission error';
		}
	}

	function editTemplateCall( $text, $template, $call, $parameter, $type, $value, $format, $legend, $instruction, $optional, $fieldFormat ) {
		$nlCount = substr_count( $value, "\n" );
		if ( $nlCount > 0 ) {
			$rows = $nlCount + 1;
		} else {
			$rows = floor( strlen( $value ) / 50 ) + 1;
		}
		if ( preg_match( '/rows\s*=/', $format ) <= 0 ) {
			$format .= " rows=$rows";
		}
		$cols = 50;
		if ( preg_match( '/cols\s*=/', $format ) <= 0 ) {
			$format .= " cols=$cols";
		}
		$textArea = '<textarea name="' . urlencode( $call . '_' . $parameter ) . "\" $format/>" . htmlspecialchars( $value ) . '</textarea>';
		return str_replace( '%NAME%', htmlspecialchars( str_replace( '_', ' ', $parameter ) ),
				str_replace( '%TYPE%', $type,
					str_replace( '%INPUT%', $textArea,
						str_replace( '%LEGEND%', '</html>' . htmlspecialchars( $legend ) . '<html>',
							str_replace( '%INSTRUCTION%', '</html>' . htmlspecialchars( $instruction ) . '<html>', $fieldFormat )
					)
				)
			)
		);
	}

	/**
	 * return an array of template invocations; each element is an associative array of parameter and value
	 *
	 * @param string $text
	 * @param string $template
	 * @return array[]
	 */
	function getTemplateParmValues( $text, $template ) {
		$matches = array();
		$noMatches = preg_match_all( '/\{\{\s*' . preg_quote( $template, '/' ) . '\s*[|}]/i', $text, $matches, PREG_OFFSET_CAPTURE );
		if ( $noMatches <= 0 ) {
			return array();
		}
		$textLen = strlen( $text );
		$tval = array(); // the result array of template values
		$call = -1;      // index for tval

		foreach ( $matches as $matchA ) {
			foreach ( $matchA as $matchB ) {
				list( $match, $start ) = $matchB;
				$tval[++$call] = array();
				$nr = 0; // number of parameter if no name given
				$parmValue = '';
				$parmName = '';
				$parm = '';

				if ( $match[strlen( $match ) - 1] == '}' ) {
					break; // template was called without parameters, continue with next invocation
				}

				// search to the end of the template call
				$cbrackets = 2;
				for ( $i = $start + strlen( $match ); $i < $textLen; $i++ ) {
					$c = $text[$i];
					if ( $c == '{' || $c == '[' ) {
						$cbrackets++; // we count both types of brackets
					}
					if ( $c == '}' || $c == ']' ) {
						$cbrackets--;
					}
					if ( ( $cbrackets == 2 && $c == '|' ) || ( $cbrackets == 1 && $c == '}' ) ) {
						// parameter (name or value) found
						if ( $parmName == '' ) {
							$tval[$call][++$nr] = trim( $parm );
						} else {
							$tval[$call][$parmName] = trim( $parmValue );
						}
						$parmName = '';
						$parmValue = '';
						$parm = '';
						continue;
					} else {
						if ( $parmName == '' ) {
							if ( $c == '=' ) {
								$parmName = trim( $parm );
							}
						} else {
							$parmValue .= $c;
						}
					}
					$parm .= $c;
					if ( $cbrackets == 0 ) {
						break; // end of parameter list
					}
				}
			}
		}
		return $tval;
	}

	/**
	 * Changes a single parameter value within a certain call of a template
	 *
	 * @param int &$matchCount
	 * @param string $text
	 * @param string $template
	 * @param int $call
	 * @param string $parameter
	 * @param string $value
	 * @param string[] $afterParm
	 * @param bool $optional
	 * @return string
	 */
	function updateTemplateCall( &$matchCount, $text, $template, $call, $parameter, $value, $afterParm, $optional ) {
		// if parameter is optional and value is empty we leave everything as it is (i.e. we do not remove the parm)
		if ( $optional && $value == '' ) {
			return $text;
		}

		$matches = array();
		$noMatches = preg_match_all( '/\{\{\s*' . preg_quote( $template, '/' ) . '\s*[|}]/i', $text, $matches, PREG_OFFSET_CAPTURE );
		if ( $noMatches <= 0 ) {
			return $text;
		}

		$beginSubst = -1;
		$endSubst = -1;
		$posInsertAt = 0;
		$apNrLast = 1000; // last (optional) predecessor

		foreach ( $matches as $matchA ) {
			$matchCount = count( $matchA );
			foreach ( $matchA as $occurence => $matchB ) {
				if ( $occurence < $call ) {
					continue;
				}
				list( $match, $start ) = $matchB;

				if ( $match[strlen( $match ) - 1] == '}' ) {
					// template was called without parameters, add new parameter and value
					// append parameter and value
					// FIXME: Undefined $i!
					$beginSubst = $i;
					$endSubst = $i;
					$substitution = "|$parameter = $value";
					break;
				} else {
					// there is already a list of parameters; we search to the end of the template call
					$cbrackets = 2;
					$parm = '';
					$pos = $start + strlen( $match ) - 1;
					$textLen = strlen( $text );
					for ( $i = $pos + 1; $i < $textLen; $i++ ) {
						$c = $text[$i];
						if ( $c == '{' || $c == '[' ) {
							$cbrackets++; // we count both types of brackets
						}
						if ( $c == '}' || $c == ']' ) {
							$cbrackets--;
						}
						if ( ( $cbrackets == 2 && $c == '|' ) || ( $cbrackets == 1 && $c == '}' ) ) {
							// parameter (name / value) found
							$token = explode( '=', $parm, 2 );
							if ( count( $token ) == 2 ) {
								// we need a pair of name / value
								$parmName = trim( $token[0] );
								if ( $parmName == $parameter ) {
									// we found the parameter, now replace the current value
									$parmValue = trim( $token[1] );
									if ( $parmValue == $value ) {
										break; // no need to change when values are identical
									}
									// keep spaces;
									if ( $parmValue == '' ) {
										if ( strlen( $token[1] ) > 0 && $token[1][strlen( $token[1] ) - 1] == "\n" ) {
											$substitution = str_replace( "\n", $value . "\n", $token[1] );
										} else {
											$substitution = $value . $token[1];
										}
									} else {
										$substitution = str_replace( $parmValue, $value, $token[1] );
									}
									$beginSubst = $pos + strlen( $token[0] ) + 2;
									$endSubst = $i;
									break;
								} else {
									foreach ( $afterParm as $apNr => $ap ) {
										// store position for insertion
										if ( $parmName == $ap && $apNr < $apNrLast ) {
											$posInsertAt = $i;
											$apNrLast = $apNr;
											break;
										}
									}
								}
							}

							if ( $c == '}' ) {
								// end of template call reached, insert at stored position or here
								if ( $posInsertAt != 0 ) {
									$beginSubst = $posInsertAt;
								} else {
									$beginSubst = $i;
								}
								$substitution = "|$parameter = $value";
								if ( $text[$beginSubst - 1] == "\n" ) {
									--$beginSubst;
									$substitution = "\n" . $substitution;
								}
								$endSubst = $beginSubst;
								break;
							}

							$pos = $i;
							$parm = '';
						} else {
							$parm .= $c;
						}
						if ( $cbrackets == 0 ) {
							break;
						}
					}
				}
				break;
			}
			break;
		}

		if ( $beginSubst < 0 ) {
			return $text;
		}

		return substr( $text, 0, $beginSubst ) . $substitution . substr( $text, $endSubst );
	}

	function deleteArticleByRule( $title, $text, $rulesText ) {
		global $wgUser, $wgOut;

		// return "deletion of articles by DPL is disabled.";

		// we use ; as command delimiter; \; stands for a semicolon
		// \n is translated to a real linefeed
		$rulesText = str_replace( ";", '°', $rulesText );
		$rulesText = str_replace( '\°', ';', $rulesText );
		$rulesText = str_replace( "\\n", "\n", $rulesText );
		$rules = explode( '°', $rulesText );
		$exec = false;
		$message = '';
		$reason = '';

		foreach ( $rules as $rule ) {
			if ( preg_match( '/^\s*#/', $rule ) > 0 ) {
				continue; // # is comment symbol
			}

			$rule = preg_replace( '/^\s+/', '', $rule ); // strip leading white space
			$cmd = preg_split( '/ +/', $rule, 2 );
			if ( count( $cmd ) > 1 ) {
				$arg = $cmd[1];
			} else {
				$arg = '';
			}
			$cmd[0] = trim( $cmd[0] );

			if ( $cmd[0] == 'reason' ) {
				$reason = $arg;
			}

			// we execute only if "exec" is given, otherwise we merely show what would be done
			if ( $cmd[0] == 'exec' ) {
				$exec = true;
			}
		}
		$reason .= "\nbulk delete by DPL query";

		$titleX = Title::newFromText( $title );
		if ( $exec ) {
			# Check permissions
			$permissionErrors = MediaWikiServices::getInstance()->getPermissionManager()
				->getPermissionErrors( 'delete', $wgUser, $titleX );
			if ( count( $permissionErrors ) > 0 ) {
				$wgOut->showPermissionsErrorPage( $permissionErrors );
				return 'permission error';
			} elseif ( wfReadOnly() ) {
				throw new ReadOnlyError;
			} else {
				$articleX = new Article( $titleX );
				$articleX->doDelete( $reason );
			}
		} else {
			$message .= "set 'exec yes' to delete &#160; &#160; <big>'''$title'''</big>\n";
		}
		$message .= '<pre><nowiki>'
			. "\n" . $text . '</nowiki></pre>'; // <pre><nowiki>\n"; // .$text."\n</nowiki></pre>\n";
		return $message;
	}

	/**
	 * Generate a hyperlink to the article
	 *
	 * @param string $tag
	 * @param DPLArticle $article
	 * @param int $iTitleMaxLen
	 * @return string
	 */
	public function articleLink( $tag, $article, $iTitleMaxLen ) {
		$pagename = $article->mTitle->getPrefixedText();
		if ( $this->mEscapeLinks && ( $article->mNamespace == 14 || $article->mNamespace == 6 ) ) {
			// links to categories or images need an additional ":"
			$pagename = ':' . $pagename;
		}
		return $this->substTagParm( $tag, $pagename, $article, $this->filteredCount, '', $iTitleMaxLen );
	}

	/**
	 * Format one item of an entry in the output list (i.e. the collection of occurences of one item from the include parameter)
	 *
	 * @param string $piece
	 * @param string $tagStart
	 * @param string $tagEnd
	 * @return string
	 */
	function formatItem( $piece, $tagStart, $tagEnd ) {
		return $tagStart . $piece . $tagEnd;
	}

	/**
	 * Format one single item of an entry in the output list (i.e. one occurence of one item from the include parameter)
	 *
	 * @param string[] &$pieces
	 * @param int $s
	 * @param DPLArticle $article
	 */
	function formatSingleItems( &$pieces, $s, $article ) {
		$firstCall = true;
		foreach ( $pieces as $key => $val ) {
			if ( array_key_exists( $s, $this->mTableRow ) ) {
				if ( $s == 0 || $firstCall ) {
					$pieces[$key] = str_replace( '%%', $val, $this->mTableRow[$s] );
				} else {
					$n = strpos( $this->mTableRow[$s], '|' );
					if (
						$n === false ||
						!( strpos( substr( $this->mTableRow[$s], 0, $n ), '{' ) === false ) ||
						!( strpos( substr( $this->mTableRow[$s], 0, $n ), '[' ) === false )
					) {
						$pieces[$key] = str_replace( '%%', $val, $this->mTableRow[$s] );
					} else {
						$pieces[$key] = str_replace( '%%', $val, substr( $this->mTableRow[$s], $n + 1 ) );
					}
				}
				$pieces[$key] = str_replace( '%IMAGE%', self::imageWithPath( $val ), $pieces[$key] );
				$pieces[$key] = str_replace( '%PAGE%', $article->mTitle->getPrefixedText(), $pieces[$key] );
				if ( strpos( $pieces[$key], '%CAT' ) >= 0 ) {
					if ( !empty( $article->mCategoryLinks ) ) {
						$pieces[$key] = str_replace( '%' . 'CATLIST%', implode( ', ', $article->mCategoryLinks ), $pieces[$key] );
						$pieces[$key] = str_replace( '%' . 'CATBULLETS%', '* ' . implode( "\n* ", $article->mCategoryLinks ), $pieces[$key] );
						$pieces[$key] = str_replace( '%' . 'CATNAMES%', implode( ', ', $article->mCategoryTexts ), $pieces[$key] );
					} else {
						$pieces[$key] = str_replace( '%' . 'CATLIST%', '', $pieces[$key] );
						$pieces[$key] = str_replace( '%' . 'CATBULLETS%', '', $pieces[$key] );
						$pieces[$key] = str_replace( '%' . 'CATNAMES%', '', $pieces[$key] );
					}
				}
			}
			$firstCall = false;
		}
	}

	/**
	 * Format one single template argument of one occurence of one item from the include parameter
	 * is called via a backlink from DPLInclude::includeTemplate()
	 *
	 * @param string $arg
	 * @param int $s
	 * @param int $argNr
	 * @param bool $firstCall
	 * @param int $maxlen
	 * @param DPLArticle $article
	 * @return string
	 */
	public function formatTemplateArg( $arg, $s, $argNr, $firstCall, $maxlen, $article ) {
		// we could try to format fields differently within the first call of a template
		// currently we do not make such a difference

		// if the result starts with a '-' we add a leading space; thus we avoid a misinterpretation of |- as
		// a start of a new row (wiki table syntax)
		if ( array_key_exists( "$s.$argNr", $this->mTableRow ) ) {
			$n = -1;
			if ( $s >= 1 && $argNr == 0 && !$firstCall ) {
				$n = strpos( $this->mTableRow["$s.$argNr"], '|' );
				if (
					$n === false ||
					!( strpos( substr( $this->mTableRow["$s.$argNr"], 0, $n ), '{' ) === false ) ||
					!( strpos( substr( $this->mTableRow["$s.$argNr"], 0, $n ), '[' ) === false )
				) {
					$n = -1;
				}
			}
			$result = str_replace( '%%', $arg, substr( $this->mTableRow["$s.$argNr"], $n + 1 ) );
			$result = str_replace( '%PAGE%', $article->mTitle->getPrefixedText(), $result );
			$result = str_replace( '%IMAGE%', self::imageWithPath( $arg ), $result );
			$result = $this->cutAt( $maxlen, $result );
			if ( strlen( $result ) > 0 && $result[0] == '-' ) {
				return ' ' . $result;
			} else {
				return $result;
			}
		}

		$result = $this->cutAt( $maxlen, $arg );
		if ( strlen( $result ) > 0 && $result[0] == '-' ) {
			return ' ' . $result;
		} else {
			return $result;
		}
	}

	/**
	 * Return the total number of rows (filtered)
	 *
	 * @return int
	 */
	public function getRowCount() {
		return $this->filteredCount;
	}

	/**
	 * Truncate a portion of wikitext so that ..
	 * ... it is not larger that $lim characters
	 * ... it is balanced in terms of braces, brackets and tags
	 * ... can be used as content of a wikitable field without spoiling the whole surrounding wikitext structure
	 *
	 * @param int $lim Limit of character count for the result
	 * @param string $text The wikitext to be truncated
	 * @return string The truncated text; note that in some cases it may be slightly longer than the given limit
	 *         if the text is alread shorter than the limit or if the limit is negative, the text
	 *         will be returned without any checks for balance of tags
	 */
	function cutAt( $lim, $text ) {
		if ( $lim < 0 ) {
			return $text;
		}
		return DPLInclude::limitTranscludedText( $text, $lim );
	}

	/**
	 * Slightly different from CategoryViewer::formatList() (no need to instantiate a CategoryViewer object)
	 *
	 * @param int $iStart
	 * @param int $iCount
	 * @return string
	 */
	function formatCategoryList( $iStart, $iCount ) {
		$aArticles = array();
		$aArticles_start_char = array();
		for ( $i = $iStart; $i < $iStart + $iCount; $i++ ) {
			$aArticles[] = $this->mArticles[$i]->mLink;
			$aArticles_start_char[] = $this->mArticles[$i]->mStartChar;
			$this->filteredCount = $this->filteredCount + 1;
		}
		if ( count( $aArticles ) > ExtDynamicPageList::$categoryStyleListCutoff ) {
			return '__NOTOC____NOEDITSECTION__' . CategoryViewer::columnList( $aArticles, $aArticles_start_char );
		} elseif ( count( $aArticles ) > 0 ) {
			// for short lists of articles in categories.
			return '__NOTOC____NOEDITSECTION__' . CategoryViewer::shortList( $aArticles, $aArticles_start_char );
		}
		return '';
	}

	/**
	 * Prepends an image name with its hash path.
	 *
	 * @param string $imgName Name of the image (may start with Image: or File:)
	 * @return string
	 */
	static function imageWithPath( $imgName ) {
		$title = Title::newFromText( 'Image:' . $imgName );
		if ( $title !== null ) {
			if ( method_exists( MediaWikiServices::class, 'getRepoGroup' ) ) {
				// MediaWiki 1.34+
				$repo = MediaWikiServices::getInstance()->getRepoGroup();
			} else {
				$repo = RepoGroup::singleton();
			}
			$iTitle = Title::makeTitleSafe( 6, $title->getDBkey() );
			$imageUrl = preg_replace( '~^.*images/(.*)~', '\1', $repo->getLocalRepo()->newFile( $iTitle )->getPath() );
		} else {
			$imageUrl = '???';
		}
		return $imageUrl;
	}

	/**
	 * Returns message in the requested format after parsing wikitext to HTML
	 * This is meant to be equivalent to wfMsgExt() with parse, parsemag and
	 * escape as available options but using the DPL local parser instead of
	 * the global one (bugfix).
	 *
	 * @param string $key
	 * @param string[]|string $options
	 * @return string HTML
	 */
	function msgExt( $key, $options ) {
		$args = func_get_args();
		array_shift( $args );
		array_shift( $args );

		if ( !is_array( $options ) ) {
			$options = array( $options );
		}

		$string = wfMessage( $key )->plain();

		$string = wfMsgReplaceArgs( $string, $args );

		$this->mParserOptions->setInterfaceMessage( true );
		$string = $this->mParser->recursiveTagParse( $string );
		$this->mParserOptions->setInterfaceMessage( false );

		if ( in_array( 'escape', $options ) ) {
			$string = htmlspecialchars( $string );
		}

		return $string;
	}

	public function getText() {
		return $this->mOutput;
	}

}
