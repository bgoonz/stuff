# == Class: nagios
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
class nagios (
  $base_dir                                     = $nagios::params::base_dir,
  $cfg_files                                    = $nagios::params::cfg_files,
  $cfg_dirs                                     = $nagios::params::cfg_dirs,
  $cfg_command_check_interval                   = $nagios::params::cfg_command_check_interval,
  $cfg_use_retained_scheduling_info             = $nagios::params::cfg_use_retained_scheduling_info,
  $cfg_enable_flap_detection                    = $nagios::params::cfg_enable_flap_detection,
  $cfg_enable_notifications                     = $nagios::params::cfg_enable_notifications,
  $cfg_global_host_event_handler                = $nagios::params::cfg_global_host_event_handler,
  $cfg_global_service_event_handler             = $nagios::params::cfg_global_service_event_handler,
  $cgi_authorized_for_system_information        = $nagios::params::cgi_authorized_for_system_information,
  $cgi_authorized_for_configuration_information = $nagios::params::cgi_authorized_for_configuration_information,
  $cgi_authorized_for_system_commands           = $nagios::params::cgi_authorized_for_system_commands,
  $cgi_authorized_for_all_services              = $nagios::params::cgi_authorized_for_all_services,
  $cgi_authorized_for_all_hosts                 = $nagios::params::cgi_authorized_for_all_hosts,
  $cgi_authorized_for_all_service_commands      = $nagios::params::cgi_authorized_for_all_service_commands,
  $cgi_authorized_for_all_host_commands         = $nagios::params::cgi_authorized_for_all_host_commands,
  $resource_user                                = { },
  $packages_core                                = $nagios::params::packages_core,
  $packages_plugins                             = $nagios::params::packages_plugins,
  $dependencies                                 = $nagios::params::package_dependencies,
  $link_lib64                                   = $nagios::params::link_lib64,
  $purge_objects                                = $nagios::params::purge_default_objects,
  $puppet_resources_collect                     = $nagios::params::puppet_resources_collect,
  $puppet_resources_purge                       = $nagios::params::puppet_resources_purge,
  $service_control                              = $nagios::params::service_control,
) inherits nagios::params {

  class { 'nagios::packages':
    packages_core    => $packages_core,
    packages_plugins => $packages_plugins,
    dependencies     => $dependencies,
    link_lib64       => $link_lib64,
    purge_objects    => $purge_objects,
    base_dir         => $base_dir,
  }

  class { 'nagios::cgi_cfg':
    authorized_for_configuration_information => $cgi_authorized_for_configuration_information,
    authorized_for_system_commands           => $cgi_authorized_for_system_commands,
    authorized_for_all_services              => $cgi_authorized_for_all_services,
    authorized_for_all_hosts                 => $cgi_authorized_for_all_hosts,
    authorized_for_all_service_commands      => $cgi_authorized_for_all_service_commands,
    authorized_for_all_host_commands         => $cgi_authorized_for_all_host_commands,
    require                                  => Class['nagios::packages'],
  }

  class { 'nagios::nagios_cfg':
    cfg_files                    => $cfg_files,
    cfg_dirs                     => $cfg_dirs,
    command_check_interval       => $cfg_command_check_interval,
    use_retained_scheduling_info => $cfg_use_retained_scheduling_info,
    enable_flap_detection        => $cfg_enable_flap_detection,
    enable_notifications         => $cfg_enable_notifications,
    global_host_event_handler    => $cfg_global_host_event_handler,
    global_service_event_handler => $cfg_global_service_event_handler,
    require                      => Class['nagios::packages'],
  }

  class { 'nagios::resource_cfg':
    resource_user => $resource_user,
    require       => Class['nagios::packages'],
  }

  class { 'nagios::puppet_resources':
    auto_collect => $puppet_resources_collect,
    auto_purge   => $puppet_resources_purge,
    base_dir     => $base_dir,
    require      => Class['nagios::packages'],
  }

  if ($service_control) {
    class { 'nagios::service':
      require => Class['nagios::nagios_cfg'],
    }
  }

}

