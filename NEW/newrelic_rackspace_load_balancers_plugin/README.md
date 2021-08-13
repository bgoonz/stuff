# Rackspace Load Balancers plugin

## Dependencies/Requirements
* Ruby (>= 1.8.7)
* Rubygems (>= 1.3.7)
* Bundler `gem install bundler`
* Logging must be enabled on the load balancer nodes.

## Installation

The Rackspace plugin can be [installed manually](#first-time-setup-instructions) or automatically with [Chef](http://www.getchef.com) and [Puppet](http://puppetlabs.com). For Chef and Puppet support see the New Relic plugin's [Chef Cookbook](http://community.opscode.com/cookbooks/newrelic_plugins) and [Puppet Module](https://forge.puppetlabs.com/newrelic/newrelic_plugins).

Additional information on using Chef and Puppet with New Relic is available in New Relic's [documentation](https://docs.newrelic.com/docs/plugins/plugin-installation-with-chef-and-puppet).

## First Time Setup Instructions
1. Download the latest tagged version from [HERE](https://github.com/newrelic-platform/newrelic_rackspace_load_balancers_plugin/tags)
2. Extract to the location you want to run the plugin from
3. Rename `config/template_newrelic_plugin.yml` to `config/newrelic_plugin.yml`
4. Edit `config/newrelic_plugin.yml` (See configuration information section for additional information)
5. Run `bundle install`
6. Run `bundle exec ./bin/newrelic_rs`

## Configuration Information
1. Replace 'LICENSE KEY' with your New Relic license key
2. Replace 'USERNAME' with your Rackspace username
3. Replace 'KEY' with your Rackspace API key. This can be found under API Keys in your Rackspace account settings.
4. Replace 'REGION' with the region your load balancer is located. This should be `ord`, `dfw` or `lon`. ( *Note:* This is case sensitive)

###Special Instructions for use with multiple regions
If your load balancers are in multiple regions, copy all files to a secondary directory and modify the configuration files to reflect the secondary region. You will need to run the agent twice, once for each region.

## Running the agent

To start the agent run: `bundle exec ./bin/newrelic_rs`

## Keep this process running
You can use services like these to manage this process. 
- [Upstart](http://upstart.ubuntu.com/)
- [Systemd](http://www.freedesktop.org/wiki/Software/systemd/)
- [Runit](http://smarden.org/runit/)
- [Monit](http://mmonit.com/monit/)

## For Support
Plugin support and troubleshooting assistance can be obtained by visiting [support.newrelic.com](https://support.newrelic.com)

## Credits
The New Relic Rackspace Load Balancers plugin was originally authored by [Sean Porter](https://github.com/portertech) and the team at [Heavy Water Operations](http://hw-ops.com/). Subsequent updates and support are provided by [New Relic](http://newrelic.com/platform).

## Contributing

You are welcome to send pull requests to us - however, by doing so you agree that you are granting New Relic a non-exclusive, non-revokable, no-cost license to use the code, algorithms, patents, and ideas in that code in our products if we so choose. You also agree the code is provided as-is and you provide no warranties as to its fitness or correctness for any purpose.
