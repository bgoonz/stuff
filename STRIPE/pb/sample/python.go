package sample

import (
	"bytes"
	"fmt"
	"strings"
	"text/template"
)

type RPC struct {
	Pkg     string
	Service string
	Method  string
	// Maybe In and Out should be proto.Messages
	InMsg  string
	In     map[string]interface{}
	Out    map[string]interface{}
	OutMsg string
}

func pyValue(val interface{}) string {
	switch val.(type) {
	case bool:
		return strings.Title(fmt.Sprintf("%t", val))
	case string:
		return fmt.Sprintf("\"%s\"", val)
	case int:
		return fmt.Sprintf("%d", val)
	default:
		return fmt.Sprintf("%s", val)
	}
}

var pyFuncs = template.FuncMap{
	"py": pyValue,
}

var pyTemplate = template.Must(template.New("python").Funcs(pyFuncs).Parse(`
from __future__ import print_function

import grpc
import pprint
import {{.Pkg}}

channel = grpc.insecure_channel('104.198.13.176:50051')
stub = {{.Pkg}}.{{.Service}}Stub(channel)
response = stub.{{.Method}}({{.Pkg}}.{{.InMsg}}(
{{- range $key, $value := .In}}
    {{$key}}={{py $value}},
{{- end}}
))
pprint.pprint(response)
# {
{{- range $key, $value := .Out}}
#   "{{$key}}": {{py $value}},
{{- end}}
# }
`))

func Python(example RPC) string {
	var b bytes.Buffer
	pyTemplate.Execute(&b, example)
	return b.String()
}
