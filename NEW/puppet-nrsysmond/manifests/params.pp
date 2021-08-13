# = Class: nrsysmond::params
#
# Provides default parameter values for nrsysmond
#
class nrsysmond::params {
  case $::osfamily {
    'RedHat': {
      if $::hardwaremodel == 'x86_64' {
        $rpm_repo_location = 'https://yum.newrelic.com/pub/newrelic/el5/x86_64/newrelic-repo-5-3.noarch.rpm'
      } else {
        $rpm_repo_location = 'https://yum.newrelic.com/pub/newrelic/el5/i386/newrelic-repo-5-3.noarch.rpm'
      }
    }
    'Debian': {
      $apt_repo = 'https://apt.newrelic.com/debian/'
    }
    default: {
      fail("ERROR: nrsysmond is not supported on osfamily ${::osfamily}")
    }
  }
  $version  = 'latest'
  $loglevel = 'error'
  $logfile  = '/var/log/newrelic/nrsysmond.log'
}
