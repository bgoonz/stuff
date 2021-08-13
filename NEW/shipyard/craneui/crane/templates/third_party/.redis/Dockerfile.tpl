{% extends 'third_party/third_party.tpl' %}

{% block debian %}
RUN wget http://download.redis.io/redis-stable.tar.gz
RUN tar xvzf redis-stable.tar.gz
RUN cd redis-stable && make

RUN cd redis-stable && sudo cp src/redis-server /usr/local/bin/
RUN cd redis-stable && sudo cp src/redis-cli /usr/local/bin/
{% endblock%}

{% block redhat %}
RUN wget http://dl.fedoraproject.org/pub/epel/6/x86_64/epel-release-6-8.noarch.rpm
RUN wget http://rpms.famillecollet.com/enterprise/remi-release-6.rpm
RUN rpm -Uvh remi-release-6*.rpm epel-release-6*.rpm"
RUN yum install -y redis
{% endblock%}
