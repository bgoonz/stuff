// Package pluginmgr is a plugin manager for hal that allows users to
// manage plugins from inside chat or over REST.
package pluginmgr

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
	"time"

	"github.com/netflix/hal-9001/hal"
)

var log hal.Logger

// NAME of the plugin
const NAME = "pluginmgr"

// HELP text
const HELP = `
Examples:
!plugin list
!plugin instances
!plugin save
!plugin attach <plugin> --room <room>
!plugin attach --regex ^!foo <plugin> <room>
!plugin detach <plugin> <room>
!plugin group list
!plugin group add <group_name> <plugin_name>
!plugin group del <group_name> <plugin_name>

e.g.
!plugin attach uptime --room CORE
!plugin detach uptime --room CORE
!plugin save
`

const PluginGroupTable = `
CREATE TABLE IF NOT EXISTS plugin_groups (
    group_name  VARCHAR(191),
    plugin_name VARCHAR(191),
	ts          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY(group_name, plugin_name)
)`

type PluginGroupRow struct {
	Group     string    `json:"group"`
	Plugin    string    `json:"plugin"`
	Timestamp time.Time `json:"timestamp"`
}

type PluginGroup []*PluginGroupRow

var cli *hal.Cmd

// Register makes this plugin available to the system.
func Register() {
	plugin := hal.Plugin{
		Name:    NAME,
		Func:    pluginmgr,
		Command: "plugin",
	}

	plugin.Register()

	hal.SqlInit(PluginGroupTable)

	cli = hal.NewCmd("!plugin", true).SetUsage("Manage bot plugins.")

	cli.AddSubCmd("attach").
		SetUsage("attach a plugin to the current or specified room with an optional command regex").
		SubCmd().AddIdxParam(0, "plugin", true).
		SubCmd().AddIdxParam(1, "room", false).
		SubCmd().AddIdxParam(2, "regex", false)

	cli.AddSubCmd("detach").
		SetUsage("detach a plugin from a room").
		SubCmd().AddIdxParam(0, "plugin", true).
		SubCmd().AddIdxParam(1, "room", false).
		SubCmd().AddIdxParam(2, "regex", false)

	cli.AddSubCmd("save").
		SetUsage("persist the configured plugins to the database")

	cli.AddSubCmd("list").
		SetUsage("list the attached plugins")

	cli.AddSubCmd("instances").
		SetUsage("list the available plugin instances").
		SubCmd().AddIdxParam(0, "room", false)

	grp := cli.AddSubCmd("group")
	grp.SetUsage("Plugin groups.")

	grp.AddSubCmd("list").
		AddIdxParam(0, "group", false)

	grp.AddSubCmd("add").
		SubCmd().AddIdxParam(0, "group", true).
		SubCmd().AddIdxParam(1, "plugin", true)

	grp.AddSubCmd("del").
		SubCmd().AddIdxParam(0, "group", true).
		SubCmd().AddIdxParam(1, "plugin", true)
}

func pluginmgr(evt hal.Evt) {
	req, err := cli.Process(evt.BodyAsArgv())
	if err != nil {
		evt.Replyf("%s\n%s", err, cli.Usage())
		return
	}

	sub := req.SubCmdInst()
	pr := hal.PluginRegistry()

	// read the param, check validity, return string
	plugin := func() string {
		name := sub.GetIdxParamInstByName("plugin").MustString()
		p, err := pr.GetPlugin(name)
		if err != nil {
			evt.Replyf("No such plugin: %q", name)
			return ""
		}

		return p.Name
	}

	// read the param, resolve name -> id as needed, return string
	room := func() string {
		// automatically defaults to the current room with or without the *
		r := evt.RoomId
		rp := sub.GetIdxParamInstByName("room")
		if rp.Found() {
			r = rp.MustString()
		}

		// the user may have provided --room with a room name
		// try to resolve a roomId with the broker, falling back to the name
		if evt.Broker != nil {
			roomId := evt.Broker.RoomNameToId(r)
			if roomId != "" {
				return roomId
			}
		}

		return r
	}

	// read the param, grab the plugin, return string w/ default from
	// the plugin metadata
	regex := func() string {
		// only needs to work with commands that require the plugin arg
		pn := sub.GetIdxParamInstByName("plugin").MustString()
		p, err := pr.GetPlugin(pn)
		if err != nil {
			return "" // doesn't matter, nothing works without a good plugin
		}
		return sub.GetIdxParamInstByName("regex").DefString(p.Regex)
	}

	switch req.SubCmdToken() {
	case "", "help":
		evt.Reply(cli.Usage())
	case "attach":
		attachPlugin(evt, plugin(), room(), regex())
	case "detach":
		detachPlugin(evt, plugin(), room())
	case "save":
		savePlugins(evt)
	case "list":
		listPlugins(evt)
	case "instances":
		listInstances(evt, room())
	case "group":
		gsub := sub.SubCmdInst()
		g := gsub.GetIdxParamInstByName("group").MustString()
		switch sub.SubCmdToken() {
		case "add":
			p := gsub.GetIdxParamInstByName("plugin").MustString()
			addGroupPlugin(evt, g, p)
		case "del":
			p := gsub.GetIdxParamInstByName("plugin").MustString()
			delGroupPlugin(evt, g, p)
		case "list":
			listGroupPlugin(evt, g)
		}
	}
}

func listPlugins(evt hal.Evt) {
	hdr := []string{"Plugin Name", "Default RE", "Status"}
	rows := [][]string{}
	pr := hal.PluginRegistry()

	for _, p := range pr.ActivePluginList() {
		row := []string{p.Name, p.Regex, "active"}
		rows = append(rows, row)
	}

	for _, p := range pr.InactivePluginList() {
		row := []string{p.Name, p.Regex, "inactive"}
		rows = append(rows, row)
	}

	evt.ReplyTable(hdr, rows)
}

func listInstances(evt hal.Evt, roomId string) {
	hdr := []string{"Plugin Name", "Broker", "Room", "RE"}
	rows := [][]string{}
	pr := hal.PluginRegistry()

	if roomId == "*" {
		roomId = evt.RoomId
	}

	for _, inst := range pr.InstanceList() {
		if roomId != "" && inst.RoomId != roomId {
			continue
		}

		row := []string{
			inst.Plugin.Name,
			inst.Broker.Name(),
			inst.RoomId,
			inst.Regex,
		}
		rows = append(rows, row)
	}

	evt.ReplyTable(hdr, rows)
}

func savePlugins(evt hal.Evt) {
	pr := hal.PluginRegistry()

	err := pr.SaveInstances()
	if err != nil {
		evt.Replyf("Error while saving plugin config: %s", err)
	} else {
		evt.Reply("Plugin configuration saved.")
	}
}

func attachPlugin(evt hal.Evt, pluginName, roomId, regex string) {
	pr := hal.PluginRegistry()
	plugin, err := pr.GetPlugin(pluginName)
	if err != nil {
		evt.Replyf("No such plugin: '%s'", plugin)
		return
	}

	inst := plugin.Instance(roomId, evt.Broker)
	inst.RoomId = roomId
	inst.Regex = regex
	err = inst.Register()
	if err != nil {
		evt.Replyf("Failed to launch plugin '%s' in room id '%s': %s", plugin, roomId, err)

	} else {
		evt.Replyf("Launched an instance of plugin: '%s' in room id '%s'", plugin, roomId)
	}
}

func detachPlugin(evt hal.Evt, plugin, roomId string) {
	pr := hal.PluginRegistry()
	instances := pr.FindInstances(roomId, evt.BrokerName(), plugin)

	// there should be only one, for now just log if that is not the case
	if len(instances) > 1 {
		log.Printf("FindInstances(%q, %q) returned %d instances. Expected 0 or 1.",
			roomId, plugin, len(instances))
	} else if len(instances) == 0 {
		evt.Replyf("No plugin named %q is attached to room %q.", plugin, roomId)
	}

	for _, inst := range instances {
		inst.Unregister()
		evt.Replyf("%q/%q unregistered", roomId, plugin)
	}
}

func GetPluginGroup(group string) (PluginGroup, error) {
	out := make(PluginGroup, 0)
	sql := `SELECT group_name, plugin_name FROM plugin_groups`
	params := []interface{}{}

	if group != "" {
		sql = sql + " WHERE group_name=?"
		params = []interface{}{&group}
	}

	db := hal.SqlDB()
	rows, err := db.Query(sql, params...)
	if err != nil {
		return out, err
	}
	defer rows.Close()

	for rows.Next() {
		pgr := PluginGroupRow{}

		// TODO: add timestamps back after making some helpers for time conversion
		// (code that was here didn't handle NULL)
		err := rows.Scan(&pgr.Group, &pgr.Plugin)
		if err != nil {
			log.Printf("PluginGroup row iteration failed: %s\n", err)
			break
		}

		out = append(out, &pgr)
	}

	return out, nil
}

func (pgr *PluginGroupRow) Save() error {
	sql := `INSERT INTO plugin_groups
	        (group_name, plugin_name, ts) VALUES (?, ?, ?)`

	db := hal.SqlDB()
	_, err := db.Exec(sql, &pgr.Group, &pgr.Plugin, &pgr.Timestamp)
	return err
}

func (pgr *PluginGroupRow) Delete() error {
	sql := `DELETE FROM plugin_groups WHERE group_name=? AND plugin_name=?`

	db := hal.SqlDB()
	_, err := db.Exec(sql, &pgr.Group, &pgr.Plugin)
	return err
}

func listGroupPlugin(evt hal.Evt, group string) {
	pgs, err := GetPluginGroup("")
	if err != nil {
		evt.Replyf("Could not fetch plugin group list: %s", err)
		return
	}

	tbl := make([][]string, len(pgs))
	for i, pgr := range pgs {
		tbl[i] = []string{pgr.Group, pgr.Plugin}
	}

	evt.ReplyTable([]string{"Group Name", "Plugin Name"}, tbl)
}

func addGroupPlugin(evt hal.Evt, group, pluginName string) {
	pr := hal.PluginRegistry()
	// make sure the plugin name is valid
	plugin, err := pr.GetPlugin(pluginName)
	if err != nil {
		evt.Error(err)
		return
	}

	// no checking for group other than "can it be inserted as a string"
	pgr := PluginGroupRow{
		Group:     group,
		Plugin:    plugin.Name,
		Timestamp: time.Now(),
	}

	err = pgr.Save()
	if err != nil {
		evt.Replyf("failed to add %q to group %q: %s", pgr.Plugin, pgr.Group, err)
	} else {
		evt.Replyf("added %q to group %q", pgr.Plugin, pgr.Group)
	}
}

func delGroupPlugin(evt hal.Evt, group, plugin string) {
	pgr := PluginGroupRow{Group: group, Plugin: plugin}
	err := pgr.Delete()
	if err != nil {
		evt.Replyf("failed to delete %q from group %q: %s", pgr.Plugin, pgr.Group, err)
	} else {
		evt.Replyf("deleted %q from group %q", pgr.Plugin, pgr.Group)
	}
}
