
class TestClass
  include Benchmark
  
  def benchmark_method
  end
end


puts "Baseline time: #{TestClass.new.benchmark(:benchmark_method).round(2)} usec per invocation"
