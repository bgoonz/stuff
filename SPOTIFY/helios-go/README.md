helios-go [![Build Status](https://travis-ci.org/spotify/helios-go.svg?branch=master)](https://travis-ci.org/spotify/helios-go)
=========

Go client for Helios

Status
---
This is very much a work in progress. Only a couple methods have been implemented.

Example
---

```go
import "github.com/spotify/helios-go/helios"

// Construct a Helios client. Uses SRV lookup to find masters in "example.net".
client, err := helios.NewClient("example.net", nil)

// List all available hosts.
hosts, err := client.Hosts.List()
```
