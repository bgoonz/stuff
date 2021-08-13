
-- Add the Page <-> Citation relationship table for BibManager
CREATE TABLE IF NOT EXISTS /*_*/bibmanager_page_citation_rel (
  bmpc_bibtexCitation  varchar(255) NOT NULL,
  bmpc_page_id         int unsigned NOT NULL,
  bmpc_timestamp       binary(14)   NOT NULL default '',
  bmpc_user            int unsigned NOT NULL default 0,
  PRIMARY KEY ( bmpc_bibtexCitation )
) /*$wgDBTableOptions*/;

CREATE INDEX /*i*/bmpc_bibtexCitationIDX ON /*_*/bibmanager_page_citation_rel ( bmpc_bibtexCitation(50) );