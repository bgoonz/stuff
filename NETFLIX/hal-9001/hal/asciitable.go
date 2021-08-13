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
	"bytes"
	"fmt"
	"strings"
)

// Table takes a 2-dimensional array of strings and returns a single string
// formatted in a table appropriate for rendering in a fixed-width font.
// Should be suitable for Markdown table rendering.
// cheesy 2-pass technique, assuming straight fixed-width ASCII for now
func AsciiTable(hdr []string, rows [][]string) string {
	if len(rows) == 0 {
		return "NO DATA TO DISPLAY"
	} else if len(rows[0]) == 0 {
		panic("BUG: the first row seems to be empty!")
	}

	// find the needed width of each column
	colwidths := make([]int, len(hdr))
	// start with the headers' widths
	for j, col := range hdr {
		colwidths[j] = len(col)
	}

	// bump to the size of any larger cells
	for i, row := range rows {
		// handle empty/short rows gracefully by reallocating which
		// results in a default value of ""
		if len(row) < len(hdr) {
			newrow := make([]string, len(hdr))
			copy(newrow[0:len(row)], row)
			rows[i] = newrow
			row = newrow
		}

		for j, col := range row {
			if colwidths[j] < len(col) {
				colwidths[j] = len(col)
			}
		}
	}

	// generate format strings for the columns
	fmts := make([]string, len(colwidths))
	hrcs := make([]string, len(colwidths))
	if len(colwidths) > 1 {
		for i, width := range colwidths {
			if i == 0 {
				fmts[i] = fmt.Sprintf("| %%%ds |", width)
				hrcs[i] = fmt.Sprintf("|%s|", strings.Repeat("-", width+2))
			} else if i == len(colwidths)-1 {
				fmts[i] = fmt.Sprintf(" %%%ds |\n", width)
				hrcs[i] = fmt.Sprintf("%s|\n", strings.Repeat("-", width+2))
			} else {
				fmts[i] = fmt.Sprintf(" %%%ds |", width)
				hrcs[i] = fmt.Sprintf("%s|", strings.Repeat("-", width+2))
			}
		}
	} else {
		// single-column tables
		fmts[0] = fmt.Sprintf("| %%%ds |\n", colwidths[0])
		hrcs[0] = fmt.Sprintf("|%s|\n", strings.Repeat("-", colwidths[0]+2))
	}

	// horizontal rule
	hr := strings.Join(hrcs, "")

	buf := bytes.NewBuffer([]byte{})

	fmt.Fprint(buf, hr)

	for j, col := range hdr {
		fmt.Fprintf(buf, fmts[j], col)
	}

	fmt.Fprintf(buf, hr)

	for _, row := range rows {
		for j, col := range row {
			fmt.Fprintf(buf, fmts[j], col)
		}
	}

	fmt.Fprintf(buf, hr)

	return buf.String()
}
