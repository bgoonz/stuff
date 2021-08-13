-- (c) 2011 by Hallo Welt! Medienwerkstatt GmbH
-- Table(s) for BibManager
-- Replace /*_*/ with the proper prefix
-- Replace /*$wgDBTableOptions*/ with the correct options

-- Add the main table for BibManager
CREATE TABLE IF NOT EXISTS /*_*/bibmanager (
  bm_bibtexEntryType text         NOT NULL,
  bm_bibtexCitation  varchar(255) NOT NULL,
  bm_address         text         NOT NULL,
  bm_author          text         NOT NULL,
  bm_booktitle       text         NOT NULL,
  bm_chapter         int(11)      NOT NULL,
  bm_doi             text         NOT NULL,
  bm_edition         int(11)      NOT NULL,
  bm_editor          text         NOT NULL,
  bm_eprint          text         NOT NULL,
  bm_fulltext        text         NOT NULL,
  bm_howpublished    text         NOT NULL,
  bm_institution     text         NOT NULL,
  bm_isbn            bigint(20)   NOT NULL,
  bm_journal         text         NOT NULL,
  bm_month           text         NOT NULL,
  bm_note            text         NOT NULL,
  bm_number          int(11)      NOT NULL,
  bm_organization    text         NOT NULL,
  bm_pages           text         NOT NULL,
  bm_publisher       text         NOT NULL,
  bm_school          text         NOT NULL,
  bm_series          text         NOT NULL,
  bm_title           text         NOT NULL,
  bm_type            text         NOT NULL,
  bm_url             text         NOT NULL,
  bm_volume          text         NOT NULL,
  bm_year            int(11)      NOT NULL,
  bm_key             text         NOT NULL,
  bm_crossref        text         NOT NULL,
  PRIMARY KEY ( bm_bibtexCitation )
) /*$wgDBTableOptions*/;

CREATE INDEX /*i*/bm_bibtexEntryTypeIDX ON /*_*/bibmanager ( bm_bibtexEntryType(50) );
