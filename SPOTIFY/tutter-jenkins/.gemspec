# -*- encoding: utf-8 -*-
Gem::Specification.new do |s|
  s.name        = 'tutter-jenkins'
  s.version     = '0.0.5'
  s.author      = 'Alexey Lapitsky'
  s.email       = ['alexey@spotify.com']
  s.homepage    = 'https://github.com/spotify/tutter-jenkins'
  s.summary     = 'Merges pull requests if tests PASS'
  s.description = 'This tutter action let non collaborators review and merge code without having more then read access to the project'
  s.license     = 'Apache 2.0'

  s.files         = `git ls-files`.split("\n")
  s.require_paths = ['lib']

  s.required_ruby_version = '>= 1.8.7'
end
