CREATE TABLE /*_*/datamodel_sample (
  ds_id binary(32) NOT NULL PRIMARY KEY,
  ds_shard integer unsigned NOT NULL,
  ds_title varchar(255) binary NOT NULL DEFAULT '',
  ds_email varchar(255) binary DEFAULT NULL,
  ds_visible boolean NOT NULL,
  ds_timestamp varbinary(14) DEFAULT NULL
) /*$wgDBTableOptions*/;

-- sort indexes
CREATE INDEX /*i*/idx_title ON /*_*/datamodel_sample (ds_title, ds_id, ds_visible);
CREATE INDEX /*i*/idx_timestamp ON /*_*/datamodel_sample (ds_timestamp, ds_id, ds_visible);
