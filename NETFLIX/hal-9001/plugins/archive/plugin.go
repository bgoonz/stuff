package archive

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
	"github.com/nlopes/slack"
)

var log hal.Logger

// ArchiveEntry is a single event observed by the archive plugin.
type ArchiveEntry struct {
	ID        string    `json:"id"`
	Timestamp time.Time `json:"timestamp"`
	User      string    `json:"user"`
	Room      string    `json:"room"`
	Broker    string    `json:"broker"`
	Body      string    `json:"body"`
	Reactions []string  `json:"reactions"`
}

// ArchiveTable stores events for posterity.
// The brokers currently supported do not provide a surrogate event id
// and instead rely on the timestamp/user/room for identity.
const ArchiveTable = `
CREATE TABLE IF NOT EXISTS archive (
  id       VARCHAR(191),
  user     VARCHAR(191),
  room     VARCHAR(191),
  broker   VARCHAR(191),
  ts       TIMESTAMP,
  body     TEXT,
  PRIMARY KEY (id,user,room,broker)
)`

const ReactionTable = `
CREATE TABLE IF NOT EXISTS reactions (
  id       VARCHAR(191),
  user     VARCHAR(191),
  room     VARCHAR(191),
  broker   VARCHAR(191),
  ts       TIMESTAMP,
  reaction VARCHAR(191),
  PRIMARY KEY (ts,user,room,broker)
)`

func Register() {
	archive := hal.Plugin{
		Name:      "message_archive",
		Func:      archiveRecorder,
		BotEvents: true,
	}
	archive.Register()

	reactions := hal.Plugin{
		Name:      "reaction_tracker",
		Func:      archiveReaction,
		BotEvents: true,
	}
	reactions.Register()

	// apply the schema to the database as necessary
	hal.SqlInit(ArchiveTable)
	hal.SqlInit(ReactionTable)

	http.HandleFunc("/v1/archive", httpGetArchive)
}

// ArchiveRecorder inserts every message received into the database for use
// by other parts of the system.
func archiveRecorder(evt hal.Evt) {
	// ignore non-chat events for the archive (e.g. reaction added, etc.)
	if !evt.IsChat {
		return
	}

	// ignore bot commands prefixed with !
	if strings.HasPrefix(strings.TrimSpace(evt.Body), "!") {
		return
	}

	sql := `INSERT INTO archive (id, user, room, broker, ts, body) VALUES (?, ?, ?, ?, ?, ?)`
	_, err := hal.SqlDB().Exec(sql, evt.ID, evt.UserId, evt.RoomId, evt.BrokerName(), evt.Time, evt.Body)
	if err != nil {
		log.Printf("Could not insert event into archive: %s\n", err)
	}
}

// archiveReactionAdded switches on the type of the original message and calls a
// broker-specific function to pull out the reaction and write it to the database.
func archiveReaction(evt hal.Evt) {
	// ignore events marked as chats since they can't be reactions
	if evt.IsChat {
		return
	}

	switch evt.Original.(type) {
	case *slack.ReactionAddedEvent:
		log.Printf("adding reaction: (%T) %q\n", evt.Original, evt.Body)
		rae := evt.Original.(*slack.ReactionAddedEvent)
		insertReaction(evt.Time, rae.Item.Timestamp, evt.UserId, evt.RoomId, evt.BrokerName(), rae.Reaction)
	case *slack.ReactionRemovedEvent:
		log.Printf("deleting reaction: (%T) %q\n", evt.Original, evt.Body)
		rre := evt.Original.(*slack.ReactionRemovedEvent)

		// TODO: handle files & file comments
		deleteReaction(rre.Item.Timestamp, evt.UserId, rre.Item.Channel, evt.BrokerName(), rre.Reaction)
	default:
		return
	}
}

func insertReaction(ts time.Time, id, user, room, broker, reaction string) {
	sql := `INSERT INTO reactions (id,user,room,broker,ts,reaction) VALUES (?,?,?,?,?,?)`
	_, err := hal.SqlDB().Exec(sql, id, user, room, broker, ts, reaction)
	if err != nil {
		log.Printf("Could not insert reaction into reactions table: %s\n", err)
	}
}

func deleteReaction(id, user, room, broker, reaction string) {
	sql := `DELETE FROM reactions WHERE id=? AND user=? AND room=? AND broker=? AND reaction=?`
	_, err := hal.SqlDB().Exec(sql, id, user, room, broker, reaction)
	if err != nil {
		log.Printf("Could not delete reaction from reactions table: %s\n", err)
	}
}

// httpGetArchive retreives the 50 latest items from the event archive.
func httpGetArchive(w http.ResponseWriter, r *http.Request) {
	aes, err := FetchArchive(50)
	if err != nil {
		http.Error(w, fmt.Sprintf("could not fetch message archive: '%s'", err), 500)
		return
	}

	js, err := json.Marshal(aes)
	if err != nil {
		http.Error(w, fmt.Sprintf("could not marshal archive to json: '%s'", err), 500)
		return
	}

	w.Write(js)
}

// FetchArchive selects messages from the archive table up to the provided number of messages limit.
func FetchArchive(limit int) ([]*ArchiveEntry, error) {
	db := hal.SqlDB()

	// joining reactions in here for now - might be better to let the client do it
	// but for now get something working
	// This pulls back multiple rows if there are multiple reactions. The row iteration
	// below uses a map to dedupe the archive rows and put reactions into a list.
	// This might be better written with GROUP_CONCAT later...
	sql := `SELECT a.id AS id,
	               UNIX_TIMESTAMP(a.ts) AS ts,
				   a.user AS user,
				   a.room AS room,
				   a.broker AS broker,
				   a.body AS body,
				   IFNULL(r.reaction,"") AS reaction
	          FROM archive a
			  LEFT OUTER JOIN reactions r ON ( r.id = a.id AND r.room = a.room )
			  WHERE a.ts < ? AND a.ts > ?
			  GROUP BY a.id
			  ORDER BY a.ts DESC`

	now := time.Now()
	yesterday := now.Add(-time.Hour * 24)
	rows, err := db.Query(sql, &now, &yesterday)
	if err != nil {
		log.Printf("archive query failed: %s\n", err)
		return nil, err
	}
	defer rows.Close()

	entries := make(map[string]*ArchiveEntry)

	for rows.Next() {
		var ts int64
		var id, room, user, broker, body, reaction string
		err = rows.Scan(&id, &ts, &user, &room, &broker, &body, &reaction)
		if err != nil {
			log.Printf("Row iteration failed: %s\n", err)
			return nil, err
		}

		if entry, exists := entries[id]; exists {
			if reaction != "" {
				entry.Reactions = append(entry.Reactions, reaction)
			}
		} else {
			ae := ArchiveEntry{
				ID:        id,
				Timestamp: time.Unix(ts, 0),
				Broker:    broker,
				Body:      body,
				Reactions: []string{},
			}

			if reaction != "" {
				ae.Reactions = append(ae.Reactions, reaction)
			}

			// convert ids to names
			broker := hal.Router().GetBroker(ae.Broker)
			ae.Room = broker.RoomIdToName(room)
			ae.User = broker.UserIdToName(user)

			entries[id] = &ae
		}
	}

	// hmm might want to sort these before sending...
	aes := make([]*ArchiveEntry, len(entries))
	var i int
	for _, ae := range entries {
		aes[i] = ae
		i++
	}

	return aes, nil
}
