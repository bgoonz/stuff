{% extends 'third_party/third_party.tpl' %}

{% block configuration %}
{% endblock%}

{% block debian %}
RUN sudo apt-get install -y mysql-server
{% endblock%}

{% block redhat %}
{% endblock%}
