#!/usr/bin/python -tt
# -*- coding: utf-8 -*-
# Copyright (c) 2013 Spotify AB
#
# Licensed under the Apache License, Version 2.0 (the "License"); you may not
# use this file except in compliance with the License. You may obtain a copy of
# the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
# WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
# License for the specific language governing permissions and limitations under
# the License.


import os.path as op

#Where am I ?
_module_dir = op.dirname(op.realpath(__file__))
_main_dir = op.abspath(op.join(_module_dir, '..'))
_fabric_base_dir = op.join(_main_dir, 'fabric/')

#Certfile locations:
CERTIFICATES_DIR = op.join(_fabric_base_dir, 'sample_cert_dir/')
NONEXISTANT_CERTIFICATES_DIR = op.join(_fabric_base_dir,
                                       'sssample_cert_dir/')
EXPIRED_3_DAYS = op.join(CERTIFICATES_DIR, 'expired_3_days.pem')
EXPIRE_6_DAYS = op.join(CERTIFICATES_DIR, 'expire_6_days.pem')
EXPIRE_21_DAYS = op.join(CERTIFICATES_DIR, 'expire_21_days.pem')
EXPIRE_41_DAYS = op.join(CERTIFICATES_DIR, 'expire_41_days.pem')
EXPIRE_41_DAYS_DER = op.join(CERTIFICATES_DIR, 'expire_41_days.der')
BROKEN_CERT = op.join(CERTIFICATES_DIR, 'broken_certificate.crt')
IGNORED_CERT = op.join(CERTIFICATES_DIR, 'ignored_certificate.crt')
ALL_CERTS_SET = set([EXPIRED_3_DAYS, EXPIRE_6_DAYS, EXPIRE_21_DAYS, EXPIRE_41_DAYS,
                     EXPIRE_41_DAYS_DER, BROKEN_CERT, IGNORED_CERT])

#Configfile location
TEST_CONFIG_FILE = op.join(_fabric_base_dir, 'certcheck.yml')
TEST_MALFORMED_CONFIG_FILE = op.join(_fabric_base_dir, 'malformed.yml')
TEST_NONEXISTANT_CONFIG_FILE = op.join(_fabric_base_dir,
                                       'certcheck.yml.nonexistant')

#Test lockfile location:
TEST_LOCKFILE = op.join(_fabric_base_dir, 'filelock.pid')
