# frozen_string_literal: true
module SSF
  class LoggingClient < SSF::BaseClient
    def connect_to_socket(host, port)
      nil
    end

    def send_to_socket(span)
      puts("would have sent #{span}")
      true
    end
  end
end
