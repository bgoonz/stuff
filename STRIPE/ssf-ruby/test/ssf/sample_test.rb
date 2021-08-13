require 'mocha/mini_test'
require 'minitest/autorun'
require 'ssf'
require 'securerandom'

module SSFTest
  class FailingClient < SSF::BaseClient
    def connect_to_socket(host, port)
      nil
    end

    def send_to_socket(span)
      false
    end
  end

  class SSFClientTest < Minitest::Test
    def test_create_ssf
      s = Ssf::SSFSpan.new({
        id: 123456,
      })
      assert(s.id == 123456, "id doesn't match")
    end

    def test_encode_ssf
      s = Ssf::SSFSpan.new({
        id: 123456,
      })

      message = Ssf::SSFSpan.encode(s)

      s2 = Ssf::SSFSpan.decode(message)

      assert(s.id == s2.id)
    end

    def test_set_tag
      s = Ssf::SSFSpan.new({
        id: 123456,
      })
      s.set_tag('foo', 'bar')
      assert_equal(s.tags['foo'], 'bar')
    end

    def test_set_tags
      s = Ssf::SSFSpan.new({
        id: 123456,
      })
      s.set_tag('foo', 'bar')

      s.set_tags({
        'foo' => 'gorch',
        'fart' => 'eww',
      })
      assert_equal(s.tags['foo'], 'gorch')
      assert_equal(s.tags['fart'], 'eww')
    end

    def test_set_tags_with_symbols
      s = Ssf::SSFSpan.new({
        id: 123456,
      })
      # Make sure we stringify everything. If anything raises, we'll fail
      s.set_tag(:foo, 'bar')
      assert_equal(s.tags['foo'], 'bar')
      s.set_tag('foo', :bar)
      assert_equal(s.tags['foo'], 'bar')
      s.set_tags({ foo: 'bar' })
      assert_equal(s.tags['foo'], 'bar')
      s.set_tags({ 'foo' => :bar })
      assert_equal(s.tags['foo'], 'bar')
    end

    def test_set_tag_with_nils
      s = Ssf::SSFSpan.new({
        id: 123456,
      })
      # We need to ensure that if someone accidentally passes a nill we
      # don't blow up! Raising will fail.
      s.set_tag(nil, nil)
      s.set_tags(nil)
    end

    def test_set_tag_with_encoding
      c = SSF::BaseClient.new(host: '127.0.01', port: '8128')
      span = c.start_span(name: 'run test', service: 'test-srv', tags: {'hi' => "\xAD"})
      span.set_tag('there', "\xAD")
      span.child_span(name: 'hi this is dog', tags: {'this_is_dog' => "\xAD"})
    end

    def test_failing_client
      c = FailingClient.new(host: '127.0.01', port: '8128')
      span = c.start_span(name: 'run test', service: 'test-srv')
      result = span.finish

      refute(result, "Failing client didn't fail")
    end

    def test_failing_udp_client
      UDPSocket.any_instance.stubs(:send).raises(StandardError.new("explosion"))

      c = SSF::BaseClient.new(host: '127.0.01', port: '8128')
      span = c.start_span(name: 'run test', service: 'test-srv')
      result = span.finish

      refute(result, "Failing client didn't fail")
    end

    def test_local_buffer_send
      s = Ssf::SSFSpan.new({
        id: 123456,
      })

      c = SSF::LocalBufferingClient.new
      result = c.send_to_socket(s)
      assert(result, "Local client didn't return true")

      assert_equal(1, c.buffer.length, 'Expected to find one span in client')
      assert_equal(123456, c.buffer[0].id)
      c.reset
      assert_equal(0, c.buffer.length, 'Expected buffer to be cleared')
    end

    def test_client_send
      s = Ssf::SSFSpan.new({
        id: 123456,
      })

      c = SSF::LoggingClient.new(host: '127.0.01', port: '8128')
      result = c.send_to_socket(s)
      assert(result, "Logging client didn't return true")
    end

    def test_full_client_send
      c = SSF::LoggingClient.new(host: '127.0.01', port: '8128')
      span = c.start_span(name: 'run test', service: 'test-srv')
      result = span.finish
      assert(result, "Logging client didn't return true")

      assert(span.end_timestamp > span.start_timestamp)
      assert_equal('test_full_client_send', name)
      assert_equal('test-srv', span.service)
    end

    def test_child_span
      c = SSF::LoggingClient.new(host: '127.0.0.1', port: '8128')
      span = c.start_span(name: 'op1', tags: {'tag1' => 'value1'}, service: 'test-srv')

      child1 = c.start_span(name: 'op2', tags: {'tag2' => 'value2'}, parent: span, service: 'test-srv')

      child1.finish
      span.finish

      span.tags.each do |key, value|
        if key != 'name'
          assert(child1.tags[key], "expected to find non-nil value for #{key}")
        end
      end

      assert(child1.parent_id == span.id)
      assert(child1.trace_id == span.trace_id)
    end

    def test_from_context
      c = SSF::LoggingClient.new(host: '127.0.0.1', port: '8128')
      span = c.start_span_from_context(name: 'op1',
                                tags: { 'tag1' => 'value1' },
                                trace_id: 5,
                                parent_id: 10,
                                service: 'test-srv')

      assert(span.trace_id == 5)
      assert(span.parent_id == 10)
    end


    def test_start_span_context_tags_nonstrings
      # we should be able to handle passing in keys and values for
      # 'tags' that are not strings without throwing an exception
      c = SSF::LoggingClient.new(host: '127.0.0.1', port: '8128')

      tags = {
        :foo => :bar,
        'something' => nil,
        'a_number' => 5,
      }

      span = c.start_span(name: 'op1', tags: tags, service: 'test-srv')
      assert_equal('bar', span.tags['foo'])
      assert_equal(nil, span.tags['something'])
      assert_equal('5', span.tags['a_number'])
    end

    def test_child_span_tags_nonstrings
      # we should be able to handle passing in keys and values for
      # 'tags' that are not strings without throwing an exception
      c = SSF::LoggingClient.new(host: '127.0.0.1', port: '8128')

      tags = {
        :foo => :bar,
        'something' => nil,
        'a_number' => 5,
      }

      span = c.start_span(name: 'op1', tags: tags, service: 'test-srv')
      span = c.start_span(name: 'op2', tags: tags, parent: span, service: 'test-srv')

      assert_equal("bar", span.tags["foo"])
      assert_equal(nil, span.tags["something"])
      assert_equal("5", span.tags["a_number"])
    end

    def test_indicator_span
      c = SSF::LoggingClient.new(host: '127.0.0.1', port: '8128')

      indicator_span = c.start_span(name: 'op1', indicator: true, service: 'test-srv')
      not_indicator_span = c.start_span(name: 'op2', indicator: false, service: 'test-srv')
      default_span = c.start_span(name: 'op3', service: 'test-srv')
      assert_equal(true, indicator_span.indicator)
      assert_equal(false, not_indicator_span.indicator)
      assert_equal(false, default_span.indicator)
    end

    def test_client_span
      c = SSF::Client.new(host: '127.0.0.1', port: '8128', service: 'test-srv')

      span = c.start_span(name: 'op1')
      assert_equal('test-srv', span.service)
    end

    def test_client_span_context
      c = SSF::Client.new(host: '127.0.0.1', port: '8128', service: 'test-srv')

      span = c.start_span_from_context(name: 'op1', trace_id: 5, parent_id: 10)
      assert_equal(5, span.trace_id)
      assert_equal(10, span.parent_id)
      assert_equal('test-srv', span.service)
    end
  end
end
