CREATE TABLE IF NOT EXISTS ajaxpoll_info (
  poll_id TEXT NOT NULL PRIMARY KEY default '',
  poll_txt TEXT,
  poll_show_results_before_voting SMALLINT,
  poll_date TIMESTAMPTZ default NULL
);
