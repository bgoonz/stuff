--
-- Schema for DeviceMapLogCapture
--

CREATE TABLE IF NOT EXISTS /*_*/device_map_log_capture (
	-- Timestamp
	action_time char(14) NOT NULL,

	-- session id
	session_id varbinary(255) NOT NULL,

	-- site being used
	site varbinary(255) NOT NULL,

	-- event ID (not unique)
	event_id integer NOT NULL,

	-- dmap value
	dmap text NOT NULL,

	-- country_code
	country_code char(2),

	-- user_agent
	user_agent text NOT NULL

) /*$wgDBTableOptions*/;

CREATE INDEX /*i*/device_map_log_capture_action_time ON /*_*/device_map_log_capture (action_time);
CREATE INDEX /*i*/device_map_log_capture_event_id ON /*_*/device_map_log_capture (event_id);
CREATE INDEX /*i*/device_map_log_capture_session_id ON /*_*/device_map_log_capture (session_id);
