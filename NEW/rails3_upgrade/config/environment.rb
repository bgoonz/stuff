# Put this in config/environment.rb

# Load the rails application
require_relative "application"

if ApplicationConfig.is_rails3?
  # Initialize the rails application
  YourAppModule::Application.initialize!
end
