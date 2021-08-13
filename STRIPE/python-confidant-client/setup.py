# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
# implied.
# See the License for the specific language governing permissions and
# limitations under the License.

from __future__ import absolute_import

from setuptools import setup, find_packages


setup(
    name="confidant-client",
    version="2.0.0",
    packages=find_packages(exclude=["test*"]),
    install_requires=[
        # Boto3 is the Amazon Web Services (AWS) Software Development Kit (SDK)
        # for Python.
        # License: Apache2
        # Upstream url: https://github.com/boto/boto3
        # Use: For KMS
        'boto3>=1.2.6,<2.0.0',

        # cryptography is a package which provides cryptographic recipes and
        # primitives to Python developers.
        # License: BSD
        # Upstream url: https://github.com/pyca/cryptography
        # Use: For encryption
        'cryptography>=1.2.1,<3.0.0',

        # Python HTTP for Humans.
        # License: Apache2
        # Upstream url: http://python-requests.org
        # Use: REST calls to external services
        'requests>=2.9.1,<3.0.0',

        # A python library for reusing KMS for your own authentication and
        # authorization.
        # Licence: Apache2
        # Upstream url: https://github.com/lyft/python-kmsauth
        # Use: client authentication to confidant
        'kmsauth>=0.3.0,<1.0.0',

        # License: MIT
        # Upstream url: http://pyyaml.org/wiki/PyYAML
        # Use: For parsing users.yaml
        'PyYAML>=3.11',

        # License: BSD
        # Upstream url: http://jinja.pocoo.org/
        # Use: For generating templated output files from Confidant secrets
        'jinja2>=2.8',

        # License: MIT
        # Upstream url: https://github.com/benjaminp/six
        # Use: Python 2/3 compatiability
        'six>=1.10.0',
    ],
    extras_require={
        ':python_version=="2.7"': [
            # Provides enhanced HTTPS support for httplib and urllib2 using
            # PyOpenSSL
            # License: BSD
            # Upstream url: https://github.com/cedadev/ndg_httpsclient/
            # Use: Securing requests for python < 2.7.9.
            'ndg-httpsclient>=0.4.0,<1.0.0',

            # ASN.1 types and codecs
            # License: BSD
            # Upstream url: http://sourceforge.net/projects/pyasn1/
            # Use: Securing requests for python < 2.7.9.
            'pyasn1>=0.1.9,<1.0.0',

            # Python wrapper module around the OpenSSL library
            # License: APL2
            # Upstream url: https://github.com/pyca/pyopenssl
            # Use: Securing requests for python < 2.7.9.
            'pyOpenSSL>=0.15.1,<19.0.0',
        ],
    },
    author="Ryan Lane",
    author_email="rlane@lyft.com",
    description="A client for confidant, a secret management system.",
    license="apache2",
    url="https://github.com/lyft/python-confidant-client",
    entry_points={
        "console_scripts": [
            "confidant = confidant_client.cli:main",
            "confidant-format = confidant_client.formatter:main"
        ],
    },
    classifiers=[
        'Programming Language :: Python :: 2.7',
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.3',
        'Programming Language :: Python :: 3.4',
        'Programming Language :: Python :: 3.5',
        'Programming Language :: Python :: 3.6',
        'Programming Language :: Python :: 3.7',
        'Programming Language :: Python :: 3.8',
    ],
)
