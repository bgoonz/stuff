[puppet-sphinx](https://github.com/stankevich/puppet-sphinx)
======

Puppet module for installing and managing Sphinx.

## Usage

### sphinx

Installs and manages Sphinx.

**config_file** — Sphinx configuration file or template.

**cronjob** — Run indexer nightly. Default: true

  class { 'sphinx':
    config_file => 'sphinx/sphinx.conf.erb',
    cronjob     => false,
  }

## Authors

[Sergey Stankevich](https://github.com/stankevich)
