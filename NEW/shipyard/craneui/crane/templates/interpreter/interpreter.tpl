FROM {{repository}}/{{os}}

ADD . /install
RUN chmod 755 /install/install.sh
{% block dependencies %}
{% endblock %}
RUN /install/install.sh {{version}}
{% block packages %}
{% endblock%}
