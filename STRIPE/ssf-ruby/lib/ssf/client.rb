# frozen_string_literal: true
require 'socket'

module SSF
  class Client
    attr_reader :base_client
    attr_reader :service

    def initialize(host: nil, port: nil, max_buffer_size: nil, service:)
      @base_client = SSF::BaseClient.new(
        host: host,
        port: port,
        max_buffer_size: max_buffer_size
      )
      @service = service
    end

    def start_span(name: '', tags: {}, parent: nil, indicator: false)
      base_client.start_span(
        name: name,
        tags: tags,
        parent: parent,
        indicator: indicator,
        service: service
      )
    end

    def start_span_from_context(name: '', tags: {}, trace_id: nil, parent_id: nil, indicator: false, clean_tags: true)
      base_client.start_span_from_context(
        name: name,
        tags: tags,
        trace_id: trace_id,
        parent_id: parent_id,
        indicator: indicator,
        clean_tags: clean_tags,
        service: service 
      )
    end
  end
end
