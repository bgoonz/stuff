include nginx

nginx::resource::vhost { 'test.local':
  ensure  => present,
  rewrite => {
    'change /user to /users' => {
      'regex'       => '^/user/(.*)$',
      'replacement' => '/users/$1?',
    },
    'change /users to /show?user=' => {
      'regex'       => '^/users/(.*)$',
      'replacement' => '/show?user=$1?',
      'flag'        => 'last',
    },
  },
}

nginx::resource::vhost { 'test.local:8080':
  ensure      => present,
  listen_port => 8080,
  server_name => 'test.local',
  rewrite     => {
    'remove www' => {
      'regex'       => '^'
      'replacement' => 'http://example.com$request_uri?',
      'flag'        => 'permenant',
    },
  },
}

nginx::resource::location { 'test.local-bob':
  ensure   => present,
  location => '/bob',
  vhost    => 'test.local',
  www_root => '/var/www/bob',
}

