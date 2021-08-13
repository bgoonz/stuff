module Helios
  class Listener
    def initialize(aws = nil)
      @aws ||= (aws || AWS::SQS.new)
    end

    def listen!
      Logger.instance.info "Beginning polling..."
      @aws.queues.named('helios').poll do |message|
        effect_start = Time.now
        effect_thread = Thread.new do
          begin
            Logger.instance.info "Received message:"
            Logger.instance.info "\t#{message.body}"
            message = JSON.parse(message.body)
            Dispatcher.new(message).dispatch!
          rescue Exception => ex
            Logger.instance.error "ERROR: #{ex.message}"
            Logger.instance.error ex.backtrace.join("\n")
          end
        end

        loop do
          break unless effect_thread.alive?
          sleep 0.001
          if Time.now > (effect_start + 15)
            effect_thread.kill
            Logger.instance.warn "killed long-running thread"
          end
        end
      end
    end
  end
end
