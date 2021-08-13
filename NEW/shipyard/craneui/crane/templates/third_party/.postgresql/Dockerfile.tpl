{% extends 'third_party/third_party.tpl' %}

{% block configuration %}
RUN adduser postgres
{% endblock%}

{% block debian %}
RUN apt-get install -y postgresql
{% endblock%}

{% block redhat %}
{% endblock%}
