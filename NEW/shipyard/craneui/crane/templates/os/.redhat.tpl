{% extends "os/os.tpl" %}

{% block dependencies %}
RUN yum clean all

# currently the upstart RPM does not upgrade cleanly - 20130807
RUN yum --exclude=upstart\* update -y
RUN yum groupinstall -y "Development Tools"
# FIXME : to many lines : must match the 42 layers ...
RUN yum install -y libevent-devel
RUN yum install -y openssh-clients openssh-server
RUN yum install -y curl
RUN yum install -y bzip2 bzip2-devel
RUN yum install -y siege
#RUN yum install -y vim

# Fix /dev/fd
RUN ln -s /proc/self/fd /dev/fd

RUN ssh-keygen -t rsa -N '' -f /etc/ssh/ssh_host_rsa_key
RUN ssh-keygen -t dsa -N '' -f /etc/ssh/ssh_host_dsa_key
{% endblock %}
