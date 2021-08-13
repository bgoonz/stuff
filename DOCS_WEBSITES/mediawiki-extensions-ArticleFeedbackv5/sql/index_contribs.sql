CREATE INDEX /*i*/contribs ON /*_*/aft_feedback (aft_user, aft_timestamp);
CREATE INDEX /*i*/contribs_anon ON /*_*/aft_feedback (aft_user, aft_user_text, aft_timestamp);
