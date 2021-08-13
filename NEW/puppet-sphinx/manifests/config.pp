class sphinx::config {
  case $operatingsystem {
    Ubuntu,Debian: { include sphinx::config::debian }
    RedHat,CentOS: { include sphinx::config::redhat }
    default: { fail("Module is not compatible with ${::operatingsystem}") }
  }
}