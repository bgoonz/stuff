#!/bin/sh

RBENV_ROOT='/home/qa/.rbenvroot'

# Install rbenv
git clone https://github.com/sstephenson/rbenv.git $RBENV_ROOT
echo '
if [[ ! -d "${HOME}/.rbenv"  ]]; then
   export RBENV_ROOT=/home/qa/.rbenvroot
   export PATH="$RBENV_ROOT/bin:$PATH"
   eval "$(rbenv init -)"
fi' > /etc/profile.d/rbenv.sh
chmod +x /etc/profile.d/rbenv.sh

# install ruby-build
mkdir $RBENV_ROOT/plugins && git clone https://github.com/sstephenson/ruby-build.git $RBENV_ROOT/plugins/ruby-build

# install rbenv-gem-rehash
git clone https://github.com/sstephenson/rbenv-gem-rehash.git $RBENV_ROOT/plugins/rbenv-gem-rehash

export RBENV_ROOT="$RBENV_ROOT"
export PATH="$PATH:$RBENV_ROOT/shims:$RBENV_ROOT/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"

# install ruby
rbenv install -v $1 && rbenv rehash && rbenv global $1

# link gem
ln -s $RBENV_ROOT/versions/$1/bin/gem /usr/local/bin/

# install CORE gems
gem update --system && gem install bundler --no-rdoc --no-ri

gem list

chown -R qa:qa /home/qa/.rbenvroot
echo 'source /etc/profile.d/rbenv.sh' > /home/qa/.bashrc
