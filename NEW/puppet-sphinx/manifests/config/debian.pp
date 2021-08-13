class sphinx::config::debian {

  Exec['sphinx_enable'] -> File['/etc/sphinxsearch/sphinx.conf'] -> Service['sphinxsearch']
  File['/etc/sphinxsearch/sphinx.conf'] ~> Service['sphinxsearch']

  exec { 'sphinx_enable':
    command => 'sed -i "s/START=no/START=yes/g" /etc/default/sphinxsearch',
    unless  => 'grep -q "START=yes" /etc/default/sphinxsearch',
  }

  file { '/etc/sphinxsearch/sphinx.conf':
    ensure => present,
    mode   => '0644',
    owner  => 'root',
    group  => 'root',
  }

  if $sphinx::config_file =~ /^puppet:\/\// {
    File['/etc/sphinxsearch/sphinx.conf'] {
      source => $sphinx::config_file,
    }
  } else {
    File['/etc/sphinxsearch/sphinx.conf'] {
      content => template($sphinx::config_file),
    }
  }

  service { 'sphinxsearch':
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
