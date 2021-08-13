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

import "github.com/netflix/hal-9001/hal"

// This bot doesn't do anything except start the router and wait forever
// for messages that will never come.
//
// Most of hal's functionality is optional. It's still built along with the
// rest of hal but is not active unless it's used in main or a plugin.

func main() {
	router := hal.Router()
	router.Route()
}
