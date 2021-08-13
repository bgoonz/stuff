// blabber records events as word pairs with counts and can
// use that data to generate text
// This is an experiment and work-in-progress. I haven't built
// one of these before...
package blabber

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
	"bytes"
	"fmt"
	"math/rand"
	"strings"

	"github.com/netflix/hal-9001/hal"
)

var log hal.Logger

type wncRow struct {
	word  string
	next  string
	count int
}

type qFrag struct {
	empty  bool
	sql    string
	params []interface{}
}

// a table tracking words said in the attached chatroom, hopefully
// suitable for quick & dirty markov-style chatterbot stuff
const BLABBERWORDS_TABLE = `
CREATE TABLE IF NOT EXISTS blabberwords (
  word     VARCHAR(191),  -- the word seen in the room
  user     VARCHAR(191),  -- the user who said it
  room     VARCHAR(191),  -- the chat room it was said in
  next     VARCHAR(191),  -- the word after it
  count    int,           -- how many times this pair has been seen
  ts       TIMESTAMP,     -- when it was last said (not indexed for now)
  PRIMARY KEY (word, user, room, next)
)`

func Register() {
	bw := hal.Plugin{
		Name: "blabberwords",
		Func: bwCounter,
	}
	bw.Register()

	bb := hal.Plugin{
		Name:    "blab",
		Func:    blab,
		Command: "blab",
	}
	bb.Register()

	// apply the schema to the database as necessary
	hal.SqlInit(BLABBERWORDS_TABLE)
}

func bwCounter(evt hal.Evt) {
	parts := evt.BodyAsArgv()

	// ignore really short lines or commands
	// TODO: ignore the bot too and add prefs for things to ignore
	if len(parts) < 2 || strings.HasPrefix(strings.TrimSpace(parts[0]), "!") {
		return
	}

	db := hal.SqlDB()

	sql := `INSERT INTO blabberwords
	          (word,user,room,next,count)
	        VALUES (?, ?, ?, ?, 1)
	        ON DUPLICATE KEY UPDATE
			  count=values(count) + 1`

	query, err := db.Prepare(sql)
	if err != nil {
		log.Printf("Could not prepare insert query: %s", err)
		return
	}

	for i, word := range parts {
		next := ""
		// first word will have word="", next="first"
		// last word will have word="whatever", next=""
		if i == 0 {
			next = word
			word = ""
		} else if i < len(parts)-1 {
			next = parts[i+1]
		}

		tword := strings.TrimRight(word, ".?!")
		tnext := strings.TrimRight(next, ".?!")

		_, err = query.Exec(tword, evt.User, evt.Room, tnext)
		if err != nil {
			log.Printf("prepared insert into blabberwords failed: %s", err)
			continue
		}
	}
}

// !blab --user atobey
// !blab --user atobey --room incidents
// !blab --room incidents
// !blab --user atobey,dhahn,jhorowitz ???
// !blab --user dhahn
// TODO: figure out a non-insane way to build a sentence around a specific word or words
func blab(evt hal.Evt) {
	users := []string{}
	rooms := []string{}
	argv := evt.BodyAsArgv()

	for i, arg := range argv {
		switch arg {
		case "--user":
			found := extractArgs(argv, i)
			users = append(users, found...)
		case "--room":
			found := extractArgs(argv, i)
			rooms = append(rooms, found...)
		}
	}

	userFrag := mkQueryFragment("user", users)
	roomFrag := mkQueryFragment("room", rooms)

	// start with a random first word given the provided constraints
	first := firstWord(userFrag, roomFrag)
	words := []wncRow{first}
	for {
		next := nextWord(words[len(words)-1], userFrag, roomFrag)
		words = append(words, next)

		log.Printf("BLAB: %+v", words)

		// found a last word
		if next.next == "" {
			break
		}

		// stop trying after 20 words
		if len(words) > 20 {
			break
		}
	}

	evt.Reply(rowsToString(words))
}

// for now, completely random, will add in probability later...
func nextWord(current wncRow, userFrag, roomFrag qFrag) wncRow {
	sqlbuf := bytes.NewBufferString("SELECT word,next,count FROM blabberwords WHERE word=? ")
	params := []interface{}{current.next}

	if !userFrag.empty {
		sqlbuf.WriteString(" AND ")
		sqlbuf.WriteString(userFrag.sql)
		params = append(params, userFrag.params...)
	}

	if !roomFrag.empty {
		sqlbuf.WriteString(" AND ")
		sqlbuf.WriteString(roomFrag.sql)
		params = append(params, roomFrag.params...)
	}

	rows := getRows(sqlbuf.String(), params)

	if len(rows) == 0 {
		log.Printf("blabber.nextWord got 0 rows, returning empty row")
		return wncRow{"", "", 0}
	}

	idx := rand.Intn(len(rows) - 1)
	return rows[idx]
}

func rowsToString(rows []wncRow) string {
	words := make([]string, len(rows))

	for i, val := range rows {
		words[i] = val.word
	}

	return strings.Join(words, " ")
}

func getRows(sql string, params []interface{}) []wncRow {
	db := hal.SqlDB()

	log.Printf("Running query: %q\n%+v\n", sql, params)

	rows, err := db.Query(sql, params...)
	if err != nil {
		log.Printf("blabberwords query %q failed: %s", sql, err)
		return []wncRow{}
	}

	wncs := []wncRow{}
	for rows.Next() {
		wnc := wncRow{}
		err = rows.Scan(&wnc.word, &wnc.next, &wnc.count)
		if err != nil {
			log.Printf("blabberwords query scan failed: %s", err)
			return wncs
		}

		wncs = append(wncs, wnc)
	}

	return wncs
}

func firstWord(userFrag, roomFrag qFrag) wncRow {
	sqlbuf := bytes.NewBufferString("SELECT word,next,count FROM blabberwords WHERE word='' ")
	params := []interface{}{}

	if !userFrag.empty {
		sqlbuf.WriteString(" AND ")
		sqlbuf.WriteString(userFrag.sql)
		params = append(params, userFrag.params...)
	}

	if !roomFrag.empty {
		sqlbuf.WriteString(" AND ")
		sqlbuf.WriteString(roomFrag.sql)
		params = append(params, roomFrag.params...)
	}

	// will get back a list (potentially large) of candidates
	wncs := getRows(sqlbuf.String(), params)

	// when now rows are returned, just say "FAIL"
	if len(wncs) == 0 {
		return wncRow{"FAIL", "", 0}
	}

	idx := rand.Intn(len(wncs) - 1)

	return wncs[idx]
}

func mkQueryFragment(col string, list []string) qFrag {
	if len(list) == 0 {
		return qFrag{true, "", []interface{}{}}
	}

	params := make([]interface{}, len(list))
	frags := make([]string, len(list))

	for i, item := range list {
		frags[i] = fmt.Sprintf("%s=?", col)
		params[i] = item
	}

	sql := " ( " + strings.Join(frags, " OR ") + " ) "

	return qFrag{false, sql, params}
}

func extractArgs(argv []string, i int) []string {
	out := []string{}

	// out of bounds, nothing to do
	if i < len(argv)-2 {
		return out
	}

	clean := strings.Replace(argv[i+1], " ", "", -1)
	return strings.Split(clean, ",")
}
