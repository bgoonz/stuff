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
	"encoding/json"
	"io/ioutil"
)

// https://v2.developer.pagerduty.com/v2/page/api-reference#!/Escalation_Policies/get_escalation_policies

func GetEscalationPolicies(token string, params map[string][]string) ([]EscalationPolicy, error) {
	policies := make([]EscalationPolicy, 0)
	offset := 0
	limit := 100

	for {
		epresp := EscalationPolicyResponse{}

		url := pagedUrl("/escalation_policies", offset, limit, params)

		resp, err := authenticatedGet(url, token)
		if err != nil {
			log.Printf("GET %s failed: %s", url, err)
			return policies, err
		}

		data, err := ioutil.ReadAll(resp.Body)

		err = json.Unmarshal(data, &epresp)
		if err != nil {
			log.Printf("json.Unmarshal failed: %s", err)
			return policies, err
		}

		policies = append(policies, epresp.EscalationPolicies...)

		if epresp.More {
			offset = offset + limit
		} else {
			break
		}
	}

	return policies, nil
}
