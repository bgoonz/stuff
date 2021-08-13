// cross_the_streams replicates messages between brokers
package cross_the_streams

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

var log hal.Logger

// Register makes this plugin available to the system.
func Register() {
	plugin := hal.Plugin{
		Name: "cross_the_streams",
		Func: crossStreams,
		//  source: Pref.Room / Pref.Broker
		Settings: hal.Prefs{
			hal.Pref{Plugin: "cross_the_streams", Key: "to.broker"},
			hal.Pref{Plugin: "cross_the_streams", Key: "to.room"},
		},
	}

	plugin.Register()
}

// crossStreams looks at events it recieves and repeats them
// to a different broker.
func crossStreams(evt hal.Evt) {
	prefs := evt.InstanceSettings()
	tbPrefs := prefs.Key("to.broker")
	trPrefs := prefs.Key("to.room")

	// no matches, move on
	if len(tbPrefs) == 0 || len(trPrefs) == 0 {
		return
	}

	toBroker := tbPrefs[0].Value
	toRoomId := trPrefs[0].Value

	tb := hal.Router().GetBroker(toBroker)
	if tb != nil {
		toRoom := tb.RoomIdToName(toRoomId)
		body := fmt.Sprintf("%s %s@%s: %s", evt.Time, evt.User, evt.Room, evt.Body)
		out := hal.Evt{
			Body:   body,
			Room:   toRoom,
			RoomId: toRoomId,
			Time:   evt.Time,
			Broker: tb,
		}
		tb.Send(out)
	} else {
		log.Printf("hal.Router does not know about a broker named %q", toBroker)
	}
}
