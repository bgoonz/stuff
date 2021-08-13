# Type rbenv::user
#
# Install rbenv and optionally complile a ruby version with it.
#
# Parameters:
# - *foruser*: the user who is going to install rbenv, defaults to $title
# - *group*: the group of the user installing rbenv, defaults to $title
# - *home_dir*: the home directory of the user, defaults to /home/$title
# - *compile*: whether or not a ruby version will be compiled
# - *version*: the ruby version which is going to be compiled and
#   installed. It is optional.
#
# Requires:
# - a compiled-in rbenv environment for the user.
#
# Sample Usage:
#
#   rbenv::user {
#     "www-data":
#       group => 'www-data',
#       home_dir => '/home/www-data',
#       compile => true
#       version => '1.9.3-p194';
#   }
define rbenv::user( $foruser=$title, $group=$title, $home_dir="/home/${title}", $compile=true, $version='1.9.3-p194' ) {

  include rbenv::dependencies

  rbenv::install { "rbenv::install::${foruser}::${version}":
    user      => $foruser,
    group     => $group,
    home_dir  => $home_dir,
  }

  if $compile {
    rbenv::compile { "rbenv::compile::${foruser}::${version}":
      user         => $foruser,
      group        => $group,
      home_dir     => $home_dir,
      ruby_version => $version,
    }
  }

}
