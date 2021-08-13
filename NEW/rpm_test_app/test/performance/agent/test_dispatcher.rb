


# dispatcher

class ActionController::Dispatcher
  class << self
  end
end

module Mongrel
  class HttpServer
  end 
end

#require File.dirname(__FILE__) + "/../../../vendor/plugins/newrelic_rpm/lib/new_relic/agent/instrumentation/dispatcher_instrumentation"
#require File.dirname(__FILE__) + "/../../../vendor/plugins/newrelic_rpm/lib/new_relic/agent/instrumentation/rails/dispatcher"


class ActionController::Dispatcher
  class << self
    include Benchmark

    def dispatch_without_newrelic(*args)
    end
  end
end




puts "Dispatcher without mongrel queue: #{ActionController::Dispatcher.benchmark(:dispatch_newrelic).round(2)} usec per invocation"

Thread.current[:started_on] = Time.now

puts "Dispatcher with mongrel queue: #{ActionController::Dispatcher.benchmark(:dispatch_newrelic).round(2)} usec per invocation"
