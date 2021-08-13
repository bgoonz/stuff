#!/usr/bin/env ruby
require File.dirname(__FILE__) + "/../../../config/environment"
require File.dirname(__FILE__) + '/base_benchmark.rb'

::RPM_DEVELOPER = false
NewRelic::Agent.instance.start :test, :test



# RUN from the rpm directory with ruby test/performance/agent/agent_microbenchmark.rb

# This script must be run from the RPM home directory
# ruby test/performance/agent/agent_microbenchmark.rb


# IDEAS
# use a Symbol for metric names rather than String - may be faster to compare


require File.dirname(__FILE__) + '/test_baseline'

require File.dirname(__FILE__) + '/test_method_tracer_no_scope'
require File.dirname(__FILE__) + '/test_method_tracer_with_scope'

require File.dirname(__FILE__) + '/test_dispatcher'
require File.dirname(__FILE__) + '/test_controller'
require File.dirname(__FILE__) + '/test_active_record'
