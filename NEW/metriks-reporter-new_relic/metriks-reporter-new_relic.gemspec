# coding: utf-8
lib = File.expand_path('../lib', __FILE__)
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)
require 'metriks/reporter/new_relic/version'

Gem::Specification.new do |spec|
  spec.name          = "metriks-reporter-new_relic"
  spec.version       = Metriks::Reporter::NewRelic::VERSION
  spec.authors       = ["Jon Guymon"]
  spec.email         = ["jon@newrelic.com"]
  spec.description   = %q{Allows metric data collected by with the Metriks gem to be reported to your New Relic account via a running New Relic Ruby agent.}
  spec.summary       = %q{Metriks Reporter for New Relic.}
  spec.homepage      = "https://github.com/newrelic/metriks-reporter-new_relic"
  spec.license       = "MIT"

  spec.files         = `git ls-files`.split($/)
  spec.executables   = spec.files.grep(%r{^bin/}) { |f| File.basename(f) }
  spec.test_files    = spec.files.grep(%r{^(test|spec|features)/})
  spec.require_paths = ["lib"]

  spec.add_development_dependency "bundler", "~> 1.3"
  spec.add_development_dependency "rake"

  spec.add_dependency 'newrelic_rpm', '> 3.5.0'
  spec.add_dependency 'metriks'
end
