# Public: Manage the 'domain' entry in /etc/resolv.conf
#
# namevar - The value String to set the 'domain' entry in /etc/resolv.conf to.
# ensure  - The state of the resource as a String.  Valid values are 'absent'
#           and 'present' (default: 'present').
#
# Example
#
#   # Add the 'domain' entry to /etc/resolv.conf and set it to 'foo.bar.com'
#   resolvconf::domain { 'foo.bar.com': }
#
#   # Remove the 'domain' entry from /etc/resolv.conf
#   resolvconf::domain { 'test.bar.com':
#     ensure => absent,
#   }
define resolvconf::domain($ensure = 'present') {

  Augeas {
    context => '/files/etc/resolv.conf',
  }

  case $ensure {
    'present': {
      augeas { "Setting domain in /etc/resolv.conf to ${name}":
        changes => "set domain ${name}",
      }
    }
    'absent': {
      augeas { 'Removing domain from /etc/resolv.conf':
        changes => 'rm domain',
      }
    }
    default: {
      fail("Invalid ensure value passed to Resolvconf::Domain[${name}]")
    }
  }
}
