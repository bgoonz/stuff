package lint

import (
	"fmt"
	"regexp"

	descriptor "github.com/golang/protobuf/protoc-gen-go/descriptor"
)

const styleGuideBase = "https://golang.org/wiki/CodeReviewComments"

// A Linter lints Go source code.
type Linter struct {
	file     *descriptor.FileDescriptorProto
	src      []byte
	filename string
	problems []Problem
}

func NewLinter(file *descriptor.FileDescriptorProto) *Linter {
	return &Linter{file: file}
}

// Problem represents a problem in some source code.
type Problem struct {
	Position   string  // position in source file
	Text       string  // the prose that describes the problem
	Link       string  // (optional) the link to the style guide for the problem
	Confidence float64 // a value in (0,1] estimating the confidence in this problem's correctness
	LineText   string  // the source line
	Category   string  // a short name for the general category of the problem
}

func (l *Linter) Lint() []Problem {
	for _, msg := range l.file.MessageType {
		l.lintMessage(msg)
	}
	for _, enum := range l.file.EnumType {
		l.lintEnum(enum)
	}
	for _, srv := range l.file.Service {
		l.lintService(srv)
	}
	return l.problems
}

// The variadic arguments may start with link and category types,
// and must end with a format string and any arguments.
// It returns the new Problem.
func (l *Linter) errorf(confidence float64, msg string, args ...interface{}) {
	l.problems = append(l.problems, Problem{
		Position: "",
		Text:     fmt.Sprintf(msg, args...),
	})
}

var camelCaseRE = regexp.MustCompile(`^[A-Z][a-zA-Z0-9]*$`)
var upperCaseRE = regexp.MustCompile(`^[A-Z][A-Z0-9_]*$`)
var snakeCaseRE = regexp.MustCompile(`^[a-z][a-z0-9_]*$`)

// lintEnums complains if the name of an enum is not CamelCase.
func (l *Linter) lintEnum(enum *descriptor.EnumDescriptorProto) {
	if enum.Name != nil {
		if !camelCaseRE.MatchString(*enum.Name) {
			l.errorf(0.9, "enum name %s should be CamelCase", *enum.Name)
		}
	}
	for _, v := range enum.Value {
		if v.Name != nil && !upperCaseRE.MatchString(*v.Name) {
			l.errorf(0.9, "enum field %s.%s should be uppercase", *enum.Name, *v.Name)
		}
	}
}

func (l *Linter) lintMessage(msg *descriptor.DescriptorProto) {
	if msg.Name != nil {
		if !camelCaseRE.MatchString(*msg.Name) {
			l.errorf(0.9, "message name %s should be CamelCase", *msg.Name)
		}
	}
	for _, field := range msg.Field {
		if field.Name != nil && !snakeCaseRE.MatchString(*field.Name) {
			l.errorf(0.9, "message field %s.%s should be lowercase", *msg.Name, *field.Name)
		}
	}

	for _, nested := range msg.NestedType {
		l.lintMessage(nested)
	}

	for _, enum := range msg.EnumType {
		l.lintEnum(enum)
	}

}

func (l *Linter) lintService(srv *descriptor.ServiceDescriptorProto) {
	if srv.Name != nil {
		if !camelCaseRE.MatchString(*srv.Name) {
			l.errorf(0.9, "service name %s should be CamelCase", *srv.Name)
		}
	}
	for _, rpc := range srv.Method {
		if rpc.Name != nil && !snakeCaseRE.MatchString(*rpc.Name) {
			l.errorf(0.9, "rpc method %s.%s should be lowercase", *srv.Name, *rpc.Name)
		}
	}
}
