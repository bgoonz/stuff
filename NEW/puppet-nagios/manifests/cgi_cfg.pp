# == Class: nagios::cgi_cfg
#
# === Parameters
#
# [*authorized_for_system_information*]        -
# [*authorized_for_configuration_information*] -
# [*authorized_for_system_commands*]           -
# [*authorized_for_all_services*]              -
# [*authorized_for_all_hosts*]                 -
# [*authorized_for_all_service_commands*]      -
# [*authorized_for_all_host_commands*]         -
# === Examples
#
# === Authors
#
# === Copyright
#
# Copyright 2013 New Relic, Inc. All rights reserved.
#
class nagios::cgi_cfg (
  $authorized_for_system_information        = $nagios::params::cgi_authorized_for_system_information,
  $authorized_for_configuration_information = $nagios::params::cgi_authorized_for_configuration_information,
  $authorized_for_system_commands           = $nagios::params::cgi_authorized_for_system_commands,
  $authorized_for_all_services              = $nagios::params::cgi_authorized_for_all_services,
  $authorized_for_all_hosts                 = $nagios::params::cgi_authorized_for_all_hosts,
  $authorized_for_all_service_commands      = $nagios::params::cgi_authorized_for_all_service_commands,
  $authorized_for_all_host_commands         = $nagios::params::cgi_authorized_for_all_host_commands,
) inherits nagios::params {

  file { '/etc/nagios/cgi.cfg':
    ensure  => present,
    owner   => 'root',
    group   => 'root',
    mode    => '0664',
    content => template("${module_name}/cgi.cfg.erb"),
  }
}

