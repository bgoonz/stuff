# an example of how to write an environment-specific config
# that works in Rails 2 & Rails 3

config_block = proc do
  config.cache_classes = false

  # ....
end

if ApplicationConfig.is_rails3?
    YourAppModule::Application.configure(&config_block)
else
  config_block.call
end
