# == Class: nagios::resource_cfg
#
# === Parameters
#
# [*resource_user*] - Hash containing the $USERxx$ values that should be written out
# [*resource_file*] - Path to the resource.cfg file
#
# === Examples
#
# class { 'nagios::resource_cfg':
#   resource_user => { 'USER1' => 'something', 'USER32' => 'something_else' }
# }
# === Authors
#
# === Copyright
#
# Copyright 2013 New Relic, Inc. All rights reserved.
#
class nagios::resource_cfg(
  $resource_user = { },
  $resource_file = $nagios::params::resource_file,
) inherits nagios::params {

  # This template uses: $resource_user
  file { $resource_file:
    ensure  => file,
    mode    => '0660',
    owner   => 'root',
    group   => 'wheel',
    content => template("${module_name}/resource.cfg.erb"),
  }
}

