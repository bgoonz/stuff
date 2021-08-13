#!/bin/bash
cd `dirname "$0"`;
cd {{application_name}};

virtualenv -p `which python` venv;
source venv/bin/activate;
pip install -r requirements.txt

# From here, do what you want to configure your app or anything else
{{before_launch}}

echo '---------------------------------- APP BUILD FINISHED'
