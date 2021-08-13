# Stealth Stars, Inc.

Use Rails to manage all of your field operatives!

This is the demo application we'll be using in our [New Relic Performance Code Kata](http://railsconf.com/2013/talks#talk-55) talk at RailsConf 2013. It has a number of performance issues, some of which
we'll be working through in our talk.

This code is here mainly so you can follow along with the talk, or follow up on points you were
curious about afterwards. If you're looking for something better suited to working through on your
own, be sure to check out the [New Relic Ruby Code Kata](https://github.com/newrelic/newrelic-ruby-kata).

## Getting started

To get the app running locally:

1. `bundle`
2. `RAILS_ENV=production bundle exec rake db:setup content:generate` - this will create a local database and seed it with dummy data
3. Set `NEW_RELIC_LICENSE_KEY` in your environment (or in `script/deploy`) to your New Relic license key (alternately, you may just edit `config/newrelic.yml` to add it there).
4. `./script/deploy` - this will start up a local unicorn instance serving the app, and notify New Relic of the deployment. You can also use this script whenever you make changes to the application to restart Unicorn and notify New Relic of the changes.
5. Visit http://localhost:3333/
