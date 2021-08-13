package main

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
	"io/ioutil"
	"log"
	"net/http"
	"os"

	"github.com/netflix/hal-9001/hal"

	"github.com/netflix/hal-9001/brokers/hipchat"
	"github.com/netflix/hal-9001/brokers/slack"

	"github.com/netflix/hal-9001/plugins/archive"
	"github.com/netflix/hal-9001/plugins/google_calendar"
	"github.com/netflix/hal-9001/plugins/mark"
	"github.com/netflix/hal-9001/plugins/pagerduty"
	"github.com/netflix/hal-9001/plugins/pluginmgr"
	"github.com/netflix/hal-9001/plugins/prefmgr"
	"github.com/netflix/hal-9001/plugins/roster"
	"github.com/netflix/hal-9001/plugins/seppuku"
	"github.com/netflix/hal-9001/plugins/uptime"
)

func main() {
	// configuration is in environment variables
	// if you prefer configuration files or flags, that's cool, just replace
	// this part with your thing
	dsn := requireEnv("HAL_DSN")
	keyfile := requireEnv("HAL_SECRETS_KEY_FILE")
	controlRoom := requireEnv("HAL_CONTROL_ROOM")
	hipchatRoomJid := requireEnv("HAL_HIPCHAT_ROOM_JID")
	hipchatRoomName := requireEnv("HAL_HIPCHAT_ROOM_NAME")
	webAddr := defaultEnv("HAL_HTTP_LISTEN_ADDR", ":9001")

	// hal provides a k/v API for managing secrets that the DB code uses to get
	// its DSN (which contains a password). Put the DSN there so the DB can find
	// it.
	secrets := hal.Secrets()
	secrets.Set(hal.SECRETS_KEY_DSN, dsn)

	// parts of hal rely on the database (prefs, secrets, etc.)
	// so make sure the DSN is valid and hal can connect before
	// doing anything else
	// hal can't do much without the database, so you probably want this
	db := hal.SqlDB()
	if err := db.Ping(); err != nil {
		log.Fatalf("Could not ping the database: %s", err)
	}

	// get the secrets encryption key from the file specified
	// this should be protected like any other private key
	// if you don't use the secrets persistence, this can be removed/ignored
	skey, err := ioutil.ReadFile(keyfile)
	if err != nil {
		log.Fatalf("Could not read key file '%s': %s", keyfile, err)
	}

	// Set the encryption key for persisted secrets.
	// Secrets can persist to the database, encrypting the key and value
	// with AES-GCM before writing so that database backups, etc only contain
	// ciphertext and no cleartext secrets.
	secrets.SetEncryptionKey(skey)

	// load secrets from the database
	secrets.LoadFromDB()

	// update the DSN again since the database might have a stale copy
	secrets.Set(hal.SECRETS_KEY_DSN, dsn)

	// configure the Hipchat broker
	hconf := hipchat.Config{
		Host:     hipchat.HIPCHAT_HOST, // TODO: not really configurable yet
		Jid:      secrets.Get("hipchat.jid"),
		Password: secrets.Get("hipchat.password"),

		// TODO: make this configurable via prefs (or maybe secrets?)
		Rooms: map[string]string{
			hipchatRoomJid: hipchatRoomName,
		},
	}
	hc := hconf.NewBroker("hipchat")

	// configure the Slack broker
	sconf := slack.Config{
		Token: secrets.Get("slack.token"),
	}
	slk := sconf.NewBroker("slack")

	// bind the slack and hipchat plugins to the router
	router := hal.Router()
	router.AddBroker(hc)
	router.AddBroker(slk)

	// Plugin registration makes them available to the bot but does not
	// activate them. That happens at runtime using e.g. pluginmgr or
	// the plugin registry's LoadInstances() (used below)
	archive.Register()
	google_calendar.Register()
	mark.Register()
	pagerduty.Register()
	pluginmgr.Register()
	prefmgr.Register()
	roster.Register()
	seppuku.Register()
	uptime.Register()

	// start up the router goroutine
	go router.Route()

	// load any previously configured plugin instances from the database
	pr := hal.PluginRegistry()
	pr.LoadInstances()

	// pluginmgr is needed to set up all the other plugins
	// so if it's not present, initialize it manually just this once
	// alternatively, you could poke config straight into the DB
	// TODO: remove the hard-coded room name or make it configurable
	for _, broker := range router.Brokers() {
		if len(pr.FindInstances(controlRoom, broker.Name(), "pluginmgr")) == 0 {
			mgr, _ := pr.GetPlugin("pluginmgr")
			mgrInst := mgr.Instance(controlRoom, broker)
			mgrInst.Register()
		}
	}

	// temporary ... (2016-03-02)
	// TODO: remove this or make it permanent by using the same method as
	// the pluginmgr bootstrap above to set the room name, etc.
	for _, broker := range router.Brokers() {
		broker.Send(hal.Evt{
			Body: "Ohai! HAL-9001 up and running.",
			Room: controlRoom,
			User: "HAL-9001",
		})
	}

	// start the webserver - some plugins register handlers to the default
	// net/http router. This makes them available. Remove this if you don't
	// want the webserver and the handlers will be silently ignored.
	go func() {
		err := http.ListenAndServe(webAddr, nil)
		if err != nil {
			log.Fatalf("Could not listen on '%s': %s\n", webAddr, err)
		}
	}()

	// block forever
	select {}
}

func requireEnv(key string) string {
	val := os.Getenv(key)
	if val == "" {
		log.Fatalf("The %q environment variable is required!", key)
	}

	return val
}

func defaultEnv(key, def string) string {
	val := os.Getenv(key)

	if val == "" {
		return def
	}

	return val
}
