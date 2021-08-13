#!/bin/bash

if [ -z "$URL" ]
then
    echo "no URL skipping init"
    mv ../init.sh init.sh
else
    mv decode-url.js ..
    shopt -s dotglob
    echo "Downloading starter.zip from $URL"
    URL=$(node /workspace/decode-url.js $URL)
    rm -rf ./*
    echo "Downloading starter.zip from $URL"
    wget -qO- $URL | jar xvf /dev/stdin
    mv * temp
    mv temp/* .
    rm -rf temp
    if [ -f ./mvnw ]
    then
        chmod 777 ./mvnw
        ./mvnw clean install -DskipTests
        ./mvnw spring-boot:run
    else
        chmod 777 ./gradlew
        ./gradlew install
    fi
fi