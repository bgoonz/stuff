package sample

import "testing"

func TestPython(t *testing.T) {
	t.Log(Python(RPC{
		Pkg:     "hellogrpc",
		Service: "Greeter",
		Method:  "SayHello",
		// Parse the protofile to infer the message type here
		InMsg: "HelloRequest",
		In: map[string]interface{}{
			"name": "kjc",
		},
		OutMsg: "HelloReply",
		Out: map[string]interface{}{
			"message": "Hello kjc!",
		},
	}))
}
