#!/bin/bash
cd `dirname "$0"`;
cd app;

virtualenv -p `which python` venv;
source venv/bin/activate;
pip install -r requirements.txt
# From here, do what you want to configure your app or anything else
