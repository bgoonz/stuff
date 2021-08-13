---
section: self-hosted/latest
title: Install Gitpod Self-Hosted on Google Kubernetes Engine (GKE)
---

<script context="module">
  export const prerender = true;
</script>

# Install Gitpod Self-Hosted on Google Kubernetes Engine (GKE)

Installation instructions for Gitpod Self-Hosted on Google Kubernetes Engine are currently located in the [gitpod-io/gitpod-gke-guide](https://github.com/gitpod-io/gitpod-gke-guide) repository on GitHub. The installation process takes around twenty minutes. In the end, the following resources are created:

- A GKE cluster running Kubernetes v1.21 ([rapid channel](https://cloud.google.com/kubernetes-engine/docs/release-notes-rapid).
- GCP L4 load balancer.
- Cloud SQL - Mysql database.
- Cloud DNS zone.
- In-cluster docker registry using [Cloud Storage](https://cloud.google.com/storage) as storage backend.
- Installation of [calico](https://docs.projectcalico.org) as CNI and NetworkPolicy implementation
- Installation of [cert-manager](https://cert-manager.io/) for self-signed SSL certificates
- Installation of a [Jaeger operator](https://github.com/jaegertracing/helm-charts/tree/main/charts/jaeger-operator) and Jaeger deployment for gitpod distributed tracing
- A [gitpod.io](https://github.com/gitpod-io/gitpod) deployment
