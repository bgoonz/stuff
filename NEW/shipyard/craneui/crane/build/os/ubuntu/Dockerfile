FROM ubuntu

MAINTAINER New Relic Crane UI

RUN useradd qa --home /home/qa/ --shell `which bash` --groups sudo
RUN mkdir /home/qa
RUN chown -R qa /home/qa

RUN echo 'root:toor' | chpasswd
RUN echo 'qa:aq' | chpasswd

RUN apt-get update
RUN apt-get install -y build-essential libevent-dev openssh-server curl patch bzip2 libbz2-dev git siege sudo
#RUN apt-get install -y vim


RUN sudo apt-get install -y mysql-server libmysqlclient-dev sqlite3 libsqlite3-dev

RUN mkdir /var/run/sshd

EXPOSE 22

RUN echo $BUILD

CMD ["/usr/sbin/sshd", "-D"]