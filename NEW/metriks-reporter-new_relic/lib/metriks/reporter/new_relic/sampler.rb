require 'new_relic/agent/sampler'

module Metriks::Reporter
  module NewRelic
    class Sampler < ::NewRelic::Agent::Sampler
      def initialize(options={})
        @registry = options[:registry] || Metriks::Registry.default
        @cache = Hash.new
      end

      def poll
        @registry.each do |name, metric|
          case metric
          when defined?(Metriks::Gauge) && metric.kind_of?(Metriks::Gauge)
            NewRelic::Agent.record_metric(newrelic_name(name), metric.value)
  
          when Metriks::Timer
            count = value_update(name, :count, metric.count) do |old,new|
              new - old
            end
            min = value_update(name, :min, metric.min) do |old,new|
              new < old ? new : old
            end
            max = value_update(name, :max, metric.max) do |old,new|
              new > old ? new : old
            end
            value = {
              :total => metric.mean,
              :count => count,
              :min => min,
              :max => max,
              # NOTE: we lose the total sum of squares, not in the registry
              :sum_of_squares => 0
            }
            ::NewRelic::Agent.record_metric(newrelic_name(name), value)

          when Metriks::Counter
            count = value_update(name, :count, metric.count) do |old,new|
              new - old
            end
            ::NewRelic::Agent.increment_metric(newrelic_name(name), count)
          end
        end
      end

      def newrelic_name(name)
        "Custom/" + name.gsub('.', '/')
      end

      def value_update(metric_name, field_name, new_value)
        cache_key = "#{metric_name}-#{field_name}"
        if @cache[cache_key] == nil
          update = new_value
        else
          update = yield(@cache[cache_key], new_value)
        end
        @cache[cache_key] = update
        return update
      end
    end
  end
end
