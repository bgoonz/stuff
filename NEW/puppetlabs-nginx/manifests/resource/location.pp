# define: nginx::resource::location
#
# This definition creates a new location entry within a virtual host
#
# Parameters:
#   [*ensure*]                 - Enables or disables the specified location (present|absent)
#   [*vhost*]                  - Defines the default vHost for this location entry to include with
#   [*rewrite*]                - Specifies rewrite rules for location definition. Hash should contain 'regex' and 'replacement' keys (required) and could contain a 'flag' key (optional)
#   [*location*]               - Specifies the URI associated with this location entry
#   [*www_root*]               - Specifies the location on disk for files to be read from. Cannot be set in conjunction with $proxy
#   [*index_files*]            - Default index files for NGINX to read when traversing a directory
#   [*proxy*]                  - Proxy server(s) for a location to connect to. Accepts a single value, can be used in conjunction
#                                with nginx::resource::upstream
#   [*proxy_read_timeout*]     - Override the default the proxy read timeout value of 90 seconds
#   [*proxy_intercept_errors*] - Override the default proxy error interception value of off
#   [*return_str*]             - Configures a location with only the contents of "return <return_str>"
#   [*ssl*]                    - Indicates whether to setup SSL bindings for this location.
#   [*try_files*]              - An array of file locations to try
#   [*option*]                 - Reserved for future use
#   [*ssi]                     - Enables or disables service side includes (on|off)
#
# Actions:
#
# Requires:
#
# Sample Usage:
#  nginx::resource::location { 'test2.local-bob':
#    ensure   => present,
#    www_root => '/var/www/bob',
#    location => '/bob',
#    vhost    => 'test2.local',
#  }
define nginx::resource::location(
  $location,
  $ensure                 = present,
  $vhost                  = undef,
  $rewrite                = { },
  $www_root               = undef,
  $index_files            = ['index.html', 'index.htm', 'index.php'],
  $proxy                  = undef,
  $proxy_read_timeout     = $nginx::params::nx_proxy_read_timeout,
  $proxy_intercept_errors = $nginx::params::nx_proxy_intercept_errors,
  $return_str             = undef,
  $ssl                    = false,
  $try_files              = undef,
  $option                 = undef,
  $ssi                    = $nginx::params::nx_ssi,
) {
  include nginx::config

  File {
    owner  => 'root',
    group  => 'root',
    mode   => '0644',
    notify => Class['nginx::service'],
  }

  ## Shared Variables
  $ensure_real = $ensure ? {
    'absent' => absent,
    default  => file,
  }

  # Use proxy template if $proxy is defined, otherwise use directory template.
  if ($proxy != undef) {
    $content_real = template('nginx/vhost/vhost_location_proxy.erb')
  } elsif ($return_str != undef) {
    $content_real = template('nginx/vhost/vhost_location_return.erb')
  } else {
    $content_real = template('nginx/vhost/vhost_location_directory.erb')
  }

  ## Check for various error condtiions
  if ($vhost == undef) {
    fail('Cannot create a location reference without attaching to a virtual host')
  }
  if (($www_root == undef) and ($proxy == undef) and ($return_str == undef)) {
    fail('Cannot create a location reference without a www_root, proxy or return_str defined')
  }
  if (($www_root != undef) and ($proxy != undef)) {
    fail('Cannot define both directory and proxy in a virtual host')
  }

  ## Create stubs for vHost File Fragment Pattern
  file {"${nginx::config::nx_temp_dir}/nginx.d/${vhost}-500-${name}":
    ensure  => $ensure_real,
    content => $content_real,
  }

  if $rewrite != {} {
    # Template uses: $rewrite
    file { "${nginx::config::nx_temp_dir}/nginx.d/${vhost}-600-${name}":
      ensure => $ensure ? {
        'absent' => 'absent',
        default  => 'file',
      },
      content => template('nginx/vhost/vhost_location_rewrite.erb'),
      notify  => Class['nginx::service'],
    }
  }

  ## Only create SSL Specific locations if $ssl is true.
  if ($ssl == 'true') {
    file {"${nginx::config::nx_temp_dir}/nginx.d/${vhost}-800-${name}-ssl":
      ensure  => $ensure_real,
      content => $content_real,
    }
  }
}
