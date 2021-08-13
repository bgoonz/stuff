package google_calendar

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

	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
	"google.golang.org/api/calendar/v3"
)

const oauthJsonKey = `google-calendar-oauth-client-json`

// a simplified calendar event returned by getEvents
type CalEvent struct {
	Start       time.Time
	End         time.Time
	AllDay      bool
	Name        string
	Description string
}

type GoogleError struct {
	Parent error
}

func (e GoogleError) Error() string {
	return fmt.Sprintf("Failed while communicating with Google Calender: %s", e.Parent.Error())
}

type PrefMissingError struct{}

func (e PrefMissingError) Error() string {
	return `the calendar-id pref must be set for the room. Try:
!prefs set --room * --plugin google_calendar --key calendar-id --value <id>`
}

type SecretMissingError struct{}

func (e SecretMissingError) Error() string {
	return "the google-calendar-oauth-client-json secret must be set. Contact the bot admin."
}

func getEvents(calendarId string, now time.Time) ([]CalEvent, error) {
	// TODO: figure out if it's feasible to have one secret per bot or
	// if it really needs to be per-calendar or room
	// TODO: this should probably be passed to this function rather than
	// making this file require hal
	secrets := hal.Secrets()
	jsonData := secrets.Get("google-calendar-oauth-client-json")
	if jsonData == "" {
		return nil, SecretMissingError{}
	}

	config, err := google.JWTConfigFromJSON([]byte(jsonData), calendar.CalendarReadonlyScope)
	if err != nil {
		return nil, GoogleError{err}
	}
	client := config.Client(oauth2.NoContext)
	cal, err := calendar.New(client)
	if err != nil {
		return nil, GoogleError{err}
	}

	min := now.Add(time.Hour * -1).Format(time.RFC3339)
	max := now.Add(time.Hour * 24).Format(time.RFC3339)
	events, err := cal.Events.List(calendarId).
		ShowDeleted(false).
		SingleEvents(true).
		TimeMin(min).
		TimeMax(max).
		Do()

	if err != nil {
		return nil, GoogleError{err}
	}

	out := make([]CalEvent, len(events.Items))
	for i, event := range events.Items {
		var start, end time.Time
		var allday bool

		// try twice to parse the time fields:
		// all-day events have a date field and datetime is empty
		if event.Start.DateTime != "" {
			start, err = time.Parse(time.RFC3339, event.Start.DateTime)
			if err != nil {
				log.Printf("Failed to parse start time from calendar event: %s", err)
			}
		} else if event.Start.Date != "" {
			// the timezone seems to always be blank - not sure if it's a bug in
			// the API or expected behavior. Either way, the downstream code
			// evaluating the returned time will have to check for all-day
			// and do the right thing
			// leaving this here (and in the end block below) for now while I
			// investigate what's going on
			zone, err := time.LoadLocation(event.Start.TimeZone)
			if err != nil {
				log.Printf("Failed to parse start date TimeZone %q from calendar event: %s", event.Start.TimeZone, err)
			}

			start, err = time.ParseInLocation("2006-01-02", event.Start.Date, zone)
			if err != nil {
				log.Printf("Failed to parse start date from all-day calendar event: %s", err)
				continue
			}

			allday = true
		} else {
			log.Println("event start time/date are both empty!")
			continue
		}

		if event.End.DateTime != "" {
			end, err = time.Parse(time.RFC3339, event.End.DateTime)
			if err != nil {
				log.Printf("Failed to parse end time from calendar event: %s", err)
			}
		} else if event.End.Date != "" {
			zone, err := time.LoadLocation(event.End.TimeZone)
			if err != nil {
				log.Printf("Failed to parse end date TimeZone %q from calendar event: %s", event.End.TimeZone, err)
			}

			log.Debugf("endZone: %q", event.End.TimeZone)

			end, err = time.ParseInLocation("2006-01-02", event.End.Date, zone)
			if err != nil {
				log.Printf("Failed to parse end date from all-day calendar event: %s", err)
			}
			// the event actually ends at 00:00:00 the next day so add a day
			end = end.AddDate(0, 0, 1)

			allday = true
		} else {
			log.Println("event end time/date are both empty!")
			continue
		}

		out[i].Start = start
		out[i].End = end
		out[i].AllDay = allday
		out[i].Name = event.Summary
		out[i].Description = event.Description
	}

	return out, nil
}
