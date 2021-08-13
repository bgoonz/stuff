# == Class: redis::params
#
# Set parameters for configuring redis
#
# === Examples
#
#  class { 'redis::params': }
#
# === Authors
#
# Jonathan Thurman <jthurman@newrelic.com>
#
class redis::params {
  # Generic settings
  $nagios_check_timeout       = 5   # Seconds
  $nagios_service_description = 'redis'
  $nagios_servicegroups       = 'redis'
  $nagios_use                 = 'critical-service'
  $nagios_mem_warn_percent    = 75
  $nagios_mem_crit_percent    = 90

  # OS Specific
  case $::osfamily {
    redhat: {
      $package        = 'redis'
      $service        = 'redis'
      $user           = 'redis'
      $group          = 'redis'
      $conf_dir       = '/etc/redis.d'
      $conf_file      = '/etc/redis.conf'
      $unixsocket_dir = '/var/run/redis/sock'
      $log_dir        = '/var/log/redis'
      $data_dir       = '/var/lib/redis'
      $pid_dir        = '/var/run/redis'
      $init_dir       = '/etc/init.d'
    }
    default: {
      fail("Unsupported platform: ${::osfamily}")
    }
  }
}
