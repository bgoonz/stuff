package google_calendar

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

// TODO: announce start / end

import (
	"fmt"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/netflix/hal-9001/hal"
)

var log hal.Logger

const Usage = `!gcal (silence|status|expire|reload)
!gcal silence 4h
!gcal reload


Even when attached, this plugin will not do anything until it is fully configured
for the room. At a mininum the calendar-id needs to be set. One or all of autoreply,
announce-start, and announce-end should be set to true to make anything happen.

Setting up:

    !prefs set --room <roomid> --plugin google_calendar --key calendar-id --value <calendar link>

    autoreply: when set to true, the bot will reply with a message for any activity in the
    room during hours when an event exists on the calendar. If the event has a description
    set, that will be the text sent to the room. Otherwise a default message is generated.
    !prefs set --room <roomid> --plugin google_calendar --key autoreply --value true

    announce-(start|end): the bot will automatically announce when an event is starting or
    ending. The event's description will be included if it is not empty.
    !prefs set --room <roomid> --plugin google_calendar --key announce-start --value true
    !prefs set --room <roomid> --plugin google_calendar --key announce-end --value true

    timezone: optional, tells the bot which timezone to report dates in
    !prefs set --room <roomid> --plugin google_calendar --key timezone --value America/Los_Angeles
`

const DefaultTz = "America/Los_Angeles"
const DefaultMsg = "Calendar event: %q"

type Config struct {
	RoomId        string
	CalendarId    string
	Timezone      time.Location
	Autoreply     bool
	AnnounceStart bool
	AnnounceEnd   bool
	CalEvents     []CalEvent
	EvtsSinceLast int
	mut           sync.Mutex
	configTs      time.Time
	calTs         time.Time
}

var configCache map[string]*Config
var topMut sync.Mutex
var mentionWords = [...]string{"@here", "@all"}

func init() {
	configCache = make(map[string]*Config)
	log.SetPrefix("plugins/google_calendar")
}

func Register() {
	p := hal.Plugin{
		Name: "google_calendar",
		Func: handleEvt,
		Init: initData,
	}

	p.Register()
}

// initData primes the cache and starts the background goroutine
func initData(inst *hal.Instance) {
	topMut.Lock()
	config := Config{RoomId: inst.RoomId}
	configCache[inst.RoomId] = &config
	topMut.Unlock()

	pf := hal.PeriodicFunc{
		Name:     "google_calendar-" + inst.RoomId,
		Interval: time.Minute * 10,
		Function: func() { updateCachedCalEvents(inst.RoomId) },
	}
	pf.Register()

	go func() {
		time.Sleep(time.Second * 5)
		pf.Start()
	}()
}

// handleEvt handles events coming in from the chat system. It does not interact
// directly with the calendar API and relies on the background goroutine to populate
// the cache.
func handleEvt(evt hal.Evt) {
	// don't process non-chat or messages with an empty body
	if !evt.IsChat || evt.Body == "" {
		return
	}

	if strings.HasPrefix(strings.TrimSpace(evt.Body), "!") {
		handleCommand(&evt)
		return
	}

	now := time.Now()

	// use the hal kv store to prevent spamming
	// the spam keys are written with a 1 hour TTL so there's no need to examine the time
	// except for debugging purposes
	userSpamKey := getSpamKey("user", evt.UserId)
	userTs, _ := hal.GetKV(userSpamKey)
	// users can !gcal silence to silence the messages for the whole room e.g. during an incident
	roomSpamKey := getSpamKey("room", evt.RoomId)
	roomTs, _ := hal.GetKV(roomSpamKey)

	// always reply to @here/@everyone, etc.
	var isBroadcast bool
	for _, mention := range mentionWords {
		if strings.Contains(evt.Body, mention) {
			isBroadcast = true
			break
		}
	}

	config := getCachedConfig(evt.RoomId, now)
	calEvents, err := config.getCachedCalEvents(now)
	if err != nil {
		nospamReplyf(&evt, "Error while getting calendar data: %s", err)
		return
	}

	log.Debugf("handleEvt checking message. Replied to user at: %q. Replied to room at: %q. %d events since last reply", userTs, roomTs, config.EvtsSinceLast)

	// count events since the last notification to the room
	if roomTs != "" {
		config.EvtsSinceLast++

		// wait for at least 20 events before notifying again
		// TODO: should this be configurable?
		if config.EvtsSinceLast > 20 {
			// some events have passed and the message has likely been scrolled
			// off most screens so let it hit the room again
			roomTs = ""
		}
	}

	// the user/room has been notified in the last hour, nothing to do now
	if !isBroadcast && (userTs != "" || roomTs != "") {
		log.Printf("Not responding to message because a reply was sent already. user @ %q, room @ %q", userTs, roomTs)
		return
	}

	for _, e := range calEvents {
		log.Debugf("Autoreply: %t, Now: %q, Start: %q, End: %q", config.Autoreply, now.String(), e.Start.String(), e.End.String())
		log.Debugf("e.Description: %q, e.Name: %q", e.Description, e.Name)
		if config.Autoreply && e.Start.Before(now) && e.End.After(now) {
			msg := e.Description
			if msg == "" {
				msg = fmt.Sprintf(DefaultMsg, e.Name)
			}

			evt.Reply(msg)

			expire := e.End.Sub(now)
			hal.SetKV(userSpamKey, now.Format(time.RFC3339), expire) // only notify each user once per calendar event
			hal.SetKV(roomSpamKey, now.Format(time.RFC3339), expire) // only notify the room again if it gets busy
			log.Debugf("will not notify room %q for 10 minutes or the user %q for 2 hours", roomSpamKey, userSpamKey)

			config.EvtsSinceLast = 0

			break // only notify once even if there are overlapping entries
		}
	}
}

// nospamReplyf keeps track of error replies and only replies with the same message
// once per hour.
func nospamReplyf(evt *hal.Evt, msg string, a ...interface{}) {
	errSpamKey := getSpamKey("err", evt.RoomId)
	errStr, _ := hal.GetKV(errSpamKey)

	reply := fmt.Sprintf(msg, a...)

	if errStr == reply {
		log.Println(reply)
		return
	}

	evt.Reply(reply)

	hal.SetKV(errSpamKey, reply, time.Hour)
}

func handleCommand(evt *hal.Evt) {
	argv := evt.BodyAsArgv()

	if argv[0] != "!gcal" {
		return
	}

	if len(argv) < 2 {
		evt.Replyf(Usage)
		return
	}

	now := time.Now()
	config := getCachedConfig(evt.RoomId, now)

	switch argv[1] {
	case "status":
		evt.Replyf("Calendar cache is %.f minutes old. Config cache is %.f minutes old.",
			now.Sub(config.calTs).Minutes(), now.Sub(config.configTs).Minutes())
	case "help":
		evt.Replyf(Usage)
	case "expire":
		config.expireCaches()
		evt.Replyf("config & calendar caches expired")
	case "reload":
		config.expireCaches()
		updateCachedCalEvents(evt.RoomId)
		evt.Replyf("reload complete")
	case "silence":
		if len(argv) == 3 {
			d, err := time.ParseDuration(argv[2])
			if err != nil {
				evt.Replyf("Invalid silence duration %q: %s", argv[2], err)
			} else {
				key := getSpamKey("room", evt.RoomId)
				hal.SetKV(key, "-", d)
				evt.Replyf("Calendar notifications silenced for %s.", d.String())
			}
		} else {
			evt.Reply("Invalid command. A duration is requried, e.g. !gcal silence 4h")
		}
	}
}

func getSpamKey(scope, id string) string {
	return "gcal-" + scope + "-spam-" + id
}

func updateCachedCalEvents(roomId string) {
	log.Debugf("START: updateCachedCalEvents(%q)", roomId)

	now := time.Now()

	topMut.Lock()
	c := configCache[roomId]
	topMut.Unlock()

	c.LoadFromPrefs() // update the config from prefs

	evts, err := getEvents(c.CalendarId, now)
	if err != nil {
		log.Printf("FAILED: updateCachedCalEvents(%q): %s", roomId, err)
		return
	}

	c.mut.Lock()
	c.calTs = now
	c.CalEvents = evts
	c.mut.Unlock()

	log.Debugf("DONE: updateCachedCalEvents(%q)", roomId)
}

func getCachedConfig(roomId string, now time.Time) *Config {
	topMut.Lock()
	c := configCache[roomId]
	topMut.Unlock()

	age := now.Sub(c.configTs)

	if age.Minutes() > 10 {
		c.LoadFromPrefs()
	}

	return c
}

// getCachedEvents fetches the calendar data from the Google Calendar API,
func (c *Config) getCachedCalEvents(now time.Time) ([]CalEvent, error) {
	c.mut.Lock()
	calAge := now.Sub(c.calTs)
	c.mut.Unlock()

	if calAge.Hours() > 1.1 {
		log.Debugf("%q's calendar cache appears to be expired after %f hours", c.RoomId, calAge.Hours())
		evts, err := getEvents(c.CalendarId, now)
		if err != nil {
			log.Printf("Error encountered while fetching calendar events: %s", err)
			return nil, err
		} else {
			c.mut.Lock()
			c.calTs = now
			c.CalEvents = evts
			c.mut.Unlock()
		}
	}

	return c.CalEvents, nil
}

func (c *Config) LoadFromPrefs() error {
	c.mut.Lock()
	defer c.mut.Unlock()

	cidpref := hal.GetPref("", "", c.RoomId, "google_calendar", "calendar-id", "")
	if cidpref.Success {
		c.CalendarId = cidpref.Value
	} else {
		return fmt.Errorf("Failed to load calendar-id preference for room %q: %s", c.RoomId, cidpref.Error)
	}

	c.Autoreply = c.loadBoolPref("autoreply")
	c.AnnounceStart = c.loadBoolPref("announce-start")
	c.AnnounceEnd = c.loadBoolPref("announce-end")

	tzpref := hal.GetPref("", "", c.RoomId, "google_calendar", "timezone", DefaultTz)
	tz, err := time.LoadLocation(tzpref.Value)
	if err != nil {
		return fmt.Errorf("Could not load timezone info for '%s': %s\n", tzpref.Value, err)
	}
	c.Timezone = *tz

	c.configTs = time.Now()

	return nil
}

func (c *Config) expireCaches() {
	c.calTs = time.Time{}
	c.configTs = time.Time{}
}

func (c *Config) loadBoolPref(key string) bool {
	pref := hal.GetPref("", "", c.RoomId, "google_calendar", key, "false")

	val, err := strconv.ParseBool(pref.Value)
	if err != nil {
		log.Printf("unable to parse boolean pref value: %s", err)
		return false
	}

	return val
}
