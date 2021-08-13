package helios

import (
	"fmt"
	"net/http"
	"net/http/httptest"
	"net/url"
	"reflect"
	"testing"
)

// Testing approach here inspired by the github client from Google:
// https://github.com/google/go-github/blob/master/github/github_test.go

var (
	testMux    *http.ServeMux
	testServer *httptest.Server

	// client is the Helios client used for tests
	client *Client
)

// setup initializes testServer and testMux, along with a helios.Client that talks
// to the test server. Use testMux.handleFunc to return test data, and make sure to
// call teardown() to tear down the testServer when done.
func setup() {
	testMux = http.NewServeMux()
	testServer = httptest.NewServer(testMux)

	url, _ := url.Parse(testServer.URL)
	client = NewClientForURL(url, nil)
}

func teardown() {
	testServer.Close()
}

func TestVersion(t *testing.T) {
	setup()
	defer teardown()

	testMux.HandleFunc("/version", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == "GET" {
			fmt.Fprint(w, `"0.8.17"`)
		}
	})

	actual, err := client.Version()

	if err != nil {
		t.Errorf("Version returned error: %v", err)
	}

	expected := "0.8.17"
	if actual != expected {
		t.Errorf("Version returned %v, expected %v", actual, expected)
	}
}

func TestMasters(t *testing.T) {
	setup()
	defer teardown()

	testMux.HandleFunc("/masters", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == "GET" {
			fmt.Fprint(w, `["master1", "master2"]`)
		}
	})

	actual, err := client.Masters()

	if err != nil {
		t.Errorf("Masters returned error: %v", err)
	}

	expected := []string{"master1", "master2"}
	if !reflect.DeepEqual(actual, expected) {
		t.Errorf("Masters returned %v, expected %v", actual, expected)
	}
}
