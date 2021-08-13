--
-- Tables to be added to the commonly used schema.
--
CREATE TABLE IF NOT EXISTS /*_*/swsite (
  -- The site's ID.
  sws_id              int unsigned NOT NULL PRIMARY KEY AUTO_INCREMENT,
  sws_name            varbinary(255) NOT NULL,
  sws_short_name      varbinary(255) NOT NULL,
  sws_site_uri        varbinary(255) NOT NULL,
  sws_user_uri        varbinary(255) NOT NULL,
  sws_work_uri        varbinary(255) NOT NULL
) /*$wgDBTableOptions*/;
CREATE UNIQUE INDEX /*i*/swsite_name ON /*_*/swsite (sws_name);
CREATE UNIQUE INDEX /*i*/swsite_short_name ON /*_*/swsite (sws_short_name);
CREATE UNIQUE INDEX /*i*/swsite_site_uri ON /*_*/swsite (sws_site_uri);
CREATE UNIQUE INDEX /*i*/swsite_user_uri ON /*_*/swsite (sws_user_uri);
CREATE UNIQUE INDEX /*i*/swsite_work_uri ON /*_*/swsite (sws_work_uri);

-- Insert a dummy site.
--INSERT INTO swsite (sws_name, sws_short_name, sws_site_uri, sws_user_uri, sws_work_uri) VALUES( 'dummySite', 'dummySite', 'dummy://DummySite', 'dummy://DummySite/User:', 'dummy://DummySite/Work:');


CREATE TABLE IF NOT EXISTS /*_*/swauthor (
  -- The author's ID.
  swa_id              int unsigned NOT NULL PRIMARY KEY AUTO_INCREMENT,
  swa_site            int unsigned NOT NULL,
  swa_user_name       varbinary(255),
  swa_real_name       varbinary(255),
  -- Concatenated with swsite.sws_user_uri, should identify the work unambiguously.
  swa_uri_part        varbinary(255) NOT NULL
) /*$wgDBTableOptions*/;
CREATE UNIQUE INDEX /*i*/swauthor_namesite_unique ON /*_*/swauthor (swa_site,swa_user_name);

-- Insert a dummy author.
-- INSERT INTO swauthor (swa_uri_part, swa_user_name, swa_real_name, swa_site) VALUES( 'DummyAuthor', 'DummyAuthor', 'DummyAuthor', 0);


--
-- Table structure for table srcwork
--
-- All RDF information about a source work is stored here, one source work per row. 
-- A source work is identified either by its ID or by the about-date pair. 
--
CREATE TABLE IF NOT EXISTS /*_*/srcwork (
  -- A unique ID for each source work.
  srcwork_id          int unsigned NOT NULL PRIMARY KEY AUTO_INCREMENT,
  -- The site's id.
  srcwork_site        int unsigned NOT NULL,
  -- The creator's id.
  srcwork_creator     int unsigned NOT NULL,
  -- Extracted from RDF. The version data of the work, stored as MW timestamp.
  srcwork_date        binary(14) NOT NULL,
  -- Usefull or not? Intended to be some short form of about usable for listings.
  srcwork_title       varbinary(255) NOT NULL DEFAULT '',
  -- Concatenated with swsite.sws_work_uri, should identify the work unambiguously.
  srcwork_uri_part    varbinary(255) NOT NULL
) /*$wgDBTableOptions*/;
-- Identifies the work if id not known.
CREATE UNIQUE INDEX /*i*/srcwork_uridate_unique ON /*_*/srcwork (srcwork_site, srcwork_uri_part, srcwork_date);

-- Insert a dummy source work.
-- INSERT INTO srcwork (srcwork_id, srcwork_uri, srcwork_date, srcwork_creator) VALUES( 0, 'dummy://DummySrcwork', to_timestamp( 0), 0);
-- INSERT INTO srcwork (srcwork_uri_part, srcwork_date, srcwork_creator, srcwork_site) VALUES( 'DummySrcwork', '00000000000000', 0, 0);


CREATE TABLE IF NOT EXISTS /*_*/swauthor_links (
  -- The source work's ID as used in 'srcwork.srcwork_id'.
  swal_srcworkid      int unsigned NOT NULL,
  -- The source work's author's ID as used in 'swauthor.swa_id'.
  swal_authorid	      int unsigned NOT NULL
) /*$wgDBTableOptions*/;
CREATE UNIQUE INDEX /*i*/swal_srcwork_author_unique ON /*_*/swauthor_links (swal_srcworkid, swal_authorid);


CREATE TABLE IF NOT EXISTS /*_*/swsource_links (
  -- The source work's ID as used in 'srcwork.srcwork_id'.
  swsl_workid         int unsigned NOT NULL,
  -- The source work's own source ID as used in 'srcwork.srcwork_id'.
  swsl_sourceid       int unsigned NOT NULL,
  swsl_comment        varbinary(255) NOT NULL DEFAULT ''
) /*$wgDBTableOptions*/;
CREATE UNIQUE INDEX /*i*/swsl_work_source_unique ON /*_*/swsource_links (swsl_workid, swsl_sourceid);


--
-- Table structure for table revsrc
--
-- This table links source works to revisions. Only the first revision of an article
-- that is derived from a source should be linked to its source.
-- Each revision may have more than one source work.
-- Vice versa, one source work may be attributed by more than one revision.
-- Each line holds one revision-source pair plus some additional info.
-- Thus, we use 'revsrc_rs' as unique KEY.
CREATE TABLE IF NOT EXISTS /*_*/revsrc (
  -- The revision's ID as used in 'revision.rev_id'.
  revsrc_revid        int unsigned NOT NULL,
  -- The source work's ID as used in 'srcwork.srcwork_id'.
  revsrc_srcworkid    int unsigned NOT NULL,
  -- A MW timestamp when the attribution was made.
  revsrc_timestamp    binary(14) NOT NULL,
  -- The user who has made the attribution.
  revsrc_user         int unsigned NOT NULL,
  revsrc_user_text    text NOT NULL,
  revsrc_comment      text NOT NULL
) /*$wgDBTableOptions*/;
CREATE UNIQUE INDEX /*i*/revsrc_rs_unique ON /*_*/revsrc (revsrc_revid, revsrc_srcworkid);
CREATE INDEX /*i*/revsrc_revid_index ON /*_*/revsrc (revsrc_revid);
CREATE INDEX /*i*/revsrc_timestamp_index ON /*_*/revsrc (revsrc_timestamp);
