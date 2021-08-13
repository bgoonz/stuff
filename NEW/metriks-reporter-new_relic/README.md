# Metriks::Reporter::NewRelic

Allows metric data collected by with the Metriks gem to be reported to your New Relic account via a running New Relic Ruby agent.

## Usage

```ruby
require 'metriks/reporter/new_relic'

Metriks::Reporter::NewRelic.start
```

Metric data will be available via [custom dashboards](https://newrelic.com/docs/instrumentation/custom-dashboards) in the "Custom" namespace.  If you record some timer data like this:

```ruby
Metriks.timer('some.time') do
  something(that, takes).a.while
end
```

It will be recorded in New Relic as "Custom/some/time".
