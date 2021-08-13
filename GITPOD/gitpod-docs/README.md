# Gitpod Documentation

The user's guide for Gitpod using mdbook. Published to https://docs.gitpod.io

[![Open in Gitpod](http://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io#https://github.com/gitpod-io/gitpod-docs)

## Build
```
mdbook build && mdbook test
```

## Publish

1. push contents to branch "master"
2. this will trigger an internal job that runs the build commands and makes the generated documentation available on https://docs.gitpod.io/
