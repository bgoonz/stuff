# Example: Run Nginx Web Server in Gitpod.io

Nginx is included in Gitpod's [workspace-full](https://hub.docker.com/r/gitpod/workspace-full) docker image.
This example shows how to interact with Nginx and how to configure Nginx. Configuration is optionl, since a default configuration is included in workspace-full.

## Try or Contribute

open [https://gitpod.io#https://github.com/gitpod-io/nginx-example](https://gitpod.io#https://github.com/gitpod-io/nginx-example)

## In this Example:

1. optional: custom [nginx.conf](https://github.com/gitpod-io/nginx-example/blob/master/nginx/nginx.conf).
2. optional: set www-root via NGINX_DOCROOT_IN_REPO via [Dockerfile](https://github.com/gitpod-io/nginx-example/blob/master/.gitpod.dockerfile) (you don't want a custom nginx.conf).
3. follow the Nginx logs in the Gitpod Terminal View via multitail (see [.gitpod.yaml](https://github.com/gitpod-io/nginx-example/blob/master/.gitpod.yml)).

## Terminal Commands to try

- `nginx` - start Nginx (it's started automatically on workspace launch)
- `nginx -s stop` - stop Nginx
- `nginx -s reload` - reload Nginx config
- `gp open /etc/nginx/nginx.conf` - Open nginx.conf in Gitpod editor
- `gp open /var/log/nginx/access.log` - Open access.log in Gitpod editor
- `gp open /var/log/nginx/error.log` - Open error.log in Gitpod editor
- `multitail /var/log/nginx/access.log -I /var/log/nginx/error.log` - View and follow logs in Terminal
