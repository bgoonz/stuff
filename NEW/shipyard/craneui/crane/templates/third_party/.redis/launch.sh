#!/bin/bash

# Launch sshd
/usr/sbin/sshd;

/usr/local/bin/redis-server;

while true; do
    sleep 60;
done
