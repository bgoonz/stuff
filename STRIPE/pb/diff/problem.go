package diff

import (
	"fmt"

	"github.com/golang/protobuf/protoc-gen-go/descriptor"
)

type ProblemChangedFieldType struct {
	Message string
	Number  int32
	Field   string
	OldType *descriptor.FieldDescriptorProto_Type
	NewType *descriptor.FieldDescriptorProto_Type
}

func (p ProblemChangedFieldType) String() string {
	return fmt.Sprintf("changed types for field '%s' on message '%s': %s -> %s",
		p.Field, p.Message, p.OldType, p.NewType)
}

type ProblemChangedFieldName struct {
	Message string
	Number  int32
	OldName *string
	NewName *string
}

func (p ProblemChangedFieldName) String() string {
	return fmt.Sprintf("changed name for field #%d on message '%s': %s -> %s",
		p.Number, p.Message, *p.OldName, *p.NewName)
}

type ProblemChangedFieldLabel struct {
	Message  string
	Field    string
	OldLabel *descriptor.FieldDescriptorProto_Label
	NewLabel *descriptor.FieldDescriptorProto_Label
}

func (p ProblemChangedFieldLabel) String() string {
	return fmt.Sprintf("changed label for field '%s' on message '%s': %s -> %s",
		p.Field, p.Message, p.OldLabel, p.NewLabel)
}

type ProblemRemovedField struct {
	Message string
	Field   string
}

func (p ProblemRemovedField) String() string {
	return fmt.Sprintf("removed field '%s' from message '%s'", p.Field, p.Message)
}

type ProblemRemovedServiceMethod struct {
	Service string
	Name    string
}

func (p ProblemRemovedServiceMethod) String() string {
	return fmt.Sprintf("removed method '%s' from service '%s'", p.Name, p.Service)
}

type ProblemChangedService struct {
	Service string
	Name    string
	Side    string
	OldType string
	NewType string
}

func (p ProblemChangedService) String() string {
	return fmt.Sprintf("changed %s type for method '%s' on service '%s': %s -> %s",
		p.Side, p.Name, p.Service, p.OldType, p.NewType)
}

type ProblemRemovedEnumValue struct {
	Enum string
	Name string
}

func (p ProblemRemovedEnumValue) String() string {
	return fmt.Sprintf("removed value '%s' from enum '%s'", p.Name, p.Enum)
}

type ProblemChangeEnumValue struct {
	Enum     string
	Name     string
	OldValue int32
	NewValue int32
}

func (p ProblemChangeEnumValue) String() string {
	return fmt.Sprintf("changed value '%s' on enum '%s': %d -> %d", p.Name, p.Enum, p.OldValue, p.NewValue)
}

type ProblemRemovedEnum struct {
	Enum string
}

func (p ProblemRemovedEnum) String() string {
	return fmt.Sprintf("removed enum '%s'", p.Enum)
}

type ProblemRemovedMessage struct {
	Message string
}

func (p ProblemRemovedMessage) String() string {
	return fmt.Sprintf("removed message '%s'", p.Message)
}

type ProblemRemovedFile struct {
	File string
}

func (p ProblemRemovedFile) String() string {
	return fmt.Sprintf("removed file '%s'", p.File)
}

type ProblemRemovedService struct {
	Name string
}

func (p ProblemRemovedService) String() string {
	return fmt.Sprintf("removed service '%s'", p.Name)
}

type ProblemChangedServiceStreaming struct {
	Service   string
	Name      string
	Side      string
	OldStream *bool
	NewStream *bool
}

func (p ProblemChangedServiceStreaming) String() string {
	return fmt.Sprintf("changed %s streaming for method '%s' on service '%s': %t -> %t",
		p.Side, p.Name, p.Service, p.OldStream != nil, p.NewStream != nil)
}

type ProblemChangedPackage struct {
	File   *descriptor.FileDescriptorProto
	OldPkg string
	NewPkg string
}

func (p ProblemChangedPackage) String() string {
	return fmt.Sprintf("changed package name: %s -> %s", p.OldPkg, p.NewPkg)
}
