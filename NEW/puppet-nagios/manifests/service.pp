# == Class: nagios::service
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
class nagios::service (
  $service_enable     = $nagios::params::service_enable,
  $service_ensure     = $nagios::params::service_ensure,
  $service_hasrestart = $nagios::params::service_hasrestart,
  $service_hasstatus  = $nagios::params::service_hasstatus,
) inherits nagios::params {

  service { 'nagios':
    ensure     => $service_ensure,
    enable     => $service_enable,
    hasrestart => $service_hasrestart,
    hasstatus  => $service_hasstatus,
    require    => Class['nagios::packages'],
  }

}

