package pagerduty

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

// the hal.secrets key that should contain the pagerduty auth token
const PagerdutyTokenKey = `pagerduty.token`

// the key name used for caching the full escalation policy
const CacheKey = `pagerduty.policy_cache`

const cacheExpire = time.Minute * 10

const DefaultCacheInterval = "1h"

func Register() {
	// use a custom RE because !page might be "!page foo" or "!pagefoo"
	pg := hal.Plugin{
		Name:  "page",
		Func:  page,
		Regex: "^[[:space:]]*!page",
	}
	pg.Register()

	oc := hal.Plugin{
		Name:    "oncall",
		Func:    oncall,
		Init:    oncallInit,
		Command: "oncall",
	}
	oc.Register()

	poller := hal.Plugin{
		Name:    "pd_poller",
		Func:    pollerHandler,
		Init:    pollerInit,
		Command: "pdpoller",
	}
	poller.Register()
}

// TODO: consider making the token key per-room so different rooms can use different tokens
// doing this will require a separate cache object per token...
func getSecrets() (token string, err error) {
	secrets := hal.Secrets()
	token = secrets.Get(PagerdutyTokenKey)
	if token == "" {
		err = fmt.Errorf("Your Pagerduty auth token does not seem to be configured. Please add the %q secret.", PagerdutyTokenKey)
	}

	if err != nil {
		log.Println(err)
	}

	return token, err
}
