BEGIN;
SET client_min_messages = 'ERROR';


-- Create new columns
DROP INDEX swauthor_namesite_unique;
ALTER TABLE swauthor
  RENAME COLUMN swa_uri TO swa_uri_part,
  ALTER COLUMN swa_site TYPE INTEGER;
CREATE UNIQUE INDEX swauthor_namesite_unique ON swauthor (swa_site,swa_uri_part,swa_user_name);

DROP INDEX srcwork_uridate_unique;
ALTER TABLE srcwork
  RENAME COLUMN srcwork_uri TO srcwork_uri_part,
  ADD COLUMN srcwork_site INTEGER;
CREATE UNIQUE INDEX srcwork_uridate_unique ON srcwork (srcwork_site,srcwork_uri_part,srcwork_date);


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


COMMIT;
