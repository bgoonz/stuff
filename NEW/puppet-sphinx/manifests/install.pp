class sphinx::install {
  case $operatingsystem {
    Ubuntu,Debian: { package { 'sphinxsearch': ensure => present } }
    RedHat,CentOS: { package { 'sphinx': ensure => present } }
  }
}
