CREATE TABLE IF NOT EXISTS /*_*/ajaxpoll_vote (
  `poll_vote_id` int unsigned NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `poll_id` varchar(32) NOT NULL default '',
  `poll_actor` bigint unsigned NOT NULL,
  `poll_ip` varchar(255) default NULL,
  `poll_answer` int(3) default NULL,
  `poll_date` datetime default NULL
) /*$wgDBTableOptions*/;

CREATE UNIQUE INDEX /*i*/poll_id_actor ON /*_*/ajaxpoll_vote (poll_id, poll_actor);
