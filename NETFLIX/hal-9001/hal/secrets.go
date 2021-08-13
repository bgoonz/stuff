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
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"io"
	"sync"
)

// secrets stores a plaintext key/value store for
// sensitive data that the bot and plugins need to operate
// along with methods for persisting encrypted copies to the database
type SecretStore struct {
	key   []byte            // encryption key for persistence
	keyed bool              // track whether the key has been set
	kv    map[string]string // the in-memory k/v store
	mut   sync.Mutex        // protect concurrent access
	init  sync.Once         // singleton initialization
	itbl  sync.Once         // table initialization
}

var secrets SecretStore

// SECRETS_TABLE holds encrypted key/value pairs along with their nonces.
// uses VARBINARY instead of BINARY to avoid null termination issues.
const SECRETS_TABLE = `
CREATE TABLE IF NOT EXISTS secrets (
	pkey  VARCHAR(191)     NOT NULL, -- plaintext key
	sval  VARBINARY(16384) NOT NULL, -- AES/GCM sealed value
	nonce VARBINARY(12)    NOT NULL, -- GCM nonce for the value
	ts    TIMESTAMP,                 -- timestamp, for debugging/cleanup
	PRIMARY KEY(pkey)
)`

// for temporarily holding encrypted data
type ssRec struct {
	pkey  []byte
	sval  []byte
	nonce []byte
}

// 256-bit AES key and 96-bit nonce size in bytes
const KEY_SIZE = 32
const NONCE_SIZE = 12

// Secrets returns a handle for accessing secrets managed by hal.
func Secrets() *SecretStore {
	secrets.init.Do(func() {
		secrets.kv = make(map[string]string)
		secrets.key = make([]byte, KEY_SIZE)
		secrets.keyed = false
	})

	return &secrets
}

// SetEncryptionKey sets the key used to encrypt/decrypt credentials
// stored in the database. This needs to be called before anything
// will work.
func (ss *SecretStore) SetEncryptionKey(in []byte) {
	ss.mut.Lock()
	defer ss.mut.Unlock()

	// do not rely on the caller's memory: make a copy
	done := copy(ss.key, in)

	// catch unlikely errors and anyone trying to use a smaller key
	if done != KEY_SIZE {
		log.Fatalf("BUG: SetEncryptionKey failed to store the key. Only %d bytes copied.", done)
	}

	ss.keyed = true
}

// Get returns the value of a key from the secret store.
// If the key doesn't exist, empty string is returned.
// To check existence, use Exists(string).
func (ss *SecretStore) Get(key string) string {
	ss.mut.Lock()
	defer ss.mut.Unlock()

	if _, exists := ss.kv[key]; exists {
		return ss.kv[key]
	} else {
		return ""
	}
}

// Exists checks to see if the provided key exists
// in the secret store.
func (ss *SecretStore) Exists(key string) bool {
	ss.mut.Lock()
	defer ss.mut.Unlock()

	_, exists := ss.kv[key]
	return exists
}

// Put adds a key/value to the in-memory secret store.
// Put'ing a key that already exists overwrites the previous
// value. The secret store is not persisted at this point,
// an additional call to Save() is required.
func (ss *SecretStore) Set(key, value string) {
	ss.mut.Lock()
	defer ss.mut.Unlock()

	ss.kv[key] = value
}

// Put is an alias for Set
func (ss *SecretStore) Put(key, value string) {
	ss.Set(key, value)
}

// Delete removes the key from the in-memory secret store.
// This is not persisted.
func (ss *SecretStore) Delete(key string) {
	ss.mut.Lock()
	defer ss.mut.Unlock()

	delete(ss.kv, key)
}

// Dump returns a copy of the kv store. DO NOT USE IN PLUGINS.
// This returns an UNENCRYPTED copy of the kv store for CLI
// tools and debugging. This might go away.
func (ss *SecretStore) Dump() map[string]string {
	out := make(map[string]string)

	ss.mut.Lock()
	defer ss.mut.Unlock()

	for k, v := range ss.kv {
		out[k] = v
	}

	return out
}

// Load secrets from the database and decrypt them into hal's in-memory secret
// store. The database-side secrets will be added to the existing store,
// overwriting on conflict (e.g. the database secrets).
// Any errors during this process are fatal.
func (ss *SecretStore) LoadFromDB() {
	if !ss.keyed {
		panic("The secret store key has not been set!")
	}

	ss.initTable()

	db := SqlDB()

	rows, err := db.Query("SELECT pkey, sval, nonce FROM secrets")
	if err != nil {
		log.Fatalf("Could not read secrets from the database: %s", err)
	}

	defer rows.Close()

	// encrypted key/value and key/nonce
	encrypted := make([]ssRec, 0)

	// pull the encrypted data into memory
	for rows.Next() {
		ssr := ssRec{}
		err := rows.Scan(&ssr.pkey, &ssr.sval, &ssr.nonce)
		if err != nil {
			log.Fatalf("Could not rows.Scan: %s", err)
		}

		encrypted = append(encrypted, ssr)
	}

	gcm := ss.getGCM()

	// decrypt the keys/values into ss.kv
	for _, ssr := range encrypted {
		value, err := gcm.Open(nil, ssr.nonce, ssr.sval, nil)
		if err != nil {
			log.Fatalf("value decryption failed: %s\n", err)
		}

		ss.kv[string(ssr.pkey)] = string(value)
	}
}

// Serialize the secret store, encrypt it, and store it in the database.
// Any errors during this process are fatal.
func (ss *SecretStore) SaveToDB() {
	gcm := ss.getGCM()
	ss.initTable()

	ss.mut.Lock()
	defer ss.mut.Unlock()

	db := SqlDB()

	tx, err := db.Begin()
	if err != nil {
		log.Fatalf("Failed to create transaction for saving secrets: %s", err)
	}

	insert, err := tx.Prepare(`INSERT INTO secrets (pkey,sval,nonce) VALUES (?,?,?)`)
	if err != nil {
		log.Fatalf("Failed to prepare insert query: %s", err)
	}
	defer insert.Close()

	_, err = tx.Exec(`TRUNCATE TABLE secrets`)
	if err != nil {
		log.Fatalf("Failed to truncate secrets table: %s", err)
	}

	// use a unique nonce for each key/value pair
	// TODO: ask infosec if using the nonce for both is OK
	for key, val := range ss.kv {
		nonce, err := ss.mkNonce()
		if err != nil {
			log.Fatalf("Could not create a new nonce: %s", err)
		}

		sealed := gcm.Seal(nil, nonce, []byte(val), nil)

		_, err = insert.Exec(key, sealed, nonce)
		if err != nil {
			log.Fatalf("Could not write encrypted key/value/nonce to DB: %s", err)
		}
	}

	err = tx.Commit()
	if err != nil {
		log.Fatalf("secrets.SaveToDB transaction failed: %s", err)
	}
}

// initTable runs the table initialization statement once
func (ss *SecretStore) initTable() {
	ss.itbl.Do(func() {
		err := SqlInit(SECRETS_TABLE)
		if err != nil {
			log.Printf("Failed to initialize the secrets table: %s", err)
		}
	})
}

func (ss *SecretStore) WipeDB() {
	SqlDB().Exec(`TRUNCATE TABLE secrets`)
}

func (ss *SecretStore) InitDB() {
	ss.initTable()
	ss.SaveToDB()
}

func (ss *SecretStore) mkNonce() ([]byte, error) {
	nonce := make([]byte, NONCE_SIZE)

	_, err := io.ReadFull(rand.Reader, nonce)
	if err != nil {
		log.Printf("Could not acquire nonce: %s", err)
		return nil, err
	}

	return nonce, nil
}

// getGCM returns an AES/GCM cipher configured with the default nonce size.
func (ss *SecretStore) getGCM() cipher.AEAD {
	if !ss.keyed {
		panic("The secret store key has not been set!")
	}

	ss.mut.Lock()
	defer ss.mut.Unlock()

	block, err := aes.NewCipher(ss.key)
	if err != nil {
		log.Fatalf("aes.NewCipher failed: %s", err)
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		log.Fatalf("cipher.NewGCM(aes block) failed: %s", err)
	}

	return gcm
}
