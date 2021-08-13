[![Archived header](https://github.com/newrelic/open-source-office/raw/master/examples/categories/images/Archived.png)](https://github.com/newrelic/open-source-office/blob/master/examples/categories/index.md#archived)

## Memcached Ruby Plugin for New Relic

Prerequisites
-------------
- A New Relic account. Signup for a free account at [http://newrelic.com](http://newrelic.com)
- A server running Memcached v1.4 or greater. Download the latest version of Memcached for free [here](https://code.google.com/p/memcached/downloads/list).
- Ruby version 1.8.7 or better

Installation
-------------

The Memcached plugin can be [installed manually](#running-the-agent) or automatically with [Chef](http://www.getchef.com) and [Puppet](http://puppetlabs.com). For Chef and Puppet support see the New Relic plugin's [Chef Cookbook](http://community.opscode.com/cookbooks/newrelic_plugins) and [Puppet Module](https://forge.puppetlabs.com/newrelic/newrelic_plugins).

Additional information on using Chef and Puppet with New Relic is available in New Relic's [documentation](https://docs.newrelic.com/docs/plugins/plugin-installation-with-chef-and-puppet).

Running the Agent
----------------------------------

1. Download the latest `newrelic_memcached_plugin-X.Y.Z.tar.gz` from [the tags list](https://github.com/newrelic-platform/newrelic_memcached_plugin/tags)
1. Extract the downloaded archive to the location you want to run the Memcached agent from
1. Run `bundle install` to install required gems
1. Copy `config/template_newrelic_plugin.yml` to `config/newrelic_plugin.yml`
1. Edit `config/newrelic_plugin.yml` with your license key and to point to your instances of Memcached. You can add as many hosts as you'd like If your Memcached instances are bound to an external IP, use that value for the host field.  If you omit the 'port' field it will default to '11211'
1. Edit the `config/newrelic_plugin.yml` file by changing the name and endpoint fields to match your Memcached server configuration
1. From your shell run: `./newrelic_memcached_agent`
1. Wait a few minutes for New Relic to begin processing the data sent from your agent.
1. Log into your New Relic account at [http://newrelic.com](http://newrelic.com) and click on `Memcached` on the left hand nav bar to start seeing your Memcached metrics

Source Code
-----------

This plugin can be found at [https://github.com/newrelic-platform/newrelic_memcached_plugin](https://github.com/newrelic-platform/newrelic_memcached_plugin)

Contributing
-----------

You are welcome to send pull requests to us - however, by doing so you agree that you are granting New Relic a non-exclusive, non-revokable, no-cost license to use the code, algorithms, patents, and ideas in that code in our products if we so choose. You also agree the code is provided as-is and you provide no warranties as to its fitness or correctness for any purpose.
