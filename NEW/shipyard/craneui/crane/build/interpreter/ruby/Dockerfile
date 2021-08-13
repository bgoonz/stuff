FROM 127.0.0.1/ubuntu

ADD . /install
RUN chmod 755 /install/install.sh

RUN apt-get update > /dev/null
RUN apt-get install -y libyaml-dev libffi-dev libsqlite3-dev libreadline-gplv2-dev libncurses5-dev zlib1g-dev libbz2-dev libssl-dev libgdbm-dev libsasl2-dev

RUN /install/install.sh 1.9.3-p392

# setup environment
ENV RBENV_ROOT /usr/local/rbenv
ENV PATH /usr/local/rbenv/shims:/usr/local/rbenv/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin