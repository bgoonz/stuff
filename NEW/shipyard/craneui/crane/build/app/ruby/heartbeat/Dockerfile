FROM 127.0.0.1/ubuntu/ruby1.9.3-p194


RUN sudo apt-get install -y mysql-server libmysqlclient-dev sqlite3 libsqlite3-dev

EXPOSE 3306

ADD . /home/qa/website

ADD heartbeat.tar.gz /home/qa/website


RUN mkdir /home/qa/databases && chown -R qa:qa /home/qa/ && chmod 755 /home/qa/website/buildapp.sh && sudo -u qa /home/qa/website/buildapp.sh

RUN mv /home/qa/website/launch.sh /home/qa/website/heartbeat && chmod 755 /home/qa/website/heartbeat/launch.sh
RUN mv /home/qa/website/launcher.sh /home/qa/website/heartbeat && chmod 755 /home/qa/website/heartbeat/launcher.sh

EXPOSE 4567

#VOLUME '/home/qa/databases'

CMD /home/qa/website/heartbeat/launcher.sh