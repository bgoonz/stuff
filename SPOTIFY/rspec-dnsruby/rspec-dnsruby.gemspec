Gem::Specification.new do |s|
  s.version       = '0.1.1'
  s.name          = 'rspec-dnsruby'
  s.authors       = ['Alexey Lapitsky', 'Johannes Russek']
  s.email         = 'alexey@spotify.com'
  s.description   = 'Easily test your DNS entries with RSpec'
  s.summary       = 'rspec-dnsruby provides an easy-to-use DSL for testing your DNS records are responding as they should.'
  s.homepage      = 'https://github.com/spotify/rspec-dnsruby'
  s.license       = 'Apache 2.0'

  s.files         = `git ls-files`.split($\)
  s.executables   = s.files.grep(%r{^bin/}).map{ |f| File.basename(f) }
  s.test_files    = s.files.grep(%r{^(test|spec|features)/})
  s.require_paths = ['lib']

  s.add_dependency 'dnsruby'
  s.add_dependency 'activesupport'
  s.add_dependency 'rspec', '>= 2.9'
end
