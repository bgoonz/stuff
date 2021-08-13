#!/bin/sh

cd `dirname "$0"`;
source venv/bin/activate;

# Launch the app IN BACKGROUND, if you need siege to be launched.

python app.py & # CHANGE THIS LINE TO FIT YOUR NEEDS

# Comment this line if you don't want siege to run on your app.
siege -c 5 -f urls.txt;
