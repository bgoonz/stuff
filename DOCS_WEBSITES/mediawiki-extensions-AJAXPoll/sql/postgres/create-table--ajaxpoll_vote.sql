DROP SEQUENCE IF EXISTS ajaxpoll_vote_poll_vote_id_seq CASCADE;
CREATE SEQUENCE ajaxpoll_vote_poll_vote_id_seq;

CREATE TABLE IF NOT EXISTS ajaxpoll_vote (
  poll_vote_id INTEGER NOT NULL PRIMARY KEY DEFAULT nextval('ajaxpoll_vote_poll_vote_id_seq'),
  poll_id TEXT NOT NULL default '',
  poll_actor INTEGER NOT NULL,
  poll_ip TEXT default NULL,
  poll_answer SMALLINT default NULL,
  poll_date TIMESTAMPTZ default NULL
);

ALTER SEQUENCE ajaxpoll_vote_poll_vote_id_seq OWNED BY ajaxpoll_vote.poll_vote_id;

CREATE UNIQUE INDEX poll_id_actor ON ajaxpoll_vote (poll_id, poll_actor);
