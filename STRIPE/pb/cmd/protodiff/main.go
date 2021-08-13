package main

import (
	"flag"
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"path/filepath"

	"github.com/golang/protobuf/proto"
	"github.com/golang/protobuf/protoc-gen-go/descriptor"
	"github.com/stackmachine/pb/diff"
)

var l *log.Logger

func parseFileDescriptorSet(filename string) (*descriptor.FileDescriptorSet, error) {
	var fds descriptor.FileDescriptorSet
	blob, err := ioutil.ReadFile(filename)
	if err != nil {
		return nil, fmt.Errorf("error reading %s: %s", filename, err)
	}
	if err := proto.Unmarshal(blob, &fds); err != nil {
		return nil, fmt.Errorf("error parsing FileDescriptorSet: %s", err)
	}
	return &fds, nil
}

func diffFiles(previous, head string) ([]filechange, error) {
	prev, err := parseFileDescriptorSet(previous)
	if err != nil {
		return nil, err
	}
	curr, err := parseFileDescriptorSet(head)
	if err != nil {
		return nil, err
	}
	report, err := diff.DiffSet(prev, curr)
	fc := make([]filechange, len(report.Changes))
	for i, c := range report.Changes {
		fc[i] = filechange{filepath.Base(previous), c}
	}
	return fc, err
}

type filechange struct {
	file   string
	change diff.Change
}

func diffDirs(previous, current string) ([]filechange, error) {
	files, err := ioutil.ReadDir(previous)
	if err != nil {
		return nil, err
	}
	changes := []filechange{}
	var lastErr error
	for _, info := range files {
		cs, err := diffFiles(filepath.Join(previous, info.Name()), filepath.Join(current, info.Name()))
		changes = append(changes, cs...)
		if err != nil {
			lastErr = err
		}
	}
	return changes, lastErr
}

// protoc -o old example.proto
// protoc -o new example.proto
// protodiff -prev old -head new
func main() {
	l = log.New(os.Stderr, "", 0)

	var prevPath, headPath string

	flag.StringVar(&prevPath, "prev", "", "path to previous FileDescriptorSet file or directory")
	flag.StringVar(&headPath, "head", "", "path to current FileDescriptorSet file or directory")
	flag.Parse()

	var changes []filechange
	var err error

	if stat, serr := os.Stat(prevPath); serr == nil && stat.IsDir() {
		changes, err = diffDirs(prevPath, headPath)
	} else {
		changes, err = diffFiles(prevPath, headPath)
	}

	if len(changes) > 0 {
		for _, fc := range changes {
			l.Printf("%s: %s\n", fc.file, fc.change)
		}
		os.Exit(1)
	}

	if err != nil {
		l.Fatal(err)
	}
}
