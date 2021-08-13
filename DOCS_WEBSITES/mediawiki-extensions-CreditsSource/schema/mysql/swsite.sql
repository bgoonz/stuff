-- Create new columns
DROP /*i*/INDEX swauthor_namesite_unique ON /*_*/swauthor;
ALTER TABLE /*_*/swauthor
  CHANGE COLUMN swa_uri swa_uri_part varbinary(255) NOT NULL,
  CHANGE COLUMN swa_site swa_site int unsigned;
CREATE UNIQUE INDEX /*i*/swauthor_namesite_unique ON /*_*/swauthor (swa_site,swa_uri_part,swa_user_name);

DROP /*i*/INDEX srcwork_uridate_unique ON /*_*/srcwork;
ALTER TABLE /*_*/srcwork
  CHANGE COLUMN srcwork_uri srcwork_uri_part varbinary(255) NOT NULL,
  ADD COLUMN srcwork_site int unsigned;
CREATE UNIQUE INDEX /*i*/srcwork_uridate_unique ON /*_*/srcwork (srcwork_site,srcwork_uri_part,srcwork_date);


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
