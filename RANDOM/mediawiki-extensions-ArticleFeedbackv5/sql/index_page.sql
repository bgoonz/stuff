CREATE INDEX /*i*/relevance_page ON /*_*/aft_feedback (aft_page, aft_relevance_score);
CREATE INDEX /*i*/age_page ON /*_*/aft_feedback (aft_page, aft_timestamp);
CREATE INDEX /*i*/helpful_page ON /*_*/aft_feedback (aft_page, aft_net_helpful);
