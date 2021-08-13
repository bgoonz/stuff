#!/bin/bash

# Launch sshd
/usr/sbin/sshd;

cd `dirname "$0"`;
rbenv rehash;

# Launch the app IN BACKGROUND, if you need siege to be launched.

ruby <app>.rb & # CHANGE THIS LINE TO FIT YOUR NEEDS

# Comment this line if you don't want siege to run on your app.
siege -c 2 -d 1 -f urls.txt;
