package main

// go run utf8table.go

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
	"github.com/netflix/hal-9001/hal"
	"image/color"
)

func main() {
	samples := []string{
		"ffffff",
		"ffffffff",
		"000000ff",
		"000000aa",
		"888888ff",
		"888888",
		"f79e10",   // amber
		"f79e10ff", // amber with alpha
	}

	fd := hal.FixedFont()

	for _, sample := range samples {
		result := fd.ParseColor(sample, color.Black)
		fmt.Printf("%q => %q\n", sample, result)
	}
}
