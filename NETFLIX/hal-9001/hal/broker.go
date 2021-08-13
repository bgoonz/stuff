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

// Broker is an instance of a broker that can send/receive events.
type Broker interface {
	// the text name of the broker, arbitrary, but usually "slack" or "cli"
	Name() string
	Send(evt Evt)
	SendTable(evt Evt, header []string, rows [][]string)
	SendDM(evt Evt)
	SetTopic(roomId, topic string) error
	GetTopic(roomId string) (topic string, err error)
	Leave(roomId string) (err error)
	LooksLikeRoomId(room string) bool
	LooksLikeUserId(user string) bool
	RoomIdToName(id string) (name string)
	RoomNameToId(name string) (id string)
	UserIdToName(id string) (name string)
	UserNameToId(name string) (id string)
	Stream(out chan *Evt)
}
