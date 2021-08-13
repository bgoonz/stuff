require 'puppet-lint'

namespace :test do

  namespace :puppet do
    task :syntax do
      files = Dir['manifests/**/*.pp']
      files.each do |file|
        $stdout.write "Syntax checking #{file}... "
        $stdout.flush
        output = `bundle exec puppet parser validate #{file} 2>&1`
        if $?.success?
          puts "OK"
        else
          puts "failed"
          puts "---"
          puts output
          fail
        end
      end
    end

    task :lint do
      linter =  PuppetLint.new
      Dir.glob('manifests/**/*.pp').each do |puppet_file|
        puts "Evaluating #{puppet_file}"
        linter.file = puppet_file
        linter.run
      end
      fail if linter.errors? or linter.warnings?
    end
  end
  task :puppet => ['puppet:syntax', 'puppet:lint']
end

task :test => ['test:puppet']
task :default => :test
