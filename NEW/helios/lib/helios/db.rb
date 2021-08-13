require 'redis'
require 'singleton'

module Helios
  class DB
    include Singleton

    def set(key, value)
      db.set(key, value)
    end

    def get(key)
      db.get(key)
    end

    private
    def db
      @db ||= Redis.new(host: (ENV['REDIS_HOST'] || '127.0.0.1'))
    end
  end
end
