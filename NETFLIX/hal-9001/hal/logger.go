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
	"os"
	"sync"
	"time"
)

// Logger provides a handle for using Hal's logging facility. Any Logger created
// ultimately uses the same singleton.
type Logger struct {
	prefix string // logging prefix string - eventually will be prepended to all messages
}

type LogEntry struct {
	Time    time.Time
	Prefix  string
	Body    string
	IsDebug bool
}

// logger contains the state for the logger
type logger struct {
	debug       bool            // for enabling/disabling debug logs
	logSinks    []chan LogEntry // a list of channels to receive log messages
	dbgSinks    []chan LogEntry // a list of channels to receive debug messages
	logFwdQuit  chan struct{}   // used to quit the default log message forwarder
	dbgFwdQuit  chan struct{}   // used to quit the default debug message forwarder
	logFwdClose chan struct{}   // used to signal it's ok to close the log channel
	dbgFwdClose chan struct{}   // used to signal it's ok to close the debug channel
	listLock    sync.Mutex      // protect concurrent access to the sink lists
	once        sync.Once       // initialize on first use
}

// makes log available inside Hal
var log Logger

// the singleton logger state
var gl logger

// String returns the LogEntry as a formatted log string.
func (l *LogEntry) String() string {
	var prefix string

	if l.Prefix != "" {
		prefix = "[" + l.Prefix + "] "
	}

	return l.Time.Format(time.RFC3339) + " " + prefix + l.Body
}

// initialize allocates channels and starts the background goroutines
// that forward output to stdout
func (l *logger) initialize() {
	l.once.Do(func() {
		l.listLock.Lock()
		defer l.listLock.Unlock()

		l.debug = true
		l.logSinks = make([]chan LogEntry, 1)
		l.dbgSinks = make([]chan LogEntry, 1)
		l.logSinks[0] = make(chan LogEntry, 10)
		l.dbgSinks[0] = make(chan LogEntry, 10)
		l.logFwdClose = make(chan struct{})
		l.dbgFwdClose = make(chan struct{})

		// always print logs & debug to stdout by default
		go l.fwdStdout(l.logSinks[0], l.logFwdClose)
		go l.fwdStdout(l.dbgSinks[0], l.dbgFwdClose)
	})
}

// fwdStdout is run as a goroutine to read off a channel and print to stdout.
func (l *logger) fwdStdout(src chan LogEntry, closed chan struct{}) {
	for out := range src {
		print(out.String() + "\n")
	}

	closed <- struct{}{}
}

// SetPrefix sets a new prefix that will be prepended to every message from the logger handle.
func (l *Logger) SetPrefix(prefix string) {
	l.prefix = prefix
}

// Printf formats the message and propagates it as a log message.
func (l *Logger) Printf(msg string, a ...interface{}) {
	gl.initialize()

	out := LogEntry{
		Time:   time.Now(),
		Prefix: l.prefix,
		Body:   fmt.Sprintf(msg, a...),
	}

	for _, sink := range gl.logSinks {
		sink <- out
	}
}

// Println merges the arguments and propagates the result as a log message.
func (l *Logger) Println(a ...interface{}) {
	gl.initialize()

	out := LogEntry{
		Time:   time.Now(),
		Prefix: l.prefix,
		Body:   fmt.Sprintln(a...),
	}

	for _, sink := range gl.logSinks {
		sink <- out
	}
}

// Debugf formats the message and propagates it. No work is performed if debugging
// is disabled.
func (l *Logger) Debugf(msg string, a ...interface{}) {
	gl.initialize()

	if gl.debug {
		out := LogEntry{
			Time:    time.Now(),
			Prefix:  l.prefix,
			Body:    fmt.Sprintf(msg, a...),
			IsDebug: true,
		}

		for _, sink := range gl.dbgSinks {
			sink <- out
		}
	}
}

// Fatalf formats the message, propagates the log, then exits the program.
func (l *Logger) Fatalf(msg string, a ...interface{}) {
	gl.initialize()

	out := LogEntry{
		Time:   time.Now(),
		Prefix: l.prefix,
		Body:   fmt.Sprintf(msg, a...),
	}

	for i, sink := range gl.logSinks {
		sink <- out
		if i > 0 {
			close(sink)
		}
	}

	l.DisableLogStdout()
	l.DisableDbgStdout()

	os.Exit(1)
}

// Panic panics immediately. No attempt is made to forward/propagate.
func (l *Logger) Panic(msg string) {
	out := LogEntry{
		Time:   time.Now(),
		Prefix: l.prefix,
		Body:   msg,
	}
	panic(out.String())
}

// Panicf formats a message and panics. Not propagated.
func (l *Logger) Panicf(msg string, a ...interface{}) {
	out := LogEntry{
		Time:   time.Now(),
		Prefix: l.prefix,
		Body:   fmt.Sprintf(msg, a...),
	}
	panic(out.String())
}

// IsDebug returns true of debug messages are enabled.
func IsDebug() bool {
	return gl.debug
}

// IsDebug returns true of debug messages are enabled.
func (l *Logger) IsDebug() bool {
	return gl.debug
}

// EnableDebug enables debug message propagation.
func (l *Logger) EnableDebug() {
	gl.debug = true
}

// DisableDebug disables debug message propagation.
func (l *Logger) DisableDebug() {
	gl.debug = false
}

// NewLogSink creates a new channel that will receive log messages.
// It is allocated and ready to go on return. Do not close it.
func (l *Logger) NewLogSink() chan LogEntry {
	gl.initialize()
	gl.listLock.Lock()
	defer gl.listLock.Unlock()

	sink := make(chan LogEntry, 1000)
	gl.logSinks = append(gl.logSinks, sink)
	return sink
}

// NewLogSink creates a new channel that will receive debug messages.
// It is allocated and ready to go on return. Do not close it.
func (l *Logger) NewDebugSink() chan LogEntry {
	gl.initialize()
	gl.listLock.Lock()
	defer gl.listLock.Unlock()

	sink := make(chan LogEntry, 1000)
	gl.dbgSinks = append(gl.dbgSinks, sink)
	return sink
}

// DisableLogStdout disables the automatic forwarding of log messages to stdout.
func (l *Logger) DisableLogStdout() {
	gl.initialize()
	gl.listLock.Lock()
	defer gl.listLock.Unlock()

	close(gl.logSinks[0])
	<-gl.logFwdClose
	close(gl.logFwdClose)

	gl.logSinks = gl.logSinks[1:]
}

// DisableDbgStdout disables the automatic forwarding of debug messages to stdout.
func (l *Logger) DisableDbgStdout() {
	gl.initialize()

	gl.listLock.Lock()
	defer gl.listLock.Unlock()

	close(gl.dbgSinks[0])
	<-gl.dbgFwdClose
	close(gl.dbgFwdClose)

	gl.dbgSinks = gl.dbgSinks[1:]
}
