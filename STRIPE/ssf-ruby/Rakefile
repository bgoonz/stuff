require 'bundler/gem_tasks'
require 'bundler/setup'
require 'rake/testtask'

task :default => [:test]


Rake::TestTask.new do |t|
  t.pattern = './test/**/*_test.rb'
  t.verbose = true
end

