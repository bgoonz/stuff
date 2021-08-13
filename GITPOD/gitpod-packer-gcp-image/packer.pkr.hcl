variable "image_name" {
  type    = string
  default = "var"
}

variable "project_id" {
  type    = string
  default = "var"
}

variable "source_image" {
  type    = string
  default = "var"
}

variable "zone" {
  type    = string
  default = "var"
}

# "timestamp" template function replacement
locals { timestamp = regex_replace(timestamp(), "[- TZ:]", "") }

source "googlecompute" "build_image" {
  image_labels = {
    ubuntu     = "21_04"
    kernel     = "v5_12_5"
    containerd = "v1_5_2"
    k3s        = "v1_21_1"
  }
  disk_size      = 50
  image_name     = "${var.image_name}"
  machine_type   = "f1-micro"
  project_id     = "${var.project_id}"
  source_image   = "${var.source_image}"
  ssh_username   = "packer"
  zone           = "${var.zone}"
  # enable Nested Hypervisor
  image_licenses = ["projects/vm-options/global/licenses/enable-vmx"]
  image_storage_locations = ["us"]
}

build {
  sources = ["source.googlecompute.build_image"]

  provisioner "file" {
    source      = "${path.root}/limits.conf"
    destination = "/tmp/limits.conf"
  }

  provisioner "file" {
    source      = "${path.root}/sysctl.conf"
    destination = "/tmp/sysctl-k8s.conf"
  }

  provisioner "file" {
    source      = "${path.root}/stargz-snapshotter.service"
    destination = "/tmp/stargz-snapshotter.service"
  }

  provisioner "file" {
    source      = "${path.root}/containerd.toml"
    destination = "/tmp/containerd.toml"
  }

  provisioner "file" {
    source      = "${path.root}/setup.sh"
    destination = "/tmp/setup.sh"
  }

  provisioner "file" {
    source      = "${path.root}/rc.local"
    destination = "/tmp/rc.local"
  }

  provisioner "file" {
    source      = "${path.root}/rc-local.service"
    destination = "/tmp/rc-local.service"
  }

  provisioner "shell" {
    inline = [
      "chmod +x /tmp/setup.sh",
      "sudo bash -c /tmp/setup.sh"
    ]
  }
}
