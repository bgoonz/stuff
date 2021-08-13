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
	dbsql "database/sql"
	"sync"
	"time"
)

const KVTable = `
CREATE TABLE IF NOT EXISTS kv (
	 pkey    VARCHAR(191) NOT NULL,
	 value   MEDIUMTEXT,
	 expires DATETIME,
	 ttl     INT NOT NULL DEFAULT 0, -- ttl 0 is forever
	 ts      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	 PRIMARY KEY(pkey)
)`

var kvLateInitOnce sync.Once

func kvLazyInit() {
	kvLateInitOnce.Do(func() {
		SqlInit(KVTable)
		go kvCleanup()
	})
}

func kvCleanup() {
	c := time.Tick(time.Minute)

	for _ = range c {
		db := SqlDB()
		_, err := db.Exec("DELETE FROM kv WHERE expires < NOW()")
		if err != nil {
			log.Printf("DELETE of expired keys from the DB failed: %s", err)
		}
	}
}

// ExistsKV checks to see if a key exists in the kv. False if any errors are
// encountered.
func ExistsKV(key string) bool {
	kvLazyInit()
	db := SqlDB()

	var count int64
	sql := "SELECT COUNT(pkey) FROM kv WHERE pkey=? AND expires > NOW()"
	err := db.QueryRow(sql, key).Scan(&count)
	if err != nil {
		log.Printf("ExistsKV query %q failed: %s", sql, err)
		return false
	}

	return count > 0
}

// GetKV retreives a value from the database. Returns value,ok style. Returns
// "", false if the query fails and "", true if there was no value available.
func GetKV(key string) (string, bool) {
	kvLazyInit()
	db := SqlDB()

	var value string
	sql := "SELECT value FROM kv WHERE pkey=? AND expires > NOW()"
	err := db.QueryRow(sql, key).Scan(&value)
	if err == dbsql.ErrNoRows {
		return "", true
	} else if err != nil {
		log.Printf("GetKV query %q failed: %s", sql, err)
		return "", false
	}

	return value, true
}

// SetKV inserts a new value in the database with the provided TTL. If the TTL
// is 0, it defaults to 10 years.
func SetKV(key, value string, ttl time.Duration) (err error) {
	kvLazyInit()
	db := SqlDB()
	now := time.Now()

	if ttl == 0 {
		ttl = time.Hour * 24 * 3650
	}

	sql := "INSERT INTO kv (pkey,value,expires,ttl) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE value=?, expires=?, ttl=?"

	expires := now.Add(ttl)
	ttlsecs := int(ttl.Seconds())
	_, err = db.Exec(sql, key, value, expires, ttlsecs, value, expires, ttlsecs)

	if err != nil {
		log.Printf("SetKV query %q failed: %s", sql, err)
	}

	return err
}
