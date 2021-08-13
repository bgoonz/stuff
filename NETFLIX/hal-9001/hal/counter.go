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
)

const CounterTable = `
CREATE TABLE IF NOT EXISTS counter (
	 pkey    VARCHAR(191) NOT NULL,
	 value   int,
	 ts      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	 PRIMARY KEY(pkey)
)`

func GetCounter(key string) (value int, err error) {
	db := SqlDB()
	SqlInit(CounterTable)

	sql := "SELECT value FROM counter WHERE pkey=?"
	err = db.QueryRow(sql, key).Scan(&value)
	if err == dbsql.ErrNoRows {
		return 0, nil
	} else if err != nil {
		log.Printf("GetCounter query failed: %s", err)
		return 0, err
	}

	return value, nil
}

func SetCounter(key string, value int) error {
	db := SqlDB()
	SqlInit(CounterTable)

	sql := `INSERT INTO counter (pkey,value) VALUES (?,?) ON DUPLICATE KEY UPDATE value=?`

	_, err := db.Exec(sql, key, value, value)
	if err != nil {
		log.Printf("SetCounter upsert failed: %s", err)
	}

	return err
}

func IncrementCounter(key string) error {
	db := SqlDB()
	SqlInit(CounterTable)

	sql := `INSERT INTO counter (pkey,value) VALUES (?,1) ON DUPLICATE KEY UPDATE value=value+1`

	_, err := db.Exec(sql, key)
	if err != nil {
		log.Printf("IncrementCounter query failed: %s", err)
	}

	return err
}

func DecrementCounter(key string) error {
	db := SqlDB()
	SqlInit(CounterTable)

	sql := `INSERT INTO counter (pkey,value) VALUES (?,-1) ON DUPLICATE KEY UPDATE value=value-1`

	_, err := db.Exec(sql, key)
	if err != nil {
		log.Printf("DecrementCounter query failed: %s", err)
	}

	return err
}
