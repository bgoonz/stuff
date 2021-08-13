module Helios
  class Logger
    def self.instance
      @logger ||= if ENV['HELIOS_PRODUCTION']
                    ::Logger::Syslog.new('helios', Syslog::LOG_LOCAL7)
                  else
                    ::Logger.new(STDOUT)
                  end
    end
  end
end
