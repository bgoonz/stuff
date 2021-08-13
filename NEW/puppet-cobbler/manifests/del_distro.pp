# Define: cobbler::del_distro
define cobbler::del_distro (){
  include cobbler
  $distro = $title
  cobblerdistro { $distro :
    ensure  => absent,
    destdir => $cobbler::distro_path,
    require => [ Service[$cobbler::service_name], Service[$cobbler::apache_service] ],
  }
  file { "${cobbler::distro_path}/kickstarts/${distro}.ks":
    ensure  => absent,
  }
}
