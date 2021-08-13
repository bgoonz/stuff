package helios

import (
	"fmt"
	"net/http"
	"reflect"
	"testing"
)

func TestHostsService_List(t *testing.T) {
	setup()
	defer teardown()

	testMux.HandleFunc("/hosts", func(w http.ResponseWriter, r *http.Request) {
		if r.Method == "GET" {
			fmt.Fprint(w, `["host1", "host2"]`)
		}
	})

	actual, err := client.Hosts.List()

	if err != nil {
		t.Errorf("Hosts.List returned error: %v", err)
	}

	expected := []string{"host1", "host2"}
	if !reflect.DeepEqual(actual, expected) {
		t.Errorf("Hosts.List returned %v, expected %v", actual, expected)
	}
}
