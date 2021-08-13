## Overview

This is a simple script that can read tcpdump full of [statsd](https://github.com/etsy/statsd) traffic and then display summary information. It will give you:

* The most prolific hosts.
* The hottest keys.
* The hottest key prefixes.

It displays each of these in a table with absolute counts, a PDF and a CDF (where applicable).

You could use this if you are, for example, trying to figure out where to add sampling.

## Instructions
Install requirements (you probably want to be using [some form of virtualenv](https://virtualenv.pypa.io/en/latest/)):

    pip install -r requirements.txt

Take a tcpdump on the statsd server:

    tcpdump -c3000000 -A -wstats.pcap -t dst port 8125 
	
Then pass that data to this script on stdin:

    ./statsdump.py < stats.pcap
	
Voilà.
