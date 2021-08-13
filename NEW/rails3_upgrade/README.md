# Hey Rails developers!

Julian Giuca ([@juliangiuca](https://github.com/juliangiuca)) and Andrew Bloomgarden ([@aughr](https://github.com/aughr)) spoke at RailsConf 2013 about how New Relic upgraded to Rails 3 on master. These files were extracted from that work to help you make that same move.

As soon as the talk video is out, we'll link it here. In the meantime, we've
put [the slides on
SpeakerDeck](https://speakerdeck.com/aughr/upgrading-to-rails-3-on-an-active-master-branch).

## Bundler patch

We add a new method to the Bundler DSL to let you switch which lockfile you're
using.

* [lib/bundler/lockfile_dsl.rb](lib/bundler/lockfile_dsl.rb)

## Boot sequence

We then patch the boot sequence to work under Rails 2 and Rails 3.

* [config/boot.rb](config/boot.rb)
* [config/application.rb](config/application.rb)
* [config/environment.rb](config/environment.rb)

## Environment-specific config

We have a sample file showing how config can work in both Rails 2 and Rails 3.

* [config/environments/development.rb](config/environments/development.rb)

## Running a server

Finally, you probably want to start a server. This makes it easy.

* [script/server3](script/server3)
* [config\_rails3.ru](config_rails3.ru)
