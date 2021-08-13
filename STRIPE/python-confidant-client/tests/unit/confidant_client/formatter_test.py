from __future__ import absolute_import
import six
import unittest

from confidant_client import formatter


def credentials_data_fixture(credential_pairs=None, credentials_metadata=None):
    return {
        "service": {
            "modified_date": "Thu, 1 Jan 1970 00:00:00 GMT",
            "id": "example-service-id",
            "modified_by": "james@lyft.com",
            "credentials": [{
                "id": "example-credential-id",
                "name": "example-credential-name",
                "data_type": "credential",
                "revision": 2,
                "credential_pairs": credential_pairs or {
                    "testkey": "testval",
                    "testkey2": "testval2"
                },
                "metadata": credentials_metadata or {},
                "documentation": None,
                "enabled": True,
            }],
            "account": None,
            "revision": 2,
            "enabled": True,
            "blind_credentials": []
        },
        "result": True
    }


class FormatterTest(unittest.TestCase):

    def test_export_vars(self):
        data = credentials_data_fixture()
        prefix = 'test_prefix_'

        exports = formatter.bash_export_format(data, prefix)

        for credentials in data['service']['credentials']:
            for key, value in six.iteritems(credentials['credential_pairs']):
                expected_var_name = prefix.upper() + key.upper()
                expected_assignment = '{}={}'.format(expected_var_name, value)
                expected_export = 'export {}'.format(expected_var_name)

                self.assertIn(expected_assignment, exports)
                self.assertIn(expected_export, exports)

    def test_export_var_prefix_override(self):
        metadata = {
            'env_var_prefix': 'override_'
        }
        data = credentials_data_fixture(credentials_metadata=metadata)
        default_prefix = 'test_prefix_'
        override_prefix = 'override_'

        exports = formatter.bash_export_format(data, default_prefix)

        expected_var_name = override_prefix.upper() + 'TESTKEY'
        expected_assignment = '{}={}'.format(expected_var_name, 'testval')
        expected_export = 'export {}'.format(expected_var_name)

        self.assertIn(expected_assignment, exports)
        self.assertIn(expected_export, exports)

    def test_combined_pair_format(self):
        data = credentials_data_fixture()

        result = formatter.combined_credential_pair_format(data)

        self.assertIn('credentials', result)
        self.assertIn('credentials_metadata', result)

        for credential in result['credentials_metadata']['credentials']:
            self.assertNotIn('metadata', credential)

    def test_combined_pair_format_with_metadata(self):
        metadata = {
            'env_var_prefix': 'override_'
        }
        data = credentials_data_fixture(credentials_metadata=metadata)

        result = formatter.combined_credential_pair_format(data)

        self.assertIn('credentials', result)
        self.assertIn('credentials_metadata', result)
        self.assertIn('credentials_source', result)

        for credential in result['credentials_metadata']['credentials']:
            self.assertIn('metadata', credential)
            self.assertIn('env_var_prefix', credential['metadata'])

            for key, value in six.iteritems(result['credentials']):
                id_from_credential = credential['id']
                id_from_source = result['credentials_source'][key]
                self.assertEqual(id_from_credential, id_from_source)
