include nginx

nginx::resource::vhost { 'test3.local':
  ensure   => present,
  www_root => '/var/www/nginx-default',
}

nginx::resource::location { 'test3.local-errors':
  ensure   => present,
  www_root => '/var/www/errors',
  location => '/errors',
  vhost    => 'test3.local',
}

nginx::resource::location { 'test3.local-noerrors':
  ensure                 => present,
  www_root               => '/var/www/errors',
  location               => '/errors',
  vhost                  => 'test3.local',
  proxy                  => 'http://proxypass',
  proxy_intercept_errors => 'off',
}
