package main

import (
	"testing"

	"github.com/stripe/zeus/go/config"
)

func TestDefaultConfigFile(t *testing.T) {
	if config.ConfigFile != "zeus.json" {
		t.Fail()
	}
}
