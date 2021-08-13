FROM docker-staging.pdx.vm.datanerd.us/ubuntu

ADD . /install
RUN chmod 755 /install/install.sh

RUN apt-get update > /dev/null
RUN apt-get install -y build-essential libsqlite3-dev libreadline-gplv2-dev libncurses5-dev zlib1g-dev libbz2-dev libssl-dev libgdbm-dev libsasl2-dev

RUN /install/install.sh 2.7.5

RUN wget https://bitbucket.org/pypa/setuptools/raw/bootstrap/ez_setup.py -O - | python
RUN easy_install pip
RUN pip install virtualenv
RUN pip install virtualenvwrapper