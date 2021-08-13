class { 'sphinx':
  config_file => 'sphinx/sphinx.conf.erb',
  cronjob     => false,
}
