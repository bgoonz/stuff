require 'test_helper'
require 'metriks/reporter/new_relic'

class Metriks::Reporter::NewRelicTest < Test::Unit::TestCase
  def test_start_adds_sampler_to_agent
    ::NewRelic::Agent.manual_start
    Metriks::Reporter::NewRelic.start
    assert(::NewRelic::Agent.instance.stats_engine.send(:harvest_samplers) \
             .map{|s| s.class}.include?(Metriks::Reporter::NewRelic::Sampler))
  end

  def _test_stop_removes_sampler_from_agent
  end
end
