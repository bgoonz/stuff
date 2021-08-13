require 'newrelic_rackspace_plugin/agent_plugin'
require 'newrelic_rackspace_lb/version'

module NewRelicRackspacePlugin
  class PluginAgent
    module Lb
      class Agent < PluginAgent

        agent_version NewRelicRackspacePlugin::Lb::VERSION.version
        agent_guid 'com.newrelic.rackspace.lb_overview'
        agent_human_labels('Rackspace LB'){ 'Rackspace Load Balancers' }

        STATS = [
          {:key => 'incoming', :ref => 'incomingTransfer', :unit => 'bytes'},
          {:key => 'incoming_ssl', :ref => 'incomingTransferSsl', :unit => 'bytes'},
          {:key => 'outgoing', :ref => 'outgoingTransfer', :unit => 'bytes'},
          {:key => 'outgoing_ssl', :ref => 'outgoingTransferSsl', :unit => 'bytes'}
        ]

        def poll_cycle
          log_errors do
            fog(:loadbalancers).load_balancers.each do |lb|
              state = lb.state
              log.debug "Current state of #{lb.name}: #{state}"

              report_metric('active', 'percent', state == 'ACTIVE' ? 100.0 : 0.0, :name => lb.name)

              log.debug "Fetching stats information for load balancer: #{lb.name}"
              # TODO/NOTE: We can only use time block queries via fog.
              # Update to use /current once implemented
              usage = lb.usage(
                :start_time => (Time.now - 3600).strftime('%Y-%m-%d'),
                :end_time => (Time.now + 86400).strftime('%Y-%m-%d')
              )
              log.debug usage.inspect
              stats = usage['loadBalancerUsageRecords'].last
              log.debug "Fetched stat: #{stats.inspect}"
              if(stats)
                STATS.each do |get_stat|
                  report_metric get_stat[:key], get_stat[:unit], stats[get_stat[:ref]], :name => lb.name
                end
              else
                log.info 'Empty usage record returned. Skipping send until valid result received.'
              end
            end
          end
        end
      end
    end
  end
end

NewRelic::Plugin::Setup.install_agent :rackspace_lb, NewRelicRackspacePlugin::PluginAgent::Lb
