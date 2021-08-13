FROM redhat

MAINTAINER New Relic Crane UI

RUN useradd qa

RUN echo 'root:toor' | chpasswd
RUN echo 'qa:aq' | chpasswd

RUN yum clean all

# currently the upstart RPM does not upgrade cleanly - 20130807
RUN yum --exclude=upstart\* update -y
RUN yum groupinstall -y "Development Tools"
RUN yum install -y libevent-devel
RUN yum install -y openssh-clients openssh-server
RUN yum install -y curl
RUN yum install -y bzip2 bzip2-devel

# Fix /dev/fd
RUN ln -s /proc/self/fd /dev/fd

RUN ssh-keygen -t rsa -N '' -f /etc/ssh/ssh_host_rsa_key
RUN ssh-keygen -t dsa -N '' -f /etc/ssh/ssh_host_dsa_key

RUN mkdir /var/run/sshd

EXPOSE 22

CMD ["/usr/sbin/sshd", "-D"]