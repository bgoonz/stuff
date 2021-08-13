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
	"fmt"
	"io/ioutil"
)

// https://v2.developer.pagerduty.com/v2/page/api-reference#!/On-Calls/get_oncalls
// TODO: figure out if query should be a typed struct or validated
func GetOncalls(token string, query map[string][]string) ([]Oncall, error) {
	oncalls := make([]Oncall, 0)
	offset := 0
	limit := 100

	for {
		oncallsResp := OncallsResponse{}

		url := pagedUrl("/oncalls", offset, limit, query)

		resp, err := authenticatedGet(url, token)
		if err != nil {
			log.Printf("GET %s failed: %s", url, err)
			return oncalls, err
		}

		data, err := ioutil.ReadAll(resp.Body)

		err = json.Unmarshal(data, &oncallsResp)
		if err != nil {
			fmt.Printf("\n\n%s\n\n", data)
			log.Printf("json.Unmarshal of data from %q failed: %s", url, err)
			return oncalls, err
		}

		oncalls = append(oncalls, oncallsResp.Oncalls...)

		if oncallsResp.More {
			offset = offset + limit
		} else {
			break
		}
	}

	return oncalls, nil
}
