{% extends "os/os.tpl" %}

{% block dependencies %}
RUN apt-get update
RUN apt-get install -y build-essential libevent-dev openssh-server curl patch bzip2 libbz2-dev git siege sudo
#RUN apt-get install -y vim

{# Dirty hardcoded installation #}
RUN sudo apt-get install -y mysql-server libmysqlclient-dev sqlite3 libsqlite3-dev
{% endblock %}
