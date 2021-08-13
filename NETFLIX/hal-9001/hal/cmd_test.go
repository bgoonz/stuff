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

import (
	"strings"
	"testing"
)

func TestCmd(t *testing.T) {
	// example 1 - smoke test
	oc := NewCmd("oncall", false).
		SetUsage("search Pagerduty escalation policies for a string")
	oc.AddSubCmd("cache-status")
	oc.AddSubCmd("cache-interval").AddIdxParam(0, "interval", true)
	oc.AddSubCmd("help").AddAlias("h")

	oc.GetSubCmd("cache-status").SetUsage("check the status of the background caching job")
	oc.GetSubCmd("cache-interval").SetUsage("set the background caching job interval")

	var res *CmdInst
	var err error
	// make sure a command with no args doesn't blow up
	res, err = oc.Process([]string{"!oncall"})
	if err != nil {
		t.Fail()
	}

	res, err = oc.Process([]string{"!oncall", "help"})
	if err != nil {
		t.Fail()
	}

	res, err = oc.Process([]string{"!oncall", "h"})
	if err != nil {
		t.Error(err)
		t.Fail()
	}

	res, err = oc.Process([]string{"!oncall", "sre"})
	if len(res.Remainder()) != 1 || res.Remainder()[0] != "sre" {
		t.Fail()
	}

	res, err = oc.Process([]string{"!oncall", "cache-status"})
	if err != nil {
		t.Error(err)
		t.Fail()
	}
	if res.SubCmdToken() != "cache-status" {
		t.Fail()
	}

	res, err = oc.Process([]string{"!oncall", "cache-interval", "1h"})
	if err != nil {
		t.Error(err)
		t.Fail()
	}
	if res.SubCmdToken() != "cache-interval" {
		t.Fail()
	}

	// example 2
	// Alias: requiring explicit aliases instead of guessing seems right
	pc := NewCmd("prefs", true)
	pc.AddSubCmd("set").
		SetUsage("set a pref").
		SubCmd().AddKVParam("key", true).AddAlias("k").SetUsage("ohai!").
		SubCmd().AddKVParam("value", true).AddAlias("v").
		SubCmd().AddKVParam("room", false).AddAlias("r").
		SubCmd().AddKVParam("user", false).AddAlias("u").
		SubCmd().AddKVParam("broker", false).AddAlias("b")

	pc.AddSubCmd("get").
		SubCmd().AddKVParam("key", true).AddAlias("k").
		SubCmd().AddKVParam("value", true).AddAlias("v").
		SubCmd().AddKVParam("room", false).AddAlias("r").
		SubCmd().AddKVParam("user", false).AddAlias("u").SetDefault("*").
		SubCmd().AddKVParam("broker", false).AddAlias("b")

	pc.AddSubCmd("rm").AddIdxParam(0, "id", true)

	argv2 := strings.Split("prefs set --room * --user foo --broker console --key ohai --value nevermind", " ")
	res, err = pc.Process(argv2)
	if err != nil {
		t.Error(err)
		t.Fail()
	}

	if len(res.Remainder()) != 0 {
		t.Error("There should not be any remainder")
	}
	if res.SubCmdToken() != "set" {
		t.Errorf("wrong subcommand. Expected %q, got %q", "set", res.SubCmdToken())
	}
	if res.SubCmdInst() == nil {
		t.Error("result.SubCmdInst is nil when it should be an instance for 'set'")
		t.FailNow()
	}
	subcmd := res.SubCmdInst()
	if subcmd.GetKVParamInst("room").MustString() != "*" {
		t.Errorf("wrong room, expected *, got %q", subcmd.GetKVParamInst("room").MustString())
	}
	if subcmd.GetKVParamInst("key").MustString() != "ohai" {
		t.Errorf("wrong key, expected 'ohai', got %q", subcmd.GetKVParamInst("key").MustString())
	}
	if subcmd.GetKVParamInst("value").MustString() != "nevermind" {
		t.Errorf("wrong value, expected 'nevermind', got %q", subcmd.GetKVParamInst("value").MustString())
	}
	// check that defaults are working
	dval := "1234"
	rds := subcmd.GetKVParamInst("room").DefString(dval)
	if rds != dval {
		t.Errorf("DefString returned %q, expected %q", rds, dval)
	}
	irds := subcmd.GetKVParamInst("room").DefInt(999)
	if irds != 999 {
		t.Errorf("DefString returned %d, expected 999", irds)
	}

	// again with out-of-order parameters
	argv3 := strings.Split("prefs --user bob --key testing get --value lol", " ")
	res, err = pc.Process(argv3)
	if err != nil {
		t.Error(err)
		t.Fail()
	}
	if len(res.Remainder()) != 0 {
		t.Error("There should not be any remainder")
	}
	if res.SubCmdToken() != "get" {
		t.Errorf("wrong subcommand. Expected 'get', got %q", res.SubCmdToken())
	}
	if res.SubCmdInst() == nil {
		t.Error("result.SubCmdInst is nil when it should be an instance for 'get'")
		t.FailNow()
	}
	subcmd = res.SubCmdInst()
	kvpi := subcmd.GetKVParamInst("key")
	if kvpi == nil {
		t.Error("BUG: subcmd.GetKVParamInst('key') returned nil")
		t.FailNow()
	}
	if kvpi.MustString() != "testing" {
		t.Errorf("wrong key, expected 'testing', got %q", subcmd.GetKVParamInst("key").MustString())
	}

	argv4 := []string{"!prefs", "rm", "4"}
	res, err = pc.Process(argv4)
	if err != nil {
		t.Error(err)
		t.Fail()
	}
	if res.SubCmdToken() != "rm" {
		t.Errorf("Expected rm, got %q", res.SubCmdToken())
	}
	pp := res.SubCmdInst().GetIdxParamInst(0)
	if pp.Value() != "4" {
		t.Errorf("wrong value from positional parameter. got %d, expected 4", pp.idx)
	}

	dc := NewCmd("dc", false)
	dc.AddKVParam("dc_required_kvparam_with_default", true).SetDefault("this is the default")
	sdc := dc.AddSubCmd("test")
	sdc.AddKVParam("kvparam_with_default", false).SetDefault("this is the default 1")
	sdc.AddKVParam("required_kvparam_with_default", true).SetDefault("this is the default 2")
	sdc.AddKVParam("required_kvparam_without_default", true)
	sdc.AddBoolParam("boolparam_with_default", false).SetDefault(true)
	sdc.AddBoolParam("required_boolparam_with_default", true).SetDefault(false)
	sdc.AddBoolParam("required_boolparam_without_default", true)

	res, err = dc.Process([]string{"dc"})
	if err != nil {
		t.Errorf("command should parse ok with no arguments: %s", err)
		t.Fail()
	}

	res, err = dc.Process([]string{"dc", "--dc_required_kvparam_with_default", "whatever"})
	if err != nil {
		t.Fail()
	}

	res, err = dc.Process([]string{"dc", "test"})
	if res != nil || err == nil {
		t.Errorf("subcommand should NOT parse ok with no arguments: %s", err)
		t.Fail()
	}

	res, err = dc.Process([]string{"dc", "test", "required_kvparam_without_default=yes", "--required_boolparam_without_default"})
	if err != nil {
		t.Fail()
	}
}
