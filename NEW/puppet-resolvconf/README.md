# puppet-resolvconf

## Usage

```puppet
# Prefer hitting a local resolver
resolvconf::nameserver { '127.0.0.1':
  priority => '0',
}

# Fallback to the network resolvers
resolvconf::nameserver { ['10.0.0.1', '10.0.0.2']: }

# Set the resolve timeout to 1s
resolvconf::option { 'timeout':
  value => '1',
}

resolvconf::search {
  'foo.test.com':
    priority => '0';
  'bar.test.com':
    priority => '1';
  'baz.test.com':
    priority => '2';
  'test.com': ;
}
```

## Things i'd still like to fix

Having to manually specify priorities is kinda nasty.  A better approach might
be to change some of these to native types and pass values through as an array
to specify the order in a more natural way.
