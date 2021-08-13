require 'rake/testtask'

task :default => :test

Rake::TestTask.new do |t|
  t.libs.push 'spec'
  t.libs.push 'vendor/rdmx'
  t.test_files = FileList['spec/**/*_spec.rb']
  t.verbose = true
end
