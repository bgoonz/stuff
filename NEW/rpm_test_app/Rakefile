# Add your own tasks in files placed in lib/tasks ending in .rake,
# for example lib/tasks/capistrano.rake, and they will automatically be available to Rake.

require(File.join(File.dirname(__FILE__), 'config', 'boot'))

require 'rake'
require 'rake/testtask'
require 'rake/rdoctask'
Dir["#{File.dirname(__FILE__)}/vendor/gems/**/tasks/**/*.rake"].sort.each { |ext| load ext }
if ENV['RAILS_ENV'] == 'test'
  require 'rubygems'
  # Load the CI gem if available
  begin
    gem 'ci_reporter'
    require 'ci/reporter/rake/test_unit'
    require 'ci/reporter/rake/rspec'
  rescue Exception => e
  end
end
require 'tasks/rails'
