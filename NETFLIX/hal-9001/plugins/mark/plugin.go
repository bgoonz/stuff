package mark

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
	"strings"
	"time"

	"github.com/netflix/hal-9001/hal"
)

var log hal.Logger

type Mark struct {
	Timestamp time.Time `json:"timestamp"`
	User      string    `json:"user"`
	Room      string    `json:"room"`
	Broker    string    `json:"broker"`
	Note      string    `json:"note"`
}

const MarkTable = `
CREATE TABLE IF NOT EXISTS marks (
  ts       TIMESTAMP,
  user     VARCHAR(191),
  room     VARCHAR(191),
  broker   VARCHAR(191),
  note     TEXT,
  PRIMARY KEY (ts,user,room,broker)
)`

func Register() {
	mark := hal.Plugin{
		Name:    "mark",
		Command: "mark",
		Func:    mark,
	}
	mark.Register()

	hal.SqlInit(MarkTable)

	http.HandleFunc("/v1/marks", httpGetMarks)
}

func mark(evt hal.Evt) {
	args := evt.BodyAsArgv()
	// check for !marks list or !marks --list and do that instead
	if len(args) > 1 && (args[1] == "list" || args[1] == "--list") {
		listMarks(evt)
		return
	}

	// strip the leading "!mark "
	note := strings.TrimSpace(evt.Body)
	note = strings.TrimPrefix(note, "!mark")
	note = strings.TrimSpace(note)

	sql := `INSERT INTO marks (ts, user, room, broker, note) VALUES (?, ?, ?, ?, ?)`
	_, err := hal.SqlDB().Exec(sql, evt.Time, evt.UserId, evt.RoomId, evt.BrokerName(), note)
	if err != nil {
		log.Printf("Could not insert mark into database: %s\n", err)
	}

	log.Printf("Mark added at %s with note %q", evt.Time, note)

	evt.Replyf("Mark added at %s with note %q", evt.Time, note)
}

func listMarks(evt hal.Evt) {
	marks, err := FetchMarks(evt.RoomId, 50)
	if err != nil {
		evt.Replyf("could not fetch marks: '%s'", err)
		return
	}

	data := make([][]string, len(marks))
	for i, mark := range marks {
		user := evt.Broker.UserIdToName(mark.User)
		data[i] = []string{mark.Timestamp.String(), user, mark.Note}
	}

	evt.ReplyTable([]string{"Time", "User", "Note"}, data)
}

func httpGetMarks(w http.ResponseWriter, r *http.Request) {
	marks, err := FetchMarks("", 50)
	if err != nil {
		http.Error(w, fmt.Sprintf("could not fetch marks: '%s'", err), 500)
		return
	}

	js, err := json.Marshal(marks)
	if err != nil {
		http.Error(w, fmt.Sprintf("could not marshal marks to json: '%s'", err), 500)
		return
	}

	w.Write(js)
}

func FetchMarks(room string, limit int) ([]Mark, error) {
	db := hal.SqlDB()

	sql := `SELECT UNIX_TIMESTAMP(ts) AS ts, user, room, broker, note
	        FROM marks
			WHERE ts < ? AND ts > ?`

	// temporary - these will be parameters eventually
	// will probably also add query gen for filtering by user/room/broker
	now := time.Now()
	yesterday := now.Add(-time.Hour * 24)

	params := make([]interface{}, 2)
	params[0] = &now
	params[1] = &yesterday

	if room != "" {
		sql = sql + " AND room=?"
		params = append(params, &room)
	}
	sql = sql + " ORDER BY ts DESC"

	rows, err := db.Query(sql, params...)
	if err != nil {
		log.Printf("marks query failed: %s\n", err)
		return nil, err
	}
	defer rows.Close()

	marks := make([]Mark, 0)

	for rows.Next() {
		mark := Mark{}

		var ts int64
		err = rows.Scan(&ts, &mark.User, &mark.Room, &mark.Broker, &mark.Note)
		if err != nil {
			log.Printf("Row iteration failed: %s\n", err)
			return nil, err
		}

		mark.Timestamp = time.Unix(ts, 0)

		marks = append(marks, mark)
	}

	return marks, nil
}
