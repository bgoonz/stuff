// Package docker allows users to attach a Docker image to a room and interact
// with it over its stdin/stdout.
package docker

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
	"os/exec"

	"github.com/netflix/hal-9001/hal"
)

const Name = "docker"

const Usage = `
Examples:
!docker images
!docker run
`

// Register makes this plugin available to the system.
func Register() {
	plugin := hal.Plugin{
		Name:    Name,
		Func:    docker,
		Command: "docker",
	}

	plugin.Register()
}

func docker(evt hal.Evt) {
	argv := evt.BodyAsArgv()

	if len(argv) < 2 {
		evt.Reply(Usage)
		return
	}

	switch argv[1] {
	case "images":
		images(evt)
	case "run":
		if len(argv) < 3 {
			evt.Replyf("docker run requires an image id!\n%s", Usage)
			return
		}
		run(evt, argv)
	}
}

// TODO: the idea is to be able to run an interactive container that may be more
// than a single command, e.g. an old-school question/answer script that asks a
// few questions then does some work. This will probably require a timeout
// and some way to either signal which container you're messaging or spawn a
// DM room for the purpose and perhaps send the output back to the originating
// room. The DM approach is likely least complex, even across brokers.
func run(evt hal.Evt, argv []string) {
	// danger! insecure! Demo code ;)
	cmd := exec.Command("/usr/bin/docker", argv[1:]...)
	out, err := cmd.Output()
	if err != nil {
		evt.Replyf("Encountered an error while running 'docker run %s': %s", argv[2], err)
	}

	evt.Reply(string(out))
}

func images(evt hal.Evt) {
	cmd := exec.Command("/usr/bin/docker", "images")
	out, err := cmd.Output()
	if err != nil {
		evt.Replyf("Encountered an error while running 'docker images': %s", err)
	}

	evt.Reply(string(out))
}
