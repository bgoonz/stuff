# Define: cobbler::dhcp
#
# This module manages ISC DHCP for Cobbler
# https://fedorahosted.org/cobbler/
#
define cobbler::dhcp (
  $nameservers     = '127.0.0.1',
  $dhcp_interfaces = 'eth0',
  $dhcp_template   = 'cobbler/dhcp.template.erb',
  ) {
  package { 'dhcp':
    ensure => present,
  }
  service { 'dhcpd':
    ensure  => running,
    require => Package['dhcp'],
  }
  file { '/etc/cobbler/dhcp.template':
    ensure  => present,
    owner   => root,
    group   => root,
    mode    => '0644',
    content => template($dhcp_template),
  }
}
