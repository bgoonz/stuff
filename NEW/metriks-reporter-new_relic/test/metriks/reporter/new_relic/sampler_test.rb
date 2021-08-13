require 'test_helper'
require 'metriks/reporter/new_relic/sampler'

class Metriks::Reporter::NewRelic::SamplerTest < Test::Unit::TestCase
  def setup
    @registry = Metriks::Registry.new
    @sampler = Metriks::Reporter::NewRelic::Sampler.new(:registry => @registry)
  end

  def test_harvests_guage_values_from_registry
    @registry.gauge('queue.size').set(666)
    @sampler.poll
    assert_equal(666, NewRelic::Agent.instance.stats_engine \
                   .lookup_stats('Custom/queue/size').total_call_time)
  end if Metriks.respond_to?(:gauge)

  def test_harvests_timer_data
    @registry.timer('queue.time').update(2)
    @registry.timer('queue.time').update(4)
    @registry.timer('queue.time').update(6)

    @sampler.poll

    stats = NewRelic::Agent.instance.stats_engine \
      .lookup_stats('Custom/queue/time')
    assert_equal(3, stats.call_count)
    assert_equal(4, stats.total_call_time)
    assert_equal(2, stats.min_call_time)
    assert_equal(6, stats.max_call_time)
  end

  def test_harvests_counter_data_incrementally
    @registry.counter('queue.push').increment

    @sampler.poll

    @registry.counter('queue.push').increment
    @registry.counter('queue.push').increment
    
    @sampler.poll

    stats = NewRelic::Agent.instance.stats_engine \
      .lookup_stats('Custom/queue/push')
    assert_equal 3, stats.call_count # 3 not 4, don't recount the first
    assert_equal 0, stats.total_call_time
  end
end
