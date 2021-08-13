"""A client module for Confidant."""

from __future__ import absolute_import
import logging
import json
import base64
import os
import yaml

# Import third party libs
import requests
import boto3
import kmsauth
import six
from cryptography.fernet import Fernet
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util import Retry

import confidant_client.services
from confidant_client.lib import cryptolib

# shut up requests module
logging.getLogger('requests').setLevel(logging.WARNING)
logging.getLogger('urllib3').setLevel(logging.WARNING)

# shut up boto3 and botocore
boto3.set_stream_logger(level=logging.WARNING)
logging.getLogger('botocore').setLevel(logging.WARNING)

VERSION = '2.0.0'
JSON_HEADERS = {'Content-type': 'application/json', 'Accept': 'text/plain'}
TOKEN_SKEW = 3
TIME_FORMAT = "%Y%m%dT%H%M%SZ"


def ensure_bytes(str_or_bytes, encoding='utf-8', errors='strict'):
    """Ensures an input is bytes, encoding if it is a string.
    """
    if isinstance(str_or_bytes, six.text_type):
        return str_or_bytes.encode(encoding, errors)
    return str_or_bytes


class ConfidantClient(object):

    """A class that represents a confidant client."""

    def __init__(
            self,
            url=None,
            auth_key=None,
            auth_context=None,
            token_lifetime=None,
            token_version=None,
            token_cache_file=None,
            assume_role=None,
            mfa_pin=None,
            region=None,
            retries=None,
            backoff=None,
            config_files=None,
            profile=None,
            verify=None
            ):
        """Create a ConfidantClient object.

        Args:
            url: URL of confidant server. Default: None
            auth_key: The KMS key ARN or alias to use for authentication.
                Default: None
            auth_context: The KMS encryption context to use for authentication.
                Default: None
            token_lifetime: Lifetime of the authentication token generated.
                Default: 10
            token_version: The version of the authentication token. Default: 2
            token_cache_file: The location to use for caching the auth token.
                If set to empty string, no cache will be used. Default:
                /dev/shm/confidant/confidant_token
            assume_role: IAM role to assume for getting KMS auth token.
                Default: None
            mfa_pin: pin to use when assuming a role or getting an MFA session.
                Default: None
            region: AWS region to connect to. Default: None.
            retries: Number of retries to use on failed requests. Default: 0
            backoff: Backoff factor for retries. See urllib3's Retry helper.
                Default: 1
            config_files: A list of config files to attempt to load
            configuration from. First file found will be used. Default:
                ['~/.confidant', '/etc/confidant/config']
            profile: profile to read config values from.
            verify:  Whether we verify the servers TLS certificate.
        """
        # Set defaults
        self.config = {
            'url': None,
            'auth_key': None,
            'auth_context': {},
            'token_lifetime': 10,
            'token_version': 2,
            'token_cache_file': '/dev/shm/confidant/confidant_token',
            'assume_role': None,
            'region': None,
            'retries': 0,
            'backoff': 1,
            'verify': True
        }
        if config_files is None:
            config_files = ['~/.confidant', '/etc/confidant/config']
        if profile is None:
            profile = 'default'
        # Override defaults from config file
        self.config.update(self._load_config(config_files, profile))
        # Override config from passed-in args
        args_config = {
            'url': url,
            'auth_key': auth_key,
            'auth_context': auth_context,
            'token_lifetime': token_lifetime,
            'token_version': token_version,
            'token_cache_file': token_cache_file,
            'region': region,
            'backoff': backoff,
            'assume_role': assume_role,
            'verify': verify
        }
        for key, val in args_config.items():
            if val is not None:
                self.config[key] = val
        # Use session to re-try failed requests.
        self.request_session = requests.Session()
        self.request_session.verify = self.config['verify']
        for proto in ['http://', 'https://']:
            self.request_session.mount(
                proto,
                HTTPAdapter(
                    max_retries=Retry(
                        total=self.config['retries'],
                        status_forcelist=[500, 503],
                        backoff_factor=self.config['backoff']
                    )
                )
            )
        self.iam_client = confidant_client.services.get_boto_client(
            'iam',
            region=self.config['region']
        )
        self._load_user_auth_context()
        self._validate_client()
        self.sts_client = confidant_client.services.get_boto_client(
            'sts',
            region=self.config['region']
        )
        self.kms_client = confidant_client.services.get_boto_client(
            'kms',
            region=self.config['region']
        )
        if self.config['assume_role']:
            self.aws_creds = self._get_assume_role_creds(
                self.config['assume_role'],
                mfa_pin
            )
        elif mfa_pin:
            self.aws_creds = self._get_mfa_creds(mfa_pin)
        else:
            self.aws_creds = None
        try:
            self.generator = kmsauth.KMSTokenGenerator(
                self.config['auth_key'],
                self.config['auth_context'],
                self.config['region'],
                token_version=self.config['token_version'],
                token_cache_file=self.config['token_cache_file'],
                token_lifetime=self.config['token_lifetime'],
                aws_creds=self.aws_creds
            )
        except kmsauth.ConfigurationError:
            raise ClientConfigurationError('Error configuring kmsauth client.')

    def _load_config(self, config_files, profile):
        """Initialize client settings from config."""
        for filename in config_files:
            try:
                with open(os.path.expanduser(filename), 'r') as f:
                    config = yaml.safe_load(f.read())
                    return config.get(profile, {})
            except IOError:
                logging.debug('{0} config file not found.'.format(filename))
                pass
            except yaml.YAMLError as e:
                msg = 'Failed to parse {0}: {1}'.format(filename, e)
                logging.error(msg)
                raise ClientConfigurationError(msg)
        # No file found
        return {}

    def _load_user_auth_context(self):
        """Conditionally load from auth context for users."""
        if self.config['auth_context'].get('user_type') == 'user':
            if not self.config['auth_context'].get('from'):
                try:
                    username = self.iam_client.get_user()['User']['UserName']
                    self.config['auth_context']['from'] = username
                except Exception:
                    logging.warning(
                        'Could not set from auth_context from get_user.'
                    )

    def _validate_client(self):
        """Ensure the configuration passed into init is valid."""
        if not self.config['url']:
            raise ClientConfigurationError('url not provided.')
        if not self.config['auth_key']:
            raise ClientConfigurationError('auth_key not provided.')
        if not self.config['auth_context']:
            raise ClientConfigurationError('auth_context not provided.')

    def get_config(self):
        return self.config

    def _get_username(self):
        """Get a username formatted for a specific token version."""
        return self.generator.get_username()

    def _get_assume_role_creds(self, role, mfa_pin=None):
        """Get AWS credentials for the specified role."""
        # A full ARN is passed in
        if role.startswith('arn:aws'):
            base_arn = role.rsplit(':', 1)[0]
            role_name = role.rsplit('/', 1)[1]
            role_arn = role
            user = None
        # A role name is passed in
        else:
            user = self.iam_client.get_user()
            base_arn = user['User']['Arn'].rsplit(':', 1)[0]
            role_name = role
            role_arn = '{0}:role/{1}'.format(base_arn, role)
        if mfa_pin:
            if user is None:
                user = self.iam_client.get_user()
            username = user['User']['UserName']
            mfa_arn = '{0}:mfa/{1}'.format(base_arn, username)
            return self.sts_client.assume_role(
                RoleArn=role_arn,
                RoleSessionName='{0}_confidant'.format(role_name),
                SerialNumber=mfa_arn,
                TokenCode=mfa_pin
            )['Credentials']
        else:
            return self.sts_client.assume_role(
                RoleArn=role_arn,
                RoleSessionName='{0}_confidant'.format(role_name)
            )['Credentials']

    def _get_mfa_creds(self, mfa_pin):
        """Get an AWS session token credentials, assumed with MFA."""
        user = self.iam_client.get_user()
        base_arn = user['User']['Arn'].rsplit(':', 1)[0]
        mfa_arn = '{0}:mfa/{1}'.format(base_arn, user['User']['UserName'])
        return self.sts_client.get_session_token(
            SerialNumber=mfa_arn,
            TokenCode=mfa_pin
        )['Credentials']

    def _get_token(self):
        """Get an authentication token."""
        return self.generator.get_token()

    def _check_response_code(self, response, expected=None):
        if expected is None:
            expected = [200]
        if response.status_code not in expected:
            logging.error('API error (response code {0}): {1}'.format(
                response.status_code,
                response.text
            ))
            return False
        return True

    def get_service(self, service, decrypt_blind=False):
        """Get a service's metadata and secrets."""
        # Return a dict, always with an attribute that specifies whether or not
        # the function was able to successfully get a result.
        ret = {'result': False}
        # Make a request to confidant with the provided url, to fetch the
        # service providing the service name and base64 encoded
        # token for authentication.
        try:
            response = self._execute_request(
                'get',
                '{0}/v1/services/{1}'.format(self.config['url'], service),
                expected_return_codes=[200, 404]
            )
        except RequestExecutionError:
            logging.exception('Error with executing request')
            return ret
        if response.status_code == 404:
            logging.debug('Service not found in confidant.')
            ret['result'] = True
            return ret
        try:
            data = response.json()
            if decrypt_blind:
                data['blind_credentials'] = self._decrypt_blind_credentials(
                    data['blind_credentials']
                )
        except ValueError:
            logging.exception(
                'Received badly formatted json data from confidant.'
            )
            return ret
        ret['service'] = data
        ret['result'] = True
        return ret

    def get_blind_credential(self, id, decrypt_blind=False):
        """Get a blind credential from ID."""
        # Return a dict, always with an attribute that specifies whether or not
        # the function was able to successfully get a result.
        ret = {'result': False}
        # Make a request to confidant with the provided url, to fetch the
        # service providing the service name and base64 encoded
        # token for authentication.
        try:
            response = self._execute_request(
                'get',
                '{0}/v1/blind_credentials/{1}'.format(self.config['url'], id),
                expected_return_codes=[200, 404]
            )
        except RequestExecutionError:
            logging.exception('Error with executing request')
            return ret
        if response.status_code == 404:
            logging.debug('Blind credential not found in confidant.')
            ret['result'] = False
            return ret
        try:
            data = response.json()
            if decrypt_blind:
                data['decrypted_credential_pairs'] = self._get_decrypted_pairs(
                    data
                )
        except ValueError:
            logging.error('Received badly formatted json data from confidant.')
            return ret
        ret['blind_credential'] = data
        ret['result'] = True
        return ret

    def _decrypt_blind_credentials(self, blind_credentials):
        _blind_credentials = []
        for blind_credential in blind_credentials:
            decrypted_pairs = self._get_decrypted_pairs(
                blind_credential
            )
            blind_credential['decrypted_credential_pairs'] = decrypted_pairs
            _blind_credentials.append(blind_credential)
        return _blind_credentials

    def _get_decrypted_pairs(self, credential):
        """
        From credential, get decrypted blind credential pairs.

        Given a region => data_key dict of data keys, a region => context dict
        of KMS encryption context, a dict of encrypted credential pairs, a
        cipher and a cipher version, return decrypted credential_pairs.
        """
        region = self.config['region']
        _context = credential['metadata']['context'][region]
        if self.aws_creds:
            _kms_client = confidant_client.services.get_boto_client(
                'kms',
                region=self.config['region'],
                aws_access_key_id=self.aws_creds['AccessKeyId'],
                aws_secret_access_key=self.aws_creds['SecretAccessKey'],
                aws_session_token=self.aws_creds['SessionToken']
            )
        else:
            _kms_client = self.kms_client
        _data_key = cryptolib.decrypt_datakey(
            base64.b64decode(
                ensure_bytes(credential['data_key'][region])
            ),
            _context,
            _kms_client
        )
        _credential_pair = credential['credential_pairs'][region]
        f = Fernet(_data_key)
        return json.loads(f.decrypt(_credential_pair.encode('utf-8')))

    def _get_keys_and_encrypted_pairs(
            self,
            blind_keys,
            context,
            credential_pairs,
            cipher_type,
            cipher_version
            ):
        """
        Get data keys and encrypted credential_pairs.

        Given a region => kms key dict of blind keys, a region => context dict
        of KMS encryption context, a dict of credential pairs, a cipher and a
        cipher version, generate a dict of region => data keys and a dict of
        region => encrypted credential_pairs and return both in a tuple.
        """
        data_keys = {}
        _credential_pairs = {}
        for region, blind_key in six.iteritems(blind_keys):
            if self.aws_creds:
                session = confidant_client.services.get_boto_session(
                    region=region,
                    aws_access_key_id=self.aws_creds['AccessKeyId'],
                    aws_secret_access_key=self.aws_creds['SecretAccessKey'],
                    aws_session_token=self.aws_creds['SessionToken']
                )
            else:
                session = confidant_client.services.get_boto_session(
                    region=region
                )
            _kms = session.client('kms')
            data_key = cryptolib.create_datakey(
                context[region],
                blind_key,
                _kms
            )
            data_keys[region] = base64.b64encode(
                ensure_bytes(data_key['ciphertext'])
            ).decode('ascii')
            # TODO: this crypto code needs to come from a library. Right now we
            # only support fernet and cipher_version 2, so we're hardcoding it
            # and ignoring the arguments.
            f = Fernet(data_key['plaintext'])
            # For paranoia sake, let's purposely purge plaintext from the
            # data_key, incase someone decides later to include the data_key
            # directly into the return.
            del data_key['plaintext']
            _credential_pairs[region] = f.encrypt(
                json.dumps(credential_pairs).encode('utf-8')
            ).decode('ascii')
        return data_keys, _credential_pairs

    def revert_credential(
            self,
            id,
            revision=None
            ):
        """Reverts a credential to a previous revision.

        Args:
            id: The ID of the credential.
            revision: The revision number to revert to, or None to revert to
                the immediately previous revision.
        """
        # Return a dict, always with an attribute that specifies whether or not
        # the function was able to successfully get a result.
        ret = {'result': False}
        logging.info(
            'Attempting to revert credential to revision {}'.format(revision)
        )
        try:
            response = self._execute_request(
                'put',
                '{0}/v1/credentials/{1}/{2}'.format(
                    self.config['url'],
                    id,
                    revision,
                ),
                headers=JSON_HEADERS,
            )
        except RequestExecutionError:
            logging.exception('Error with executing request')
            return ret
        try:
            data = response.json()
        except ValueError:
            logging.error('Received badly formatted json data from confidant.')
            return ret
        ret['credential'] = data
        ret['result'] = True
        return ret

    def revert_service(
            self,
            id,
            revision=None
            ):
        """Reverts a service to a previous revision.

        Args:
            id: The ID of the service.
            revision: The revision number to revert to, or None to revert to
                the immediately previous revision.
        """
        # Return a dict, always with an attribute that specifies whether or not
        # the function was able to successfully get a result.
        ret = {'result': False}
        try:
            response = self._execute_request(
                'put',
                '{0}/v1/services/{1}/{2}'.format(
                    self.config['url'],
                    id,
                    revision,
                ),
                headers=JSON_HEADERS,
            )
        except RequestExecutionError:
            logging.exception('Error with executing request')
            return ret
        try:
            data = response.json()
        except ValueError:
            logging.error('Received badly formatted json data from confidant.')
            return ret
        ret['service'] = data
        ret['result'] = True
        return ret

    def revert_blind_credential(
            self,
            id,
            revision=None
            ):
        """Reverts a blind credential to a previous revision.

        Args:
            id: The ID of the blind credential.
            revision: The revision number to revert to, or None to revert to
                the immediately previous revision.
        """
        # Return a dict, always with an attribute that specifies whether or not
        # the function was able to successfully get a result.
        ret = {'result': False}
        try:
            response = self._execute_request(
                'put',
                '{0}/v1/blind_credentials/{1}/{2}'.format(
                    self.config['url'],
                    id,
                    revision,
                ),
                headers=JSON_HEADERS,
            )
        except RequestExecutionError:
            logging.exception('Error with executing request')
            return ret
        try:
            data = response.json()
        except ValueError:
            logging.error('Received badly formatted json data from confidant.')
            return ret
        ret['blind_credential'] = data
        ret['result'] = True
        return ret

    def create_blind_credential(
            self,
            blind_keys,
            contexts,
            name,
            credential_pairs,
            metadata=None,
            cipher_type='fernet',
            cipher_version=2,
            store_keys=True,
            enabled=True,
            documentation=None
            ):
        """Create a server blinded credential and store it in Confidant."""
        # Return a dict, always with an attribute that specifies whether or not
        # the function was able to successfully get a result.
        ret = {'result': False}
        if metadata is None:
            metadata = {}
        metadata['context'] = contexts
        data_keys, _credential_pairs = self._get_keys_and_encrypted_pairs(
            blind_keys,
            contexts,
            credential_pairs,
            cipher_type,
            cipher_version
        )
        data = {
            'name': name,
            'credential_pairs': _credential_pairs,
            'data_key': data_keys,
            'metadata': metadata,
            'cipher_type': cipher_type,
            'cipher_version': cipher_version,
            'enabled': enabled,
            'documentation': documentation
        }
        if store_keys:
            data['credential_keys'] = list(credential_pairs.keys())
        try:
            response = self._execute_request(
                'post',
                '{0}/v1/blind_credentials'.format(self.config['url']),
                timeout=5,
                headers=JSON_HEADERS,
                data=json.dumps(data),
            )
        except RequestExecutionError:
            logging.exception('Error with executing request')
            return ret
        try:
            data = response.json()
        except ValueError:
            logging.error('Received badly formatted json data from confidant.')
            return ret
        ret['blind_credential'] = data
        ret['result'] = True
        return ret

    def update_blind_credential(
            self,
            id,
            blind_keys=None,
            contexts=None,
            name=None,
            credential_pairs=None,
            metadata=None,
            cipher_type=None,
            cipher_version=None,
            store_keys=True,
            enabled=None,
            documentation=None
            ):
        """Update a server blinded credential in Confidant."""
        # Return a dict, always with an attribute that specifies whether or not
        # the function was able to successfully get a result.
        ret = {'result': False}
        cred = self.get_blind_credential(id)
        if not cred['result']:
            return ret
        data = cred['blind_credential']
        del data['revision']
        del data['modified_by']
        del data['modified_date']
        if name is not None:
            data['name'] = name
        if metadata is not None:
            _context = data['metadata']['context']
            data['metadata'] = metadata
            data['metadata']['context'] = _context
        if documentation is not None:
            data['documentation'] = documentation
        if credential_pairs is not None:
            if contexts is not None:
                data['metadata']['context'] = contexts
            else:
                contexts = data['metadata']['context']
            if cipher_type is not None:
                data['cipher_type'] = cipher_type
            else:
                cipher_type = data['cipher_type']
            if cipher_version is not None:
                data['cipher_version'] = cipher_version
            else:
                cipher_version = data['cipher_version']
            data_keys, _credential_pairs = self._get_keys_and_encrypted_pairs(
                blind_keys,
                contexts,
                credential_pairs,
                cipher_type,
                cipher_version
            )
            data['data_key'] = data_keys
            data['credential_pairs'] = _credential_pairs
            if store_keys:
                data['credential_keys'] = list(credential_pairs.keys())
        if enabled is not None:
            data['enabled'] = enabled
        try:
            response = self._execute_request(
                'put',
                '{0}/v1/blind_credentials/{1}'.format(self.config['url'], id),
                timeout=5,
                headers=JSON_HEADERS,
                data=json.dumps(data)
            )
        except RequestExecutionError:
            logging.exception('Error with executing request')
            return ret
        try:
            data = response.json()
        except ValueError:
            logging.error('Received badly formatted json data from confidant.')
            return ret
        ret['blind_credential'] = data
        ret['result'] = True
        return ret

    def list_blind_credentials(self):
        """Get a list of blind credentials."""
        # Return a dict, always with an attribute that specifies whether or not
        # the function was able to successfully get a result.
        ret = {'result': False}
        # Make a request to confidant with the provided url, to fetch the
        # service providing the service name and base64 encoded
        # token for authentication.
        try:
            response = self._execute_request(
                'get',
                '{0}/v1/blind_credentials'.format(self.config['url'])
            )
        except RequestExecutionError:
            logging.exception('Error with executing request')
            return ret
        try:
            data = response.json()
        except ValueError:
            logging.error('Received badly formatted json data from confidant.')
            return ret
        ret['blind_credentials'] = data['blind_credentials']
        ret['result'] = True
        return ret

    def get_certificate(self, ca, cn, san=None, validity=120):
        """Get a certificate chain and key from the provided CA, issued for
        the given CN and SAN.
        """
        ret = {'result': False}
        _san = ''
        if san:
            if san > 1:
                _san = '&'.join(['san={}'.format(i) for i in san])
            else:
                _san = 'san={}'.format(san[0])
            _san = '&{}'.format(_san)
        try:
            response = self._execute_request(
                'get',
                '{0}/v1/certificates/{1}/{2}?validity={3}{4}'.format(
                    self.config['url'],
                    ca,
                    cn,
                    validity,
                    _san,
                ),
            )
        except RequestExecutionError:
            logging.exception('Error with executing request')
            return ret
        try:
            data = response.json()
        except ValueError:
            logging.error('Received badly formatted json data from confidant.')
            return ret
        ret['certificate'] = data
        ret['result'] = True
        return ret

    def get_certificate_from_csr(self, ca, csr, validity=120):
        """Get a certificate chain from the provided CA, using the provided
        CSR.
        """
        ret = {'result': False}
        try:
            response = self._execute_request(
                'post',
                '{0}/v1/certificates/{1}'.format(
                    self.config['url'],
                    ca,
                    data={
                        'csr': csr,
                        'validity': validity,
                    }
                ),
            )
        except RequestExecutionError:
            logging.exception('Error with executing request')
            return ret
        try:
            data = response.json()
        except ValueError:
            logging.error('Received badly formatted json data from confidant.')
            return ret
        ret['certificate'] = data
        ret['result'] = True
        return ret

    def get_ca(self, ca):
        """Get the CA certificate, certificate chain, and tag info for the
        provided CA.
        """
        ret = {'result': False}
        try:
            response = self._execute_request(
                'get',
                '{0}/v1/cas/{1}'.format(self.config['url'], ca),
            )
        except RequestExecutionError:
            logging.exception('Error with executing request')
            return ret
        try:
            data = response.json()
        except ValueError:
            logging.error('Received badly formatted json data from confidant.')
            return ret
        ret['ca'] = data
        ret['result'] = True
        return ret

    def list_cas(self):
        """Get the CA certificate, certificate chain, and tag info for the
        provided CA.
        """
        ret = {'result': False}
        try:
            response = self._execute_request(
                'get',
                '{0}/v1/cas'.format(self.config['url']),
            )
        except RequestExecutionError:
            logging.exception('Error with executing request')
            return ret
        try:
            data = response.json()
        except ValueError:
            logging.error('Received badly formatted json data from confidant.')
            return ret
        ret['cas'] = data['cas']
        ret['result'] = True
        return ret

    def _execute_request(
            self,
            method,
            url,
            expected_return_codes=[200],
            timeout=2,
            **kwargs
            ):
        try:
            if method == 'get':
                response = self.request_session.get(
                    url,
                    auth=(self._get_username(), self._get_token()),
                    allow_redirects=False,
                    timeout=timeout,
                    **kwargs
                )
            elif method == 'post':
                response = self.request_session.post(
                    url,
                    auth=(self._get_username(), self._get_token()),
                    allow_redirects=False,
                    timeout=timeout,
                    **kwargs
                )
            elif method == 'put':
                response = self.request_session.put(
                    url,
                    auth=(self._get_username(), self._get_token()),
                    allow_redirects=False,
                    timeout=timeout,
                    **kwargs
                )
            else:
                raise ValueError('Unexpected method: {}'.format(method))
        except requests.ConnectionError:
            raise RequestExecutionError('Failed to connect to confidant.')
        except requests.Timeout:
            raise RequestExecutionError('Confidant request timed out.')
        if not self._check_response_code(
                response, expected=expected_return_codes):
            raise RequestExecutionError('Unexpected return code')
        return response


class TokenCreationError(Exception):

    """An exception raised when a token was unsuccessfully created."""

    pass


class ClientConfigurationError(Exception):

    """An exception raised when the client has been invalidly configured."""

    pass


class RequestExecutionError(Exception):

    """An exception raised when a request to Confidant failed."""
    pass
