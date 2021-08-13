-- add archive-related columns/indexes to schema
ALTER TABLE /*_*/aft_feedback
  ADD COLUMN aft_archive boolean NOT NULL DEFAULT 0,
  ADD COLUMN aft_archive_date varbinary(14) DEFAULT NULL,
  DROP INDEX /*i*/relevance,
  DROP INDEX /*i*/age,
  DROP INDEX /*i*/helpful,
  ADD INDEX /*i*/relevance (aft_relevance_score, aft_id, aft_has_comment, aft_oversight, aft_archive, aft_hide),
  ADD INDEX /*i*/age (aft_timestamp, aft_id, aft_has_comment, aft_oversight, aft_archive, aft_hide),
  ADD INDEX /*i*/helpful (aft_net_helpful, aft_id, aft_has_comment, aft_oversight, aft_archive, aft_hide),
  ADD INDEX /*i*/archive_queue (aft_archive, aft_archive_date);

-- set archive dates (= creation date) for existing unmonitored feedback
-- running setArchiveDate.php maintenance script will then fill out the correct archive date
UPDATE /*_*/aft_feedback SET aft_archive_date = aft_timestamp WHERE aft_hide = 0 AND aft_feature = 0 AND aft_resolve = 0 AND aft_noaction = 0;
