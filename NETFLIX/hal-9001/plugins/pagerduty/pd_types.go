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
	"time"
)

type ContactMethod struct {
	Id             string `json:"id"`
	Type           string `json:"type"`
	Label          string `json:"label"`
	Address        string `json:"address"`
	SendShortEmail bool   `json:"send_short_email"`
}

type NotificationRule struct {
	Id                  string        `json:"id"`
	Type                string        `json:"type"`
	StartDelayInMinutes int           `json:"start_delay_in_minutes"`
	CreatedAt           string        `json:"created_at"`
	Urgency             string        `json:"urgency"`
	ContactMethod       ContactMethod `json:"contact_method"`
}

type Team struct {
	Id          string `json:"id"`
	Type        string `json:"type"`
	Summary     string `json:"summary"`
	Self        string `json:"self"`
	HtmlUrl     string `json:"html_url"`
	Name        string `json:"name"`
	Description string `json:"description"`
}

type TeamRef struct {
	Id      string `json:"id"`
	Type    string `json:"type"`
	Summary string `json:"summary"`
	Self    string `json:"self"`
	HtmlUrl string `json:"html_url"`
}

type TeamsResponse struct {
	Teams  []Team `json:"teams"`
	Offset int    `json:"offset"`
	Limit  int    `json:"limit"`
	More   bool   `json:"more"`
	Total  int    `json:"total,omitempty"`
}

type Schedule struct {
	Id                   string             `json:"id"`
	Summary              string             `json:"summary"`
	Type                 string             `json:"type"`
	Self                 string             `json:"self"`
	HtmlUrl              string             `json:"html_url"`
	ScheduleLayers       []ScheduleLayer    `json:"schedule_layers"`
	Timezone             string             `json:"time_zone"`
	Name                 string             `json:"name"`
	Description          string             `json:"description"`
	FinalSchedule        SubSchedule        `json:"final_schedule,omitempty"`
	OverridesSubSchedule SubSchedule        `json:"overrides_subschedule,omitempty"`
	EscalationPolicies   []EscalationPolicy `json:"escalation_policies"`
	Users                []UserRef          `json:"users"`
}

type ScheduleRef struct {
	Id      string `json:"id"`
	Type    string `json:"type"`
	Summary string `json:"summary"`
	Self    string `json:"self"`
	HtmlUrl string `json:"html_url"`
}

type SchedulesResponse struct {
	Schedules []Schedule `json:"schedules"`
	Offset    int        `json:"offset"`
	Limit     int        `json:"limit"`
	More      bool       `json:"more"`
	Total     int        `json:"total,omitempty"`
}

type ScheduleLayer struct {
	Id                         string               `json:"id,omitempty"`
	Start                      *time.Time           `json:"start"`
	End                        *time.Time           `json:"end,omitempty"`
	Type                       string               `json:"type"`
	Summary                    string               `json:"summary"`
	Self                       string               `json:"self"`
	HtmlUrl                    string               `json:"html_url"`
	Users                      []UserRef            `json:"users"`
	Restrictions               []Restriction        `json:"restrictions"`
	RotationVirtualStart       string               `json:"rotation_virtual_start"`
	RotationTurnLengthSeconds  int                  `json:"rotation_turn_length_seconds"`
	Name                       string               `json:"name"`
	RenderedScheduleEntries    []ScheduleLayerEntry `json:"rendered_schedule_entries"`
	RenderedCoveragePercentage float64              `json:"rendered_coverage_percentage"`
}

type SubSchedule struct {
	Name                       string               `json:"name"`
	RenderedScheduleEntries    []ScheduleLayerEntry `json:"rendered_schedule_entries"`
	RenderedCoveragePercentage float64              `json:"rendered_coverage_percentage"`
}

type ScheduleLayerEntry struct {
	User  UserRef `json:"user"`
	Start string  `json:"start"`
	End   string  `json:"end"`
}

type Restriction struct {
	Type            string `json:"type"`
	DurationSeconds int    `json:"duration_seconds"`
	StartTimeOfDay  string `json:"start_time_of_day"`
}

type EscalationPolicy struct {
	Id              string           `json:"id"`
	Summary         string           `json:"summary"`
	Type            string           `json:"type"`
	Self            string           `json:"self"`
	HtmlUrl         string           `json:"html_url"`
	Name            string           `json:"name"`
	Description     string           `json:"description"`
	NumLoops        int              `json:"num_loops"`
	RepeatEnabled   bool             `json:"repeat_enabled"`
	EscalationRules []EscalationRule `json:"escalation_rules"`
	ServiceRefs     []ServiceRef     `json:"services"`
	TeamRefs        []TeamRef        `json:"teams"`
}

type EscalationPolicyResponse struct {
	EscalationPolicies []EscalationPolicy `json:"escalation_policies"`
	Offset             int                `json:"offset"`
	Limit              int                `json:"limit"`
	More               bool               `json:"more"`
	Total              int                `json:"total,omitempty"`
}

type EscalationRule struct {
	Id                       string             `json:"id"`
	EscalationDelayInMinutes int                `json:"escalation_delay_in_minutes"`
	Targets                  []EscalationTarget `json:"targets"`
}

type EscalationPolicyRef struct {
	Id      string `json:"id"`
	Type    string `json:"type"`
	Summary string `json:"summary"`
	Self    string `json:"self"`
	HtmlUrl string `json:"html_url"`
}

type EscalationTarget struct {
	Id   string `json:"id"`
	Type string `json:"type"`
}

type PolicyService struct {
	Id                 string `json:"id"`
	Name               string `json:"name"`
	IntegrationEmail   string `json:"integration_email"`
	HtmlUrl            string `json:"html_url"`
	EscalationPolicyId string `json:"escalation_policy_id"`
}

type Integration struct {
	Id               string `json:"id"`
	Type             string `json:"type"`
	Summary          string `json:"summary"`
	Self             string `json:"self"`
	HtmlUrl          string `json:"html_url"`
	Name             string `json:"name"`
	CreatedAt        string `json:"created_at"`
	IntegrationKey   string `json:"integration_key"`
	IntegrationEmail string `json:"integration_email"`
	// ignore service
	// ignore vendor
	// ignore config
}

type IncidentCounts struct {
	Triggered    int `json:"triggered"`
	Acknowledged int `json:"acknowledged"`
	Resolved     int `json:"resolved"`
	Total        int `json:"total"`
}

// Service represents a Pagerduty service object from /api/v1/services/:id
type Service struct {
	Id                     string           `json:"id"`
	Type                   string           `json:"type"`
	Name                   string           `json:"name"`
	ServiceUrl             string           `json:"service_url"`
	ServiceKey             string           `json:"service_key"`
	AutoResolveTimeout     int              `json:"auto_resolve_timeout"`
	AcknowledgementTimeout int              `json:"acknowledgement_timeout"`
	CreatedAt              string           `json:"created_at"`
	Status                 string           `json:"status"`
	LastIncidentTimestamp  string           `json:"last_incident_timestamp"`
	EmailIncidentCreation  string           `json:"email_incident_creation"`
	IncidentCounts         IncidentCounts   `json:"incident_counts"`
	EmailFilterMode        string           `json:"email_filter_mode"`
	Description            string           `json:"description"`
	Integrations           []Integration    `json:"integrations"`
	EscalationPolicy       EscalationPolicy `json:"escalation_policy"`
	Teams                  []Team           `json:"teams"`
}

type ServiceRef struct {
	Id      string `json:"id"`
	Type    string `json:"type"`
	Summary string `json:"summary"`
	Self    string `json:"self"`
	HtmlUrl string `json:"html_url"`
}

type ServicesResponse struct {
	Services []Service `json:"services"`
	Limit    int       `json:"limit"`
	Offset   int       `json:"offset"`
	More     bool      `json:"more"`
	Total    int       `json:"total"`
}

type User struct {
	Id                string             `json:"id"`
	Type              string             `json:"type"`
	Summary           string             `json:"summary"`
	Self              string             `json:"self"`
	HtmlUrl           string             `json:"html_url"`
	Name              string             `json:"name"`
	Email             string             `json:"email"`
	JobTitle          string             `json:"job_title"`
	Timezone          string             `json:"time_zone"`
	Color             string             `json:"color"`
	Role              string             `json:"role,omitempty"`
	AvatarUrl         string             `json:"avatar_url,omitempty"`
	Description       string             `json:"description,omitempty"`
	Billed            bool               `json:"billed,omitempty"`
	UserUrl           string             `json:"user_url,omitempty"`
	InvitationSent    bool               `json:"invitation_sent,omitempty"`
	MarketingOptOut   bool               `json:"marketing_opt_out,omitempty"`
	ContactMethods    []ContactMethod    `json:"contact_methods"`
	NotificationRules []NotificationRule `json:"notification_rules"`
	Teams             []Team             `json:"teams"`
}

type UserRef struct {
	Id      string `json:"id"`
	Type    string `json:"type"`
	Summary string `json:"summary"`
	Self    string `json:"self"`
	HtmlUrl string `json:"html_url"`
}

type UsersResponse struct {
	Users  []User `json:"users"`
	Offset int    `json:"offset"`
	Limit  int    `json:"limit"`
	More   bool   `json:"more"`
	Total  int    `json:"total"`
}

type Oncall struct {
	EscalationPolicy EscalationPolicy `json:"escalation_policy"`
	User             User             `json:"user"`
	Schedule         Schedule         `json:"schedule"`
	EscalationLevel  int              `json:"escalation_level"`
	Start            *time.Time       `json:"start"`
	End              *time.Time       `json:"end"`
}

type OncallsResponse struct {
	Oncalls []Oncall `json:"oncalls"`
	Offset  int      `json:"offset"`
	Limit   int      `json:"limit"`
	More    bool     `json:"more"`
	Total   int      `json:"total,omitempty"`
}

type Override struct {
	Id    string  `json:"id"`
	Start string  `json:"start"`
	End   string  `json:"end"`
	User  UserRef `json:"user"`
}
