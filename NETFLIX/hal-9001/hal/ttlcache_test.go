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
	"time"

	"github.com/netflix/hal-9001/hal"
)

type Whatever struct {
	Field1 string
	Field2 int
	Field3 map[string]string
}

func TestTtlCache(t *testing.T) {
	w1 := Whatever{
		Field1: "testing",
		Field2: 9,
		Field3: map[string]string{"foo": "bar"},
	}

	cache := hal.Cache()
	cache.Set("whatever", &w1, time.Hour*24)

	w2 := Whatever{}
	ttl, err := cache.Get("whatever", &w2)
	if err != nil {
		panic(err)
	}

	if ttl == 0 {
		t.Error("ttl expired way too early")
		t.Fail()
	}

	if w2.Field2 != w1.Field2 {
		t.Error("Field2 doesn't match")
		t.Fail()
	}

	if w2.Field3["foo"] != "bar" {
		t.Error("Field3 doesn't match")
		t.Fail()
	}
}
