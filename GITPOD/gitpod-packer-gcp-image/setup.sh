#!/bin/bash

set -e
set -x
export DEBIAN_FRONTEND=noninteractive

# Copy files
cp /tmp/limits.conf                 /etc/security/limits.conf
cp /tmp/sysctl-k8s.conf             /etc/sysctl.d/k8s.conf
cp /tmp/stargz-snapshotter.service  /etc/systemd/system/stargz-snapshotter.service
cp /tmp/rc.local                    /etc/rc.local
cp /tmp/rc-local.service            /etc/systemd/system/rc-local.service

# fix permissions
chmod +x /etc/rc.local

# Enable stargz-snapshotter plugin
mkdir -p /etc/containerd/
cp /tmp/containerd.toml             /etc/containerd/config.toml

# Update OS
apt update && apt dist-upgrade -y

# Install required packages
apt --no-install-recommends install -y \
  apt-transport-https ca-certificates curl gnupg2 software-properties-common \
  iptables libseccomp2 socat conntrack ipset \
  fuse \
  jq \
  awscli \
  iproute2 \
  auditd \
  ethtool \
  google-compute-engine google-osconfig-agent

# Enable modules
cat <<EOF > /etc/modules-load.d/k8s.conf
br_netfilter
overlay
fuse
EOF

# Disable modules
cat <<EOF > /etc/modprobe.d/kubernetes-blacklist.conf
blacklist dccp
blacklist sctp
EOF

# Install linux kernel 5.12
curl -sSL -o linux-headers.deb        https://kernel.ubuntu.com/~kernel-ppa/mainline/v5.12.5/amd64/linux-headers-5.12.5-051205-generic_5.12.5-051205.202105190541_amd64.deb
curl -sSL -o linux-headers_all.deb    https://kernel.ubuntu.com/~kernel-ppa/mainline/v5.12.5/amd64/linux-headers-5.12.5-051205_5.12.5-051205.202105190541_all.deb
curl -sSL -o linux-image-unsigned.deb https://kernel.ubuntu.com/~kernel-ppa/mainline/v5.12.5/amd64/linux-image-unsigned-5.12.5-051205-generic_5.12.5-051205.202105190541_amd64.deb
curl -sSL -o linux-modules.deb        https://kernel.ubuntu.com/~kernel-ppa/mainline/v5.12.5/amd64/linux-modules-5.12.5-051205-generic_5.12.5-051205.202105190541_amd64.deb
dpkg --force-all -i ./*.deb
rm ./*.deb

# Configure grub
echo "GRUB_GFXPAYLOAD_LINUX=keep" >> /etc/default/grub
# Enable cgroups2
sed -i 's/GRUB_CMDLINE_LINUX="\(.*\)"/GRUB_CMDLINE_LINUX="systemd.unified_cgroup_hierarchy=1 cgroup_no_v1=all \1"/g' /etc/default/grub
update-grub2

# Install containerd
curl -sSL https://github.com/containerd/containerd/releases/download/v1.5.2/cri-containerd-cni-1.5.2-linux-amd64.tar.gz -o - | tar -xz -C /
# remove default containerd cni
rm -f /etc/cni/net.d/10-containerd-net.conflist

# Install stargz-snapshotter plugin
curl -sSL https://github.com/containerd/stargz-snapshotter/releases/download/v0.6.1/stargz-snapshotter-v0.6.1-linux-amd64.tar.gz -o - | tar -xz -C /usr/local/bin

# configure stargz-snapshotter plugin
mkdir -p /etc/containerd-stargz-grpc
touch /etc/containerd-stargz-grpc/config.toml

# Disable software irqbalance service
systemctl stop irqbalance.service     || true
systemctl disable irqbalance.service  || true

# Reload systemd
systemctl daemon-reload

# Start containerd and stargz
systemctl enable containerd
systemctl enable stargz-snapshotter

echo "-a never,task" > /etc/audit/rules.d/disable-syscall-auditing.rules
augenrules --load

# Install helm
curl -fsSL https://get.helm.sh/helm-v3.5.2-linux-amd64.tar.gz -o - | tar -xzvC /tmp/ --strip-components=1
cp /tmp/helm /usr/local/bin/helm

# Install calicoctl
curl -sSL  https://github.com/projectcalico/calicoctl/releases/download/v3.19.1/calicoctl -o /usr/local/bin/calicoctl
chmod +x /usr/local/bin/calicoctl

# Install flux toolkit
curl -sSL https://toolkit.fluxcd.io/install.sh | bash

# Download k3s tar file to improve initial start time and remove dependency of Internet connection
mkdir -p /var/lib/rancher/k3s/agent/images/
curl -sSL "https://github.com/k3s-io/k3s/releases/download/v1.21.1%2Bk3s1/k3s-airgap-images-amd64.tar" \
  -o /var/lib/rancher/k3s/agent/images/k3s-airgap-images-amd64.tar

# Download k3s binary
curl -sSL "https://github.com/k3s-io/k3s/releases/download/v1.21.1%2Bk3s1/k3s" -o /usr/local/bin/k3s
chmod +x /usr/local/bin/k3s

# Download k3s install script
curl -sSL https://get.k3s.io/ -o /usr/local/bin/install-k3s.sh
chmod +x /usr/local/bin/install-k3s.sh

# restart services being deferred
systemctl restart unattended-upgrades.service

# cleanup temporal packages
apt-get clean
apt-get autoclean
apt-get autoremove -y

# cleanup journal logs
rm -rf /var/log/journal/*
rm -rf /tmp/*

exit 0
