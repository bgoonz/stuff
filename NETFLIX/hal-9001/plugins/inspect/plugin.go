package inspect

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

import "github.com/netflix/hal-9001/hal"

var log hal.Logger

func Register() {
	getid := hal.Plugin{
		Name:    "getid",
		Func:    getid,
		Command: "getid",
	}
	getid.Register()

	leave := hal.Plugin{
		Name:  "leave",
		Func:  leave,
		Regex: "^[[:space:]]*!leave",
	}
	leave.Register()
}

// getid resolves user & room names to ids using the broker's RoomNameToId
// and UserNameToId methods (along with the LooksLike* variants).
func getid(evt hal.Evt) {
	args := evt.BodyAsArgv()
	if len(args) != 2 {
		evt.Replyf("%s requires exactly 2 arguments. Only %d were provided. e.g. !getid atobey",
			args[0], len(args))
		return
	}

	maybeRoomId := evt.Broker.RoomNameToId(args[1])
	maybeUserId := evt.Broker.UserNameToId(args[1])

	if evt.Broker.LooksLikeRoomId(maybeRoomId) {
		evt.Replyf("Room: %q => %q", args[1], maybeRoomId)
	} else if evt.Broker.LooksLikeUserId(maybeUserId) {
		evt.Replyf("User: %q => %q", args[1], maybeUserId)
	} else {
		evt.Replyf("Could not resolve %q as a user or room.", args[1])
	}
}

func leave(evt hal.Evt) {
	log.Printf("Leaving room %q as requested by %s.", evt.RoomId, evt.User)
	evt.Replyf("Leaving room %q as requested by %s.", evt.RoomId, evt.User)
	err := evt.Broker.Leave(evt.RoomId)
	if err != nil {
		evt.Replyf("Error leaving room %q: %s", evt.RoomId, err)
	}
}
