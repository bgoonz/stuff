package seppuku

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
	"os"
	"time"

	"github.com/netflix/hal-9001/hal"
)

var log hal.Logger

func Register() {
	p := hal.Plugin{
		Name:  "seppuku",
		Func:  seppuku,
		Regex: "^[[:space:]]*!(seppuku|切腹)",
	}
	p.Register()

	z := hal.Plugin{
		Name:  "zombie",
		Func:  zombie,
		Regex: "^[[:space:]]*!(zombie|ゾンビ)",
	}
	z.Register()
}

// seppuku instructs the bot to die.
// you probably don't want this on in production - if you do, a supervisor
// is highly recommended
func seppuku(evt hal.Evt) {
	evt.Reply("さようなら")
	time.Sleep(2 * time.Second)
	log.Printf("exiting due to %q command from %s in %s/%s", evt.Body, evt.User, evt.BrokerName(), evt.Room)
	os.Exit(1337)
}

// zombie disables all plugins but seppuku and stays running.
// useful for putting a bot deployed under a supervisor out of comission
// so a local copy can be tested without interference - put the bot into zombie
// mode then when you're ready for it to die, instruct it to seppuku
func zombie(evt hal.Evt) {
	pr := hal.PluginRegistry()

	for _, inst := range pr.InstanceList() {
		if inst.Plugin.Name == "zombie" {
			// this makes the hal router think zombie has executed for every
			// incoming event so it doesn't fall through and say "invalid command"
			inst.Regex = ""
			inst.Func = func(evt hal.Evt) { return }
		} else if inst.Plugin.Name != "seppuku" {
			inst.Unregister()
		}
	}

	evt.Reply("まったネクストライフ")
}
