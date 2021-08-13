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

const PLUGIN_INST_TABLE = `
CREATE TABLE IF NOT EXISTS plugin_instances (
	plugin  varchar(191) NOT NULL,
	broker  varchar(191) NOT NULL,
	room    varchar(191) NOT NULL,
	regex   varchar(191) NOT NULL DEFAULT "",
	ts      TIMESTAMP,
	PRIMARY KEY(plugin, broker, room)
)
`

// LoadInstances loads the previously saved plugin instance configuration
// from the database and *merges* it with the plugin registry. This should be
// idempotent if run multiple times.
// TODO: decide if it makes sense to persist settings or just pull the prefs
// each time.
func (pr *pluginRegistry) LoadInstances() error {
	log.Printf("Loading plugin instances from the database.")

	db := SqlDB()

	err := SqlInit(PLUGIN_INST_TABLE)
	if err != nil {
		log.Printf("Failed to initialize the plugin_instances table: %s", err)
		return err
	}

	rows, err := db.Query(`SELECT plugin, broker, room, regex FROM plugin_instances`)
	if err != nil {
		log.Printf("LoadInstances SQL query failed: %s", err)
		return err
	}

	defer rows.Close()

	var pname, bname, roomId, re string
	for rows.Next() {
		err := rows.Scan(&pname, &bname, &roomId, &re)
		if err != nil {
			log.Printf("LoadInstances rows.Scan() failed: %s", err)
			return err
		}

		// check to see if there is already a runtime instance, create it
		// if it doesn't exist
		found := pr.FindInstances(pname, bname, roomId)
		if len(found) == 0 {
			// instance is in the DB but not registered, do it now
			plugin, err := pr.GetPlugin(pname)
			if err != nil {
				log.Printf("%q is configured in the database but is not registered. Ignoring.", pname)
				continue
			}

			broker := Router().GetBroker(bname)
			if broker == nil {
				log.Fatalf("Broker %q does not exist.", bname)
			}

			inst := plugin.Instance(roomId, broker)
			inst.Regex = re // RE can be overridden per instance

			// go over the settings and pull preferences before firing up the instance
			inst.LoadSettingsFromPrefs()

			err = inst.Register()
			if err != nil {
				log.Printf("Could not register plugin instance for plugin %q and room id %q: %s",
					pname, roomId, err)
				return err
			}
		} else if len(found) == 1 {
			// already there, move on
			continue
		} else {
			log.Fatalf("BUG: more than 1 plugin instance matched for plugin %q and room id %q",
				pname, roomId)
		}
	}

	log.Println("Done loading plugin instances.")

	return nil
}

// SaveInstances saves plugin instances configurations to the database.
func (pr *pluginRegistry) SaveInstances() error {
	log.Printf("Saving plugin instances to the database.")
	defer func() { log.Printf("Done saving plugin instances.") }()

	err := SqlInit(PLUGIN_INST_TABLE)
	if err != nil {
		log.Printf("Failed to initialize the plugin_instances table: %s", err)
		return err
	}

	instances := pr.InstanceList()

	// use a transaction to (relatively) safely wipe & rewrite the whole table
	db := SqlDB()
	tx, err := db.Begin()
	stmt, err := tx.Prepare(`INSERT INTO plugin_instances
	                          (plugin, broker, room, regex)
	                         VALUES (?, ?, ?, ?)`)

	// clear the table before writing new records
	_, err = tx.Exec("TRUNCATE TABLE plugin_instances")

	for _, inst := range instances {
		_, err = stmt.Exec(inst.Plugin.Name, inst.Broker.Name(), inst.RoomId, inst.Regex)
		if err != nil {
			log.Printf("insert failed: %s", err)
			return err
		}
	}

	err = tx.Commit()
	if err != nil {
		log.Printf("SaveInstances transaction failed: %s", err)
		return err
	}

	return nil
}
