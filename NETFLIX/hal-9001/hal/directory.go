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
	"sync"

	"github.com/juju/errors"
)

// directory is a simple graph of directory-style information that can be linked
// and queried on those links. Goals:
// 1. avoid coupling between plugins
// 2. make it easy to share data between plugins
// 3. make it easier to link data across various systems (e.g. Pagerduty, company directory, Slack)
type directory struct {
	initOnce sync.Once
}

const DirNodeTable = `
CREATE TABLE IF NOT EXISTS dir_node (
	pkey    VARCHAR(191) NOT NULL,
	kind    VARCHAR(191) NOT NULL,
	ts      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY(pkey, kind)
)`

type DirNode struct {
	Key  string `json:"key"`
	Kind string `json:"kind"`
	Ts   int    `json:"ts"`
}

const DirNodeAttrTable = `
CREATE TABLE IF NOT EXISTS dir_node_attr (
	pkey    VARCHAR(191) NOT NULL,
	kind    VARCHAR(191) NOT NULL,
	attr    VARCHAR(191) NOT NULL,
	value   MEDIUMTEXT,
	ts      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY(pkey, kind, attr),
	INDEX (pkey, kind),
	FOREIGN KEY (pkey, kind) REFERENCES dir_node(pkey, kind) ON UPDATE CASCADE
)`

type DirNodeAttr struct {
	Key   string `json:"key"`
	Kind  string `json:"kind"`
	Attr  string `json:"attr"`
	Value string `json:"value"`
	Ts    int    `json:"ts"`
}

const DirEdgeTable = `
CREATE TABLE IF NOT EXISTS dir_edge (
	keyA    VARCHAR(191) NOT NULL,
	kindA   VARCHAR(191) NOT NULL,
	keyB    VARCHAR(191) NOT NULL,
	kindB   VARCHAR(191) NOT NULL,
	ts      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	PRIMARY KEY(keyA, kindA, keyB, kindB),
	INDEX (keyA, kindA),
	INDEX (keyB, kindB),
	FOREIGN KEY (keyA, kindA) REFERENCES dir_node(pkey, kind) ON UPDATE CASCADE,
	FOREIGN KEY (keyB, kindB) REFERENCES dir_node(pkey, kind) ON UPDATE CASCADE
)`

type DirEdge struct {
	KeyA  string `json:"key_a"`
	KindA string `json:"kind_a"`
	KeyB  string `json:"key_b"`
	KindB string `json:"kind_b"`
	Ts    int    `json:"ts"`
}

var dirSingleton directory

func Directory() *directory {
	dirSingleton.initOnce.Do(func() {
		SqlInit(DirNodeTable)
		SqlInit(DirNodeAttrTable)
		SqlInit(DirEdgeTable)
	})

	return &dirSingleton
}

func (dir *directory) exec(sql string, params ...interface{}) error {
	db := SqlDB()

	_, err := db.Exec(sql, params...)
	if err != nil {
		return errors.Annotatef(err, "SQL: %q, Values: %+q", sql, params)
	}

	return nil
}

func (dir *directory) query(sql string, params ...interface{}) ([][]string, error) {
	db := SqlDB()
	out := make([][]string, 0)

	rows, err := db.Query(sql, params...)
	if err != nil {
		return out, errors.Annotatef(err, "SQL: %q, Values: %+q", sql, params)
	}

	defer rows.Close()

	cols, err := rows.Columns()
	if err != nil {
		return out, errors.Annotate(err, "rows.Columns()")
	}

	for rows.Next() {
		irow := make([]interface{}, len(cols))
		row := make([]string, len(irow))

		for i, _ := range irow {
			irow[i] = &row[i]
		}

		err := rows.Scan(irow...)
		if err != nil {
			return out, errors.Annotate(err, "rows.Scan()")
		}

		out = append(out, row)
	}

	return out, nil
}

// Put adds/updates a node for the given key/attr and creates edges for
// the attributes where possible.
func (dir *directory) Put(key, kind string, attrs map[string]string, edgeAttrs []string) error {
	err := dir.PutNode(key, kind)
	if err != nil {
		return err
	}

	if attrs == nil {
		return errors.NotValidf("attrs cannot be nil")
	}

	for attr, value := range attrs {
		err := dir.PutNodeAttr(key, kind, attr, value)
		if err != nil {
			return err
		}
	}

	// experimental: use the provided list of keys to try to create edges based on attributes
	for _, ea := range edgeAttrs {
		if value, exists := attrs[ea]; exists {
			neighbors, err := dir.GetAttrNodes(ea, value)
			if err != nil {
				return errors.Annotate(err, "GetAttrNodes failed")
			}
			for _, neighbor := range neighbors {
				dir.PutEdge(key, kind, neighbor[0], neighbor[1])
			}
		}
	}

	return nil
}

func (dir *directory) PutNode(key, kind string) error {
	sql := `INSERT INTO dir_node (pkey, kind) VALUES (?, ?) ON DUPLICATE KEY UPDATE ts=NOW()`
	return dir.exec(sql, key, kind)
}

func (dir *directory) HasNode(key, kind string) (bool, error) {
	sql := `SELECT pkey, kind FROM dir_node WHERE pkey=? AND kind=?`

	data, err := dir.query(sql, &key, &kind)
	if err != nil {
		return false, err
	}

	if len(data) > 0 {
		return true, nil
	}

	return false, nil
}

func (dir *directory) DelNode(key, kind string) error {
	sql := `DELETE FROM dir_node WHERE key=? AND kind=?`
	return dir.exec(sql, key, kind)
}

func (dir *directory) PutNodeAttr(key, kind, attr, value string) error {
	sql := `INSERT INTO dir_node_attr (pkey, kind, attr, value) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE value=?, ts=NOW()`
	return dir.exec(sql, key, kind, attr, value, value)
}

// GetAttrNodes takes an attribute and value and returns a list of nodes
// that have (exactly) matching attributes.
func (dir *directory) GetAttrNodes(attr, value string) ([][2]string, error) {
	out := make([][2]string, 0)
	sql := `SELECT pkey, kind FROM dir_node_attr WHERE attr=? AND value=? GROUP BY pkey, kind`

	data, err := dir.query(sql, &attr, &value)
	if err != nil {
		return out, err
	}

	for _, item := range data {
		// item is []string, return must be [2]string
		out = append(out, [2]string{item[0], item[1]})
	}

	return out, nil
}

func (dir *directory) HasEdge(keyA, kindA, keyB, kindB string) (bool, error) {
	sql := `SELECT "y" FROM dir_edge WHERE keyA=? AND kindA=? AND keyB=? AND kindB=?`

	data, err := dir.query(sql, &keyA, &kindA, &keyB, &kindB)
	if err != nil {
		return false, err
	}

	if len(data) > 0 {
		return true, nil
	}

	return false, nil
}

func (dir *directory) PutEdge(keyA, kindA, keyB, kindB string) error {
	sql := `INSERT INTO dir_edge (keyA, kindA, keyB, kindB) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE ts=NOW()`
	return dir.exec(sql, keyA, kindA, keyB, kindB)
}

func (dir *directory) DelEdge(keyA, kindA, keyB, kindB string) error {
	sql := `DELETE FROM dir_edge WHERE keyA=? AND kindA=? AND keyB=? AND kindB=?`
	return dir.exec(sql, keyA, kindA, keyB, kindB)
}

func (dir *directory) GetNeighbors(key, kind string) ([][2]string, error) {
	out := make([][2]string, 0)

	sql := `SELECT keyA, kindA, keyB, kindB FROM dir_edge WHERE (keyA=? AND kindA=?) OR (keyB=? AND kindB=?)`

	edges, err := dir.query(sql, &key, &kind, &key, &kind)
	if err != nil {
		return out, err
	}

	for _, e := range edges {
		if e[0] == key && e[1] == kind {
			out = append(out, [2]string{e[2], e[3]})
		} else {
			out = append(out, [2]string{e[0], e[1]})
		}
	}

	return out, nil
}

func (dir *directory) GetEdges() ([]DirEdge, error) {
	sql := `SELECT keyA, kindA, keyB, kindB, UNIX_TIMESTAMP(ts) FROM dir_edge WHERE keyA != '' AND kindA != '' AND keyB != '' AND kindB != ''`
	db := SqlDB()
	out := make([]DirEdge, 0)

	rows, err := db.Query(sql)
	if err != nil {
		return out, errors.Annotatef(err, "SQL: %q", sql)
	}

	defer rows.Close()

	for rows.Next() {
		row := DirEdge{}
		err := rows.Scan(&row.KeyA, &row.KindA, &row.KeyB, &row.KindB, &row.Ts)
		if err != nil {
			return out, errors.Annotate(err, "rows.Scan()")
		}

		out = append(out, row)
	}

	return out, nil
}

func (dir *directory) GetNodes() ([]DirNode, error) {
	sql := `SELECT pkey, kind, UNIX_TIMESTAMP(ts) FROM dir_node WHERE pkey != '' AND kind != ''`
	db := SqlDB()
	out := make([]DirNode, 0)

	rows, err := db.Query(sql)
	if err != nil {
		return out, errors.Annotatef(err, "SQL: %q", sql)
	}

	defer rows.Close()

	for rows.Next() {
		row := DirNode{}
		err := rows.Scan(&row.Key, &row.Kind, &row.Ts)
		if err != nil {
			return out, errors.Annotate(err, "rows.Scan()")
		}

		out = append(out, row)
	}

	return out, nil
}

func (dir *directory) GetNodeAttrs() ([]DirNodeAttr, error) {
	sql := `SELECT pkey, kind, attr, value, UNIX_TIMESTAMP(ts) FROM dir_node_attr WHERE pkey != '' AND kind != '' AND attr != ''`
	db := SqlDB()
	out := make([]DirNodeAttr, 0)

	rows, err := db.Query(sql)
	if err != nil {
		return out, errors.Annotatef(err, "SQL: %q", sql)
	}

	defer rows.Close()

	for rows.Next() {
		row := DirNodeAttr{}
		err := rows.Scan(&row.Key, &row.Kind, &row.Attr, &row.Value, &row.Ts)
		if err != nil {
			return out, errors.Annotate(err, "rows.Scan()")
		}

		out = append(out, row)
	}

	return out, nil
}

/* test data

INSERT INTO dir_node (kind, pkey) VALUES ("AD", "angua@dwmail.com");
INSERT INTO dir_node (kind, pkey) VALUES ("AD", "carrot@dwmail.com");
INSERT INTO dir_node (kind, pkey) VALUES ("AD", "aching@dwmail.com");
INSERT INTO dir_node (kind, pkey) VALUES ("AD", "granny@dwmail.com");
INSERT INTO dir_node (kind, pkey) VALUES ("AD", "vetinari@dwmail.com");
INSERT INTO dir_node (kind, pkey) VALUES ("AD", "vimes@dwmail.com");
INSERT INTO dir_node (kind, pkey) VALUES ("AD", "nobbs@dwmail.com");
INSERT INTO dir_node (kind, pkey) VALUES ("slack", "Angua");
INSERT INTO dir_node (kind, pkey) VALUES ("slack", "Carrot");
INSERT INTO dir_node (kind, pkey) VALUES ("slack", "Tiffany");
INSERT INTO dir_node (kind, pkey) VALUES ("slack", "Mistress Weatherwax");
INSERT INTO dir_node (kind, pkey) VALUES ("slack", "Patrician");
INSERT INTO dir_node (kind, pkey) VALUES ("slack", "Sam");
INSERT INTO dir_node (kind, pkey) VALUES ("slack", "Nobby");

INSERT INTO dir_edge (kindA, keyA, kindB, keyB) VALUES ("AD", "angua@dwmail.com", "slack", "Angua");
INSERT INTO dir_edge (kindA, keyA, kindB, keyB) VALUES ("AD", "carrot@dwmail.com", "slack", "Carrot");
INSERT INTO dir_edge (kindA, keyA, kindB, keyB) VALUES ("AD", "aching@dwmail.com", "slack", "Tiffany");
INSERT INTO dir_edge (kindA, keyA, kindB, keyB) VALUES ("AD", "granny@dwmail.com", "slack", "Mistress Weatherwax");
INSERT INTO dir_edge (kindA, keyA, kindB, keyB) VALUES ("AD", "vetinari@dwmail.com", "slack", "Patrician");
INSERT INTO dir_edge (kindA, keyA, kindB, keyB) VALUES ("AD", "vimes@dwmail.com", "slack", "Sam");
INSERT INTO dir_edge (kindA, keyA, kindB, keyB) VALUES ("AD", "nobbs@dwmail.com", "slack", "Nobby");

INSERT INTO dir_node_attr (kind, pkey, attr, value) VALUES ("AD", "angua@dwmail.com", "email", "angua@dwmail.com");
INSERT INTO dir_node_attr (kind, pkey, attr, value) VALUES ("AD", "angua@dwmail.com", "sms", "5551234567"
INSERT INTO dir_node_attr (kind, pkey, attr, value) VALUES ("AD", "carrot@dwmail.com", "sms", "5555555555");
*/
