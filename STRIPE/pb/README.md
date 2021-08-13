# Protocol Buffer utilities

## pblint

### Installation

    go get -u github.com/stackmachine/pb/cmd/protoc-gen-lint

### Usage

    protoc --lint_out=. helloworld.proto 

## protodiff

Verify protocol buffer changes are backwards compatible.

### Installation

    go get -u github.com/stackmachine/pb/cmd/protodiff

### Usage

    protoc -o prev example.proto
    # Make changes to example.proto
    protoc -o head example.proto
    protodiff -prev prev -head head
