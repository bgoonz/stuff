FROM gitpod/workspace-full
USER gitpod
RUN sudo sh -c '(echo "#!/usr/bin/env sh" && curl -L https://github.com/lihaoyi/Ammonite/releases/download/2.0.4/2.13-2.0.4) > /usr/local/bin/amm && chmod +x /usr/local/bin/amm' 
RUN brew install scala coursier/formulas/coursier sbt scalaenv
RUN sudo env "PATH=$PATH" coursier bootstrap org.scalameta:scalafmt-cli_2.12:2.4.2 \
  -r sonatype:snapshots \
  -o /usr/local/bin/scalafmt --standalone --main org.scalafmt.cli.Cli
RUN scalaenv install scala-2.9.3 && scalaenv global scala-2.9.3
RUN bash -cl "set -eux \
    version=0.8.0 \
    coursier fetch \
        org.scalameta:metals_2.12:$version \
        org.scalameta:mtags_2.13.1:$version \
        org.scalameta:mtags_2.13.0:$version \
        org.scalameta:mtags_2.12.10:$version \
        org.scalameta:mtags_2.12.9:$version \
        org.scalameta:mtags_2.12.8:$version \
        org.scalameta:mtags_2.11.12:$version"
