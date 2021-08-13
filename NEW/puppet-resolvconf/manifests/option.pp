# Public: Manage options entries in /etc/resolv.conf
#
# namevar - The name of the option to be managed as a String.
# value   - The value of the option as a String.  This is only required when
#           managing options that take a value ('ndots', 'timeout', and
#           'attempts').
# ensure  - The desired state of the resource as a String.  Valid values are
#           'absent' and 'present' (default: 'present').
#
# Examples
#
#   # Set the resolver timeout to 1 second
#   resolvconf::option { 'timeout':
#     value => '1',
#   }
#
#   # Attempt AAAA lookups before A
#   resolvconf::option { 'inet6': }
#
#   # Disable debug mode
#   resolvconif::option { 'debug':
#     ensure => 'absent',
#   }
define resolvconf::option($value = '', $ensure = 'present') {

  Augeas {
    context => '/files/etc/resolv.conf',
  }

  case $ensure {
    'present': {
      case $name {
        'ndots','timeout','attempts': {
          if $value == '' {
            fail("Must pass value to Resolvconf::Option[${name}]")
          }

          augeas {
            "Adding option '${name}' to /etc/resolv.conf":
              changes => [
                "set options[last() + 1] ${name}",
                "set options[last()]/value ${value}",
              ],
              onlyif  => "match options[.='${name}'] size == 0";
            "Setting /etc/resolv.conf option '${name}' to '${value}'":
              changes => "set options[.='${name}']/value ${value}",
              require => Augeas["Adding option '${name}' to /etc/resolv.conf"];
          }
        }
        default: {
          augeas { "Adding option '${name}' to /etc/resolv.conf":
            changes => "set options[last() + 1] ${name}",
            onlyif  => "match options[.='${name}'] size == 0",
          }
        }
      }
    }
    'absent': {
      augeas { "Removing option '${name}' from /etc/resolv.conf":
        changes => "rm options[.='${name}']",
      }
    }
    default: {
      fail("Invalid ensure value passed to Resolvconf::Option[${name}]")
    }
  }
}
