FROM gitpod/workspace-full

USER gitpod

RUN brew tap dart-lang/dart && brew install dart
