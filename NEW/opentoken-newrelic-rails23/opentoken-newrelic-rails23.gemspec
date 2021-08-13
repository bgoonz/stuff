# -*- encoding: utf-8 -*-
$:.push File.expand_path("../lib", __FILE__)
require "opentoken-newrelic-rails23/version"

Gem::Specification.new do |s|
  s.name        = "opentoken-newrelic-rails23"
  s.version     = OpenToken::VERSION
  s.platform    = Gem::Platform::RUBY
  s.authors     = ["Ryan Sonnek"]
  s.email       = ["ryan@socialcast.com"]
  s.homepage    = "http://github.com/newrelic/opentoken-newrelic-rails23"
  s.summary     = %q{ruby implementation of the opentoken specification, forked for Rails 2.3 compatibility. Use the non-forked version for Rails 3+}
  s.description = %q{parse opentoken properties passed for Single Signon requests}

  s.rubyforge_project = "opentoken-newrelic-rails23"

  # If you are on a newer version of Rails, you should be using the opentoken gem, not our fork.
  s.add_runtime_dependency(%q<activesupport>, ["~> 2.3.14"])
  s.add_runtime_dependency(%q<i18n>, [">= 0"])
  s.add_development_dependency(%q<shoulda>, ["2.11.3"])
  s.add_development_dependency(%q<timecop>, ["0.3.5"])
  s.add_development_dependency(%q<rake>, ["0.9.2"])

  s.files         = `git ls-files`.split("\n")
  s.test_files    = `git ls-files -- {test,spec,features}/*`.split("\n")
  s.executables   = `git ls-files -- bin/*`.split("\n").map{ |f| File.basename(f) }
  s.require_paths = ["lib"]
end
