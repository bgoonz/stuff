package slack

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
	"image"
	"image/color"
	"image/draw"
	"image/png"
	"io/ioutil"
	"os"
	"regexp"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/netflix/hal-9001/hal"
	"github.com/nlopes/slack"
)

var log hal.Logger

// Broker interacts with the slack service.
// TODO: add a miss cache to avoid hammering the room/user info apis
type Broker struct {
	Client  *slack.Client     // slack API object
	RTM     *slack.RTM        // slack RTM object
	UserId  string            // slack Bot user ID (for preventing loops)
	inst    string            // broker instance name
	i2u     map[string]string // id->name cache
	i2c     map[string]string // id->name cache
	u2i     map[string]string // name->id cache
	c2i     map[string]string // name->id cache
	imcs    map[string]string // userId -> channelId im channels
	lufill  time.Time         // timestamp of the last user cache fill
	lrfill  time.Time         // timestamp of the last room cache fill
	idRegex *regexp.Regexp    // compiled RE to match user/room ids
	mut     sync.Mutex        // protect access to the lookup maps
}

type Config struct {
	Token string
}

var LooksLikeIdRE *regexp.Regexp

func init() {
	LooksLikeIdRE = regexp.MustCompile(`^[UCD]\w{8}$`)

	log.SetPrefix("brokers/slack")
}

func (c Config) NewBroker(name string) Broker {
	client := slack.New(c.Token)
	// TODO: check for failures and log.Fatalf()
	rtm := client.NewRTM()

	sb := Broker{
		Client: client,
		RTM:    rtm,
		inst:   name,
		i2u:    make(map[string]string),
		i2c:    make(map[string]string),
		u2i:    make(map[string]string),
		c2i:    make(map[string]string),
		imcs:   make(map[string]string),
	}

	// fill the caches at startup to cut down on API requests
	sb.FillUserCache()
	sb.FillRoomCache()

	go rtm.ManageConnection()

	return sb
}

// Name returns the name of the broker as set in NewBroker.
func (sb Broker) Name() string {
	return sb.inst
}

func (sb Broker) Send(evt hal.Evt) {
	// Slack refuses messages over 4000 characters. Most of the time that's
	// probably data so post it as a file. Using len instead of rune count since
	// slack is probably looking at bytes.
	if len(evt.Body) > 3999 {
		sb.SendAsSnippet(evt)
	} else {
		sb.SendAsIs(evt)
	}
}

func (sb Broker) SendAsSnippet(evt hal.Evt) {
	f, err := ioutil.TempFile(os.TempDir(), "hal")
	if err != nil {
		evt.Replyf("Could not create tempfile for large text upload: %s", err)
		return
	}
	defer os.Remove(f.Name())

	f.WriteString(evt.Body)
	f.Close()

	// upload the file
	params := slack.FileUploadParameters{
		File:     f.Name(),
		Filename: "reply.txt",
		Channels: []string{evt.RoomId},
	}
	_, err = sb.Client.UploadFile(params)
	if err != nil {
		evt.Replyf("Could not upload snippet file: %s", err)
	}
}

// SendAsIs directly sends a message without considering it for posting as a snippet.
func (sb Broker) SendAsIs(evt hal.Evt) {
	// if evt.Original is a slack.PostMessageParameters, assume that means that there is
	// a rich message in the body with params that need to be posted to the web API
	// rather than going through RTM.
	// See: https://api.slack.com/bot-users
	switch evt.Original.(type) {
	case *slack.PostMessageParameters:
		params := evt.Original.(*slack.PostMessageParameters)
		params.AsUser = true // if we've gotten here, we always want this
		sb.Client.PostMessage(evt.RoomId, evt.Body, *params)
	default:
		om := sb.RTM.NewOutgoingMessage(evt.Body, evt.RoomId)
		sb.RTM.SendMessage(om)
	}
}

func (sb Broker) SendDM(evt hal.Evt) {
	evt.Room = ""
	evt.RoomId = ""

	if roomId, exists := sb.imcs[evt.UserId]; exists {
		// cache hit
		// TODO: verify what happens if the destination user has closed the DM
		evt.RoomId = roomId
	} else {
		// try to open the channel, cache it if it works
		_, _, roomId, err := sb.RTM.OpenIMChannel(evt.UserId)
		if err != nil {
			log.Printf("Error from RTM.OpenIMChannel(%q): %s", evt.UserId, err)
		} else {
			sb.imcs[evt.UserId] = roomId
			sb.i2c[roomId] = evt.UserId // TODO: verify this isn't a stupid idea
			evt.RoomId = roomId
		}
	}

	if evt.RoomId != "" {
		sb.Send(evt)
	} else {
		log.Printf("SendDM() failed because it couldn't identify a DM RoomID!")
		log.Printf("Failed message: %q", evt.String())
	}
}

func (sb Broker) Leave(roomId string) error {
	_, err := sb.Client.LeaveChannel(roomId)
	return err
}

func (sb Broker) GetTopic(roomId string) (string, error) {
	ch, err := sb.Client.GetChannelInfo(roomId)
	return ch.Topic.Value, err
}

func (sb Broker) SetTopic(roomId, topic string) error {
	r, err := sb.Client.SetChannelTopic(roomId, topic)
	log.Debugf("SetTopic(%q, %q) = %q", roomId, topic, r)
	return err
}

func (sb Broker) SendTable(evt hal.Evt, hdr []string, rows [][]string) {
	out := evt.Clone()
	out.Body = hal.Utf8Table(hdr, rows)

	tblFmt := hal.FindPrefs("", "", "", "", "table.format").One()

	if tblFmt.Value == "image" {
		sb.SendAsImage(out)
	} else if tblFmt.Value == "snippet" {
		sb.SendAsSnippet(out)
	} else {
		sb.SendAsIs(out)
	}
}

// SendAsImage sends the body of the event as a png file. The png is rendered
// using hal's FixedFont facility.
// This is useful for making sure pre-formatted text stays legible in
// Slack while we wait for them to figure out a way to render things like
// tables of data consistently.
func (sb Broker) SendAsImage(evt hal.Evt) {
	fd := hal.FixedFont()

	// create a tempfile
	f, err := ioutil.TempFile(os.TempDir(), "hal")
	if err != nil {
		evt.Replyf("Could not create tempfile for image upload: %s", err)
		return
	}
	defer os.Remove(f.Name())

	// check for a color preference
	// need to figure out a way to have a helper around this
	var fg color.Color
	fg = color.Black
	// TODO: prefs --set isn't setting the room, etc. remove the filter for now
	fgprefs := hal.FindPrefs("", "", "", "", "image.fg")
	ufgprefs := fgprefs.User(evt.UserId)
	if len(ufgprefs) > 0 {
		fg = fd.ParseColor(ufgprefs[0].Value, fg)
	} else if len(fgprefs) > 0 {
		fg = fd.ParseColor(fgprefs[0].Value, fg)
	}

	var bg color.Color
	bg = color.Transparent
	// TODO: ditto from ft
	//bgprefs := hal.FindPrefs("", sb.Name(), evt.RoomId, "", "image.bg")
	bgprefs := hal.FindPrefs("", "", "", "", "image.bg")
	ubgprefs := bgprefs.User(evt.UserId)
	if len(ubgprefs) > 0 {
		bg = fd.ParseColor(ubgprefs[0].Value, fg)
	} else if len(bgprefs) > 0 {
		bg = fd.ParseColor(bgprefs[0].Value, fg)
	}

	// generate the image
	lines := strings.Split(strings.TrimSpace(evt.Body), "\n")
	textimg := fd.StringsToImage(lines, fg)

	// img has a background color, copy textimg onto it
	img := image.NewRGBA(textimg.Bounds())
	draw.Draw(img, img.Bounds(), &image.Uniform{bg}, image.ZP, draw.Src)
	draw.Draw(img, img.Bounds(), textimg, image.ZP, draw.Src)

	// TODO: apply background color

	// write the png data to the temp file
	png.Encode(f, img)
	f.Close()

	// upload the file
	params := slack.FileUploadParameters{
		File:     f.Name(),
		Filename: "text.png",
		Channels: []string{evt.RoomId},
	}
	_, err = sb.Client.UploadFile(params)
	if err != nil {
		evt.Replyf("Could not upload image: %s", err)
	}
}

func (sb Broker) LooksLikeRoomId(room string) bool {
	sb.mut.Lock()
	defer sb.mut.Unlock()

	if _, exists := sb.i2c[room]; exists {
		return true
	}

	return LooksLikeIdRE.MatchString(room)
}

func (sb Broker) LooksLikeUserId(user string) bool {
	sb.mut.Lock()
	defer sb.mut.Unlock()

	if _, exists := sb.i2u[user]; exists {
		return true
	}

	return LooksLikeIdRE.MatchString(user)
}

// checks the cache to see if the room is known to this broker
func (sb Broker) HasRoom(room string) bool {
	sb.mut.Lock()
	defer sb.mut.Unlock()

	if LooksLikeIdRE.MatchString(room) {
		_, exists := sb.i2c[room]
		return exists
	} else {
		_, exists := sb.c2i[room]
		return exists
	}
}

// Stream is an event loop for Slack events & messages from the RTM API.
// Events are copied to a hal.Evt and forwarded to the exchange where they
// can be processed by registered handlers.
func (sb Broker) Stream(out chan *hal.Evt) {
	for {
		select {
		case msg := <-sb.RTM.IncomingEvents:
			switch ev := msg.Data.(type) {
			case *slack.UserTypingEvent:
				// frequent and mostly useless in a bot: ignore

			case *slack.HelloEvent:
				log.Debugf("HelloEvent")

			case *slack.ConnectedEvent:
				info := sb.RTM.GetInfo()
				sb.UserId = info.User.ID

				log.Debugf("ConnectedEvent - retreived bot ID %q", sb.UserId)

			case *slack.MessageEvent:
				// https://api.slack.com/events/message
				m := msg.Data.(*slack.MessageEvent)

				// mark messages generated by the bot user to prevent loops, etc.
				// but pass them through so stuff like the archive module can get them
				isBot := m.User == sb.UserId

				// A few other kinds of events are bundled as messages with a subtype.
				// Only allow isChat to remain true if it's an actual chat message.
				isChat := m.SubType == ""

				// slack channels = hal rooms, see hal-9001/hal/event.go
				e := hal.Evt{
					ID:       m.Timestamp,
					Body:     m.Text,
					Room:     sb.RoomIdToName(m.Channel),
					RoomId:   m.Channel,
					User:     sb.UserIdToName(m.User),
					UserId:   m.User,
					Broker:   sb,
					Time:     SlackTime(m.Timestamp),
					IsChat:   isChat,
					IsBot:    isBot,
					Original: m,
				}

				// let everyone know the bot is working if it appears to be a command
				if !isBot && strings.HasPrefix(strings.TrimSpace(m.Text), "!") {
					tm := sb.RTM.NewTypingMessage(m.Channel)
					sb.RTM.SendMessage(tm)
				}

				out <- &e

			case *slack.StarAddedEvent:
				sae := msg.Data.(*slack.StarAddedEvent)

				if sae.User == sb.UserId {
					log.Debugf("ignoring event from bot with id %s", sb.UserId)
					continue // ignore bot-created events
				}

				user := sb.UserIdToName(sae.User)

				e := hal.Evt{
					ID:       sae.EventTimestamp,
					Body:     fmt.Sprintf("%q added a star", user),
					Room:     sb.RoomIdToName(sae.Item.Channel),
					RoomId:   sae.Item.Channel,
					User:     user,
					UserId:   sae.User,
					Broker:   sb,
					Time:     SlackTime(sae.EventTimestamp),
					Original: sae,
				}

				out <- &e

			case *slack.StarRemovedEvent:
				sre := msg.Data.(*slack.StarRemovedEvent)

				if sre.User == sb.UserId {
					log.Debugf("ignoring event from bot with id %s", sb.UserId)
					continue // ignore bot-created events
				}

				user := sb.UserIdToName(sre.User)

				e := hal.Evt{
					ID:       sre.EventTimestamp,
					Body:     fmt.Sprintf("%q removed a star", user),
					Room:     sb.RoomIdToName(sre.Item.Channel),
					RoomId:   sre.Item.Channel,
					User:     user,
					UserId:   sre.User,
					Broker:   sb,
					Time:     SlackTime(sre.EventTimestamp),
					Original: sre,
				}

				out <- &e

			case *slack.ReactionAddedEvent:
				rae := msg.Data.(*slack.ReactionAddedEvent)

				if rae.User == sb.UserId {
					log.Debugf("ignoring event from bot with id %s", sb.UserId)
					continue // ignore bot-created events
				}

				user := sb.UserIdToName(rae.User)

				e := hal.Evt{
					ID:       rae.EventTimestamp,
					Body:     fmt.Sprintf("%q added reaction %q", user, rae.Reaction),
					Room:     sb.RoomIdToName(rae.Item.Channel),
					RoomId:   rae.Item.Channel,
					User:     user,
					UserId:   rae.User,
					Broker:   sb,
					Time:     SlackTime(rae.EventTimestamp),
					Original: rae,
				}

				out <- &e

			case *slack.ReactionRemovedEvent:
				rre := msg.Data.(*slack.ReactionRemovedEvent)

				if rre.User == sb.UserId {
					log.Debugf("ignoring event from bot with id %s", sb.UserId)
					continue // ignore bot-created events
				}

				user := sb.UserIdToName(rre.User)

				e := hal.Evt{
					ID:       rre.EventTimestamp,
					Body:     fmt.Sprintf("%q removed reaction %q", user, rre.Reaction),
					Room:     sb.RoomIdToName(rre.Item.Channel),
					RoomId:   rre.Item.Channel,
					User:     user,
					UserId:   rre.User,
					Broker:   sb,
					Time:     SlackTime(rre.EventTimestamp),
					Original: rre,
				}

				out <- &e

			case *slack.ChannelJoinedEvent:
				je := msg.Data.(*slack.ChannelJoinedEvent)
				now := time.Now()

				sb.injectRoomId(je.Channel.ID, je.Channel.Name) // cache the id:name

				e := hal.Evt{
					ID:       now.String(), // fake an id
					Body:     je.Channel.Name,
					Room:     je.Channel.Name,
					RoomId:   je.Channel.ID,
					User:     sb.UserId,
					UserId:   sb.UserId,
					Broker:   sb,
					Time:     now,
					Original: je,
				}

				out <- &e

			case *slack.GroupJoinedEvent:
				// exactly the same as ChannelJoinedEvent ^^ in a separate type
				je := msg.Data.(*slack.GroupJoinedEvent)
				now := time.Now()

				sb.injectRoomId(je.Channel.ID, je.Channel.Name) // cache the id:name

				e := hal.Evt{
					ID:       now.String(), // fake an id
					Body:     je.Channel.Name,
					Room:     je.Channel.Name,
					RoomId:   je.Channel.ID,
					User:     sb.UserId,
					UserId:   sb.UserId,
					Broker:   sb,
					Time:     now,
					Original: je,
				}

				out <- &e

			case *slack.PresenceChangeEvent:
				// ignored

			case *slack.LatencyReport:
				// ignored

			case *slack.FileCreatedEvent, *slack.FilePublicEvent, *slack.FileSharedEvent:
				// ignored

			case *slack.PrefChangeEvent:
				// ignored

			case *slack.RTMError:
				log.Printf("ignoring RTMError: %s\n", ev.Error())

			case *slack.InvalidAuthEvent:
				log.Debugf("InvalidAuthEvent")
				break

			default:
				log.Debugf("unexpected message: %+v\n", msg)
			}
		}
	}
}

// SlackTime converts the timestamp string to time.Time
func SlackTime(t string) time.Time {
	if t == "" {
		return time.Now()
	}

	// Slack advises not to parse the timestamp as a float.
	// I tried it. Turns out that string mangling is more accurate than
	// float conversions.
	parts := strings.SplitN(t, ".", 2)

	s, _ := strconv.ParseInt(parts[0], 10, 64)
	ns, _ := strconv.ParseInt(parts[1], 10, 64)

	return time.Unix(s, ns)
}

func (sb *Broker) FillUserCache() {
	// don't let this fire more than once every half hour
	now := time.Now()
	if now.Sub(sb.lufill) < time.Minute*30 {
		log.Debugf("refusing to fill cache because it has been less than 30 minutes since the last fill @ %s", sb.lufill.String())
		return
	}
	sb.lufill = now

	users, err := sb.Client.GetUsers()
	if err != nil {
		log.Printf("failed to fetch user list: %s", err)
		return
	}

	// push the users into the directory async so it doesn't hold up bot
	// startup (FillUserCache is called preemptively at startup)
	go func() {
		for _, user := range users {
			attrs := map[string]string{
				"username": user.Name,
				"name":     user.RealName,
				"email":    user.Profile.Email,
			}
			hal.Directory().Put(user.ID, "slack-user", attrs, []string{"email"})
		}
	}()

	sb.mut.Lock()
	defer sb.mut.Unlock()

	for _, user := range users {
		sb.u2i[user.Name] = user.ID
		sb.i2u[user.ID] = user.Name
	}
}

func (sb *Broker) FillRoomCache() {
	// don't let this fire more than once every half hour
	now := time.Now()
	if now.Sub(sb.lrfill) < time.Minute*30 {
		log.Printf("refusing to fill cache because it has been less than 30 minutes since the last fill @ %s", sb.lrfill.String())
		return
	}
	sb.lrfill = now

	rooms, err := sb.Client.GetChannels(true)
	if err != nil {
		log.Printf("failed to fetch room list: %s", err)
		return
	}

	// now get private channels a.k.a. groups
	groups, err := sb.Client.GetGroups(true)
	if err != nil {
		log.Printf("failed to fetch private channel list: %s", err)
		return
	}

	sb.mut.Lock()
	defer sb.mut.Unlock()

	for _, room := range rooms {
		sb.c2i[room.Name] = room.ID
		sb.i2c[room.ID] = room.Name
	}

	for _, group := range groups {
		sb.c2i[group.Name] = group.ID
		sb.i2c[group.ID] = group.Name
	}
}

// UserIdToName gets the human-readable username for a user ID using an
// in-memory cache that falls through to the Slack API
func (sb Broker) UserIdToName(id string) string {
	if id == "" {
		log.Debugf("UserIdToName(): Cannot look up empty string!")
		return ""
	}

	sb.mut.Lock()
	name, exists := sb.i2u[id]
	sb.mut.Unlock()

	if exists {
		return name
	} else {
		user, err := sb.Client.GetUserInfo(id)
		if err != nil {
			log.Printf("could not retrieve user info for '%s' via API: %s\n", id, err)
			return ""
		}

		// don't wait around for this - it can block
		go func() {
			attrs := map[string]string{
				"username": user.Name,
				"name":     user.RealName,
				"email":    user.Profile.Email,
			}

			hal.Directory().Put(user.ID, "slack-user", attrs, []string{"email"})
		}()

		sb.mut.Lock()
		defer sb.mut.Unlock()

		sb.i2u[user.ID] = user.Name
		sb.i2u[user.Name] = user.ID

		return user.Name
	}
}

// RoomIdToName gets the human-readable room name for a user ID using an
// in-memory cache that falls through to the Slack API
func (sb Broker) RoomIdToName(id string) string {
	sb.mut.Lock()
	defer sb.mut.Unlock()

	if id == "" {
		log.Debugf("RoomIdToName(): Cannot look up empty string!")
		return ""
	}

	if name, exists := sb.i2c[id]; exists {
		return name
	} else {
		var name string

		// private channels are on a different endpoint
		if strings.HasPrefix(id, "G") {
			grp, err := sb.Client.GetGroupInfo(id)
			if err != nil {
				log.Printf("could not retrieve room info for '%s' via API: %s\n", id, err)
				return ""
			}
			name = grp.Name
		} else if strings.HasPrefix(id, "D") {
			log.Println("DM CHANNELS ARE A WORK IN PROGRESS")
			//log.Printf("could not retrieve room info for '%s' via API: %s\n", id, err)
		} else {
			room, err := sb.Client.GetChannelInfo(id)
			if err != nil {
				log.Printf("could not retrieve room info for '%s' via API: %s\n", id, err)
				return ""
			}
			name = room.Name
		}

		sb.i2c[id] = name
		sb.c2i[name] = id

		return name
	}
}

// UserNameToId gets the human-readable username for a user ID using an
// in-memory cache that falls through to the Slack API
func (sb Broker) UserNameToId(name string) string {
	if name == "" {
		log.Debugf("UserNameToId(): Cannot look up empty string!")
		return ""
	}

	sb.mut.Lock()
	id, exists := sb.u2i[name]
	sb.mut.Unlock()

	if exists {
		return id
	} else {
		// there doesn't seem to be a name->id lookup so refresh the cache
		// and try again if we get here
		sb.FillUserCache()

		sb.mut.Lock()
		defer sb.mut.Unlock()

		if id, exists := sb.u2i[name]; exists {
			return id
		}

		log.Printf("service does not seem to have knowledge of username %q", name)
		return ""
	}
}

// RoomNameToId gets the id for a room name using an
// in-memory cache that falls through to the Slack API
func (sb Broker) RoomNameToId(name string) string {
	if name == "" {
		log.Println("RoomNameToId(): Cannot look up empty string!")
		return ""
	}

	sb.mut.Lock()
	id, exists := sb.c2i[name]
	sb.mut.Unlock()

	if exists {
		return id
	} else {
		sb.FillRoomCache()

		sb.mut.Lock()
		defer sb.mut.Unlock()

		if id, exists = sb.c2i[name]; exists {
			return id
		}

		log.Printf("service does not seem to have knowledge of room name %q", name)
		return ""
	}
}

// injectRoomId adds an id:name mapping to the forward and reverse lookup maps
// for internal use only, used to inject groups (private channels) on join
func (sb Broker) injectRoomId(id, name string) {
	sb.mut.Lock()
	defer sb.mut.Unlock()

	sb.c2i[name] = id
	sb.i2c[id] = name
}
