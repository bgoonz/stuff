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
	"image/png"
	"os"
	"strings"
)

func main() {
	samples := [][][]string{
		{
			{"hdr"},
			{"one"},
		},
		{
			{"hdr"},
			{"one"},
			{"two"},
		},
		{
			{"left", "right"},
			{"one", "three"},
			{"two"},
		},
		{
			{"HEADER 1", "HDR 2", "LOL WUT"},
			{"one", "two", "three"},
			{"four", "five", "six"},
		},
		{
			{"Col 1", "Col 2", "3rd Column", "4th", "FIFTH"},
			{"one", "two", "three"},
			{"four", "five", "six"},
			{"hi"},
			{"", "", "", "-", "+"},
		},
	}

	fd := hal.FixedFont()

	for i, sample := range samples {
		out := hal.Utf8Table(sample[0], sample[1:])

		lines := strings.Split(strings.TrimSpace(out), "\n")

		img := fd.StringsToImage(lines, color.Black)

		filename := fmt.Sprintf("%d.png", i)
		f, err := os.Create(filename)
		if err != nil {
			panic(err)
		}
		defer f.Close()

		png.Encode(f, img)

		fmt.Printf("Created file: %q\n", filename)
	}
}
