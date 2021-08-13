{% extends "interpreter/interpreter.tpl" %}
{%- block dependencies %}
{%- if os in ['debian', 'ubuntu']%}
RUN apt-get update > /dev/null
RUN apt-get install -y build-essential libsqlite3-dev libreadline-gplv2-dev libncurses5-dev zlib1g-dev libbz2-dev libssl-dev libgdbm-dev libsasl2-dev 
{%- elif os in ['redhat', 'centos']%}
RUN yum update > /dev/null
RUN yum install -y gcc-c++ patch readline readline-devel zlib zlib-devel libyaml-devel libffi-devel openssl-devel make autoconf automake libtool bison git-core
{%- endif %}
{% endblock%}

{% block packages -%}
{%- if version.startswith('3') %}
RUN ln -s /usr/local/bin/python3 /usr/local/bin/python
{% endif %}
RUN wget https://bitbucket.org/pypa/setuptools/raw/bootstrap/ez_setup.py -O - | python
RUN easy_install pip
RUN pip install virtualenv
RUN pip install virtualenvwrapper
{%- endblock %}
