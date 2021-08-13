package hal

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
	"sort"
	"strings"
)

// provides a persistent configuration store

// Order of precendence for prefs:
// user -> room -> broker -> plugin -> global -> default

// PrefsTable contains the SQL to create the prefs table
// key field is called pkey because key is a reserved word
const PrefsTable = `
CREATE TABLE IF NOT EXISTS prefs (
	 id      INT NOT NULL AUTO_INCREMENT, -- only used for deleting/updating by id
	 user    VARCHAR(191) DEFAULT "",
	 room    VARCHAR(191) DEFAULT "",
	 broker  VARCHAR(191) DEFAULT "",
	 plugin  VARCHAR(191) DEFAULT "",
	 pkey    VARCHAR(191) NOT NULL,
	 value   MEDIUMTEXT,
	 INDEX(id), -- required by mysql for non-PK auto_increment
	 -- InnoDB limits indexes to 767 bytes so have the PK only index the first
	 -- 32 characters of each column as a compromise
	 -- (5 cols * 4 bytes * 32 chars = 640)
	 PRIMARY KEY(user(32), room(32), broker(32), plugin(32), pkey(32))
)`

/*
   -- test data, will remove once there are automated tests
   INSERT INTO prefs (user,room,broker,plugin,pkey,value) VALUES ("tobert", "", "", "", "foo", "user");
   INSERT INTO prefs (user,room,broker,plugin,pkey,value) VALUES ("tobert", "CORE", "", "", "foo",
   "user-room");
   INSERT INTO prefs (user,room,broker,plugin,pkey,value) VALUES ("tobert", "CORE", "slack", "", "foo",
   "user-room-broker");
   INSERT INTO prefs (user,room,broker,plugin,pkey,value) VALUES ("tobert", "CORE", "slack", "uptime",
   "foo", "user-room-broker-plugin");
   INSERT INTO prefs (user,room,broker,plugin,pkey,value) VALUES ("tobert", "", "slack", "uptime", "foo",
   "user-broker-plugin");
   INSERT INTO prefs (user,room,broker,plugin,pkey,value) VALUES ("tobert", "CORE", "", "uptime",
   "foo", "user-room-plugin");
   INSERT INTO prefs (user,room,broker,plugin,pkey,value) VALUES ("tobert", "", "", "uptime", "foo",
   "user-plugin");
*/

// !prefs list --scope plugin --plugin autoresponder
// !prefs get --scope room --plugin autoresponder --room CORE --key timezone
// !prefs set --scope user --plugin autoresponder --room CORE

// Pref is a key/value pair associated with a combination of user, plugin,
// borker, or room.
type Pref struct {
	User    string `json:"user"`
	Plugin  string `json:"plugin"`
	Broker  string `json:"broker"`
	Room    string `json:"room"`
	Key     string `json:"key"`
	Value   string `json:"value"`
	Default string `json:"default"`
	Success bool   `json:"-"`
	Error   error  `json:"-"`
	Id      int    `json:"id"`
}

type Prefs []Pref

// GetPref will retreive the most-specific preference from pref
// storage using the parameters provided. This is a bit like pattern
// matching. If no match is found, the provided default is returned.
// TODO: explain this better
func GetPref(user, broker, room, plugin, key, def string) Pref {
	pref := Pref{
		User:    user,
		Room:    room,
		Broker:  broker,
		Plugin:  plugin,
		Key:     key,
		Default: def,
	}

	up := pref.Get()
	if up.Success {
		return up
	}

	// no match, return the default
	pref.Value = def
	return pref
}

// SetPref sets a preference and is shorthand for Pref{}.Set().
func SetPref(user, broker, room, plugin, key, value string) error {
	pref := Pref{
		User:   user,
		Room:   room,
		Broker: broker,
		Plugin: plugin,
		Key:    key,
		Value:  value,
	}

	return pref.Set()
}

// GetPrefs retrieves a set of preferences from the database. The
// settings are matched exactly on user,broker,room,plugin.
// e.g. GetPrefs("", "", "", "uptime") would get only records that
// have user/broker/room set to the empty string and room
// set to "uptime". A record with user "pford" and plugin "uptime"
// would not be included.
func GetPrefs(user, broker, room, plugin string) Prefs {
	pref := Pref{
		User:   user,
		Broker: broker,
		Room:   room,
		Plugin: plugin,
	}
	return pref.get()
}

// FindPrefs gets all records that match any of the inputs that are
// not empty strings. (hint: user="x", broker="y"; WHERE user=? OR broker=?)
func FindPrefs(user, broker, room, plugin, key string) Prefs {
	pref := Pref{
		User:   user,
		Broker: broker,
		Room:   room,
		Plugin: plugin,
		Key:    key,
	}
	return pref.find(false)
}

// RmPrefId removes a preference from the database by its numeric id.
func RmPrefId(id int) error {
	db := SqlDB()
	SqlInit(PrefsTable)

	_, err := db.Exec("DELETE FROM prefs WHERE id=?", &id)
	return err
}

// Get retrieves a value from the database. If the database returns
// an error, Success will be false and the Error field will be populated.
func (in *Pref) Get() Pref {
	prefs := in.get()

	if len(prefs) == 1 {
		return prefs[0]
	} else if len(prefs) > 1 {
		panic("TOO MANY PREFS")
	} else if len(prefs) == 0 {
		out := *in
		// only set success to false if there is also an error
		// queries with 0 rows are successful
		if out.Error != nil {
			out.Success = false
		} else {
			out.Success = true
			out.Value = out.Default
		}
		return out
	}

	panic("BUG: should be impossible to reach this point")
}

// GetPrefs returns all preferences that match the fields set in the handle.
func (in *Pref) GetPrefs() Prefs {
	return in.get()
}

func (in *Pref) get() Prefs {
	db := SqlDB()
	SqlInit(PrefsTable)

	sql := `SELECT user,room,broker,plugin,pkey,value,id
	        FROM prefs
	        WHERE user=?
			  AND room=?
			  AND broker=?
			  AND plugin=?`
	params := []interface{}{&in.User, &in.Room, &in.Broker, &in.Plugin}

	// only query by key if it's specified, otherwise get all keys for the selection
	if in.Key != "" {
		sql += " AND pkey=?"
		params = append(params, &in.Key)
	}

	rows, err := db.Query(sql, params...)
	if err != nil {
		log.Printf("Returning default due to SQL query failure: %s", err)
		return Prefs{}
	}

	defer rows.Close()

	out := make(Prefs, 0)

	for rows.Next() {
		p := *in

		err := rows.Scan(&p.User, &p.Room, &p.Broker, &p.Plugin, &p.Key, &p.Value, &p.Id)

		if err != nil {
			log.Printf("Returning default due to row iteration failure: %s", err)
			p.Success = false
			p.Value = in.Default
			p.Error = err
		} else {
			p.Success = true
			p.Error = nil
		}

		out = append(out, p)
	}

	return out
}

// Set writes the value and returns a new struct with the new value.
func (in *Pref) Set() error {
	db := SqlDB()
	err := SqlInit(PrefsTable)
	if err != nil {
		log.Printf("Failed to initialize the prefs table: %s", err)
		return err
	}

	sql := `INSERT INTO prefs
						(value,user,room,broker,plugin,pkey)
			VALUES (?,?,?,?,?,?)
			ON DUPLICATE KEY
			UPDATE value=?, user=?, room=?, broker=?, plugin=?, pkey=?`

	params := []interface{}{
		&in.Value, &in.User, &in.Room, &in.Broker, &in.Plugin, &in.Key,
		&in.Value, &in.User, &in.Room, &in.Broker, &in.Plugin, &in.Key,
	}

	_, err = db.Exec(sql, params...)
	if err != nil {
		log.Printf("Pref.Set() write failed: %s", err)
		return err
	}

	return nil
}

// Set writes the value and returns a new struct with the new value.
func (in *Pref) Delete() error {
	db := SqlDB()

	err := SqlInit(PrefsTable)
	if err != nil {
		log.Printf("Failed to initialize the prefs table: %s", err)
		return err
	}

	sql := `DELETE FROM prefs
			WHERE user=?
			  AND room=?
			  AND broker=?
			  AND plugin=?
			  AND pkey=?`

	// TODO: verify only one row was deleted
	_, err = db.Exec(sql, &in.User, &in.Room, &in.Broker, &in.Plugin, &in.Key)
	if err != nil {
		log.Printf("Pref.Delete() write failed: %s", err)
		return err
	}

	return nil
}

// Find retrieves all preferences from the database that match any field in the
// handle's fields. If the Key field is set, it is matched first.
// The resulting list is sorted before it is returned.
// Unlike Get(), empty string fields are not included in the (generated) query
// so it can potentially match a lot of rows.
// Returns an empty list and logs upon errors.
func (p Pref) Find() Prefs {
	return p.find(false)
}

func (p Pref) FindKey(key string) Prefs {
	p.Key = key
	return p.find(true)
}

// FindKey is like Find() but the provide key is required.
func FindKey(key string) Prefs {
	p := Pref{Key: key}
	return p.find(true)
}

func (p Pref) find(keyRequired bool) Prefs {
	db := SqlDB()
	SqlInit(PrefsTable)

	fields := make([]string, 0)
	params := make([]interface{}, 0)

	// NOTE: the order of these statements is important!
	if keyRequired {
		// ok for it to be "" to match no key, but still required
		// query is appended below
		params = append(params, p.Key)
	}

	if p.User != "" {
		fields = append(fields, "user=?")
		params = append(params, p.User)
	}

	if p.Room != "" {
		fields = append(fields, "room=?")
		params = append(params, p.Room)
	}

	if p.Broker != "" {
		fields = append(fields, "broker=?")
		params = append(params, p.Broker)
	}

	if p.Plugin != "" {
		fields = append(fields, "plugin=?")
		params = append(params, p.Plugin)
	}

	if !keyRequired && p.Key != "" {
		fields = append(fields, "pkey=?")
		params = append(params, p.Key)
	}

	q := bytes.NewBufferString("SELECT user,room,broker,plugin,pkey,value,id\n")
	q.WriteString("FROM prefs\n")

	if keyRequired || len(fields) > 0 {
		q.WriteString("\nWHERE ")
	}

	if keyRequired {
		q.WriteString("pkey=? AND (")
	}

	// TODO: maybe it's silly to make it easy for Find() to get all preferences
	// but let's cross that bridge when we come to it
	if len(fields) > 0 {
		// might make sense to add a param to this func to make it easy to
		// switch this between AND/OR for unions/intersections
		q.WriteString(strings.Join(fields, "\n  OR "))
	}

	if keyRequired {
		q.WriteString("\n)")
	}

	out := make(Prefs, 0)
	rows, err := db.Query(q.String(), params...)
	if err != nil {
		log.Println(q.String())
		log.Printf("Query failed: %s", err)
		return out
	}
	defer rows.Close()

	for rows.Next() {
		row := Pref{}
		err = rows.Scan(&row.User, &row.Room, &row.Broker, &row.Plugin, &row.Key, &row.Value, &row.Id)
		// improbable in practice - follows previously mentioned conventions for errors
		if err != nil {
			log.Printf("Fetching a row failed: %s\n", err)
			row.Error = err
			row.Success = false
			row.Value = p.Default
		} else {
			row.Error = nil
			row.Success = true
		}

		out = append(out, row)
	}

	sort.Sort(out)

	return out
}

// Clone returns a full/deep copy of the Prefs list.
func (prefs Prefs) Clone() Prefs {
	out := make(Prefs, len(prefs))

	for i, pref := range prefs {
		copy := pref
		out[i] = copy
	}

	return out
}

// One returns the most-specific preference from the Prefs according
// to the precedence order of user>room>broker>plugin>global.
//
func (prefs Prefs) One() Pref {
	if len(prefs) == 0 {
		return Pref{Success: false}
	}

	sort.Sort(prefs)
	return prefs[0]
}

// SetKey returns a copy of the pref with the key set to the provided string.
// Useful for chaining e.g. fooPrefs := p.SetKey("foo").Find().
func (pref Pref) SetKey(key string) Pref {
	pref.Key = key // already a copy
	return pref
}

// SetUser returns a copy of the pref with the User set to the provided string.
func (pref Pref) SetUser(user string) Pref {
	pref.User = user
	return pref
}

// SetBroker returns a copy of the pref with the Broker set to the provided string.
func (pref Pref) SetBroker(broker string) Pref {
	// TODO: validate?
	pref.Broker = broker
	return pref
}

// User filters the preference list by user, returning a new Prefs
// e.g. uprefs = prefs.User("adent")
func (prefs Prefs) User(user string) Prefs {
	out := make(Prefs, 0)

	for _, pref := range prefs {
		if pref.User == user {
			out = append(out, pref)
		}
	}

	return out
}

// Room filters the preference list by room, returning a new Prefs
// e.g. instprefs = prefs.Room("magrathea").Plugin("uptime").Broker("slack")
func (prefs Prefs) Room(room string) Prefs {
	out := make(Prefs, 0)

	for _, pref := range prefs {
		if pref.Room == room {
			out = append(out, pref)
		}
	}

	return out
}

// Broker filters the preference list by broker, returning a new Prefs
func (prefs Prefs) Broker(broker string) Prefs {
	out := make(Prefs, 0)

	for _, pref := range prefs {
		if pref.Broker == broker {
			out = append(out, pref)
		}
	}

	return out
}

// Plugin filters the preference list by plugin, returning a new Prefs
func (prefs Prefs) Plugin(plugin string) Prefs {
	out := make(Prefs, 0)

	for _, pref := range prefs {
		if pref.Plugin == plugin {
			out = append(out, pref)
		}
	}

	return out
}

// Key filters the preference list by key, returning a new Prefs
func (prefs Prefs) Key(key string) Prefs {
	out := make(Prefs, 0)

	for _, pref := range prefs {
		if pref.Key == key {
			out = append(out, pref)
		}
	}

	return out
}

// Value filters the preference list by key, returning a new Prefs
func (prefs Prefs) Value(value string) Prefs {
	out := make(Prefs, 0)

	for _, pref := range prefs {
		if pref.Value == value {
			out = append(out, pref)
		}
	}

	return out
}

// Table returns Prefs as a 2d list ready to hand off to e.g. hal.AsciiTable()
func (prefs Prefs) Table() [][]string {
	out := make([][]string, 1)
	out[0] = []string{"User", "Room", "Broker", "Plugin", "Key", "Value", "ID"}

	for _, pref := range prefs {
		m := []string{
			pref.User,
			pref.Room,
			pref.Broker,
			pref.Plugin,
			pref.Key,
			pref.Value,
			fmt.Sprintf("%d", pref.Id),
		}

		out = append(out, m)
	}

	return out
}

func (ps Prefs) Len() int           { return len(ps) }
func (ps Prefs) Swap(i, j int)      { ps[i], ps[j] = ps[j], ps[i] }
func (ps Prefs) Less(i, j int) bool { return ps[i].precedence() < ps[j].precedence() }

func (p *Pref) precedence() int {
	if !p.Success {
		return 0
	}
	if p.User != "" {
		return 5
	}
	if p.Room != "" {
		return 4
	}
	if p.Broker != "" {
		return 3
	}
	if p.Plugin != "" {
		return 2
	}
	if p.Key != "" {
		return 1
	}
	return 0
}

func (p *Pref) String() string {
	return fmt.Sprintf(`Pref{
	User:    %q,
	Room:    %q,
	Broker:  %q,
	Plugin:  %q,
	Key:     %q,
	Value:   %q,
	Default: %q,
	Success: %t,
	Error:   %v,
	Id:      %d,
}`, p.User, p.Room, p.Broker, p.Plugin, p.Key, p.Value, p.Default, p.Success, p.Error, p.Id)

}

func (p *Prefs) String() string {
	data := p.Table()
	return AsciiTable(data[0], data[1:])
}
