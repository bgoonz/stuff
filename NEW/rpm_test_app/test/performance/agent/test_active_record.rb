


module ActiveRecord
  module ConnectionAdapters
    class Result
      def each
      end
    
      def all_hashes
        ["test"]
      end
      
      def free
      end
    end
    class AbstractAdapter
      def log(*args)
        @@empty_result ||= Result.new
      end
    end
  end
end


class MyModel < ActiveRecord::Base
  class << self    
    include Benchmark
  end
end

NewRelic::Config.instance.set_config('skip_ar_instrumentation', false)


puts "AR find no instrumentation: #{MyModel.benchmark(:find, :all).round(2)} usec per invocation"


#require File.dirname(__FILE__) + "/../../../vendor/plugins/newrelic_rpm/lib/newrelic/agent/instrumentation/active_record"



#module ActiveRecord
#  module ConnectionAdapters
#    class AbstractAdapter
#      def log_without_newrelic_instrumentation(*args)
#        @@empty_result ||= Result.new
#      end
#    end
#  end
#end

require File.dirname(__FILE__) + "/../../../vendor/plugins/newrelic_rpm/lib/new_relic/agent/instrumentation/active_record_instrumentation"


puts "AR find WITH instrumentation: #{MyModel.benchmark(:find, :all).round(2)} usec per invocation"

