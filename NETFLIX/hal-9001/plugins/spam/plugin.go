package spam

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
	"github.com/netflix/hal-9001/hal"
)

var log hal.Logger

func Register() {
	p := hal.Plugin{
		Name: "spam",
		Func: spam,
	}
	p.Register()
}

func spam(evt hal.Evt) {
	response := evt.AsPref().SetUser("").FindKey("spam-response").One()
	if response.Success {
		evt.Reply(response.Value)
	} else {
		log.Printf("spam is configured in room %q but could not find the 'spam-response' pref", evt.RoomId)
	}
}
