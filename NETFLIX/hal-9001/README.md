# Hal-9001

Hal-9001 is a Go library that offers a number of facilities for creating a bot
and its plugins.

# Goals

* make easy things easy and hard things accessible
* 15 minutes from getting started to a working bot
* optimize for long-term maintenance

# Requirements

* Go >= 1.5

It should build with older versions of Go but it has not been tested.

# Creating your own bot

The easiest place to start is with the examples in the examples directory. Take
a look at what's there and copy the main.go of your favorite into a new repo
and start editing it to your taste.

examples/everything/main.go has the most coverage of Hal's features and has
commentary throughout the file that should help you get going.

TODO: add more of a tutorial here / on the wiki

# Building

A few dependencies are required by Hal's core library and plugins. For
building the examples/everything demo, you will need the following. Hal
core requires at least the mysql driver to build. Everything else is
a dependency of a plugin or broker and can be omitted if you don't import
those.

```
go get github.com/nlopes/slack
go get github.com/mattn/go-xmpp
go get github.com/codegangsta/cli
go get github.com/go-sql-driver/mysql

# optional - currently only used in examples/repl
go get gopkg.in/DATA-DOG/go-sqlmock.v1
```

# Using Hal in chat

Most bots built with hal start the pluginmgr plugin first. The pluginmgr
allows users to enable and configure plugins from inside the chat system.

e.g.

```
!plugin attach uptime
!plugin detach uptime
!plugin attach uptime --regex ^[[:space:]]*!up
!plugin list
```

# Terminology

### Event

Hal's events (hal.Evt) are an abstraction of the messages/events that
brokers produce/consume. An event has a Body, User, Room, and timestamp.

The handle offers some convenience methods for replying to events and
other tedious bits around processing them.

### Broker

A broker is a 2-way producer/consumer of events. The code that hooks
hal up to Slack, Hipchat, and others are brokers. There is a hal.Broker
interface that defines the required behavior of brokers.

### Plugin

A plugin is a function that processes events with metadata. Plugins do
nothing until they are attached to a room in the plugin manager.

### Instance

An instance is a plugin that has been attached to a room.

### Room

Hal calls all channels/rooms/related concepts rooms. Mostly "room" was picked
because calling things channels in Go code gets confusing when you're also
using channels extensively.

# Authoring Plugins

Hal plugins should be in a package. You can have more than one plugin
per package. Some ship with Hal, others are in their own repos and
can be added with go get/import.

Because plugins are not activated automatically and can be bound to channels
with separate configs, they have to be registered and then instantiated.

```go
package uptime

// uptime: the simplest useful plugin possible

import (
	"time"

	"github.com/netflix/hal-9001/hal"
)

var booted time.Time

func init() {
	booted = time.Now()
}

// The plugin's Register() should be called from main() in the bot to
// make the plugin available for use at runtime. It can be called anything
// you like, but most of the plugins call it Register().
//
// Plugins are not tied to a specific broker so if it is going to use
// the evt.Original field, be careful about double-checking the type
// of message or evt.Broker to make sure it's safe to use.
func Register() {
	p := hal.Plugin{
		Name:   "uptime",
		Func:   uptime,
		Regex:  "^!uptime",
	}

	p.Register()
}

// uptime implements the plugin itself
func uptime(evt hal.Evt) {
	ut := time.Since(booted)
	evt.Replyf("uptime: %s", ut.String())
}
```

# Rationale

Some constructs in Hal are the result of a few decisions that deserve explanation.

## MySQL as the only supported database driver

Right now, only mysql-compatible database backends are supported. This is
unlikely to change. Coding directly against a specific database allows Hal
to use database-specific features and avoid unncessarry abstractions or loss
of power required to support other databases.

Netflix runs its bot in AWS using Aurora with local testing against MariaDB.

## missing tests & ubiquitous assertions

This is not a permanent situation. The API changed a lot as the bot was being
built and tests were frequently invalidated. Now that the API is more stable,
tests are being added back over time.

In order to speed up development and reduce the frequence of error checking
in plugin/bot code, many parts of hal simply crash the program when errors
occur. This makes assumptions about errors obvious and immediately visible
without having to bubble errors up into consumer code at the cost of having
to run your hal bot under a supervisor. When reasons are found to convert
fatal errors into error returns, code should be refactored to do so.

# TODO

- [ ] implement sensible REST patterns for HTTP endpoints
- [ ] work on the TODOs sprinkled throughout the code
- [ ] provide more examples, e.g. slack-only, hipchat-only, console + slack
- [ ] logging hooks to redirect logs to a channel
- [ ] revive/update the Docker plugin
- [ ] update constants to match the Go standards

# Future Ideas

* [in progress] a Docker plugin that runs code in Docker over stdio
    * exists, but is not ready to be released yet
* integrate sshchat as a broker or an maybe an ssh server for admin stuff
* build in a simple arg parser something like evt.Getopts()
  along the lines of evt.BodyAsArgv()

# Community

The hangops slack seems like as good a place as any to start out.
Bot presence coming soon.

https://hangops.slack.com/messages/hal-9001/

# Author

Al Tobey <atobey@netflix.com>

# License

Apache 2
