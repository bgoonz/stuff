# coding: utf-8
lib = File.expand_path('../lib', __FILE__)
$LOAD_PATH.unshift(lib) unless $LOAD_PATH.include?(lib)
require 'time/utils/version'

Gem::Specification.new do |spec|
  spec.name          = "time-utils"
  spec.version       = Time::Utils::VERSION
  spec.authors       = ["Alex MacCaw"]
  spec.email         = ["alex@stripe.com"]
  spec.description   = %q{Some useful time utilities}
  spec.summary       = %q{Some useful time utilities}
  spec.homepage      = "http://github.com/stripe/time-utils"
  spec.license       = "MIT"

  spec.files         = `git ls-files`.split($/)
  spec.executables   = spec.files.grep(%r{^bin/}) { |f| File.basename(f) }
  spec.test_files    = spec.files.grep(%r{^(test|spec|features)/})
  spec.require_paths = ["lib"]

  spec.add_development_dependency "bundler", "~> 1.3"
  spec.add_development_dependency "rake"
end
