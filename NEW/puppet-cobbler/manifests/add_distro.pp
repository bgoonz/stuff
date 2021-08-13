# Define: cobbler::add_distro
define cobbler::add_distro (
  $arch,
  $isolink,
  $kernel            = 'images/pxeboot/vmlinuz',
  $initrd            = 'images/pxeboot/initrd.img',
  $ks_template       = "cobbler/${title}.ks.erb",
  $include_kickstart = true,
) {
  include cobbler
  $distro = $title
  $server_ip = $::cobbler::server_ip
  cobblerdistro { $distro :
    ensure  => present,
    arch    => $arch,
    isolink => $isolink,
    destdir => $::cobbler::distro_path,
    kernel  => "${::cobbler::distro_path}/${distro}/${kernel}",
    initrd  => "${::cobbler::distro_path}/${distro}/${initrd}",
    require => [ Service[$::cobbler::service_name], Service[$::cobbler::apache_service] ],
  }
  $defaultrootpw = $::cobbler::defaultrootpw
  if ($include_kickstart) {
    file { "${::cobbler::distro_path}/kickstarts/${distro}.ks":
      ensure  => present,
      content => template($ks_template),
      require => File["${cobbler::distro_path}/kickstarts"],
    }
  }
}
