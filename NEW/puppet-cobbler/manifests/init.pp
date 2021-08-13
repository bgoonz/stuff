# Define: cobbler
#
# This class manages Cobbler
# https://fedorahosted.org/cobbler/
#
# Parameters:
#
#   - $service_name [type: string]
#     Name of the cobbler service, defaults to 'cobblerd'.
#
#   - $package_name [type: string]
#     Name of the installation package, defaults to 'cobbler'
#
#   - $package_ensure [type: string]
#     Defaults to 'present', buy any version can be set
#
#   - $distro_path [type: string]
#     Defines the location on disk where distro files will be
#     stored. Contents of the ISO images will be copied over
#     in these directories, and also kickstart files will be
#     stored. Defaults to '/distro'
#
#   - $manage_dhcp [type: bool]
#     Wether or not to manage ISC DHCP.
#
#   - $dhcp_dynamic_range [type: string]
#     Range for DHCP server
#
#   - $manage_dns [type: string]
#     Wether or not to manage DNS
#
#   - $dns_option [type: string]
#     Which DNS deamon to manage - Bind or dnsmasq. If dnsmasq,
#     then dnsmasq has to be used for DHCP too.
#
#   - $manage_tftpd [type: bool]
#     Wether or not to manage TFTP daemon.
#
#   - $tftpd_option [type:string]
#     Which TFTP daemon to use.
#
#   - $server_ip [type: string]
#     IP address of a server.
#
#   - $next_server_ip [type: string]
#     Next Server in cobbler config.
#
#   - $nameservers [type: array]
#     Nameservers for kickstart files to put in resolv.conf upon
#     installation.
#
#   - $dhcp_interfaces [type: array]
#     Interface for DHCP to listen on.
#
#   - $networking_subnets [type: hash of hashes]
#     If you use *DHCP relay* on your network, then $dhcp_interfaces
#     won't suffice. $networking_subnets have to be defined, otherwise,
#     DHCP won't offer address to a machine in a network that's
#     not directly available on the DHCP machine itself.
#     Typically this would be in hiera.
#
#   - $defaultrootpw [type: string]
#     Hash of root password for kickstart files.
#
#   - $apache_service [type: string]
#     Name of the apache service.
#
#   - $allow_access [type: string]
#     For what IP addresses/hosts will access to cobbler_api be granted.
#     Default is for server_ip, ::ipaddress and localhost
#
#   - $purge_distro  [type: bool]
#   - $purge_repo    [type: bool]
#   - $purge_profile [type: bool]
#   - $purge_system  [type: bool]
#     Decides wether or not to purge (remove) from cobbler distro,
#     repo, profiles and systems which are not managed by puppet.
#     Default is true.
#
#   - default_kickstart [type: string]
#     Location of the default kickstart. Default depends on $::osfamily.
#
#   - webroot [type: string]
#     Location of Cobbler's web root. Default: '/var/www/cobbler'.
#
# Actions:
#   - Install Cobbler
#   - Manage Cobbler service
#
# Requires:
#   - puppetlabs/apache class
#     (http://forge.puppetlabs.com/puppetlabs/apache)
#
# Sample Usage:
#
define cobbler (
  $defaultrootpw,
  $service_name                          = 'cobblerd',
  $package_name                          = 'cobbler',
  $package_ensure                        = 'present',
  $distro_path                           = '/distro',
  $manage_dhcp                           = 0,
  $dhcp_template                         = 'cobbler/dhcp.template.erb',
  $dhcp_dynamic_range                    = 0,
  $manage_dns                            = 0,
  $dns_option                            = 'dnsmasq',
  $dhcp_option                           = 'isc',
  $manage_tftpd                          = 1,
  $manage_rsync                          = 1,
  $tftpd_option                          = 'in_tftpd',
  $server_ip                             = $::ipaddress,
  $next_server_ip                        = $::ipaddress,
  $nameservers                           = '127.0.0.1',
  $dhcp_interfaces                       = 'eth0',
  $networking_subnets                    = {"development"=>{"resolvers"=>["192.168.1.1", "192.168.1.2"], "subnet"=>"192.168.1.0", "router"=>"192.168.1.1", "ntpservers"=>["0.centos.pool.ntp.org", "1.centos.pool.ntp.org", "2.centos.pool.ntp.org"], "dnssearch"=>"example.com", "ranges"=>["192.168.1.100 192.168.1.150"], "netmask"=>"255.255.255.0", "broadcast"=>"192.168.1.255", "vlanid"=>"1", "cidr"=>"192.168.1.0/24", "domainname"=>"example.com"}},
  $maxlease                              = 86400,
  $deflease                              = 172800,
  $apache_service                        = 'httpd',
  $allow_access                          = "${server_ip} ${::ipaddress} 127.0.0.1",
  $reporting_enabled                     = 1,
  $reporting_sender                      = "Cobbler Server - ${::ipaddress}",
  $reporting_email                       = "root",
  $register_new_installs                 = 0,
  $pretty_json                           = 0,
  $scm_enabled                           = 0,
  $keep_repos                            = 1,
  $purge_distro                          = false,
  $purge_repo                            = false,
  $purge_profile                         = false,
  $purge_system                          = false,
  $puppet_auto_setup                     = 1,
  $puppet_server                         = 'puppet',
  $puppet_version                        = 3,
  $puppet_parameterized_classes          = 1,
  $sign_puppet_certs_automatically       = 1,
  $remove_old_puppet_certs_automatically = 1,
  $createrepo_flags                      = '-c cache -s sha',
  $default_kickstart                     = '/var/lib/cobbler/kickstarts/default.ks',
  $cobbler_lib_dir                       = '/var/lib/cobbler',
  $cobbler_settings_dir                  = '/etc/cobbler',
  $webroot                               = '/var/www/cobbler',
  $www_html_dir                          = '/var/www/html',
  $http_config_prefix                    = '/etc/httpd/conf.d',
  $proxy_config_prefix                   = '/etc/httpd/conf.d',
  $authn_module                          = 'authn_denyall',
  $authz_module                          = 'authz_allowall',
  $role                                  = 'solitary',
  $tftp_package                          = 'tftp-server',
  $syslinux_package                      = 'syslinux',
  $ldap_server                           = "example.com",
  $ldap_base_dn                          = "DC=example,DC=com",
  $ldap_port                             = 389,
  $ldap_tls_enabled                      = 0,
  $ldap_anonymous_enabled                = 1,
  $ldap_bind_dn                          = '',
  $ldap_bind_passwd                      = '',
  $ldap_search_prefix                    = 'uid=',
  $ldap_tls_cacert                       = '',
  $ldap_tls_key                          = '',
  $ldap_tls_cert                         = '',
  $admin_users                           = ['admin','cobbler'],
  $primary_server_ip                     = '127.0.0.1',
  $secondary_server_ip                   = '127.0.0.1',
  $replication_user                      = 'root',
  $replication_pkey_path                 = '/root/.ssh/id_rsa',
  $omapi_key                             = 'changeme',
  $enable_on_commit_hook                 = false,
  $on_commit_hook                        = ['"/usr/bin/logger"', '"-p"', '"user.info"', '"-t"', '"dhcpd"', 'clientip', 'clientmac', 'vendorclass', 'ddns-hostname', 'leasetime']
) {

  # require apache modules
  if ! defined(Class['apache']) {
    class { 'apache':
      default_mods      => true,
      default_vhost     => false,
      default_ssl_vhost => true,
    }
  }
  file { "${http_config_prefix}/15-default.conf":
    content => template('cobbler/15-default.conf.erb'),
    notify  => Service[$apache_service],
  }
  if ! defined(Class['apache::mod::wsgi']) {
    class { 'apache::mod::wsgi':
    }
  }
  if ! defined(Class['apache::mod::proxy']) {
    class { 'apache::mod::proxy':
    }
  }
  if ! defined(Class['apache::mod::proxy_http']) {
    class { 'apache::mod::proxy_http':
    }
  }

  # install section
  if ! defined(Package['python-ldap']) {
    package { 'python-ldap':   ensure => present, }
  }
  if ! defined(Package['xinetd']) {
    package { 'xinetd':        ensure => present, }
  }
  if ! defined(Package['git']) {
    package { 'git':           ensure => present, }
  }
  if ! defined(Package['debmirror']) {
    package { 'debmirror':     ensure => present, }
  }
  if ! defined(Package['pykickstart']) {
    package { 'pykickstart':   ensure => present, }
  }
  if ! defined(Package['hardlink']) {
    package { 'hardlink':      ensure => present, }
  }
  if ! defined(Package['cman']) {
    package { 'cman':          ensure => present, }
  }
  if ! defined(Package['fence-agents']) {
    package { 'fence-agents':  ensure => present, }
  }
  if ! defined(Package['util-linux-ng']) {
    package { 'util-linux-ng': ensure => present, }
  }
  if ! defined(Package['gpxe-bootimgs']) {
    package { 'gpxe-bootimgs': ensure => present, }
  }
  package { $tftp_package:     ensure => present, }
  package { $syslinux_package: ensure => present, }
  package { $package_name:
    ensure  => $package_ensure,
    require => [ Package[$syslinux_package], Package[$tftp_package], Package['python-ldap'], Package['xinetd'], Package['git'] ],
  }

  service { $service_name :
    ensure  => running,
    enable  => true,
    require => Package[$package_name],
  }

  if ! defined(Service['xinetd']) {
    service { 'xinetd' :
      ensure  => running,
      enable  => true,
      require => Package['xinetd'],
    }
  }

  # file defaults
  File {
    ensure => file,
    owner  => root,
    group  => root,
    mode   => '0644',
  }
  file { "${proxy_config_prefix}/proxy_cobbler.conf":
    content => template('cobbler/proxy_cobbler.conf.erb'),
    notify  => Service[$apache_service],
  }
  file { "/etc/xinetd.d/rsync":
    source => 'puppet:///modules/cobbler/xinetd-rsync',
    notify  => Service['xinetd'],
  }
  file { "/etc/debmirror.conf":
    source => 'puppet:///modules/cobbler/debmirror.conf',
    require => Package['debmirror'],
  }
  file { $distro_path :
    ensure => directory,
    mode   => '0755',
  }
  file { "${distro_path}/kickstarts" :
    ensure => directory,
    mode   => '0755',
  }
  file { '/etc/cobbler/settings':
    content => template('cobbler/settings.erb'),
    require => Package[$package_name],
    notify  => Service[$service_name],
  }
  file { '/etc/cobbler/modules.conf':
    content => template('cobbler/modules.conf.erb'),
    require => Package[$package_name],
    notify  => Service[$service_name],
  }
  file { '/etc/cobbler/users.conf':
    content => template('cobbler/users.conf.erb'),
    require => Package[$package_name],
    notify  => Service[$service_name],
  }
  file { "${http_config_prefix}/distros.conf":
    content => template('cobbler/distros.conf.erb'),
    notify  => Service[$apache_service],
  }
  file { "${http_config_prefix}/cobbler.conf":
    content => template('cobbler/cobbler.conf.erb'),
    notify  => Service[$apache_service],
  }
  if ! defined(File["${www_html_dir}/index.html"]) {
    file { "${www_html_dir}/index.html":
      content => template('cobbler/index.html.erb'),
      require => Service[$apache_service],
    }
  }

  # cobbler sync command
  exec { 'cobblersync':
    command     => '/usr/bin/cobbler sync',
    refreshonly => true,
    require     => Service[$service_name],
    notify      => Exec['cobblerget-loaders'],
  }

  # cobbler get-loaders command
  # We really only need to run this once, but it won't hurt.
  exec { 'cobblerget-loaders':
    command     => '/usr/bin/cobbler get-loaders --force',
    refreshonly => true,
    require     => Service[$service_name],
  }

  # purge resources
  if $purge_distro == true {
    resources { 'cobblerdistro':  purge => true, }
  }
  if $purge_repo == true {
    resources { 'cobblerrepo':    purge => true, }
  }
  if $purge_profile == true {
    resources { 'cobblerprofile': purge => true, }
  }
  if $purge_system == true {
    resources { 'cobblersystem':  purge => true, }
  }

  # include ISC DHCP only if we choose manage_dhcp
  if $manage_dhcp == '1' {
    package { 'dhcp':
      ensure => present,
    }
    service { 'dhcpd':
      ensure  => running,
      enable  => true,
      require => Package['dhcp'],
    }
    file { '/etc/cobbler/dhcp.template':
      ensure  => present,
      owner   => root,
      group   => root,
      mode    => '0644',
      content => template($dhcp_template),
      require => Package[$package_name],
      notify  => Exec['cobblersync'],
    }
  }

  # logrotate script
  file { '/etc/logrotate.d/cobbler':
    source => 'puppet:///modules/cobbler/logrotate',
  }

  # cobbler reposync cron script
  file { '/etc/cron.daily/cobbler-reposync':
    source => 'puppet:///modules/cobbler/cobbler-reposync.cron',
    mode   => '0755',
  }

  # ---------------------------------------------
  # Support CoreOS images and gPXE

  file { '/etc/cobbler/pxe/pxesystem_coreos.template':
    ensure  => 'present',
    owner   => root,
    group   => root,
    mode    => '0644',
    content => template('cobbler/pxesystem_coreos.template.erb'),
    require => Package['cobbler'],
  }

  file { '/etc/cobbler/pxe/bootcfg_coreos.template':
    ensure  => 'present',
    owner   => root,
    group   => root,
    mode    => '0644',
    content => template('cobbler/bootcfg_coreos.template.erb'),
    require => Package['cobbler'],
  }

  # ---------------------------------------------
  # Support VMWare ESXi images and gPXE

  file { '/etc/cobbler/pxe/pxesystem_esxi.template':
    ensure  => 'present',
    owner   => root,
    group   => root,
    mode    => '0644',
    content => template('cobbler/pxesystem_esxi.template.erb'),
    require => Package['cobbler'],
  }

  file { '/etc/cobbler/pxe/bootcfg_esxi55.template':
    ensure  => 'present',
    owner   => root,
    group   => root,
    mode    => '0644',
    content => template('cobbler/bootcfg_esxi55.template.erb'),
    require => Package['cobbler'],
  }

  file { '/etc/cobbler/pxe/bootcfg_system_esxi55.template':
    ensure => 'link',
    target => '/etc/cobbler/pxe/bootcfg_esxi55.template',
    require => File['/etc/cobbler/pxe/bootcfg_esxi55.template'],
  }

  # ---------------------------------------------

  # TFTP server doesn't like symlinks, and we need these to be
  # available to TFTP clients.
  exec { 'copy-gpxe-files-to-tftpboot-directory':
    command => '/bin/cp /usr/share/gpxe/* /var/lib/tftpboot',
    creates => '/var/lib/tftpboot/undionly.kpxe',
    require => Package['gpxe-bootimgs'],
  }

  # Update Distribution Signatures
  exec { 'update distro_signatures.json':
    command => '/bin/true',
    require => Package['cobbler'],
    unless  => '/usr/bin/cobbler signature update'
  }

  # link to signatures
  file { "${cobbler_lib_dir}/distro_signatures.json":
    ensure  => 'link',
    owner   => root,
    group   => root,
    mode    => '0644',
    target => "/etc/cobbler/distro_signatures.json",
    require => Package['cobbler'],
  }

  if $role != "solitary" {

    file { '/usr/local/bin/cobbler-replicate':
      ensure  => present,
      owner   => root,
      group   => root,
      mode    => '0770',
      content => template('cobbler/cobbler-replicate.sh.erb'),
      require => User[$replication_user],
    }

  }

  exec { 'clean_python_bytecode_sync_post_replicate.py':
    command     => '/bin/rm -f /usr/lib/python2.6/site-packages/cobbler/modules/sync_post_replicate.pyc; /bin/rm -f /usr/lib/python2.6/site-packages/cobbler/modules/sync_post_replicate.pyo',
    refreshonly => true,
    notify      => Service[$service_name],
  }

  if $role == "primary" {

    # cobbler replicate cron script
    file { '/etc/cron.daily/cobbler-replicate':
      ensure  => present,
      source  => 'puppet:///modules/cobbler/cobbler-replicate.cron',
      mode    => '0755',
      require => File['/usr/local/bin/cobbler-replicate'],
    }

    # cobbler replicatation trigger
    file { '/usr/lib/python2.6/site-packages/cobbler/modules/sync_post_replicate.py':
      ensure  => present,
      source  => 'puppet:///modules/cobbler/sync_post_replicate.py',
      mode    => '0644',
      require => Package['cobbler'],
      notify  => Exec['clean_python_bytecode_sync_post_replicate.py'],
    }

  } else {

    # cobbler replicate cron script
    file { '/etc/cron.daily/cobbler-replicate':
      ensure  => absent,
      source  => 'puppet:///modules/cobbler/cobbler-replicate.cron',
      mode    => '0755',
    }

    # cobbler replicatation trigger
    file { '/usr/lib/python2.6/site-packages/cobbler/modules/sync_post_replicate.py':
      ensure  => absent,
      source  => 'puppet:///modules/cobbler/sync_post_replicate.py',
      mode    => '0644',
      notify  => Exec['clean_python_bytecode_sync_post_replicate.py'],
    }

  }

}
# vi:nowrap:
