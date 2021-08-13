CONsistent Delivery Of Repositories
===================================

Problem
-------

- `apt` uses the `http` protocol to grab repository metadata across multiple requests.
- No information is available to ensure consistency across resources, leading to errors such as:

        Failed to fetch http://[...]  Hash Sum mismatch

Solution
--------

- Whenever we don't have a session for a client yet, or when it grabs `InRelease` or `Release.gpg`, we create a new session identified by reading a symlink. Sessions are per client, distribution and suite.

- We ask `nginx` (which does the heavy lifting of serving the data) to serve the files from a path created using this symlink.

- This only affects `dists`; `pool` is meant to be served as-is.

Usage
-----

- Deploy behind nginx, with a configuration like:

        server {
            server_name repository.foo.com;
            listen 80;

            location / {
                proxy_pass http://127.0.0.1:8080;
                proxy_set_header X-Real-IP $remote_addr;
            }
            location /direct/ {
                internal;
                alias /var/lib/debian-repository/;
            }
        }

- Put an `application.conf` in your classpath overwriting any configuration you do not like (see `src/resources/reference.conf`).

Known issues
------------

- NAT sucks. In short, you need to make sure that `nginx` will provide a unique enough `X-Real-IP` header for each client.
