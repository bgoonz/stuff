BEGIN;
SET client_min_messages = 'ERROR';


--
-- Tables to be added to the commonly used schema.
--
CREATE SEQUENCE swsite_sws_id_seq MINVALUE 0 START WITH 0;
CREATE TABLE swsite (
  -- The site's ID.
  sws_id            INTEGER PRIMARY KEY DEFAULT nextval('swsite_sws_id_seq'),
  sws_name          TEXT NOT NULL UNIQUE,
  sws_short_name    TEXT NOT NULL UNIQUE,
  sws_site_uri      TEXT NOT NULL UNIQUE,
  sws_user_uri      TEXT NOT NULL UNIQUE,
  sws_work_uri      TEXT NOT NULL UNIQUE
);

-- Insert a dummy site.
--INSERT INTO swsite (sws_name, sws_short_name, sws_site_uri, sws_user_uri, sws_work_uri) VALUES( 'dummySite', 'dummySite', 'dummy://DummySite', 'dummy://DummySite/User:', 'dummy://DummySite/Work:');


CREATE SEQUENCE swauthor_swa_id_seq MINVALUE 0 START WITH 0;
CREATE TABLE swauthor (
  -- The author's ID.
	swa_id          INTEGER PRIMARY KEY DEFAULT nextval('swauthor_swa_id_seq'),
  -- Concatenated with swsite.sws_user_uri, should identify the work unambingously.
	swa_uri_part    TEXT NOT NULL,
	swa_user_name   TEXT,
	swa_real_name   TEXT,
	swa_site        INTEGER NOT NULL REFERENCES swsite(sws_id) ON DELETE RESTRICT
);

-- Insert a dummy author.
--INSERT INTO swauthor (swa_uri_part, swa_user_name, swa_real_name, swa_site) VALUES( 'DummyAuthor', 'DummyAuthor', 'DummyAuthor', 0);


--
-- Table structure for table srcwork
--
-- All RDF information about a source work is stored here, one source work per row. 
-- A source work is identified either by its ID or by the about-date pair. 
--
CREATE SEQUENCE srcwork_srcwork_id_seq MINVALUE 0 START WITH 0;
CREATE TABLE srcwork (
  -- A unique ID for each source work.
  srcwork_id        INTEGER PRIMARY KEY DEFAULT nextval('srcwork_srcwork_id_seq'),
  -- Concatenated with swsite.sws_work_uri, should identify the work unambingously.
  srcwork_uri_part  TEXT NOT NULL,
  -- Extracted from RDF. The version data of the work, stored as MW timestamp.
  srcwork_date      TIMESTAMPTZ NOT NULL,
  -- Usefull or not? Intended to be some short form of about usable for listings.
  srcwork_title     TEXT NOT NULL DEFAULT '',
  -- The creator's id.
  srcwork_creator   INTEGER NOT NULL REFERENCES swauthor(swa_id) ON DELETE RESTRICT,
  -- The site's id.
  srcwork_site      INTEGER NOT NULL REFERENCES swsite(sws_id) ON DELETE RESTRICT
);
-- Identifies the work if id not known.
CREATE UNIQUE INDEX srcwork_uridate_unique ON srcwork (srcwork_site, srcwork_uri_part, srcwork_date);

-- Insert a dummy source work.
--INSERT INTO srcwork (srcwork_uri_part, srcwork_date, srcwork_creator, srcwork_site) VALUES( 'DummySrcwork', to_timestamp( 0), 0, 0);


CREATE TABLE swauthor_links (
  -- The source work's ID as used in 'srcwork.srcwork_id'.
  swal_srcworkid    INTEGER NOT NULL REFERENCES srcwork(srcwork_id) ON DELETE CASCADE,
  -- The source work's author's ID as used in 'swauthor.swa_id'.
  swal_authorid     INTEGER NOT NULL REFERENCES swauthor(swa_id) ON DELETE RESTRICT
);
CREATE UNIQUE INDEX swal_srcwork_author_unique ON swauthor_links (swal_srcworkid, swal_authorid);


CREATE TABLE swsource_links (
  -- The source work's ID as used in 'srcwork.srcwork_id'.
  swsl_workid       INTEGER NOT NULL REFERENCES srcwork(srcwork_id) ON DELETE CASCADE,
  -- The source work's own source ID as used in 'srcwork.srcwork_id'.
  swsl_sourceid     INTEGER NOT NULL REFERENCES srcwork(srcwork_id) ON DELETE RESTRICT,
  swsl_comment      TEXT NOT NULL DEFAULT ''
);
CREATE UNIQUE INDEX swsl_work_source_unique ON swsource_links (swsl_workid, swsl_sourceid);


--
-- Table structure for table revsrc
--
-- This table links source works to revisions. Only the first revision of an article
-- that is derived from a source should be linked to its source.
-- Each revision may have more than one source work.
-- Vice versa, one source work may be attributed by more than one revision.
-- Each line holds one revision-source pair plus some additional info.
-- Thus, we use 'revsrc_rs' as unique KEY.
CREATE TABLE revsrc (
  -- The revision's ID as used in 'revision.rev_id'.
  revsrc_revid      INTEGER NOT NULL REFERENCES revision(rev_id) ON DELETE CASCADE,
  -- The source work's ID as used in 'srcwork.srcwork_id'.
  revsrc_srcworkid  INTEGER NOT NULL REFERENCES srcwork(srcwork_id) ON DELETE RESTRICT,
  -- A MW timestamp when the attribution was made.
  revsrc_timestamp  TIMESTAMPTZ NOT NULL,
  -- The user who has made the attribution.
  revsrc_user       INTEGER NOT NULL,
  revsrc_user_text  TEXT NOT NULL,
  revsrc_comment    TEXT NOT NULL DEFAULT ''
);
CREATE UNIQUE INDEX revsrc_rs_unique ON revsrc (revsrc_revid, revsrc_srcworkid);
CREATE INDEX revsrc_revid_index ON revsrc (revsrc_revid);
CREATE INDEX revsrc_timestamp_index ON revsrc (revsrc_timestamp);


COMMIT;
