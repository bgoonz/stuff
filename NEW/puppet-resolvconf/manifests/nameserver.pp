# Public: Manage the nameserver entries in /etc/resolv.conf
#
# namevar  - The IP address of the nameserver as a String.
# priority - The optional priority of the nameserver as a Integer.  If a value
#            between 0 and 2 is specified, the nameserver will appear as the
#            first through third nameserver in the file respectively.
# ensure   - The desired state of the resource as a String.  Valid values are
#           'absent' and 'present' (default: 'present').
#
# Examples
#
#   # 10.0.0.1 and 10.0.0.3 are my nameservers
#   resolvconf::nameserver { ['10.0.0.1', '10.0.0.3']: }
#
#   # 127.0.0.1 must be the first resolver
#   resolveconf::nameserver { '127.0.0.1:
#     priority => '0',
#   }
#
#   # 10.0.0.2 is an old nameserver that we don't use anymore
#   resolvconf::nameserver { '10.0.0.2':
#     ensure => absent,
#   }
define resolvconf::nameserver($priority = 'last() + 1', $ensure = 'present') {

  Augeas {
    context => '/files/etc/resolv.conf',
  }

  case $ensure {
    present: {

      augeas { "Adding nameserver ${name} to /etc/resolv.conf":
        changes => "set nameserver[${priority}] ${name}",
        onlyif  => "match nameserver[.='${name}'] size == 0",
      }
    }
    absent: {
      augeas { "Removing nameserver ${name} from /etc/resolv.conf":
        changes => "rm nameserver[.='${name}']"
      }
    }
    default: {
      fail("Invalid ensure value passed to Resolvconf::Nameserver[${name}]")
    }
  }
}
