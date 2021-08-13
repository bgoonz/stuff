{% extends "interpreter/interpreter.tpl" %}

{%- block dependencies %}
{%- if os in ['debian', 'ubuntu']%}
RUN apt-get update > /dev/null
RUN apt-get install -y libyaml-dev libffi-dev libsqlite3-dev libreadline-gplv2-dev libncurses5-dev zlib1g-dev libbz2-dev libssl-dev libgdbm-dev libsasl2-dev 
{%- elif os in ['redhat', 'centos']%}
RUN yum update > /dev/null
RUN yum install -y gcc-c++ patch readline readline-devel zlib zlib-devel libyaml-devel libffi-devel openssl-devel make bzip2 autoconf automake libtool bison psiconv-devel git-core
{%- endif %}
{% endblock%}

{%- block packages %}
# setup environment
ENV RBENV_ROOT /usr/local/rbenv
ENV PATH /usr/local/rbenv/shims:/usr/local/rbenv/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
{%- endblock -%}
