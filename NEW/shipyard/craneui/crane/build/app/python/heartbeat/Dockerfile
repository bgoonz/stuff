FROM docker.pdx.vm.datanerd.us/ubuntu/python3.3.2

ADD . /home/qa/website
ADD heartbeat.tar.gz /home/qa/website

RUN chmod 755 /home/qa/website/buildapp.sh
RUN ls -l /home/qa/website
RUN chown -R qa:qa /home/qa/

# FIXME : sudo
#RUN sudo -u qa /home/qa/website/buildapp.sh
RUN /home/qa/website/buildapp.sh

RUN mv /home/qa/website/launch.sh /home/qa/website/heartbeat
RUN chmod 755 /home/qa/website/heartbeat/launch.sh

EXPOSE 3000

CMD /home/qa/website/heartbeat/launch.sh