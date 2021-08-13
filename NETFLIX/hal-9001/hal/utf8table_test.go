package hal

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
	"testing"
)

func TestUtf8Table(t *testing.T) {
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

	var results [5]string

	results[0] = `
╔═════╗
║ hdr ║
╟─────╢
║ one ║
╚═════╝
`

	results[1] = `
╔═════╗
║ hdr ║
╟─────╢
║ one ║
║ two ║
╚═════╝
`

	results[2] = `
╔══════╤═══════╗
║ left │ right ║
╟──────┼───────╢
║  one │ three ║
║  two │       ║
╚══════╧═══════╝
`

	results[3] = `
╔══════════╤═══════╤═════════╗
║ HEADER 1 │ HDR 2 │ LOL WUT ║
╟──────────┼───────┼─────────╢
║      one │   two │   three ║
║     four │  five │     six ║
╚══════════╧═══════╧═════════╝
`

	results[4] = `
╔═══════╤═══════╤════════════╤═════╤═══════╗
║ Col 1 │ Col 2 │ 3rd Column │ 4th │ FIFTH ║
╟───────┼───────┼────────────┼─────┼───────╢
║   one │   two │      three │     │       ║
║  four │  five │        six │     │       ║
║    hi │       │            │     │       ║
║       │       │            │   - │     + ║
╚═══════╧═══════╧════════════╧═════╧═══════╝
`

	for i, sample := range samples {
		// first row is the header, the rest is data rows
		out := Utf8Table(sample[0], sample[1:])

		if len(out) == 0 {
			t.Fail()
		}

		trout := strings.TrimSpace(out)
		trres := strings.TrimSpace(results[i])

		if trout != trres {
			t.Logf("Got: \n%s\nExpected:\n%s\n", trout, trres)
			t.Fail()
		}
	}
}
