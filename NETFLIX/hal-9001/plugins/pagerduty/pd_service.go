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

// API docs: https://developer.pagerduty.com/documentation/rest/escalation_policies/on_call

import (
	"encoding/json"
	"io/ioutil"
)

func GetServices(token string, params map[string][]string) ([]Service, error) {
	services := make([]Service, 0)
	offset := 0
	limit := 100

	for {
		svcResp := ServicesResponse{}

		svcsUrl := pagedUrl("/services", offset, limit, params)

		resp, err := authenticatedGet(svcsUrl, token)
		if err != nil {
			log.Printf("GET %s failed: %s", svcsUrl, err)
			return services, err
		}

		data, err := ioutil.ReadAll(resp.Body)

		err = json.Unmarshal(data, &svcResp)
		if err != nil {
			log.Printf("json.Unmarshal failed: %s", err)
			return []Service{}, err
		}

		services = append(services, svcResp.Services...)

		if svcResp.More {
			offset = offset + limit
		} else {
			break
		}
	}

	return services, nil
}

func GetService(token, id string) (Service, error) {
	out := Service{
		IncidentCounts: IncidentCounts{},
	}

	svcsUrl := pagedUrl("/services/"+id, 0, 0, nil)

	resp, err := authenticatedGet(svcsUrl, token)
	if err != nil {
		log.Printf("GET %s failed: %s", svcsUrl, err)
		return out, err
	}

	data, err := ioutil.ReadAll(resp.Body)

	err = json.Unmarshal(data, &out)
	if err != nil {
		log.Printf("json.Unmarshal failed: %s", err)
		return out, err
	}

	return out, nil
}
