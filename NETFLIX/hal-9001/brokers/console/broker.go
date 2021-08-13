package console

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
	"bufio"
	"fmt"
	"io"
	"os"
	"strings"
	"time"

	"github.com/chzyer/readline"
	"github.com/netflix/hal-9001/hal"
)

var log hal.Logger

type Config struct{}

type Broker struct {
	User   string
	Room   string
	Topic  string
	Stdin  chan string
	Stdout chan string
}

type SlashReaction string

// REPL starts a readline-like bot REPL on the console.
// All plugins that are present and registered are automatically enabled.
// name should be a non-empty string. It is reported as the room name/id and
// will be the string in the REPL prompt, e.g. "foo" -> "foo> ".
// If prefix is set, it is prepended to every line so you can do, e.g.
// REPL("foo", "!foo") and every line in the REPL will show up in the hal
// Evt.Body as "!foo <whatever>". To avoid this, set it to empty string.
// This will start 2 goroutines.
func REPL(name, prefix string) {
	conf := Config{}
	broker := conf.NewBroker(name)
	router := hal.Router()
	router.AddBroker(broker)
	go router.Route()

	// automatically wire up all loaded & registered plugins
	pr := hal.PluginRegistry()
	for _, p := range pr.PluginList() {
		i := p.Instance(broker.Room, broker)
		i.Register()
	}

	lines := make(chan string, 100)
	quit := make(chan struct{}, 1)

	// a simple forwarder - lines from the REPL are forwarded to the router
	// lines from the router are printed to stdout
	// when the user quits, the goroutine is shut down gracefully
	go func() {
		for {
			select {
			case <-quit:
				close(quit)
				close(lines)
				return
			case line := <-broker.Stdout:
				println(line)
			case line := <-lines:
				broker.Stdin <- line
			}
		}
	}()

	rl, err := readline.New(name + "> ")
	if err != nil {
		panic(err)
	}
	defer rl.Close()

	// block forever reading lines from stdin
	for {
		line, err := rl.Readline()
		if err == io.EOF {
			time.Sleep(time.Millisecond * 100)
			continue
		} else if err != nil {
			panic(err)
		}

		// quit or exit immediately exit the REPL
		trimmed := strings.Trim(line, "\r\n		")
		if trimmed == "quit" || trimmed == "exit" {
			break
		}

		// no input, user likely hit enter on an empty line
		if trimmed == "" {
			continue
		}

		// e.g. prefix="!prefs" translates "list" to "!prefs list"
		// so the plugin system automatically takes care of things
		// without hacks in the core code
		if prefix != "" {
			lines <- prefix + " " + strings.Trim(line, " ")
		} else {
			lines <- line
		}
	}

	quit <- struct{}{}
}

// NewBroker returns a new console.Broker.
func (c Config) NewBroker(name string) Broker {
	user := os.Getenv("USER")
	if user == "" {
		user = "testuser"
	}

	out := Broker{
		User:   user,
		Room:   name,
		Stdin:  make(chan string, 1000),
		Stdout: make(chan string, 1000),
	}

	return out
}

func (cb Broker) Name() string {
	return cb.Room
}

func (cb Broker) Send(e hal.Evt) {
	cb.Stdout <- e.Body
}

func (cb Broker) SendDM(e hal.Evt) {
	cb.Stdout <- e.Body
}

func (cb Broker) Leave(roomId string) error {
	log.Println("Leave(roomId string) not implemented.")
	return nil
}

func (cb Broker) GetTopic(roomId string) (string, error) {
	return cb.Topic, nil
}

func (cb Broker) SetTopic(roomId, topic string) error {
	cb.Topic = topic
	cb.Stdout <- fmt.Sprintf("topic set to: %q", topic)
	return nil
}

func (cb Broker) SendTable(e hal.Evt, hdr []string, rows [][]string) {
	cb.Stdout <- hal.Utf8Table(hdr, rows)
}

func (cb Broker) LooksLikeRoomId(room string) bool {
	return true
}

func (cb Broker) LooksLikeUserId(user string) bool {
	return true
}

// SimpleStdin will loop forever reading stdin and publish each line
// as an event in the console broker.
// e.g. go cbroker.SimpleStdin()
func (cb Broker) SimpleStdin() {
	scanner := bufio.NewScanner(os.Stdin)
	for scanner.Scan() {
		line := scanner.Text()

		if err := scanner.Err(); err != nil {
			log.Fatalf("Failed while reading from stdin: %s\n", err)
		}

		// ignore empty lines
		if len(line) == 0 {
			continue
		}

		cb.Stdin <- line
	}
}

// SimpleStdout prints all replies, etc to the broker on os.Stdout.
// e.g. go cbroker.SimpleStdout()
func (cb Broker) SimpleStdout() {
	for {
		select {
		case txt := <-cb.Stdout:
			// events from the Reply() method go through a go channel
			_, err := os.Stdout.WriteString(txt)
			if err != nil {
				log.Fatalf("Could not write to stdout: %s\n", err)
			}
		}
	}
}

func (cb Broker) Stream(out chan *hal.Evt) {
	for {
		input := <-cb.Stdin
		now := time.Now()

		e := hal.Evt{
			ID:       fmt.Sprintf("%d.%06d", now.Unix(), now.UnixNano()),
			User:     cb.User,
			UserId:   cb.User,
			Room:     cb.Room,
			RoomId:   cb.Room,
			Body:     input,
			Time:     now,
			Broker:   cb,
			IsChat:   true,
			Original: &input,
		}

		if strings.HasPrefix(e.Body, "/") {
			args := e.BodyAsArgv()

			// detect slash commands for creating specialized event types
			switch args[0] {
			case "/reaction":
				if len(args) == 2 {
					e.Body = args[1]
					// re-cast the reaction as a type that can be introspected by plugins
					orig := SlashReaction(args[1])
					e.Original = &orig
				} else {
					e.IsChat = true
					e.Reply("/reaction requires exactly one argument!")
				}
			}
		} else {
			// everything else is just a plain chat event
			out <- &e
		}
	}
}

// required by interface
func (b Broker) RoomIdToName(in string) string { return in }
func (b Broker) RoomNameToId(in string) string { return in }
func (b Broker) UserIdToName(in string) string { return in }
func (b Broker) UserNameToId(in string) string { return in }
