# == Class: redis
#
# Full description of class redis here.
#
# === Parameters
#
# [*version*] - Version string to enforce
#
# === Examples
#
#  class { redis:
#    package_version => '2.6.4'
#  }
#
# === Authors
#
# Jonathan Thurman <jthurman@newrelic.com>
#
class redis (
  $version = 'present'
) inherits redis::params {

  package { $redis::params::package:
    ensure => $version,
  }

  file { $redis::params::conf_dir:
    ensure => 'directory',
    owner  => 'root',
    group  => 'root',
    mode   => '0755',
  }

  # Base configuration file (Global items)
  file { $redis::params::conf_file:
    ensure  => 'present',
    owner   => $redis::params::user,
    group   => $redis::params::group,
    mode    => '0640',
    content => template('redis/redis.conf.erb'),
    require => [Package[$redis::params::package], File[$redis::params::conf_dir]],
  }

  # Directory for server log files
  file { $redis::params::log_dir:
    ensure  => 'directory',
    owner   => $redis::params::user,
    group   => $redis::params::group,
    mode    => '0755',
    require => Package[$redis::params::package],
  }

  # Directory for server pids
  file { $redis::params::pid_dir:
    ensure  => 'directory',
    owner   => $redis::params::user,
    group   => $redis::params::group,
    mode    => '0755',
    require => Package[$redis::params::package],
  }

  # Directory for unix socket files
  file { $redis::params::unixsocket_dir:
    ensure  => 'directory',
    owner   => $redis::params::user,
    group   => $redis::params::group,
    mode    => '0755',
    require => File[$redis::params::pid_dir],
  }

  # Directory for data (Default)
  file { $redis::params::data_dir:
    ensure  => 'directory',
    owner   => $redis::params::user,
    group   => $redis::params::group,
    mode    => '0755',
    require => Package[$redis::params::package],
  }
}
