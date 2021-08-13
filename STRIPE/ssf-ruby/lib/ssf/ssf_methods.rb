# frozen_string_literal: true
require 'socket'

module Ssf
  class SSFSpan
    attr_accessor :client

    def finish(time: nil)
      unless time
        time = Process.clock_gettime(Process::CLOCK_REALTIME) * 1_000_000_000
      end
      self.end_timestamp = time.to_i

      if name.nil? || name == ''
        self.name = caller_locations(1, 1)[0].label
      end

      @client.send_to_socket(self)
    end

    def child_span(name: '', tags: {})
      puts "WARN: this method is deprecated."
      span_id = SecureRandom.random_number(2**32 - 1)
      trace_id = self.trace_id
      start = Time.now.to_f * 1_000_000_000
      service = self.service
      name = name
      new_tags = {}
      self.tags.each do |key, value|
        if key != 'name'
          new_tags[key] = value
        end
      end

      new_tags = Ssf::SSFSpan.clean_tags(tags.merge(new_tags))

      parent = self.id

      span = Ssf::SSFSpan.new({
        id: span_id,
        trace_id: trace_id,
        start_timestamp: start,
        service: service,
        name: name,
        tags: new_tags,
        parent_id: parent
      })
      span.client = self.client
      span
    end

    def set_tag(name, value)
      if name.nil?
        return
      end
      self.tags[Ssf::SSFSpan.clean_string(name)] = Ssf::SSFSpan.clean_string(value)
    end

    def set_tags(tags)
      if tags.is_a?(Hash)
        tags.map do |k, v|
          self.set_tag(k, v)
        end
      end
    end

    def self.clean_tags(tags)
      tmp = {}
      tags.each do |k, v|
        tmp[clean_string(k)] = clean_string(v) unless v.nil?
      end
      tmp
    end

    def self.clean_string(str)
      str = str.to_s unless str.is_a?(String)
      if str.encoding != Encoding::UTF_8 || !str.valid_encoding?
        # assigning a non-utf8 string to a protobuf field will throw an exception
        str.to_s.encode(Encoding::UTF_8, invalid: :replace, undef: :replace)
      else
        str
      end
    end
  end
end
