#!/bin/sh

sudo pip install -r requirements.txt;
sudo mkdir /opt/crane/databases/;
sudo chown -R $USER:$USER /opt/crane
python manage.py syncdb --noinput;
python manage.py migrate;
python manage.py createsuperuser;
