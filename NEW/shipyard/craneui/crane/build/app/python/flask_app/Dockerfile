FROM 127.0.0.1/ubuntu/python2.7.5


EXPOSE 3306

ADD . /home/qa/website

ADD flask_app.tar.gz /home/qa/website


RUN mkdir /home/qa/databases && chown -R qa:qa /home/qa/ && chmod 755 /home/qa/website/sql_launcher.sh && /home/qa/website/sql_launcher.sh && chmod 755 /home/qa/website/buildapp.sh && sudo -u qa /home/qa/website/buildapp.sh

RUN mv /home/qa/website/launch.sh /home/qa/website/flask_app && chmod 755 /home/qa/website/flask_app/launch.sh
RUN mv /home/qa/website/launcher.sh /home/qa/website/flask_app && chmod 755 /home/qa/website/flask_app/launcher.sh

EXPOSE 5000

#VOLUME '/home/qa/databases'

CMD /home/qa/website/flask_app/launcher.sh