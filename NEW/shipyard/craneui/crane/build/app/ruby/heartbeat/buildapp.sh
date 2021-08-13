#!/bin/bash

cd `dirname "$0"`;
cd heartbeat;

source /etc/profile.d/rbenv.sh;

rbenv rehash;
bundle install

# From here, do what you want to configure your app or anything else


echo '---------------------------------- APP BUILD FINISHED'