require "rubygems"
require "bundler/setup"

require "newrelic_plugin"
require "newrelic_twilio/components"
require "newrelic_twilio/collectors"

module NewRelicTwilio
  module Twilio
    class Agent < NewRelic::Plugin::Agent::Base
      agent_guid "com.newrelic.twilio"
      agent_version "1.0.2"
      agent_human_labels("Twilio") { "Overview" }

      def setup_metrics
        @collector  = Collectors::Usage.new(@options[:account_sid], @options[:auth_token])
        @components = Components::Collection.new("com.newrelic.twilio", version)
      end

      def poll_cycle
        @collector.collect.each do |component, metric_name, unit, value, timestamp|
          @components.report_metric(component, metric_name, unit, value)
          #report_metric("#{component}/#{metric_name}", unit, value)
        end
        @components.process
      end
    end
  end

  #
  # Register each agent with the component.
  #
  NewRelic::Plugin::Setup.install_agent :twilio, Twilio

  #
  # Launch the agents; this never returns.
  #
  NewRelic::Plugin::Run.setup_and_run
end
