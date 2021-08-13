// uptime: the simplest useful plugin possible
package uptime

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
	"time"

	"github.com/netflix/hal-9001/hal"
)

var booted time.Time

func init() {
	booted = time.Now()
}

func Register() {
	p := hal.Plugin{
		Name:    "uptime",
		Func:    uptime,
		Command: "uptime",
	}
	p.Register()
}

func uptime(evt hal.Evt) {
	ut := time.Since(booted)
	evt.Reply(fmt.Sprintf("uptime: %s", ut.String()))
}
