# = Class: nrsysmond::repo::redhat
#
# Installs NewRelic Yum repository via an exec of /bin/rpm
#
class nrsysmond::repo::redhat (
  $rpm_repo_location = $::nrsysmond::params::rpm_repo_location,
) inherits nrsysmond::params {
  exec { 'install repo':
    command => "/bin/rpm -Uvh ${rpm_repo_location}",
    creates => '/etc/yum.repos.d/newrelic.repo',
  }
}
