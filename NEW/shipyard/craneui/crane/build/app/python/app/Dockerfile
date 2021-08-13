FROM docker.pdx.vm.datanerd.us/ubuntu/python2.7.5

ADD . /home/qa/website
ADD app.tar.gz /home/qa/website

RUN chmod 755 /home/qa/website/buildapp.sh
RUN ls -l /home/qa/website
RUN chown -R qa:qa /home/qa/

# FIXME : sudo
#RUN sudo -u qa /home/qa/website/buildapp.sh
RUN /home/qa/website/buildapp.sh

RUN mv /home/qa/website/launch.sh /home/qa/website/app
RUN chmod 755 /home/qa/website/app/launch.sh

EXPOSE 5000

CMD /home/qa/website/app/launch.sh