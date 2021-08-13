# Define: cobbler::route
#
# This class add any defined routes that might be required
#
#
#
define cobbler::route(
  $network,
  $cidrmask,
  $gateway,
) {

  exec { "Add-${network}-route":
    command => "/sbin/route add -net ${network}/${cidrmask} gw ${gateway} &> /dev/null",
    unless  => "/sbin/route -n | /bin/grep -q  ${network}"
  }

}
