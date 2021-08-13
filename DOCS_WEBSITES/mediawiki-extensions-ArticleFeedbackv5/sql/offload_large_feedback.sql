CREATE TABLE IF NOT EXISTS /*_*/aft_article_answer_text (
  aat_id            integer unsigned NOT NULL AUTO_INCREMENT,
  aat_response_text text NOT NULL,
  PRIMARY KEY (aat_id)
) /*$wgDBTableOptions*/;

ALTER TABLE /*_*/aft_article_answer
  ADD COLUMN aat_id integer unsigned NULL AFTER aa_response_text;

INSERT INTO aft_article_answer_text (aat_response_text)
  SELECT aa_response_text
  FROM aft_article_answer
  WHERE LENGTH(aa_response_text) > 255;

UPDATE aft_article_answer AS aa
INNER JOIN aft_article_answer_text AS aat ON aa_response_text = aat_response_text
SET aa.aat_id = aat.aat_id;

ALTER TABLE /*_*/aft_article_answer
  CHANGE aa_response_text aa_response_text varchar(255);