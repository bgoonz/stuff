# == Class: nagios::packages
#
# === Parameters
#
# === Examples
#
# === Authors
#
# === Copyright
#
# Copyright 2013 New Relic, Inc. All rights reserved.
#
class nagios::packages (
  $packages_core    = $nagios::params::packages_core,
  $packages_plugins = $nagios::params::packages_plugins,
  $dependencies     = $nagios::params::package_dependencies,
  $link_lib64       = $nagios::params::link_lib64,
  $purge_objects    = $nagios::params::purge_default_objects,
  $base_dir         = $nagios::params::base_dir,
) inherits nagios::params {

  package { $dependencies:
    ensure  => installed,
  }

  package { $packages_core:
    ensure  => installed,
    require => Package[$dependencies],
  }

  package { $packages_plugins:
    ensure  => installed,
    require => [Package[$dependencies], Package[$packages_core]],
  }

  if ($purge_objects) {
    file { "${base_dir}/objects/":
      ensure  => absent,
      force   => true,
      require => Package[$packages_core],
    }
  }

  if ($link_lib64) {
    # link lib64 plugins to lib so the pathing works right
    file { '/usr/lib/nagios/':
      ensure  => link,
      target  => '/usr/lib64/nagios/',
      require => Package[$packages_plugins],
    }
  }

}

