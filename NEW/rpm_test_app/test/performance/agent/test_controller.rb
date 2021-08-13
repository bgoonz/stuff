
# controller action

class TestController < ActionController::Base
  include Benchmark

  def benchmark_action
end

  def params
    {}
  end
  
  def perform_action_without_newrelic_trace
  end
end


action_time = TestController.new.benchmark(:perform_action_with_newrelic_trace)

puts "Controller Action (no view): #{action_time.round(2)} usec per invocation"


