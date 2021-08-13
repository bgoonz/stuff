require 'rspec/core/rake_task'
require 'rake/extensiontask'
require 'rake/clean'

CLEAN.include 'tmp', 'lib', 'Makefile', 'mkmf.log'

Rake::ExtensionTask.new('xmlsec')

task :default => :spec

desc "Run specs"
RSpec::Core::RakeTask.new(:spec => :compile) do |t|
	t.rspec_opts = ["-c", "-f documentation"]
	t.pattern = 'spec/**/*_spec.rb'
end

