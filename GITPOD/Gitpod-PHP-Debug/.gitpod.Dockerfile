FROM gitpod/workspace-full

USER gitpod

RUN sudo apt-get update -q \
    && sudo apt-get install -y php-dev

RUN wget http://xdebug.org/files/xdebug-2.9.1.tgz \
    && tar -xvzf xdebug-2.9.1.tgz \
    && cd xdebug-2.9.1 \
    && phpize \
    && ./configure \
    && make \
    && sudo cp modules/xdebug.so /usr/lib/php/20170718 \
    && sudo bash -c "echo -e '\nzend_extension = /usr/lib/php/20170718/xdebug.so\n[XDebug]\nxdebug.remote_enable = 1\nxdebug.remote_autostart = 1\n' >> /etc/php/7.2/cli/php.ini"