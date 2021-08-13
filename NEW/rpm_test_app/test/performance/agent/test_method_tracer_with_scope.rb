


class TestClass
  include Benchmark
  def benchmark_method
 end

  def benchmark_method_scope
    benchmark(:benchmark_method).round(2)
  end
  
  add_method_tracer :benchmark_method, 'Controller/TestMetric2', :push_scope => true
  add_method_tracer :benchmark_method_scope, 'Controller/TestMetric3', :push_scope => true
end

puts "Tracer, true scope push (already in scope): #{TestClass.new.benchmark_method_scope} usec per invocation"

puts "Tracer, true scope push (no scope): #{TestClass.new.benchmark(:benchmark_method).round(2)} usec per invocation"
