package guys

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
	"fmt"

	"github.com/netflix/hal-9001/hal"
)

func Register() {
	guys := hal.Plugin{
		Name:  "guys",
		Func:  guys,
		Regex: "(?i:guys)",
	}
	guys.Register()
}

// guys counts how many times you've used "guys" in a chat message and
// lets you know via DM
// !plugin attach guys
// this gets it listening to the room but it won't notify you until a pref is set
// !prefs set --user * --plugin guys --key enabled --value true
// or
// !prefs set --room * --plugin guys --key enabled --value true
func guys(evt hal.Evt) {
	if !evt.IsChat {
		return
	}

	key := "guys-" + evt.UserId
	hal.IncrementCounter(key)

	// even if this plugin is attached to a room it won't notify without
	// an accompanying pref to say whether it's a specific user who cares
	// or the whole room
	userCares := hal.GetPref(evt.UserId, "", "", "guys", "enabled", "false")
	roomCares := hal.GetPref("", "", evt.RoomId, "guys", "enabled", "false")
	if userCares.Value == "false" && roomCares.Value == "false" {
		return
	}

	count, _ := hal.GetCounter(key)
	msg := fmt.Sprintf("Yo. You have now used \"guys\" %d times.", count)

	// only let the user know - no need to publicly shame or clutter the room
	evt.ReplyDM(msg)
}
