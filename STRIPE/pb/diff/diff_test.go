package diff

import (
	"io/ioutil"
	"os"
	"os/exec"
	"path/filepath"
	"testing"

	"github.com/golang/protobuf/proto"
	"github.com/golang/protobuf/protoc-gen-go/descriptor"
)

// Given a directory name and a .proto file, generate a FileDescriptorSet.
//
// Requires protoc to be installed.
func generateFileSet(t *testing.T, prefix, name string) descriptor.FileDescriptorSet {
	var fds descriptor.FileDescriptorSet
	protoDir := filepath.Join("testdata", prefix)
	protoFile := filepath.Join(protoDir, name+".proto")
	fdsDir := filepath.Join("testdata", prefix+"_fds")
	fdsFile := filepath.Join(fdsDir, name+".fds")
	if err := os.MkdirAll(fdsDir, 0755); err != nil {
		t.Fatal(err)
	}
	// Run protoc
	cmd := exec.Command("protoc", "-o", fdsFile, protoFile)
	if out, err := cmd.CombinedOutput(); err != nil {
		t.Fatalf("protoc failed: %s %s", err, out)
	}
	blob, err := ioutil.ReadFile(fdsFile)
	if err != nil {
		t.Fatal(err)
	}
	if err := proto.Unmarshal(blob, &fds); err != nil {
		t.Fatalf("parsing prev proto: %s", err)
	}
	return fds
}

func TestDiffing(t *testing.T) {
	files := map[string]string{
		"changed_client_streaming": "changed client streaming for method 'Invoke' on service 'Foo': false -> true",
		"changed_server_streaming": "changed server streaming for method 'Invoke' on service 'Foo': true -> false",
		"changed_enum_value":       "changed value 'bat' on enum 'FOO': 1 -> 2",
		"changed_field_label":      "changed label for field 'name' on message 'HelloRequest': LABEL_OPTIONAL -> LABEL_REPEATED",
		"changed_field_name":       "changed name for field #1 on message 'HelloRequest': foo -> bar",
		"changed_field_type":       "changed types for field 'name' on message 'HelloRequest': TYPE_STRING -> TYPE_BOOL",
		"changed_package":          "changed package name: foo -> bar",
		"changed_service_input":    "changed input type for method 'Invoke' on service 'Foo': .helloworld.FooRequest -> .helloworld.BarRequest",
		"changed_service_output":   "changed output type for method 'Invoke' on service 'Foo': .helloworld.FooResponse -> .helloworld.BarResponse",
		"removed_enum":             "removed enum 'FOO'",
		"removed_enum_field":       "removed value 'bat' from enum 'FOO'",
		"removed_field":            "removed field 'name' from message 'HelloRequest'",
		"removed_message":          "removed message 'HelloRequest'",
		"removed_service":          "removed service 'Foo'",
		"removed_service_method":   "removed method 'Bar' from service 'Foo'",
	}
	for name, problem := range files {
		t.Run(name, func(t *testing.T) {
			prev := generateFileSet(t, "previous", name)
			curr := generateFileSet(t, "current", name)
			// Won't work with --include_imports
			report, err := DiffSet(&prev, &curr)
			if err == nil {
				t.Fatal("expected diff to have an error")
			}
			if len(report.Changes) == 0 {
				t.Fatal("expected report to have at least one problem")
			}
			if len(report.Changes) > 1 {
				t.Errorf("expected report to have one problem, has %d: %v", len(report.Changes), report)
			}
			if report.Changes[0].String() != problem {
				t.Errorf("expected problem: %s", problem)
				t.Errorf("  actual problem: %s", report.Changes[0].String())
			}
		})
	}
}
