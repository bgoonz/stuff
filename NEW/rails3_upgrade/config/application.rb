# Put this in config/application.rb
require_relative "boot"

class ApplicationConfig
  class << self
    def rails3_config(config)
      # until we no longer support Rails 2.3, reporting deprecations is
      # useless.
      ActiveSupport::Deprecation.silenced = true
      common_config(config)
    end

    def rails2_config
      common_config(config)
    end

    def is_rails3?
      Rails::VERSION::MAJOR >= 3
    end

    private

    def common_config(config)
    end
  end
end

is_rails3 = ENV.include?("USE_RAILS_3")

if is_rails3
  require 'rails/all'
  Bundler.require(:default, Rails.env) if defined?(Bundler)

  module YourAppModule
    class Application < Rails::Application
      ::ApplicationConfig.rails3_config(config)
    end
  end
else
  Rails::Initializer.run do |config|
    ::ApplicationConfig.rails2_config(config)
  end
end
