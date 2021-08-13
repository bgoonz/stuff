ALTER TABLE /*_*/aft_feedback
  ADD COLUMN aft_noaction boolean NOT NULL DEFAULT 0,
  DROP INDEX /*i*/relevance,
  DROP INDEX /*i*/age,
  DROP INDEX /*i*/helpful,
  ADD INDEX /*i*/relevance (aft_relevance_score, aft_id, aft_has_comment, aft_oversight, aft_hide),
  ADD INDEX /*i*/age (aft_timestamp, aft_id, aft_has_comment, aft_oversight, aft_hide),
  ADD INDEX /*i*/helpful (aft_net_helpful, aft_id, aft_has_comment, aft_oversight, aft_hide);
