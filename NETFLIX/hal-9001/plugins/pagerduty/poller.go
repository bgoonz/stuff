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
	"strings"
	"time"

	"github.com/netflix/hal-9001/hal"
)

// TODO: add a timestamp-based cleanup for old edges/attrs/etc.

func pollerHandler(evt hal.Evt) {
	// nothing yet - TODO: add control code, e.g. force refresh
}

func pollerInit(inst *hal.Instance) {
	pf := hal.PeriodicFunc{
		Name:     "pagerduty-poller",
		Interval: time.Hour,
		Function: ingestPagerdutyAccount,
	}

	pf.Register()
	go pf.Start()
}

func ingestPagerdutyAccount() {
	token, err := getSecrets()
	if err != nil || token == "" {
		log.Printf("pagerduty: %s is not set up in hal.Secrets. Cannot continue.", PagerdutyTokenKey)
		return
	}

	ingestPDusers(token)
	ingestPDteams(token)
	ingestPDservices(token)
	ingestPDschedules(token)
}

func ingestPDusers(token string) {
	params := map[string][]string{"include[]": []string{"contact_methods"}}
	users, err := GetUsers(token, params)
	if err != nil {
		log.Printf("Could not retreive users from the Pagerduty API: %s", err)
		return
	}

	for _, user := range users {
		attrs := map[string]string{
			"pd-user-id": user.Id,
			"name":       user.Name,
			"email":      user.Email,
		}

		// plug in the contact methods
		for _, cm := range user.ContactMethods {
			if strings.HasSuffix(cm.Type, "_reference") {
				log.Printf("contact methods not included in data: try adding include[]=contact_methods to the request")
			} else {
				attrs[cm.Type+"-id"] = cm.Id
				attrs[cm.Type] = cm.Address
			}
		}

		edges := []string{"name", "email", "phone_contact_method", "sms_contact_method"}
		logit(hal.Directory().Put(user.Id, "pd-user", attrs, edges))

		for _, team := range user.Teams {
			logit(hal.Directory().PutNode(team.Id, "pd-team"))
			logit(hal.Directory().PutEdge(team.Id, "pd-team", user.Id, "pd-user"))
		}
	}
}

func ingestPDteams(token string) {
	teams, err := GetTeams(token, nil)
	if err != nil {
		log.Printf("Could not retreive teams from the Pagerduty API: %s", err)
		return
	}

	for _, team := range teams {
		attrs := map[string]string{
			"pd-team-id":          team.Id,
			"pd-team":             team.Name,
			"pd-team-summary":     team.Summary,
			"pd-team-description": team.Description,
		}

		logit(hal.Directory().Put(team.Id, "pd-team", attrs, []string{"pd-team-id"}))
	}
}

func ingestPDservices(token string) {
	params := map[string][]string{"include[]": []string{"integrations"}}
	services, err := GetServices(token, params)
	if err != nil {
		log.Printf("Could not retreive services from the Pagerduty API: %s", err)
		return
	}

	for _, service := range services {
		attrs := map[string]string{
			"pd-service-id":           service.Id,
			"pd-service":              service.Name,
			"pd-service-description":  service.Description,
			"pd-escalation-policy-id": service.EscalationPolicy.Id,
		}

		edges := []string{"pd-service-key", "pd-service-id", "pd-escalation-policy-id", "pd-integration-key"}
		logit(hal.Directory().Put(service.Id, "pd-service", attrs, edges))

		for _, team := range service.Teams {
			logit(hal.Directory().PutNode(team.Id, "pd-team"))
			logit(hal.Directory().PutEdge(team.Id, "pd-team", service.Id, "pd-service"))
		}

		for _, igr := range service.Integrations {
			if igr.Type == "generic_email_inbound_integration" {
				logit(hal.Directory().PutNode(igr.IntegrationEmail, "pd-integration-email"))
				logit(hal.Directory().PutEdge(igr.IntegrationEmail, "pd-integration-email", service.Id, "pd-service"))

				for _, team := range service.Teams {
					logit(hal.Directory().PutEdge(igr.IntegrationEmail, "pd-integration-email", team.Id, "pd-team"))
				}
			} else if igr.Type == "events_api_v2_inbound_integration" || igr.Type == "generic_events_api_inbound_integration" {
				logit(hal.Directory().PutNode(igr.IntegrationKey, "pd-integration-key"))
				logit(hal.Directory().PutEdge(igr.IntegrationKey, "pd-integration-key", service.Id, "pd-service"))

				for _, team := range service.Teams {
					logit(hal.Directory().PutEdge(igr.IntegrationKey, "pd-integration-key", team.Id, "pd-team"))
				}
			}
		}
	}
}

func ingestPDschedules(token string) {
	schedules, err := GetSchedules(token, nil)
	if err != nil {
		log.Printf("Could not retreive schedules from the Pagerduty API: %s", err)
		return
	}

	for _, schedule := range schedules {
		attrs := map[string]string{
			"pd-schedule-id":      schedule.Id,
			"pd-schedule":         schedule.Name,
			"pd-schedule-summary": schedule.Summary,
		}

		logit(hal.Directory().Put(schedule.Id, "pd-schedule", attrs, []string{"pd-schedule-id"}))

		for _, ep := range schedule.EscalationPolicies {
			logit(hal.Directory().PutNode(ep.Id, "pd-escalation-policy"))
			logit(hal.Directory().PutEdge(ep.Id, "pd-escalation-policy", schedule.Id, "pd-schedule"))
		}

		for _, user := range schedule.Users {
			logit(hal.Directory().PutNode(user.Id, "pd-user"))
			logit(hal.Directory().PutEdge(user.Id, "pd-user", schedule.Id, "pd-schedule"))
		}
	}
}

func logit(err error) {
	if err != nil {
		log.Println("pagerduty/hal_directory error: %s", err)
	}
}
