#! /bin/bash

host=`hostname`
ghe=${host/githubhost/github}

for i in exceptions gitauth audit unicorn auth; do
	ssh admin@$ghe "tail -f /var/log/github/$i.log" | python ~/src/ghelog/bin/awesomeparsethingiethatiscool.py $ghe $i >$i.log  2>&1 &
done

for i in redis; do
	ssh admin@$ghe "tail -f /var/log/$i.log" | python ~/src/ghelog/bin/awesomeparsethingiethatiscool.py $ghe $i >$i.log 2>&1 &
done

for i in syslog; do
	ssh admin@$ghe "tail -f /var/log/$i" | python ~/src/ghelog/bin/awesomeparsethingiethatiscool.py $ghe $i >$i.log 2>&1 &
done

wait
