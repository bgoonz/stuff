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

// Utf8Table is like AsciiTable but it uses UTF8 characters for the table
// borders. It should look nice when rendered to an image by Hal's text->img.
func Utf8Table(hdr []string, rows [][]string) string {
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
	hdrtop := make([]string, len(colwidths)) // top frame, above header row
	hdrbot := make([]string, len(colwidths)) // top frame, below header row
	tblbot := make([]string, len(colwidths)) // bottom of table

	/* some unicode references - these are available in Hal's image renderer
	   ╔═════╦═════╗ ╔═══╤═══╗ ╔══╤══╤══╗
	   ║     ║     ║ ╟───┼───╢ ╟──┼──┼──╢
	   ╚═════╩═════╝ ╚═══╧═══╝ ╚══╧══╧══╝
	*/
	if len(colwidths) > 1 {
		for i, width := range colwidths {
			if i == 0 {
				// first column
				fmts[i] = fmt.Sprintf("║ %%%ds │", width)
				hdrtop[i] = fmt.Sprintf("╔%s╤", strings.Repeat("═", width+2))
				hdrbot[i] = fmt.Sprintf("╟%s┼", strings.Repeat("─", width+2))
				tblbot[i] = fmt.Sprintf("╚%s╧", strings.Repeat("═", width+2))
			} else if i == len(colwidths)-1 {
				// last column
				fmts[i] = fmt.Sprintf(" %%%ds ║\n", width)
				hdrtop[i] = fmt.Sprintf("%s╗\n", strings.Repeat("═", width+2))
				hdrbot[i] = fmt.Sprintf("%s╢\n", strings.Repeat("─", width+2))
				tblbot[i] = fmt.Sprintf("%s╝\n", strings.Repeat("═", width+2))
			} else {
				// inner columns
				fmts[i] = fmt.Sprintf(" %%%ds │", width)
				hdrtop[i] = fmt.Sprintf("%s╤", strings.Repeat("═", width+2))
				hdrbot[i] = fmt.Sprintf("%s┼", strings.Repeat("─", width+2))
				tblbot[i] = fmt.Sprintf("%s╧", strings.Repeat("═", width+2))
			}
		}
	} else {
		// single-column tables
		fmts[0] = fmt.Sprintf("║ %%%ds ║\n", colwidths[0])
		hdrtop[0] = fmt.Sprintf("╔%s╗\n", strings.Repeat("═", colwidths[0]+2))
		hdrbot[0] = fmt.Sprintf("╟%s╢\n", strings.Repeat("─", colwidths[0]+2))
		tblbot[0] = fmt.Sprintf("╚%s╝\n", strings.Repeat("═", colwidths[0]+2))
	}

	buf := bytes.NewBuffer([]byte{})

	// top of header (frame)
	// ╔══════╤═══════╗
	fmt.Fprint(buf, strings.Join(hdrtop, ""))

	// header columns (text + frame)
	// ║ left │ right ║
	for j, col := range hdr {
		fmt.Fprintf(buf, fmts[j], col)
	}

	// between header & data (frame)
	// ╟──────┼───────╢
	fmt.Fprintf(buf, strings.Join(hdrbot, ""))

	// data rows
	// ║  one │ three ║
	// ║  two │       ║
	for _, row := range rows {
		for j, col := range row {
			fmt.Fprintf(buf, fmts[j], col)
		}
	}

	// bottom frame
	// ╚══════╧═══════╝
	fmt.Fprintf(buf, strings.Join(tblbot, ""))

	return buf.String()
}
