package roster

/*
 * Copyright 2016-2017 Netflix, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/netflix/hal-9001/hal"
)

var log hal.Logger

type RosterUser struct {
	Broker    string    `json: broker` // broker name e.g. slack, hipchat
	User      string    `json: user`
	Room      string    `json: room`
	Timestamp time.Time `json: timestamp`
}

const ROSTER_TABLE = `
CREATE TABLE IF NOT EXISTS roster (
	broker VARCHAR(191) NOT NULL,
	user   VARCHAR(191) NOT NULL,
	room   VARCHAR(191) DEFAULT NULL,
	ts     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY (broker, user, room)
)`

func Register() {
	// rostertracker gets all messages and keeps a database of when users
	// were last seen to support !last, and the web roster.
	roster := hal.Plugin{
		Name: "roster_tracker",
		Func: rostertracker,
	}
	roster.Register()

	rostercmd := hal.Plugin{
		Name:  "roster_command",
		Func:  rosterlast,
		Regex: "!last",
	}
	rostercmd.Register()

	hal.SqlInit(ROSTER_TABLE)

	http.HandleFunc("/v1/roster", webroster)
}

// rostertracker is called for every message. It grabs the user and current
// time and throws it into the db for later use.
func rostertracker(msg hal.Evt) {
	db := hal.SqlDB()

	sql := `INSERT INTO roster
	          (broker, user, room, ts)
	        VALUES (?,?,?,?)
	        ON DUPLICATE KEY
	        UPDATE broker=?, user=?, room=?, ts=?`

	params := []interface{}{
		msg.BrokerName(), msg.User, msg.Room, msg.Time,
		msg.BrokerName(), msg.User, msg.Room, msg.Time,
	}

	_, err := db.Exec(sql, params...)
	if err != nil {
		log.Printf("roster_tracker write failed: %s", err)
	}
}

// rosterlast is the response to !last that causes the bot to reply via DM
// to the user with a table of when users last posted a message to slack
// rather than relying on status, which is usually useless.
func rosterlast(msg hal.Evt) {
	rus, err := GetRoster()
	if err != nil {
		log.Printf("Error while retreiving roster: %s\n", err)
		return
	}

	// TODO: ASCII art instead of JSON
	js, err := json.MarshalIndent(rus, "", "    ")
	if err != nil {
		log.Printf("JSON marshaling failed: %s\n", err)
		return
	}

	msg.Replyf("```%s```", string(js))
}

func webroster(w http.ResponseWriter, r *http.Request) {
	rus, err := GetRoster()
	if err != nil {
		http.Error(w, fmt.Sprintf("could not fetch roster: '%s'", err), 500)
		return
	}

	js, err := json.Marshal(rus)
	if err != nil {
		http.Error(w, fmt.Sprintf("could not marshal roster to json: '%s'", err), 500)
		return
	}

	w.Write(js)
}

func GetRoster() ([]*RosterUser, error) {
	db := hal.SqlDB()

	sql := `SELECT broker, user, room,
	               UNIX_TIMESTAMP(ts) AS ts
	               FROM roster
	               ORDER BY ts DESC`

	rows, err := db.Query(sql)
	if err != nil {
		log.Printf("Roster query failed: %s\n", err)
		return nil, err
	}
	defer rows.Close()

	rus := []*RosterUser{}

	for rows.Next() {
		ru := RosterUser{}

		var ts int64
		err = rows.Scan(&ru.Broker, &ru.User, &ru.Room, &ts)
		if err != nil {
			log.Printf("Row iteration failed: %s\n", err)
			return nil, err
		}

		ru.Timestamp = time.Unix(ts, 0)

		rus = append(rus, &ru)
	}

	return rus, nil
}
