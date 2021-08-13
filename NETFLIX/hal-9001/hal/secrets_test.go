package hal_test

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
	"testing"

	"github.com/netflix/hal-9001/hal"
)

func TestSecretsBasic(t *testing.T) {
	secrets := hal.Secrets()

	// make sure it returns the empty value
	if secrets.Get("whatever") != "" {
		t.Fail()
	}

	if secrets.Exists("whatever") {
		t.Fail()
	}

	secrets.Put("whatever", "foo")

	if !secrets.Exists("whatever") {
		t.Fail()
	}

	if secrets.Get("whatever") != "foo" {
		t.Fail()
	}

	secrets.Delete("whatever")

	if secrets.Exists("whatever") {
		t.Fail()
	}
}
