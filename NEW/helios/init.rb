require 'bundler'
Bundler.setup

$LOAD_PATH.concat([
  File.expand_path('../lib', __FILE__),
  File.expand_path('../vendor/rdmx', __FILE__)
])


require 'helios'
require 'helios/static_color_effect'
Dir['./lib/helios/*effect.rb'].each do |file|
  require file.sub(/\.rb/, '')
end
require 'aws-sdk'
