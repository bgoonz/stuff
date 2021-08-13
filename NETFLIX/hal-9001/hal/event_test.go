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
	"fmt"
	"testing"
)

func TestEvtBodyAsArgv(t *testing.T) {
	evt := Evt{}
	evt.Body = "a simple flat test"
	argv := evt.BodyAsArgv()

	if len(argv) != 4 {
		fmt.Printf("expected 4 elements, got %d", len(argv))
		t.Fail()
	}

	//            1     2      3    4            5     6              7                    8
	evt.Body = ` !foo --this -one "is a little" more (complicated) 'becuase of the quotes' OK`
	argv = evt.BodyAsArgv()

	if len(argv) != 8 {
		fmt.Printf("expected 8 elements, got %d", len(argv))
		t.Fail()
	}

	// leading/trailing whitespace should be stripped and embedded quotes
	// should be intact. Escaped quotes are not supported.
	evt.Body = `	!bar "perhaps 'this challenge' will" '@%$*#@(**W(IOWIE-'------ break TEH BANK "" '' `
	argv = evt.BodyAsArgv()

	if len(argv) != 9 {
		fmt.Printf("expected 9 elements, got %d", len(argv))
		t.Fail()
	}
}
