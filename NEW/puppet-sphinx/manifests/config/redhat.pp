class sphinx::config::redhat {

  File['/etc/sphinx/sphinx.conf'] -> Service['searchd']

  file { '/etc/sphinx/sphinx.conf':
    ensure => present,
    mode   => '0644',
    owner  => 'root',
    group  => 'root',
  }

  if $sphinx::config_file =~ /^puppet:\/\// {
    File['/etc/sphinx/sphinx.conf'] {
      source => $sphinx::config_file,
    }
  } else {
    File['/etc/sphinx/sphinx.conf'] {
      content => template($sphinx::config_file),
    }
  }

  service { 'searchd':
    ensure     => running,
    enable     => true,
    hasrestart => true,
    hasstatus  => true,
  }

  if $sphinx::cronjob {
    cron { 'sphinx_indexer':
      ensure  => present,
      command => 'indexer --all --rotate > /dev/null',
      user    => 'root',
      hour    => '5',
      minute  => '0',
    }
  }

}