# == Class: nagios::params
#
# === Parameters
#
# None.
#
# === Examples
#
#  class { 'nagios::params': }
#
# === Authors
#
# === Copyright
#
# Copyright 2013 New Relic, Inc. All rights reserved.
#
class nagios::params {
  # Packages
  $packages_core        = ['nagios', 'nagios-common']
  $packages_plugins     = ['nagios-plugins-all']
  $package_dependencies = ['perl-Net-SNMP']

  $user  = 'root'
  $group = 'root'

  $link_lib64            = true   # Link /usr/lib/nagios => /usr/lib64/nagios
  $purge_default_objects = true   # Delete /etc/nagios/objects

  $puppet_resources_collect = true  # Auto-collect all of the exported puppet resources
  $puppet_resources_purge   = true  # Auto-purge resources that are no longer exported

  # Service handling
  $service_control    = false  # Enable service management
  $service_enable     = true
  $service_ensure     = true
  $service_hasrestart = true
  $service_hasstatus  = true
  $service_notify     = false  # Notify the service of config file changes


  # NAGIOS.CFG PARAMS
  $base_dir = '/etc/nagios'

  # Default to just the puppet types
  $cfg_files = [
    "${base_dir}/nagios_host.cfg",
    "${base_dir}/nagios_hostgroup.cfg",
    "${base_dir}/nagios_hostdependency.cfg",
    "${base_dir}/nagios_hostescalation.cfg",
    "${base_dir}/nagios_hostextinfo.cfg",
    "${base_dir}/nagios_service.cfg",
    "${base_dir}/nagios_servicegroup.cfg",
    "${base_dir}/nagios_servicedependency.cfg",
    "${base_dir}/nagios_serviceescalation.cfg",
    "${base_dir}/nagios_serviceextinfo.cfg",
    "${base_dir}/nagios_timeperiod.cfg",
    "${base_dir}/nagios_command.cfg",
    "${base_dir}/nagios_contact.cfg",
    "${base_dir}/nagios_contactgroup.cfg",
  ]
  $cfg_dirs = [
    "${base_dir}/conf.d",
  ]
  $resource_file = "${base_dir}/private/resource.cfg"

  $cfg_command_check_interval         = '-1'
  $cfg_use_retained_scheduling_info   = '1'
  $cfg_enable_flap_detection          = '0'
  $cfg_enable_notifications           = '1'
  $cfg_global_host_event_handler      = unset
  $cfg_global_service_event_handler   = unset

  # CGI PARAMS
  $cgi_authorized_for_system_information          = 'nagiosadmin'
  $cgi_authorized_for_configuration_information   = 'nagiosadmin'
  $cgi_authorized_for_system_commands             = 'nagiosadmin'
  $cgi_authorized_for_all_services                = 'nagiosadmin'
  $cgi_authorized_for_all_hosts                   = 'nagiosadmin'
  $cgi_authorized_for_all_service_commands        = 'nagiosadmin'
  $cgi_authorized_for_all_host_commands           = 'nagiosadmin'
}
