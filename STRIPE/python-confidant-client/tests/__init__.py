# Make the tests directory a python module
# so that all unit tests are reported as part of the tests package.

from __future__ import absolute_import
import os

# Inject mandatory environment variables
env_settings = [
    ('AWS_DEFAULT_REGION', 'us-east-1'),
    ('DEBUG', 'true')
]

for env_setting in env_settings:
    os.environ[env_setting[0]] = os.getenv(env_setting[0], env_setting[1])
