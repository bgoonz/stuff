# Put this in lib/bundler/lockfile_dsl.rb and then require it:
# require File.expand_path("../lib/bundler/lockfile_dsl.rb", __FILE__)
# 
# To use it, call lockfile in your Gemfile:
# lockfile "Gemfile_rails3.lock" if ENV["USE_RAILS_3"]

class Bundler::Dsl
  def lockfile(lockfile_name)
    Bundler::SharedHelpers.custom_lockfile = lockfile_name
  end

  # We alias to_definition to allow us to overwrite the lockfile
  alias_method :to_definition_without_custom_lockfile, :to_definition
  def to_definition(old_lockfile, unlock)
    to_definition_without_custom_lockfile(Bundler::SharedHelpers.default_lockfile, unlock)
  end
end

module Bundler::SharedHelpers
  attr_accessor :custom_lockfile

  # Secondly, we need to monkey-patch the global default_lockfile definiton, in Bundler::SharedHelpers.
  def default_lockfile
    if custom_lockfile
      Pathname.new(File.join(default_gemfile.dirname, custom_lockfile))
    else
      Pathname.new("#{default_gemfile}.lock")
    end
  end
end
