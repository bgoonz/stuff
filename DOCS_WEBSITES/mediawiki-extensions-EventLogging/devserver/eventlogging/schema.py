# -*- coding: utf-8 -*-
"""
  eventlogging.schema
  ~~~~~~~~~~~~~~~~~~~

  This module implements schema retrieval and validation. Schemas are
  referenced via SCIDs, which are tuples of (Schema name, Revision ID).
  Schemas are retrieved via HTTP and then cached in-memory.

"""

import json
import re
from urllib.request import urlopen

import jsonschema

__all__ = ('get_schema')


# Regular expression which matches valid schema names.
SCHEMA_RE_PATTERN = r'[a-zA-Z0-9_-]{1,63}'
SCHEMA_RE = re.compile(r'^{0}$'.format(SCHEMA_RE_PATTERN))

# URL of index.php on the schema wiki (same as
# '$wgEventLoggingSchemaApiUri').
SCHEMA_WIKI_API = 'https://meta.wikimedia.org/w/api.php'

# Template for schema article URLs. Interpolates SCIDs.
SCHEMA_URL_FORMAT = (
    SCHEMA_WIKI_API + '?format=json&action=jsonschema&title=%s&revid=%s&formatversion=2'
)

# Schemas retrieved via HTTP are cached in this dictionary.
schema_cache = {}

# SCID of the metadata object which wraps each event.
CAPSULE_SCID = ('EventCapsule', 10981547)


def http_get(url):
    """Simple wrapper around the standard library's `urlopen` function which
    works around a circular ref. See <https://bugs.python.org/issue1208304>.
    """
    req = None
    try:
        req = urlopen(url)
        return req.read().decode('utf-8')
    finally:
        if req is not None:
            if hasattr(req, 'fp') and hasattr(req.fp, '_sock'):
                req.fp._sock.recv = None
            req.close()


def get_schema(scid, encapsulate=False):
    """Get schema from memory or HTTP."""
    schema = schema_cache.get(scid)
    if schema is None:
        schema = http_get_schema(scid)
        schema_cache[scid] = schema
    # We depart from the JSON Schema specifications by disallowing
    # additional properties by default.
    # See `<https://bugzilla.wikimedia.org/show_bug.cgi?id=44454>`_.
    schema.setdefault('additionalProperties', False)
    if encapsulate:
        capsule = get_schema(CAPSULE_SCID)
        capsule['properties']['event'] = schema
        return capsule
    return schema


def http_get_schema(scid):
    """Retrieve schema via HTTP."""
    validate_scid(scid)
    url = SCHEMA_URL_FORMAT % scid
    try:
        schema = json.loads(http_get(url))
    except (ValueError, EnvironmentError) as ex:
        raise jsonschema.SchemaError('Schema fetch failure: %s' % ex)
    jsonschema.Draft3Validator.check_schema(schema)
    return schema


def validate_scid(scid):
    """Validates an SCID.
    :raises :exc:`jsonschema.ValidationError`: If SCID is invalid.
    """
    schema, revision = scid
    if not isinstance(revision, int) or revision < 1:
        raise jsonschema.ValidationError('Invalid revision ID: %s' % revision)
    if not isinstance(schema, str) or not SCHEMA_RE.match(schema):
        raise jsonschema.ValidationError('Invalid schema name: %s' % schema)
