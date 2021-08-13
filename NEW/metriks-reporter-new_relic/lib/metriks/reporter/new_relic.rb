require 'metriks'
require 'newrelic_rpm'
require 'metriks/reporter/new_relic/sampler'

module Metriks
  module Reporter
    module NewRelic
      extend self

      def start
        ::NewRelic::Agent.instance.stats_engine.add_harvest_sampler(Sampler.new)
      end

      def stop
        # not yet able
      end

      def restart
        # not yet able
      end
    end
  end
end
