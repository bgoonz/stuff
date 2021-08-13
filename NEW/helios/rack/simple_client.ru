require File.expand_path('../../lib/helios/version', __FILE__)
require File.expand_path('../../lib/helios/rack/simple_client_service', __FILE__)

run Helios::Rack::SimpleClientService
