FROM {{repository}}/{{os}}

MAINTAINER New Relic Crane UI

ADD . /
RUN chmod 755 /launch.sh
RUN mkdir /home/qa/databases
RUN chmod 777 /home/qa/databases

{% block configuration %}{%endblock%}

{%- if os in ['debian', 'ubuntu']%}
{% block debian %}{%endblock%}
{%- elif os in ['redhat', 'centos']%}
{% block redhat %}{%endblock%}
{%- endif %}

EXPOSE {{port}}

#VOLUME {{volume}}

CMD /launch.sh
