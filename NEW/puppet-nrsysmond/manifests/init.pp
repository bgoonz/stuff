# == Class: nrsysmond
#
# This module manages the New Relic Server Agent.
#
# === Parameters
#
# [*license_key*]
#   40-character alphanumeric string provided by New Relic. This is required in
#   order for the server monitor to start.
#
# [*nrloglevel*]
#   Level of detail you want in the log file (as defined by the logfile
#   setting below. Valid values are (in increasing levels of verbosity):
#   error        - show errors only
#   warning      - show errors and warnings
#   info         - show minimal additional information messages
#   verbose      - show more detailed information messages
#   debug        - show debug messages
#   verbosedebug - show very detailed debug messages
#   **Default**: info
#
# [*nrlogifle*]
#   Name of the file where the server monitor will store it's log messages. The amount
#   of detail stored in this file is controlled
#   by the loglevel option (above).
#   **Default**: /var/log/newrelic/nrsysmond.log
#
# [*proxy*]
#   The name and optional login credentials of the proxy server to use
#   for all communication with the New Relic collector. In its simplest
#   form this setting is just a hostname[:port] setting. The default
#   port if none is specified is 1080. If your proxy requires a user
#   name, use the syntax user@host[:port]. If it also requires a
#   password use the format user:password@host[:port]. For example:
#     fred:secret@proxy.mydomain.com:8181
#
# [*ssl*]
#   Whether or not to use the Secure Sockets Layer (SSL) for all
#   communication with the New Relic collector. Possible values are
#   true/on or false/off. In certain rare cases you may need to modify
#   the SSL certificates settings below.
#   **Default**: false
#
# [*ssl_ca_bundle*]
#   The name of a PEM-encoded Certificate Authority (CA) bundle to use
#   for SSL connections. This very rarely needs to be set. The monitor
#   will attempt to find the bundle in the most common locations. If
#   you need to use SSL and the monitor is unable to locate a CA bundle
#   then either set this value or the ssl_ca_path option below.
#   **Default**: /etc/ssl/certs/ca-certificates.crt or
#            /etc/pki/tls/certs/ca-bundle.crt
#
# [*ssl_ca_path*]
#   If your SSL installation does not use CA bundles, but rather has a
#   directory with PEM-encoded Certificate Authority files, set this
#   option to the name of the directory that contains all the CA files.
#   **Default**: /etc/ssl/certs
#
# [*nrpidfile*]
#   Name of a file where the server monitoring daemon will store its
#   process ID (PID). This is used by the startup and shutdown script
#   to determine if the monitor is already running, and to start it up
#   or shut it down.
#   **Default**: /tmp/nrsysmond.pid
#
# [*collector_host*]
#   The name of the New Relic collector to connect to. This should only
#   ever be changed on the advice of New Relic support staff.
#   The format is host[:port]. Using a port number of 0 means the default
#   port, which is 80 (if not using the ssl option - see below) or 443
#   if SSL is enabled. If the port is omitted the default value is used.
#   **Default**: collector.newrelic.com
#
# [*timeout*]
#   How long the monitor should wait to contact the collector host. If
#   the connection cannot be established in this period of time, the
#   monitor will progressively back off in 15-second increments, up to
#   a maximum of 300 seconds. Once the initial connection has been
#   established, this value is reset back to the value specified here
#   (or the default). This then sets the maximum time to wait for
#   a connection to the collector to report data. There is no back-off
#   once the original connection has been made. The value is in seconds.
#   **Default**: 30
#
# [*version]
#   The version of nrsysmond to install. Usually you would leave this at
#   the default of 'latest', but if you prefer a specific release you may
#   specify a version number here as a string.
#   **Default**: latest
#
# [*labels]
#   A hash of label names and values for categories that will be
#   applied to the data sent from this agent.
#   **Default**: undef
#
#
# === Variables
#
#
# === Examples
#
#  class { nrsysmond:
#    license_key => 14758f1afd44c09b7992073ccf00b43d
#  }
#
# === Authors
#
# Jesse Dearing <jdearing@newrelic.com>
#
# === Copyright
#
# Copyright 2012 New Relic Inc., unless otherwise noted.
#
class nrsysmond (
  $license_key,
  $nrloglevel         = $::nrsysmond::params::loglevel,
  $nrlogfile          = $::nrsysmond::params::logfile,
  $proxy              = undef,
  $ssl                = undef,
  $ssl_ca_bundle      = undef,
  $ssl_ca_path        = undef,
  $nrpidfile          = undef,
  $collector_host     = undef,
  $timeout            = undef,
  $version            = $::nrsysmond::params::version,
  $labels             = undef,
  $disable_nfs        = undef,
  $disable_docker     = undef,
  $cgroup_root        = undef,
  $ignore_reclaimable = undef
) inherits nrsysmond::params {
  case $::osfamily {
    'RedHat': {
      include nrsysmond::repo::redhat
    }
    'Debian': {
      include nrsysmond::repo::debian
    }
    default: {
      fail("The osfamily '${::osfamily}' is currently not supported")
    }
  }

  $osfam_req = $::osfamily ? {
    'RedHat' => Class['nrsysmond::repo::redhat'],
    'Debian' => Class['nrsysmond::repo::debian'],
  }

  package { 'newrelic-sysmond':
    ensure  => $version,
    require => $osfam_req,
  }

  class {'nrsysmond::config':
    license_key         => $license_key,
    nrloglevel          => $nrloglevel,
    nrlogfile           => $nrlogfile,
    proxy               => $proxy,
    ssl                 => $ssl,
    ssl_ca_bundle       => $ssl_ca_bundle,
    ssl_ca_path         => $ssl_ca_path,
    nrpidfile           => $nrpidfile,
    collector_host      => $collector_host,
    timeout             => $timeout,
    labels              => $labels,
    disable_nfs         => $disable_nfs,
    disable_docker      => $disable_docker,
    cgroup_root         => $cgroup_root,
    ignore_reclaimable  => $ignore_reclaimable,
    require             => Package['newrelic-sysmond'],
  }

  service { 'newrelic-sysmond':
    ensure    => running,
    enable    => true,
    subscribe => Package['newrelic-sysmond'],
    require   => Class['nrsysmond::config']
  }
}
