[![Archived header](https://github.com/newrelic/open-source-office/raw/master/examples/categories/images/Archived.png)](https://github.com/newrelic/open-source-office/blob/master/examples/categories/index.md#archived)

# New Relic Twilio

This tool provides the New Relic Twilio metric collection agent.

## Dependencies
- A single machine
- Ruby (>= 1.8.7)
- Rubygems (>= 1.3.7)
- Bundler `gem install bundler`

## Install
1. Download the latest tagged version from https://github.com/newrelic-platform/newrelic_twilio_plugin/tags
2. Extract to the location you want to run the plugin from
3. Run `cp config/newrelic_plugin.yml.example config/newrelic_plugin.yml`
4. Edit `config/newrelic_plugin.yml` and replace "LICENSE_KEY" with your New Relic license key
5. Run `bundle install`
6. Run `bundle exec ./bin/newrelic_twilio`

## For Support
Plugin support and troubleshooting assistance can be obtained by visiting [support.newrelic.com](https://support.newrelic.com)

## Credits
The New Relic Twilio plugin was originally authored by [Sean Porter](https://github.com/portertech) and the team at [Heavy Water Operations](http://hw-ops.com/). Subsequent updates and support are provided by [New Relic](http://newrelic.com/platform).

## Contributing

You are welcome to send pull requests to us - however, by doing so you agree that you are granting New Relic a non-exclusive, non-revokable, no-cost license to use the code, algorithms, patents, and ideas in that code in our products if we so choose. You also agree the code is provided as-is and you provide no warranties as to its fitness or correctness for any purpose.
