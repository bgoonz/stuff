# frozen_string_literal: true
module SSF
  class LocalBufferingClient < BaseClient
    attr_reader :buffer

    def initialize
      @buffer = []
    end

    def send_to_socket(span)
      @buffer << span
      true
    end

    def reset
      @buffer.clear
    end
  end
end
