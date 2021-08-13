#!/bin/bash

# Launch sshd
/usr/sbin/sshd;

#/usr/lib/postgresql/9.1/bin/postgres
# postgres -D $DATA_DIRECTORY -h '0.0.0.0';

/etc/init.d/postgresql start;

sudo -u postgres psql -U postgres -d postgres -c "alter user postgres with password '{{password}}';";

# FIXME : createdb

while true; do
    sleep 60;
done
