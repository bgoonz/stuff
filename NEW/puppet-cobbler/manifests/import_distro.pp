# Define: cobbler::import_distro
define cobbler::import_distro ($arch,$path,$available_as) {
  include cobbler
  $distro = $title
  $server_ip = $::cobbler::server_ip
  cobblerdistro { $distro :
    ensure  => present,
    arch    => $arch,
    path    => $path,
    ks_meta => { tree => $available_as },
    require => [ Service[$::cobbler::service_name], Service[$::cobbler::apache_service] ],
  }
  $defaultrootpw = $::cobbler::defaultrootpw
  file { "${::cobbler::distro_path}/kickstarts/${distro}.ks":
    ensure  => present,
    content => template("cobbler/${distro}.ks.erb"),
    require => File["${::cobbler::distro_path}/kickstarts"],
  }
}
