[![Archived header](https://github.com/newrelic/open-source-office/raw/master/examples/categories/images/Archived.png)](https://github.com/newrelic/open-source-office/blob/master/examples/categories/index.md#archived)

puppet-nrsysmond
================

Puppet module to install the New Relic Server Monitor

## Usage

Easiest way to use this module is to call the nrsysmond parameterized class from
your modules.

```puppet
  class { 'nrsysmond':
    license_key    => '0123456789abcdef0123456789abcdef01234567',
  }
```

## Reference

See the [Nrsysmond class](https://github.com/newrelic/puppet-nrsysmond/blob/master/manifests/init.pp)
for a reference for all the parameters.
