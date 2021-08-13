spec = Gem::Specification.new do |s|
  s.name = 'ssf'
  s.version = '0.0.19'
  s.required_ruby_version = '>= 1.9.3'
  s.summary = 'Ruby client for the Sensor Sensibility Format'
  s.description = 'Ruby client for the Sensor Sensibility Format'
  s.author = 'Stripe'
  s.email = 'support@stripe.com'
  s.homepage = 'https://veneur.org/'
  s.license = 'MIT'

  s.files = `git ls-files`.split("\n")
  s.test_files    = `git ls-files -- test/*`.split("\n")
  s.executables   = `git ls-files -- bin/*`.split("\n").map{ |f| File.basename(f) }
  s.require_paths = ['lib']
  s.add_runtime_dependency 'google-protobuf', ['~> 3.3']
  s.add_development_dependency 'minitest', ['= 5.8.4']
  s.add_development_dependency 'rake', '= 12.3.3'
  s.add_development_dependency 'mocha', ['= 1.1.0']
end
