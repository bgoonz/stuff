module Thin
  module Backends
    # Backend to act as a TCP server using an already opened file
    # descriptor. Currently requires a patched EventMachine (see
    # https://github.com/stripe/eventmachine).
    class ReusedTcpServer < Base
      def initialize(descriptor)
        @descriptor = descriptor
        super()
      end

      def connect
        @signature = EventMachine.start_server(@descriptor, nil, Connection, &method(:initialize_connection))
      end

      def disconnect
        EventMachine.stop_server(@signature)
      end

      def to_s
        "socket:#{@descriptor}"
      end
    end
  end
end
