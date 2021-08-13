---
section: self-hosted/latest
title: Install Gitpod Self-Hosted on Amazon Elastic Kubernetes Service (EKS)
---

<script context="module">
  export const prerender = true;
</script>

# Install Gitpod Self-Hosted on Amazon Elastic Kubernetes Service (EKS)

Installation instructions for Gitpod Self-Hosted on Amazon EKS are currently located in the [gitpod-io/gitpod-eks-guide](https://github.com/gitpod-io/gitpod-eks-guide) repository on GitHub. The installation process takes around forty minutes. In the end, the following resources are created:

- An Amazon EKS cluster running Kubernetes v1.20
- Kubernetes nodes using a custom [AMI image](https://github.com/gitpod-io/amazon-eks-custom-amis/tree/gitpod):

  - Ubuntu 20.04
  - Linux kernel v5.12
  - containerd v1.54
  - runc: v1.0.1
  - CNI plugins: v0.9.1
  - Stargz Snapshotter: v0.7.0

- ALB load balancer with TLS termination and re-encryption
- RDS Mysql database
- Two autoscaling groups, one for gitpod components and another for workspaces
- In-cluster docker registry using S3 as storage backend
- IAM account with S3 access (docker-registry and gitpod user content)
- Installation of [calico](https://docs.projectcalico.org) as CNI and NetworkPolicy implementation
- Installation of [cert-manager](https://cert-manager.io/) for self-signed SSL certificates
- Installation of [cluster-autoscaler](https://github.com/kubernetes/autoscaler/tree/master/cluster-autoscaler)
- Installation of a [Jaeger operator](https://github.com/jaegertracing/helm-charts/tree/main/charts/jaeger-operator) and Jaeger deployment for gitpod distributed tracing
- Installation of [metrics-server](https://github.com/kubernetes-sigs/metrics-server)
- A [gitpod.io](https://github.com/gitpod-io/gitpod) deployment
