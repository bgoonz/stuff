


class TestClass
  include Benchmark
  
  def benchmark_method
  end
  add_method_tracer :benchmark_method, 'Controller/TestMetric', :push_scope => false
end

puts "Tracer, false scope push: #{TestClass.new.benchmark(:benchmark_method).round(2)} usec per invocation"
