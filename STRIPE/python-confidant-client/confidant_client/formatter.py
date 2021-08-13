# -*- coding: utf-8 -*-
"""Confidant formatting module."""

# Import python libs
from __future__ import absolute_import
import argparse
import jinja2
import json
import logging
import os
import pipes
import re
import six
import sys

import confidant_client

KEY_BAD_PATTERN = re.compile(r'(\W|^\d)')


def bash_export_format(data, default_prefix):
    ret = ''
    service = data.get('service', {})
    if not service:
        return ret

    credentials = service.get('credentials', [])
    blind_credentials = service.get('blind_credentials', [])
    for cred in credentials:
        metadata = cred.get('metadata', {})
        pairs = cred.get('credential_pairs', {})
        for key, val in six.iteritems(pairs):
            if not _valid_key(key):
                continue
            prefix = metadata.get('env_var_prefix') or default_prefix

            var = ': ${{{0}{1}={2}}}\n'.format(
                prefix.upper(),
                key.upper(),
                pipes.quote(val)
            )
            exp = 'export {0}{1}\n'.format(
                prefix.upper(),
                key.upper()
            )
            ret = '{0}{1}{2}'.format(
                ret,
                var,
                exp
            )
    for cred in blind_credentials:
        metadata = cred.get('metadata', {})
        pairs = cred.get('decrypted_credential_pairs', {})
        for key, val in six.iteritems(pairs):
            if not _valid_key(key):
                continue
            prefix = metadata.get('env_var_prefix', default_prefix)

            var = ': ${{{0}{1}={2}}}\n'.format(
                prefix.upper(),
                key.upper(),
                pipes.quote(val)
            )
            exp = 'export {0}{1}\n'.format(
                prefix.upper(),
                key.upper()
            )
            ret = '{0}{1}{2}'.format(
                ret,
                var,
                exp
            )
    return ret


def combined_credential_pair_format(data):
    namespace = 'credentials'
    metadata_namespace = 'credentials_metadata'
    source_namespace = 'credentials_source'
    ret = {}
    credential_pairs = {}
    credentials_metadata = []
    credentials_source = {}
    service = data.get('service', {})
    credentials = service.get('credentials', [])
    blind_credentials = service.get('blind_credentials', [])
    for credential in credentials:
        for key, val in credential['credential_pairs'].items():
            if key in credential_pairs:
                msg = 'Credential {0} ({1}) has a conflicting credential pair.'
                logging.warning(
                    msg.format(credential['name'], credential['id'])
                )
            credentials_source[key] = credential['id']
        credential_pairs.update(credential['credential_pairs'])
        credential_metadata = {
            'id': credential['id'],
            'revision': credential['revision'],
            'name': credential['name']
        }
        if credential.get('metadata'):
            credential_metadata['metadata'] = credential['metadata']
        credentials_metadata.append(credential_metadata)
    for credential in blind_credentials:
        for key, val in credential['decrypted_credential_pairs'].items():
            if key in credential_pairs:
                msg = ('Blind credential {0} ({1}) has a conflicting'
                       ' credential pair.')
                logging.warning(
                    msg.format(credential['name'], credential['id'])
                )
            credentials_source[key] = credential['id']
        credential_pairs.update(credential['decrypted_credential_pairs'])
        credential_metadata = {
            'id': credential['id'],
            'revision': credential['revision'],
            'name': credential['name']
        }
        if credential.get('metadata'):
            credential_metadata['metadata'] = credential['metadata']
        credentials_metadata.append(credential_metadata)
    ret[namespace] = credential_pairs
    ret[metadata_namespace] = {
        'revision': service.get('revision'),
        'credentials': credentials_metadata
    }
    ret[source_namespace] = credentials_source
    return ret


def jinja_format(data, template_file):
    class GlobalFileLoader(jinja2.BaseLoader):
        def get_source(self, environment, template):
            if not os.path.exists(template):
                raise jinja2.TemplateNotFound(template)
            with open(template) as f:
                source = f.read().decode('utf-8')
            return source, template, lambda: False

    combined_credentials = combined_credential_pair_format(data)
    env = jinja2.Environment(
        loader=GlobalFileLoader(),
        keep_trailing_newline=True
    )
    template = env.get_template(template_file)
    return template.render(secrets=combined_credentials['credentials'])


def _valid_key(key):
    if KEY_BAD_PATTERN.search(key):
        msg = ('A key in the returned credential_pairs ({0}) is not a valid'
               ' shell environment variable. Skipping this key.')
        logging.warning(msg.format(key))
        return False
    return True


def main():
    """Entrypoint function for confidant formatter cli."""
    parser = argparse.ArgumentParser(
        formatter_class=argparse.RawDescriptionHelpFormatter,
        description='A tool for reformatting confidant service data.'
    )
    parser.add_argument(
        '--in',
        help='File to read service data from. Default is "-" (stdin).',
        default='-',
        dest='_in'
    )
    parser.add_argument(
        '--out-format',
        required=True,
        help='Format to output: env_export, credential_combined, jinja.',
        choices=['env_export', 'credential_combined', 'jinja']
    )
    parser.add_argument(
        '--env-export-prefix',
        help=('Prefix to use for variables exported when using env_export'
              ' format.'),
        default='CREDENTIALS_'
    )
    parser.add_argument(
        '--template',
        help=('Template file to use when using the jinja format. All available'
              ' credentials will be provided in a dictionary named `secrets`.')
    )
    parser.add_argument(
        '--out',
        help='File to write reformatted data to. Default is "-" (stdout).',
        default='-'
    )
    parser.add_argument(
        '--log-level',
        help='Logging verbosity.',
        default='info'
    )
    parser.add_argument(
        '--version',
        help='Print version and exit.',
        action='version',
        version='%(prog)s {version}'.format(version=confidant_client.VERSION)
    )

    args = parser.parse_args()

    if args._in == '-':
        data = sys.stdin.read()
    else:
        with open(os.path.join(args._in), 'r') as f:
            data = f.read()
    data = json.loads(data)

    numeric_loglevel = getattr(logging, args.log_level.upper(), None)
    if not isinstance(numeric_loglevel, int):
        raise ValueError('Invalid log level: {0}'.format(args.loglevel))
    logging.basicConfig(
        level=numeric_loglevel,
        format='%(asctime)s %(name)s: %(levelname)s %(message)s',
        stream=sys.stderr
    )

    if args.out_format == 'env_export':
        ret = bash_export_format(data, args.env_export_prefix)
    elif args.out_format == 'credential_combined':
        ret = combined_credential_pair_format(data)
        ret = json.dumps(ret, sort_keys=True, indent=4, separators=(',', ': '))
    elif args.out_format == 'jinja':
        if args.template is None:
            logging.error('--template is required when using'
                          ' --out-format=jinja')
            sys.exit(1)
        ret = jinja_format(data, args.template)
    else:
        logging.error('Unsupported --out-format.')
        sys.exit(1)
    if args.out == '-':
        sys.stdout.write(ret)
    else:
        with open(os.path.join(args.out), 'w') as f:
            f.write(ret)


if __name__ == '__main__':
    main()
