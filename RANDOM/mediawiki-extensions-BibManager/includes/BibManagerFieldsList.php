<?php

class BibManagerFieldsList {

	public static function getFieldDefinitions () {
		//HINT: https://semantic-mediawiki.org/wiki/Help:BibTeX_format
		$fieldDefinitions = array (
		    'address' => array (
			'class' => 'HTMLTextField',
			'label' => wfMessage( 'bm_address' )->escaped(),
			'validation-callback' => 'BibManagerValidator::validateAddress',
		    ), //Publisher's address (usually just the city, but can be the full address for lesser-known publishers)
		    'annote' => array (
			'class' => 'HTMLTextAreaField',
			'label' => wfMessage( 'bm_annote' )->escaped(),
			'validation-callback' => 'BibManagerValidator::validateAnnote',
			'rows' => 5
		    ), //An annotation for annotated bibliography styles (not typical)
		    'author' => array (
			'class' => 'HTMLTextField',
			'label' => wfMessage( 'bm_author' )->escaped(),
			'validation-callback' => 'BibManagerValidator::validateAuthor',
		    ), //The name(s) of the author(s) (in the case of more than one author, separated by and)
		    'booktitle' => array (
			'class' => 'HTMLTextField',
			'label' => wfMessage( 'bm_booktitle' )->escaped(),
			'validation-callback' => 'BibManagerValidator::validateBooktitle',
		    ), // The title of the book, if only part of it is being cited
		    'chapter' => array (
			'class' => 'HTMLTextField',
			'label' => wfMessage( 'bm_chapter' )->escaped(),
			'validation-callback' => 'BibManagerValidator::validateChapter',
		    ), // The chapter number
		    'crossref' => array (
			'class' => 'HTMLTextField',
			'label' => wfMessage( 'bm_crossref' )->escaped(),
			'validation-callback' => 'BibManagerValidator::validateCrossref',
		    ), // The key of the cross-referenced entry
		    'edition' => array (
			'class' => 'HTMLTextField',
			'label' => wfMessage( 'bm_edition' )->escaped(),
			'validation-callback' => 'BibManagerValidator::validateEdition',
		    ), // The edition of a book, long form (such as "first" or "second")
		    'editor' => array (
			'class' => 'HTMLTextField',
			'label' => wfMessage( 'bm_editor' )->escaped(),
			'validation-callback' => 'BibManagerValidator::validateEditor',
		    ), // The name(s) of the editor(s)
		    'eprint' => array (
			'class' => 'HTMLTextField',
			'label' => wfMessage( 'bm_eprint' )->escaped(),
			'validation-callback' => 'BibManagerValidator::validateEprint',
		    ), // A specification of an electronic publication, often a preprint or a technical report
		    'howpublished' => array (
			'class' => 'HTMLTextField',
			'label' => wfMessage( 'bm_howpublished' )->escaped(),
			'validation-callback' => 'BibManagerValidator::validateHowpublished',
		    ), // How it was published, if the publishing method is nonstandard
		    'institution' => array (
			'class' => 'HTMLTextField',
			'label' => wfMessage( 'bm_institution' )->escaped(),
			'validation-callback' => 'BibManagerValidator::validateInstitution',
		    ), // The institution that was involved in the publishing, but not necessarily the publisher
		    'journal' => array (
			'class' => 'HTMLTextField',
			'label' => wfMessage( 'bm_journal' )->escaped(),
			'validation-callback' => 'BibManagerValidator::validateJournal',
		    ), // The journal or magazine the work was published in
		    'key' => array (
			'class' => 'HTMLTextField',
			'label' => wfMessage( 'bm_key' )->escaped(),
			'validation-callback' => 'BibManagerValidator::validateKey',
		    ), // A hidden field used for specifying or overriding the alphabetical order of entries (when the "author" and "editor" fields are missing). Note that this is very different from the key (mentioned just after this list) that is used to cite or cross-reference the entry.
		    'month' => array (
			'class' => 'HTMLSelectField',
			'label' => wfMessage( 'bm_month' )->escaped(),
			'options' => array (
			    '' => '',
			    wfMessage( 'bm_month_jan' )->escaped() => 'january',
			    wfMessage( 'bm_month_feb' )->escaped() => 'february',
			    wfMessage( 'bm_month_mar' )->escaped() => 'march',
			    wfMessage( 'bm_month_apr' )->escaped() => 'april',
			    wfMessage( 'bm_month_may' )->escaped() => 'may',
			    wfMessage( 'bm_month_jun' )->escaped() => 'june',
			    wfMessage( 'bm_month_jul' )->escaped() => 'july',
			    wfMessage( 'bm_month_aug' )->escaped() => 'august',
			    wfMessage( 'bm_month_sep' )->escaped() => 'september',
			    wfMessage( 'bm_month_oct' )->escaped() => 'october',
			    wfMessage( 'bm_month_nov' )->escaped() => 'november',
			    wfMessage( 'bm_month_dec' )->escaped() => 'december',
			),
			'validation-callback' => 'BibManagerValidator::validateMonth',
		    ), // The month of publication (or, if unpublished, the month of creation)
		    'note' => array (
			'class' => 'HTMLTextAreaField',
			'label' => wfMessage( 'bm_note' )->escaped(),
			'validation-callback' => 'BibManagerValidator::validateNote',
			'rows' => 5
		    ), // Miscellaneous extra information
		    'number' => array (
			'class' => 'HTMLTextField',
			'label' => wfMessage( 'bm_number' )->escaped(),
			'validation-callback' => 'BibManagerValidator::validateNumber',
		    ), // The "(issue) number" of a journal, magazine, or tech-report, if applicable. (Most publications have a "volume", but no "number" field.)
		    'organization' => array (
			'class' => 'HTMLTextField',
			'label' => wfMessage( 'bm_organization' )->escaped(),
			'validation-callback' => 'BibManagerValidator::validateOrganization',
		    ), // The conference sponsor
		    'pages' => array (
			'class' => 'HTMLTextField',
			'label' => wfMessage( 'bm_pages' )->escaped(),
			'validation-callback' => 'BibManagerValidator::validatePages',
		    ), // Page numbers, separated either by commas or double-hyphens.
		    'publisher' => array (
			'class' => 'HTMLTextField',
			'label' => wfMessage( 'bm_publisher' )->escaped(),
			'validation-callback' => 'BibManagerValidator::validatePublisher',
		    ), // The publisher's name
		    'school' => array (
			'class' => 'HTMLTextField',
			'label' => wfMessage( 'bm_school' )->escaped(),
			'validation-callback' => 'BibManagerValidator::validateSchool',
		    ), // The school where the thesis was written
		    'series' => array (
			'class' => 'HTMLTextField',
			'label' => wfMessage( 'bm_series' )->escaped(),
			'validation-callback' => 'BibManagerValidator::validateSeries',
		    ), // The series of books the book was published in (e.g. "The Hardy Boys" or "Lecture Notes in Computer Science")
		    'title' => array (
			'class' => 'HTMLTextField',
			'label' => wfMessage( 'bm_title' )->escaped(),
			'validation-callback' => 'BibManagerValidator::validateTitle',
		    ), // The title of the work
		    'type' => array (
			'class' => 'HTMLTextField',
			'label' => wfMessage( 'bm_type' )->escaped(),
			'validation-callback' => 'BibManagerValidator::validateType',
		    //validate ?
		    ), // The field overriding the default type of publication (e.g. "Research Note" for techreport, "{PhD} dissertation" for phdthesis, "Section" for inbook/incollection)
		    'url' => array (
			'class' => 'HTMLTextField',
			'label' => wfMessage( 'bm_url' )->escaped(),
			'default' => 'http://',
			'validation-callback' => 'BibManagerValidator::validateUrl',
		    ), // The WWW address
		    'volume' => array (
			'class' => 'HTMLTextField',
			'label' => wfMessage( 'bm_volume' )->escaped(),
			'validation-callback' => 'BibManagerValidator::validateVolume',
		    ), // The volume of a journal or multi-volume book
		    'year' => array (
			'class' => 'HTMLTextField',
			'label' => wfMessage( 'bm_year' )->escaped(),
			'validation-callback' => 'BibManagerValidator::validateYear',
		    ) // The year of publication (or, if unpublished, the year of creation)
		);
		Hooks::run( 'BibManagerGetFieldDefinitions', array ( &$fieldDefinitions ) );
		return $fieldDefinitions;
	}

	public static function getTypeDefinitions () {
		// TODO RBV (23.12.11 13:36): Make arrays global (label sould be only the language key!): Iterate over them, i18n-ify lables and run hook.
		$typeDefinitions = array (
		    'article' => array (
			'label' => wfMessage( 'bm_entry_type_article' )->escaped(),
			'required' => array ( 'author', 'title', 'journal', 'year' ),
			'optional' => array ( 'volume', 'number', 'pages', 'month', 'note', 'key', 'url' )
		    ),
		    'book' => array (
			'label' => wfMessage( 'bm_entry_type_book' )->escaped(),
			'required' => array ( 'author', 'editor', 'title', 'publisher', 'year' ),
			'optional' => array ( 'volume', 'number', 'series', 'address', 'edition', 'month', 'note', 'key', 'url' )
		    ),
		    'booklet' => array (
			'label' => wfMessage( 'bm_entry_type_booklet' )->escaped(),
			'required' => array ( 'title' ),
			'optional' => array ( 'author', 'howpublished', 'address', 'month', 'year', 'note', 'key' )
		    ),
		    'conference' => array (
			'label' => wfMessage( 'bm_entry_type_conference' )->escaped(),
			'required' => array ( 'author', 'title', 'booktitle', 'year' ),
			'optional' => array ( 'editor', 'volume', 'number', 'series', 'pages', 'address', 'month', 'organization', 'publisher', 'note', 'key', 'url' )
		    ),
		    'inbook' => array (
			'label' => wfMessage( 'bm_entry_type_inbook' )->escaped(),
			'required' => array ( 'author', 'editor', 'title', 'chapter', 'pages', 'publisher', 'year' ),
			'optional' => array ( 'volume', 'number', 'series', 'type', 'address', 'edition', 'month', 'note', 'key', 'url' )
		    ),
		    'incollection' => array (
			'label' => wfMessage( 'bm_entry_type_incollection' )->escaped(),
			'required' => array ( 'author', 'title', 'booktitle', 'publisher', 'year' ),
			'optional' => array ( 'editor', 'volume', 'number', 'series', 'type', 'address', 'chapter', 'pages', 'address', 'edition', 'month', 'note', 'key', 'url' )
		    ),
		    'inproceedings' => array (
			'label' => wfMessage( 'bm_entry_type_inproceedings' )->escaped(),
			'required' => array ( 'author', 'title', 'booktitle', 'year' ),
			'optional' => array ( 'editor', 'volume', 'number', 'series', 'pages', 'address', 'month', 'organization', 'publisher', 'note', 'key', 'url' )
		    ),
		    'manual' => array (
			'label' => wfMessage( 'bm_entry_type_manual' )->escaped(),
			'required' => array ( 'title' ),
			'optional' => array ( 'author', 'organization', 'address', 'edition', 'month', 'year', 'note', 'key', 'url' )
		    ),
		    'mastersthesis' => array (
			'label' => wfMessage( 'bm_entry_type_mastersthesis' )->escaped(),
			'required' => array ( 'author', 'title', 'school', 'year' ),
			'optional' => array ( 'type', 'address', 'month', 'note', 'key', 'url' )
		    ),
		    'misc' => array (
			'label' => wfMessage( 'bm_entry_type_misc' )->escaped(),
			'required' => array ( ),
			'optional' => array ( 'author', 'title', 'howpublished', 'month', 'year', 'note', 'key', 'url' )
		    ),
		    'phdthesis' => array (
			'label' => wfMessage( 'bm_entry_type_phdthesis' )->escaped(),
			'required' => array ( 'author', 'title', 'school', 'year' ),
			'optional' => array ( 'type', 'address', 'month', 'note', 'key', 'url' )
		    ),
		    'proceedings' => array (
			'label' => wfMessage( 'bm_entry_type_proceedings' )->escaped(),
			'required' => array ( 'title', 'year' ),
			'optional' => array ( 'editor', 'volume', 'number', 'series', 'address', 'month', 'organization', 'publisher', 'note', 'key', 'url' )
		    ),
		    'techreport' => array (
			'label' => wfMessage( 'bm_entry_type_techreport' )->escaped(),
			'required' => array ( 'author', 'title', 'institution', 'year' ),
			'optional' => array ( 'type', 'note', 'number', 'address', 'month', 'key', 'url' )
		    ),
		    'unpublished' => array (
			'label' => wfMessage( 'bm_entry_type_unpublished' )->escaped(),
			'required' => array ( 'author', 'title', 'note' ),
			'optional' => array ( 'month', 'year', 'key', 'url' )
		    )
		);

		Hooks::run( 'BibManagerGetTypeDefinitions', array ( &$typeDefinitions ) );
		return $typeDefinitions;
	}

}