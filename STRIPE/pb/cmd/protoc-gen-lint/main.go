package main

import (
	"fmt"
	"io/ioutil"
	"log"
	"os"

	"github.com/golang/protobuf/proto"
	plugin "github.com/golang/protobuf/protoc-gen-go/plugin"
	"github.com/stackmachine/pb/lint"
)

func runlint() error {
	data, err := ioutil.ReadAll(os.Stdin)
	if err != nil {
		return fmt.Errorf("reading input: %s", err)
	}

	var req plugin.CodeGeneratorRequest
	var resp plugin.CodeGeneratorResponse

	if err := proto.Unmarshal(data, &req); err != nil {
		return fmt.Errorf("parsing input proto: %s", err)
	}

	if len(req.FileToGenerate) == 0 {
		return fmt.Errorf("no files to generate")
	}

	for _, name := range req.FileToGenerate {
		for _, protoFile := range req.ProtoFile {
			if name == *protoFile.Name {
				problems := lint.NewLinter(protoFile).Lint()
				if len(problems) > 0 {
					e := ""
					for _, problem := range problems {
						e += problem.Text + "\n"
					}
					resp.Error = &e
				}
			}
		}
	}

	// Send back the results.
	data, err = proto.Marshal(&resp)
	if err != nil {
		return fmt.Errorf("failed to marshal output proto: %s", err)
	}
	_, err = os.Stdout.Write(data)
	if err != nil {
		return fmt.Errorf("failed to write output proto: %s", err)
	}
	return nil
}

func main() {
	if err := runlint(); err != nil {
		log.Fatal(err)
	}
}
