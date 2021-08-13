FROM ubuntu:focal

USER root

RUN apt-get update && \
    apt-get install -y curl gnupg2 software-properties-common unzip zip sudo make jq

### cloud_sql_proxy ###
ARG CLOUD_SQL_PROXY=/usr/local/bin/cloud_sql_proxy
RUN curl -fsSL https://dl.google.com/cloudsql/cloud_sql_proxy.linux.amd64 > $CLOUD_SQL_PROXY \
    && chmod +x $CLOUD_SQL_PROXY

### Docker client ###
RUN curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add - \
    # 'cosmic' not supported
    && add-apt-repository -yu "deb [arch=amd64] https://download.docker.com/linux/ubuntu bionic stable" \
    && apt-get install -yq docker-ce-cli=5:18.09.0~3-0~ubuntu-bionic \
    && apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/*

### Helm ###
RUN curl -fsSL https://get.helm.sh/helm-v3.2.4-linux-amd64.tar.gz \
    | tar -xzvC /usr/local/bin --strip-components=1 \
    && helm completion bash > /usr/share/bash-completion/completions/helm

### kubernetes ###
# https://github.com/kubernetes/kubernetes/releases/
RUN mkdir -p /usr/local/kubernetes/ && \
    curl -fsSL https://github.com/kubernetes/kubernetes/releases/download/v1.18.6/kubernetes.tar.gz \ 
    | tar -xzvC /usr/local/kubernetes/ --strip-components=1 && \
    KUBERNETES_SKIP_CONFIRM=true /usr/local/kubernetes/cluster/get-kube-binaries.sh
ENV PATH=$PATH:/usr/local/kubernetes/cluster/:/usr/local/kubernetes/client/bin/

## terraform, packer
# https://releases.hashicorp.com/terraform/
RUN curl -fsSL https://apt.releases.hashicorp.com/gpg | apt-key add - && \
    apt-add-repository "deb [arch=$(dpkg --print-architecture)] https://apt.releases.hashicorp.com $(lsb_release -cs) main" && \
    apt-get update && apt-get install -y terraform packer

RUN curl -o /usr/bin/kubectx https://raw.githubusercontent.com/ahmetb/kubectx/master/kubectx && chmod +x /usr/bin/kubectx \
 && curl -o /usr/bin/kubens  https://raw.githubusercontent.com/ahmetb/kubectx/master/kubens  && chmod +x /usr/bin/kubens

### MySQL client ###
RUN apt-get update && apt-get install -yq \
    mysql-client  \
    && apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/*

# yq - jq for YAML files
RUN cd /usr/bin && curl -L https://github.com/mikefarah/yq/releases/download/2.4.0/yq_linux_amd64 > yq && chmod +x yq

### Certbot
RUN apt-get update \
    && apt-get install -yq certbot python3-certbot-dns-google \
    && apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/*

### Argo CD CLI
# https://argo-cd.readthedocs.io/en/stable/cli_installation/
RUN VERSION=$(curl --silent "https://api.github.com/repos/argoproj/argo-cd/releases/latest" | grep '"tag_name"' | sed -E 's/.*"([^"]+)".*/\1/') && \
    curl -sSL -o /usr/local/bin/argocd https://github.com/argoproj/argo-cd/releases/download/$VERSION/argocd-linux-amd64 && \
    chmod +x /usr/local/bin/argocd

### Google Cloud ###
# https://cloud.google.com/sdk/docs/downloads-versioned-archives
ARG GCS_DIR=/opt/google-cloud-sdk
ENV PATH=$GCS_DIR/bin:$PATH
RUN mkdir $GCS_DIR \
    && curl -fsSL https://dl.google.com/dl/cloudsdk/channels/rapid/downloads/google-cloud-sdk-303.0.0-linux-x86_64.tar.gz \
    | tar -xzvC /opt \
    && /opt/google-cloud-sdk/install.sh --quiet --usage-reporting=false --bash-completion=true \
    --additional-components alpha beta
    
