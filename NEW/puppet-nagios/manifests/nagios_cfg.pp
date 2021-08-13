# == Class: nagios::nagios_cfg
#
# === Parameters
#
# [*cfg_files*]                    -
# [*cfg_dirs*]                     -
# [*command_check_interval*]       -
# [*use_retained_scheduling_info*] -
# [*enable_flap_detection*]        -
#
# === Examples
#
# === Authors
#
# === Copyright
#
# Copyright 2013 New Relic, Inc. All rights reserved.
#
class nagios::nagios_cfg (
  $base_dir                     = $nagios::params::base_dir,
  $cfg_dirs                     = $nagios::params::cfg_dirs,
  $cfg_files                    = $nagios::params::cfg_files,
  $command_check_interval       = $nagios::params::cfg_command_check_interval,
  $use_retained_scheduling_info = $nagios::params::cfg_use_retained_scheduling_info,
  $enable_flap_detection        = $nagios::params::cfg_enable_flap_detection,
  $enable_notifications         = $nagios::params::cfg_enable_notifications,
  $global_host_event_handler    = $nagios::params::cfg_global_host_event_handler,
  $global_service_event_handler = $nagios::params::cfg_global_service_event_handler
) inherits nagios::params {

  file { "${base_dir}/nagios.cfg":
    ensure  => present,
    owner   => 'root',
    group   => 'root',
    mode    => '0664',
    content => template("${module_name}/nagios.cfg.erb"),
  }
}

