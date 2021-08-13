package hipchat

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
	"strings"
	"time"

	"github.com/mattn/go-xmpp"
	"github.com/netflix/hal-9001/hal"
)

var log hal.Logger

// Broker contains the Hipchat API handles required for interacting
// with the hipchat service.
type Broker struct {
	Client *xmpp.Client
	Config Config
	inst   string
}

type Config struct {
	Host     string
	Jid      string
	Password string
	Rooms    map[string]string
}

// HIPCHAT_HOST is the only supported hipchat host.
const HIPCHAT_HOST = `chat.hipchat.com:5223`

// Hipchat is a singleton that returns an initialized and connected
// Broker. It can be called anywhere in the bot at any time.
// Host must be "chat.hipchat.com:5223". This requirement can go away
// once someone takes the time to integrate and test against an on-prem
// Hipchat server.
func (c Config) NewBroker(name string) Broker {
	// TODO: remove this once the TLS/SSL requirements are sorted
	if c.Host != HIPCHAT_HOST {
		log.Println("TODO: Only SSL and hosted Hipchat are supported at the moment.")
		log.Printf("Hipchat host must be %q.", HIPCHAT_HOST)
	}

	// for some reason Go's STARTTLS seems to be incompatible with
	// Hipchat's or maybe Hipchat TLS is broken, so don't bother and use SSL.
	options := xmpp.Options{
		Host:          c.Host,
		User:          c.Jid,
		Debug:         false,
		Password:      c.Password,
		Resource:      "bot",
		Session:       true,
		Status:        "Available",
		StatusMessage: "Hal-9001 online.",
	}

	client, err := options.NewClient()
	if err != nil {
		log.Fatalf("Could not connect to Hipchat over XMPP: %s\n", err)
	}

	for jid, name := range c.Rooms {
		_, err = client.JoinMUCNoHistory(jid, name)
		if err != nil {
			log.Fatalf("Could not join room %q/%q: %s", name, jid, err)
		}
	}

	hb := Broker{
		Client: client,
		Config: c,
		inst:   name,
	}

	return hb
}

func (hb Broker) Name() string {
	return hb.inst
}

func (hb Broker) Send(evt hal.Evt) {
	remote := fmt.Sprintf("%s/%s", evt.RoomId, hb.RoomIdToName(evt.RoomId))

	msg := xmpp.Chat{
		Text:   evt.Body,
		Stamp:  evt.Time,
		Type:   "groupchat",
		Remote: remote,
	}

	_, err := hb.Client.Send(msg)
	if err != nil {
		log.Printf("Failed to send message to Hipchat server: %s\n", err)
	}
}

// TODO: implement this - if Atlassian ever re-publishes the API docs.
func (hb Broker) SendDM(e hal.Evt) {
	panic("SendDM not implemented in Hipchat yet.")
}

// TODO: this is untested and may not be entirely correct
func (hb Broker) Leave(roomId string) error {
	for jid, name := range c.Rooms {
		if roomId == name {
			_, err := hb.Client.LeaveMUC(jid)
			return err
		}
	}
	return fmt.Errorf("Unable to determine JID of room %q.", roomId)
}

// TODO: implement
func (hb Broker) GetTopic(roomId string) (string, error) {
	panic("SetTopic not implemented in Hipchat yet. Pull requests welcome.")
}

// TODO: implement
func (hb Broker) SetTopic(roomId, topic string) error {
	panic("SetTopic not implemented in Hipchat yet. Pull requests welcome.")
}

func (hb Broker) SendTable(evt hal.Evt, hdr []string, rows [][]string) {
	out := evt.Clone()
	// TODO: verify if this works for bots - works fine in the client
	// will probably need to post with the API
	out.Body = fmt.Sprintf("/code %s", hal.Utf8Table(hdr, rows))
	hb.Send(out)
}

func (hb Broker) LooksLikeRoomId(room string) bool {
	log.Println("brokers/hipchat/LooksLikeRoomId() is a stub that always returns true!")
	return true
}

func (hb Broker) LooksLikeUserId(user string) bool {
	log.Println("brokers/hipchat/LooksLikeUserId() is a stub that always returns true!")
	return true
}

// Subscribe joins a room with the given alias.
// These names are specific to how Hipchat does things.
func (hb *Broker) Subscribe(room, alias string) {
	// TODO: take a room name and somehow look up the goofy MUC name
	// e.g. client.JoinMUC("99999_roomName@conf.hipchat.com", "Bot Name")
	hb.Client.JoinMUCNoHistory(room, alias)
	hb.Config.Rooms[room] = alias
}

// Keepalive is a timer loop that can be fired up to periodically
// send keepalive messages to the Hipchat server in order to prevent
// Hipchat from shutting the connection down due to inactivity.
func (hb *Broker) heartbeat(t time.Time) {
	// this seems to work but returns an error you'll see in the logs
	msg := xmpp.Chat{
		Text:  "heartbeat",
		Stamp: t,
	}
	msg.Stamp = t

	n, err := hb.Client.Send(msg)
	if err != nil {
		log.Fatalf("Failed to send keepalive (%d): %s\n", n, err)
	}
}

// Stream is an event loop for Hipchat events.
func (hb Broker) Stream(out chan *hal.Evt) {
	client := hb.Client
	incoming := make(chan *xmpp.Chat)
	timer := time.Tick(time.Minute * 1) // once a minute

	// grab chat messages using the blocking Recv() and forward them
	// on a channel so the select loop can also handle sending heartbeats
	go func() {
		for {
			msg, err := client.Recv()
			if err != nil {
				log.Printf("Error receiving from Hipchat: %s\n", err)
			}

			switch t := msg.(type) {
			case xmpp.Chat:
				m := msg.(xmpp.Chat)
				incoming <- &m
			case xmpp.Presence:
				continue // ignored
			default:
				log.Printf("Unhandled message of type '%T': %s ", t, t)
			}
		}
	}()

	for {
		select {
		case t := <-timer:
			hb.heartbeat(t)
		case chat := <-incoming:
			// Remote should look like "99999_roomName@conf.hipchat.com/User Name"
			parts := strings.SplitN(chat.Remote, "/", 2)
			now := time.Now()

			if len(parts) == 2 {
				// XMPP doesn't have IDs, use time like Slack
				e := hal.Evt{
					ID:       fmt.Sprintf("%d.%06d", now.Unix(), now.UnixNano()),
					Body:     chat.Text,
					Room:     hb.RoomIdToName(parts[0]),
					RoomId:   parts[0],
					User:     parts[1],
					UserId:   chat.Remote,
					Time:     now, // m.Stamp seems to be zeroed
					Broker:   hb,
					IsChat:   true,
					Original: &chat,
				}

				out <- &e
			} else {
				log.Printf("hipchat broker received an unsupported message: %+v", chat)
			}
		}
	}
}

// only considers rooms that have been configured in the bot
// and does not hit the Hipchat APIs at all
// TODO: hit the API and get the room/name lists and cache them
func (b Broker) RoomIdToName(in string) string {
	if name, exists := b.Config.Rooms[in]; exists {
		return name
	}

	return ""
}

func (b Broker) RoomNameToId(in string) string {
	for id, name := range b.Config.Rooms {
		if name == in {
			return id
		}
	}

	return ""
}

func (b Broker) UserIdToName(in string) string { return in }
func (b Broker) UserNameToId(in string) string { return in }
