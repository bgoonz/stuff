# Type rbenv::gem
#
# Install a gem under rbenv for a certain user's ruby version.
#
# Parameters:
# - *title*: ignored, just make sure it's unique
# - *foruser*: the user who is going to install the gem.
# - *gemversion*: the version of the gem you want. Passed literally to gem
#                 --version='', so you can use picky specifiers (=, ~>, etc.)
# - *rubyversion*: the version of ruby you'd like the gem installed to
# - *version*: the global ruby version which is going to be compiled and
#              installed. It is optional.
#
# Requires:
# - a compiled-in rbenv environment for the user.
#
# Sample Usage:
#
#   rbenv::gem {
#     "bundler_for_www-data":
#       gemname => 'bundler',
#       gemversion => '~>1.1',
#       foruser => 'www-data,
#       rubyversion => '1.9.3-p194';
#   }
define rbenv::gem($gemname, $foruser, $rubyversion, $gemversion) {
  $ruby_version_assert = "[ -f /home/$foruser/.rbenv/versions/$rubyversion/bin/gem ]"
  $exec_path = [ "/home/$foruser/.rbenv/shims", "/home/$foruser/.rbenv/bin", '/usr/bin', '/bin']
 
  exec {
    "install rbenv gem $gemname $gemversion in ruby $rubyversion for $foruser":
      environment => ["RBENV_VERSION=$rubyversion", "USER=$foruser", "LOGNAME=$foruser", "HOME=/home/$foruser"],
      command     => "gem install $gemname --no-ri --no-rdoc --version='$gemversion'",
      path        => $exec_path,
      user        => $foruser,
      onlyif      => $ruby_version_assert,
      unless      => "gem list -i -v'$gemversion' $gemname",
      require     => Rbenv::Compile["rbenv::compile::$foruser::$rubyversion"],
      logoutput   => "on_failure";
  }
}
