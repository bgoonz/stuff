// prefmgr exposes hal's preferences as a bot command and over REST
package prefmgr

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
	"net/http"
	"regexp"
	"strings"

	"github.com/netflix/hal-9001/hal"
)

const NAME = "prefmgr"

const HELP = `Listing keys with no filter will list all keys visible to the active user and room.

!prefs list --key KEY
!prefs list --user USER --room CHANNEL --plugin PLUGIN --key KEY --def DEFAULT
`

var cli *hal.Cmd
var slackLinkRE *regexp.Regexp
var log hal.Logger

func init() {
	log.SetPrefix("plugins/prefmgr")
}

func init() {
	cli = hal.NewCmd("!pref", true).SetUsage("Manage hal preferences over chat.")

	keyUsage := "the key name, up to 190 utf8 characters"
	valueUsage := "the value, arbitrary utf8"
	roomUsage := "the chat room id (usually auto-resolved, '*' for 'this room')"
	userUsage := "the user id (usually auto-resolved, '*' for 'executing user')"
	brokerUsage := "the broker name. e.g. 'slack' ('*' for 'this broker')"
	pluginUsage := "the plugin name. e.g. 'archive' ('*' for 'this plugin')"

	cli.AddSubCmd("set").
		SetUsage("set a preference key/value").
		SubCmd().AddKVParam("key", true).AddAlias("k").SetUsage(keyUsage).
		SubCmd().AddKVParam("value", true).AddAlias("v").SetUsage(valueUsage).
		SubCmd().AddKVParam("room", false).AddAlias("r").SetUsage(roomUsage).
		SubCmd().AddKVParam("user", false).AddAlias("u").SetUsage(userUsage).
		SubCmd().AddKVParam("broker", false).AddAlias("b").SetUsage(brokerUsage).
		SubCmd().AddKVParam("plugin", false).AddAlias("p").SetUsage(pluginUsage)

	cli.AddSubCmd("list").
		AddAlias("get").
		SetUsage("retreive preferences, optionally filtered by the provided attributes").
		SubCmd().
		AddKVParam("key", false).AddAlias("k").SetUsage(keyUsage).
		SubCmd().AddKVParam("value", false).AddAlias("v").SetUsage(valueUsage).
		SubCmd().AddKVParam("room", false).AddAlias("r").SetUsage(roomUsage).
		SubCmd().AddKVParam("user", false).AddAlias("u").SetUsage(userUsage).
		SubCmd().AddKVParam("broker", false).AddAlias("b").SetUsage(brokerUsage).
		SubCmd().AddKVParam("plugin", false).AddAlias("p").SetUsage(pluginUsage)

	cli.AddSubCmd("find").
		SetUsage("retreive preferences following precedence rules").
		SubCmd().AddKVParam("key", false).AddAlias("k").SetUsage(keyUsage).
		SubCmd().AddKVParam("value", false).AddAlias("v").SetUsage(valueUsage).
		SubCmd().AddKVParam("room", false).AddAlias("r").SetUsage(roomUsage).
		SubCmd().AddKVParam("user", false).AddAlias("u").SetUsage(userUsage).
		SubCmd().AddKVParam("broker", false).AddAlias("b").SetUsage(brokerUsage).
		SubCmd().AddKVParam("plugin", false).AddAlias("p").SetUsage(pluginUsage)

	cli.AddSubCmd("rm").
		SetUsage("delete a preference by id").
		AddIdxParam(0, "id", true).
		SetUsage("the preference id to delete")

	slackLinkRE = regexp.MustCompile("^<(?:http|mailto):.*|.*>$")
}

func Register() {
	plugin := hal.Plugin{
		Name:    NAME,
		Func:    prefmgr,
		Command: "pref",
	}
	plugin.Register()

	http.HandleFunc("/api/pref", prefHandler)
}

// prefmgr is called when someone executes !pref in the chat system
func prefmgr(evt hal.Evt) {
	req, err := cli.Process(evt.BodyAsArgv())
	if err != nil {
		// eww...
		switch err.(type) {
		case hal.SubCmdNotFound:
			evt.Reply(cli.Usage())
		default:
			evt.Reply(err.Error())
		}
		return
	}

	switch req.SubCmdToken() {
	case "", "help":
		evt.Reply(cli.Usage())
	case "set":
		cliSet(req.SubCmdInst(), &evt)
	case "list":
		cliList(req.SubCmdInst(), &evt)
	case "find":
		cliFind(req.SubCmdInst(), &evt)
	case "rm":
		cliRm(req.SubCmdInst(), &evt)
	default:
		evt.Reply(req.Usage())
	}
}

// cmd2pref copies data from the hal.Cmd and hal.Evt into a hal.Pref, resolving
// *'s on the way.
func cmd2pref(req *hal.SubCmdInst, evt *hal.Evt) (*hal.Pref, error) {
	var out hal.Pref

	for _, pi := range req.ListKVParamInsts() {
		var err error
		var key, value string

		switch pi.Key() {
		case "key":
			key, err = pi.String()
			out.Key = stripAutoLinks(key)
		case "value":
			value, err = pi.String()
			out.Value = stripAutoLinks(value)
		case "room":
			out.Room = pi.DefString(evt.RoomId)
		case "user":
			out.User = pi.DefString(evt.UserId)
		case "broker":
			out.Broker = pi.DefString(evt.BrokerName())
		case "plugin":
			out.Plugin, _ = pi.String()
		}

		// return on the first error
		if err != nil {
			return nil, err
		}
	}

	return &out, nil
}

// cliList implements !pref list
func cliList(req *hal.SubCmdInst, evt *hal.Evt) {
	opts := hal.Pref{}
	prefs := opts.Find()

	for _, pi := range req.ListKVParamInsts() {
		var err error
		var key, value string

		switch pi.Key() {
		case "key":
			key, err = pi.String()
			prefs = prefs.Key(stripAutoLinks(key))
		case "value":
			value, err = pi.String()
			prefs = prefs.Value(stripAutoLinks(value))
		case "room":
			prefs = prefs.Room(pi.DefString(evt.RoomId))
		case "user":
			prefs = prefs.User(pi.DefString(evt.UserId))
		case "broker":
			prefs = prefs.Broker(pi.DefString(evt.BrokerName()))
		case "plugin":
			prefs = prefs.Plugin(pi.DefString(NAME))
		}

		if err != nil {
			evt.Error(err)
			return
		}
	}

	data := prefs.Table()
	evt.ReplyTable(data[0], data[1:])
}

// cliFind implements !pref find
func cliFind(req *hal.SubCmdInst, evt *hal.Evt) {
	opts, err := cmd2pref(req, evt)
	if err != nil {
		panic(err) // TODO: placeholder
	}

	prefs := opts.Find()
	data := prefs.Table()
	evt.ReplyTable(data[0], data[1:])
}

// cliSet implements !pref set
func cliSet(req *hal.SubCmdInst, evt *hal.Evt) {
	opts, err := cmd2pref(req, evt)
	if err != nil {
		panic(err) // TODO: placeholder
	}

	if opts.Room != "" && !evt.Broker.LooksLikeRoomId(opts.Room) {
		opts.Room = evt.Broker.RoomNameToId(opts.Room)
	}

	if opts.User != "" && !evt.Broker.LooksLikeUserId(opts.User) {
		opts.User = evt.Broker.UserNameToId(opts.User)
	}

	// TODO: check plugin name validity
	// TODO: check broker name validity

	fmt.Printf("Setting pref: %q\n", opts.String())
	err = opts.Set()
	if err != nil {
		evt.Replyf("Failed to set pref: %q", err)
	} else {
		data := opts.GetPrefs().Table()
		evt.ReplyTable(data[0], data[1:])
	}
}

// cliRm implements !pref rm <id>
func cliRm(req *hal.SubCmdInst, evt *hal.Evt) {
	id, err := req.GetIdxParamInst(0).Int()
	if err != nil {
		panic(err) // TODO: placeholder
	}

	err = hal.RmPrefId(id)
	if err != nil {
		evt.Replyf("Failed to delete pref with id %d: %s", id, err)
	} else {
		evt.Replyf("Deleted pref id %d.", id)
	}
}

func stripAutoLinks(in string) string {
	if slackLinkRE.MatchString(in) {
		parts := strings.Split(strings.TrimSuffix(in, ">"), "|")
		if len(parts) == 2 {
			return parts[1]
		}
	}

	return in
}
