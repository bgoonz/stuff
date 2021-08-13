<?php

use MediaWiki\MediaWikiServices;

/**
 * Class that represents a single "component" of a page - either a template
 * or a piece of free text.
 *
 * @author Yaron Koren
 * @author DataTransfer
 */
class DTPageComponent {
	private $mIsTemplate = false;
	private $mTemplateName;
	static $mUnnamedFieldCounter;
	private $mFields;
	private $mFreeText;
	static $mFreeTextIDCounter = 1;
	private $mFreeTextID;

	public static function newTemplate( $templateName ) {
		$dtPageComponent = new DTPageComponent();
		$dtPageComponent->mTemplateName = trim( $templateName );
		$dtPageComponent->mIsTemplate = true;
		$dtPageComponent->mFields = [];
		self::$mUnnamedFieldCounter = 1;
		return $dtPageComponent;
	}

	public static function newFreeText( $freeText ) {
		$dtPageComponent = new DTPageComponent();
		$dtPageComponent->mIsTemplate = false;
		$dtPageComponent->mFreeText = $freeText;
		$dtPageComponent->mFreeTextID = self::$mFreeTextIDCounter++;
		return $dtPageComponent;
	}

	public function getFields() {
		return $this->mFields;
	}

	public function addNamedField( $fieldName, $fieldValue ) {
		$this->mFields[trim( $fieldName )] = trim( $fieldValue );
	}

	public function addUnnamedField( $fieldValue ) {
		$fieldName = self::$mUnnamedFieldCounter++;
		$this->mFields[$fieldName] = trim( $fieldValue );
	}

	public function isTemplate() {
		return $this->mIsTemplate;
	}

	public function toWikitext() {
		if ( $this->mIsTemplate ) {
			$wikitext = '{{' . $this->mTemplateName;
			foreach ( $this->mFields as $fieldName => $fieldValue ) {
				if ( is_numeric( $fieldName ) ) {
					$wikitext .= '|';
				} else {
					$wikitext .= "\n|$fieldName=";
				}
				if ( is_array( $fieldValue ) ) {
					foreach ( $fieldValue as $subTemplate ) {
						$wikitext .= $subTemplate->toWikitext();
					}
				} else {
					$wikitext .= $fieldValue;
				}
			}
			$wikitext .= "\n}}";
			return $wikitext;
		} else {
			return $this->mFreeText;
		}
	}

	public function toXML( $isSimplified ) {
		global $wgDataTransferViewXMLParseFields;
		global $wgDataTransferViewXMLParseFreeText;
		global $wgTitle;

		$parser = MediaWikiServices::getInstance()->getParser();

		if ( $this->mIsTemplate ) {
			if ( method_exists( 'MediaWiki\MediaWikiServices', 'getContentLanguage' ) ) {
				// MW 1.32+
				$contLang = MediaWikiServices::getInstance()->getContentLanguage();
			} else {
				global $wgContLang;
				$contLang = $wgContLang;
			}
			$namespace_labels = $contLang->getNamespaces();
			$template_label = $namespace_labels[NS_TEMPLATE];
			$field_str = str_replace( ' ', '_', wfMessage( 'dt_xml_field' )->inContentLanguage()->text() );
			$name_str = str_replace( ' ', '_', wfMessage( 'dt_xml_name' )->inContentLanguage()->text() );

			$bodyXML = '';
			foreach ( $this->mFields as $fieldName => $fieldValue ) {
				// If this field itself holds template calls,
				// get the XML for those calls.
				if ( is_array( $fieldValue ) ) {
					$fieldValueXML = '';
					foreach ( $fieldValue as $subComponent ) {
						$fieldValueXML .= $subComponent->toXML( $isSimplified );
					}
				} elseif ( $wgDataTransferViewXMLParseFields ) {
					// Avoid table of contents and "edit" links
					$fieldValue = $parser->parse( "__NOTOC__ __NOEDITSECTION__\n" . $fieldValue, $wgTitle, ParserOptions::newFromAnon() )->getText();
				}

				if ( $isSimplified ) {
					if ( is_numeric( $fieldName ) ) {
						// add "Field" to the beginning of the file name, since
						// XML tags that are simply numbers aren't allowed
						$fieldTag = $field_str . '_' . $fieldName;
					} else {
						$fieldTag = str_replace( ' ', '_', trim( $fieldName ) );
					}
					$attrs = null;
				} else {
					$fieldTag = $field_str;
					$attrs = [ $name_str => $fieldName ];
				}
				if ( is_array( $fieldValue ) ) {
					$bodyXML .= Xml::tags( $fieldTag, $attrs, $fieldValueXML );
				} else {
					$bodyXML .= Xml::element( $fieldTag, $attrs, $fieldValue );
				}
			}

			if ( $isSimplified ) {
				$templateName = str_replace( ' ', '_', $this->mTemplateName );
				return Xml::tags( $templateName, null, $bodyXML );
			} else {
				return Xml::tags( $template_label, [ $name_str => $this->mTemplateName ], $bodyXML );
			}
		} else {
			$free_text_str = str_replace( ' ', '_', wfMessage( 'dt_xml_freetext' )->inContentLanguage()->text() );
			if ( $wgDataTransferViewXMLParseFreeText ) {
				$freeText = $this->mFreeText;
				// Undo the escaping that happened before.
				$freeText = str_replace( [ '&#123;', '&#125;' ], [ '{', '}' ], $freeText );
				// Get rid of table of contents.
				if ( method_exists( '\MediaWiki\MediaWikiServices', 'getInstance' ) ) {
					// MW 1.32+
					$mw = \MediaWiki\MediaWikiServices::getInstance()->getMagicWordFactory()->get( 'toc' );
				} else {
					$mw = MagicWord::get( 'toc' );
				}
				if ( $mw->match( $freeText ) ) {
					$freeText = $mw->replace( '', $freeText );
				}
				// Avoid "edit" links.
				$freeText = $parser->parse( "__NOTOC__ __NOEDITSECTION__\n" . $freeText, $wgTitle, ParserOptions::newFromAnon() )->getText();
			} else {
				$freeText = $this->mFreeText;
			}
			return Xml::element( $free_text_str, [ 'id' => $this->mFreeTextID ], $freeText );
		}
	}
}
