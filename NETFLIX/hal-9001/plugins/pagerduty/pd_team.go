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

// https://v2.developer.pagerduty.com/v2/page/api-reference#!/Teams/get_teams

func GetTeams(token string, params map[string][]string) ([]Team, error) {
	out := make([]Team, 0)
	offset := 0
	limit := 100

	for {
		url := pagedUrl("/teams", offset, limit, params)

		resp, err := authenticatedGet(url, token)
		if err != nil {
			log.Printf("GET %s failed: %s", url, err)
			return out, err
		}

		data, err := ioutil.ReadAll(resp.Body)

		oresp := TeamsResponse{}
		err = json.Unmarshal(data, &oresp)
		if err != nil {
			log.Printf("json.Unmarshal failed: %s", err)
			return out, err
		}

		out = append(out, oresp.Teams...)

		if oresp.More {
			offset = offset + limit
		} else {
			break
		}
	}

	return out, nil
}
