Puppet module for managing Cobbler
==================================

puppet-cobbler is a Puppet module used to deploy and manage Cobbler
installation(s).

Cobbler is a Linux installation server that allows for rapid setup of
network installation environments. It glues together and automates many
associated Linux tasks so you do not have to hop between lots of
various commands and applications when rolling out new systems, and, in
some cases, changing existing ones.

Puppet is an open source configuration management tool written in Ruby.


Basic usage
-----------

To install Cobbler:

    include cobbler

To add cobbler web management:

    include cobbler::web


Distros, repos, profiles and systems
------------------------------------

You can easily add distros to your Cobbler installation just by specifying
download link of ISO image and distro name:

    cobbler::add_distro { 'CentOS-6.3-x86_64':
      arch    => 'x86_64',
      isolink => 'http://mi.mirror.garr.it/mirrors/CentOS/6.3/isos/x86_64/CentOS-6.3-x86_64-bin-DVD1.iso',
    }

If you want to use 'cobbler import', you can add a distro other way:

    cobblerdistro { 'SL-6.4-x86_64':
      ensure  => present,
      path    => '/distro/SL64/x86_64/os',
      ks_meta => {
       'tree' => 'http://repos.theory.phys.ucl.ac.uk/mirrors/SL/6.4/x86_64/os',
      },
    }

ks_meta's parameter's 'tree' value is used as '--available-as' option.

Repos example:

    cobblerrepo { 'PuppetLabs-6-x86_64-deps':
      ensure         => present,
      arch           => 'x86_64',
      mirror         => 'http://yum.puppetlabs.com/el/6/dependencies/x86_64',
      mirror_locally => false,
      priority       => 99,
      require        => [ Service[$cobbler::service_name], Service[$cobbler::apache_service] ],
    }

Profile example:

    cobblerprofile { 'CentOS-6.3-x86_64':
      ensure      => present,
      distro      => 'CentOS-6.3-x86_64',
      nameservers => $cobbler::nameservers,
      repos       => ['PuppetLabs-6-x86_64-deps', 'PuppetLabs-6-x86_64-products' ],
      kickstart   => '/somepath/kickstarts/CentOS-6.3-x86_64-static.ks',
    }

And finally, system:

    cobblersystem { 'somehost':
      ensure     => present,
      profile    => 'CentOS-6.3-x86_64',
      interfaces => { 'eth0' => {
                        mac_address      => 'AA:BB:CC:DD:EE:F0',
                        interface_type   => 'bond_slave',
                        interface_master => 'bond0',
                        static           => true,
                        management       => true,
                      },
                      'eth1' => {
                        mac_address      => 'AA:BB:CC:DD:EE:F1',
                        interface_type   => 'bond_slave',
                        interface_master => 'bond0',
                        static           => true,
                      },
                      'bond0' => {
                        ip_address     => '192.168.1.210',
                        netmask        => '255.255.255.0',
                        static         => true,
                        interface_type => 'bond',
                        bonding_opts   => 'miimon=300 mode=1 primary=em1',
                      },
      },
      netboot    => true,
      gateway    => '192.168.1.1',
      hostname   => 'somehost.example.com',
      require    => Service[$cobbler::service_name],
    }


Dependencies
------------

Some functionality is dependent on other modules:

- [apache](http://forge.puppetlabs.com/puppetlabs/apache)

Notes
-----


Contributors
------------

 * currently none

Copyright and License
---------------------

Copyright (C) 2012 Jakov Sosic <jsosic@gmail.com>

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
