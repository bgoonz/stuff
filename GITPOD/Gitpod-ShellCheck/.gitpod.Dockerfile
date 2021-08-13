FROM gitpod/workspace-full

USER gitpod

RUN brew update && brew install shellcheck