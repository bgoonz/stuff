#!/bin/bash

cd `dirname "$0"`;
cd {{application_name}};

source /etc/profile.d/rbenv.sh;

rbenv rehash;
bundle install

# From here, do what you want to configure your app or anything else
{{before_launch}}

echo '---------------------------------- APP BUILD FINISHED'
