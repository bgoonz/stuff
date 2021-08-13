# Public: Manage sortlist entries in /etc/resolv.conf.
#
# namevar  - The IP address String of the sortlist entry.
# netmask  - An optional netmask String of the sortlist entry.
# priority - The optional priority of the sortlist entry as an Integer.  If a
#            value between 0 and 14 is provided, the entry will be the first
#            through fourteenth sortlist entry respectively.
# ensure   - The desired state of the resource as a String.  Valid values are
#            'absent' and 'present' (default: 'present').
#
# Examples
#
#   resolvconf::sortlist { '192.168.0.0': }
#
#   resolvconf::sortlist { '10.0.0.0':
#     netmask => '255.255.0.0',
#   }
define resolvconf::sortlist(
    $priority = '9999',
    $netmask  = '',
    $ensure   = 'present'
    ) {

  Augeas {
    context => '/files/etc/resolv.conf',
  }

  case $ensure {
    'present': {
      augeas { "Adding sortlist entry '${name}' to /etc/resolv.conf":
        changes => "set sortlist/${priority}/address ${name}",
        onlyif  => "match sortlist/${priority}[address='${name}'] size == 0",
      }

      if $netmask == '' {
        augeas { "Removing netmask for sortlist entry '${name}'":
          changes => "rm sortlist/*[address='${name}']/netmask",
        }
      } else {
        augeas { "Setting netmask for sortlist entry '${name}' to '${netmask}'":
          changes => "set sortlist/*[address='${name}']/netmask ${netmask}",
        }
      }
    }
    'absent': {
      augeas { "Removing sortlist entry '${name}' from /etc/resolv.conf":
        changes => "rm sortlist/*[address='${name}']",
      }
    }
    default: {
      fail("Invalid ensure value passed to Resolvconf::Sortlist[${name}]")
    }
  }
}
