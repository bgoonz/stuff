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
	"database/sql"
	"strings"
	"sync"

	_ "github.com/go-sql-driver/mysql"
)

var sqldbSingleton *sql.DB
var initSqlDbOnce sync.Once
var sqlMapMutex sync.Mutex
var sqlInitCache map[string]struct{}

const SECRETS_KEY_DSN = "hal.dsn"

// DB returns the database singleton.
func SqlDB() *sql.DB {
	initSqlDbOnce.Do(func() {
		secrets := Secrets()
		dsn := secrets.Get(SECRETS_KEY_DSN)
		if dsn == "" {
			panic("Startup error: SetSqlDB(dsn) must come before any calls to hal.SqlDB()")
		}

		var err error
		sqldbSingleton, err = sql.Open("mysql", strings.TrimSpace(dsn))
		if err != nil {
			log.Fatalf("Could not connect to database: %s\n", err)
		}

		// make sure the connection is in full utf-8 mode
		sqldbSingleton.Exec("SET NAMES utf8mb4")

		err = sqldbSingleton.Ping()
		if err != nil {
			log.Fatalf("Pinging database failed: %s\n", err)
		}

		sqlInitCache = make(map[string]struct{})
	})

	return sqldbSingleton
}

// ForceSqlDBHandle can be used to forcibly replace the DB handle with another
// one, e.g. go-sqlmock. This is mainly here for tests, but it's also useful for
// things like examples/repl to operate with no database.
func ForceSqlDBHandle(db *sql.DB) {
	// trigger the sync.Once so the init code doesn't fire
	initSqlDbOnce.Do(func() {})
	sqldbSingleton = db
}

// SqlInit executes the provided SQL once per runtime.
// Execution is not tracked across restarts so statements still need
// to use CREATE TABLE IF NOT EXISTS or other methods of achieving
// idempotent execution. Errors are returned unmodified, including
// primary key violations, so you may ignore them as needed.
func SqlInit(sqlTxt string) error {
	sqlMapMutex.Lock()
	defer sqlMapMutex.Unlock()

	db := SqlDB()

	// avoid a database round-trip by checking an in-memory cache
	// fall through and hit the DB on cold cache
	if _, exists := sqlInitCache[sqlTxt]; exists {
		return nil
	}

	// clean up a little
	sqlTxt = strings.TrimSpace(sqlTxt)
	sqlTxt = strings.TrimSuffix(sqlTxt, ";")

	// check if it's a simple create table, add engine/charset if unspecified
	lowSql := strings.ToLower(sqlTxt)
	if strings.HasPrefix(lowSql, "create table") && strings.HasSuffix(lowSql, ")") {
		// looks like no engine or charset was specified, add it
		// "utf8" has incomplete support.  "utf8mb4" provides full utf8 support
		// https://mathiasbynens.be/notes/mysql-utf8mb4
		sqlTxt = sqlTxt + " ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci"
	}

	// execute the statement
	_, err := db.Exec(sqlTxt)
	if err != nil {
		log.Printf("SqlInit() failed on statement '%s':\n%s", sqlTxt, err)
		return err
	}

	sqlInitCache[sqlTxt] = struct{}{}

	return nil
}
