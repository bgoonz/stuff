

TIMES = 50000


module Benchmark
  def benchmark(method,*args)
    t0 = Time.now
    
    TIMES.times do
      send method, *args
    end
    
    t1 = Time.now
    
    return ((t1-t0)*1000000)/TIMES
  end
end
