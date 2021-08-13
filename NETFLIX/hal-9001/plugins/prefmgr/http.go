package prefmgr

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
	"net/http"

	"github.com/netflix/hal-9001/hal"
)

func prefHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	switch r.Method {
	case http.MethodGet:
		getPrefHandler(w, r)
	case http.MethodPut:
		putPrefHandler(w, r)
	case http.MethodPatch:
		patchPrefHandler(w, r)
	case http.MethodDelete:
		deletePrefHandler(w, r)
	}
}

// getPrefHandler returns all prefs as a JSON document.
// There are currently no parameters for server-side filtering, that will
// be done client-side.
func getPrefHandler(w http.ResponseWriter, r *http.Request) {
	prefs := hal.FindPrefs("", "", "", "", "")

	bytes, err := json.Marshal(&prefs)
	if err != nil {
		log.Fatalf("Error while encoding prefs as JSON: %s", err)
	}

	_, err = w.Write(bytes)
	if err != nil {
		log.Fatalf("Error while sending JSON response: %s", err)
	}
}

func putPrefHandler(w http.ResponseWriter, r *http.Request) {
}

func patchPrefHandler(w http.ResponseWriter, r *http.Request) {
}

func deletePrefHandler(w http.ResponseWriter, r *http.Request) {
}
