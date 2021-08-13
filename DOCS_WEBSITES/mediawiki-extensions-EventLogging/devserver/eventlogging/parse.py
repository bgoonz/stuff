# -*- coding: utf-8 -*-
"""
  eventlogging.parse
  ~~~~~~~~~~~~~~~~~~

  This module provides a scanf-like parser for raw log lines.

  Field specifiers
  ================

  +--------+-----------------------------+
  | Symbol | Field                       |
  +========+=============================+
  |   %h   | Client IP                   |
  +--------+-----------------------------+
  |   %j   | JSON event object           |
  +--------+-----------------------------+
  |   %q   | Query-string-encoded JSON   |
  +--------+-----------------------------+
  |   %t   | Unix timestamp integer      |
  +--------+-----------------------------+
  | %{..}i | Tab-delimited string        |
  +--------+-----------------------------+
  | %{..}s | Space-delimited string      |
  +--------+-----------------------------+
  | %{..}d | Integer                     |
  +--------+-----------------------------+

   '..' is the desired property name for the capturing group.

"""

import json
import re
import time
import uuid

from urllib.request import urlopen
from urllib.parse import unquote_to_bytes

__all__ = ('LogParser', 'utcnow')

# Formats event capsule objects into URLs using the combination of
# origin hostname, sequence ID, and timestamp. This combination is
# guaranteed to be unique. Example::
#
#   event://vanadium.eqiad.wmnet/?seqId=438763&timestamp=1359702955
#
EVENTLOGGING_URL_FORMAT = (
    'event://%(recvFrom)s/?seqId=%(seqId)s&timestamp=%(timestamp).10s')


def capsule_uuid(capsule):
    """Generate a UUID for a capsule object.

    Gets a unique URI for the capsule using `EVENTLOGGING_URL_FORMAT`
    and uses it to generate a UUID5 in the URL namespace.

    ..seealso:: `RFC 4122 <https://www.ietf.org/rfc/rfc4122.txt>`_.

    :param capsule: A capsule object (or any dictionary that defines
      `recvFrom`, `seqId`, and `timestamp`).

    """
    id = uuid.uuid5(uuid.NAMESPACE_URL, EVENTLOGGING_URL_FORMAT % capsule)
    return '%032x' % id.int


def utcnow():
    """Integer timestamp representing the number of seconds since UNIX epoch UTC."""
    return int(time.time())


def unquote_plus(unicode):
    """Replace %xx escapes by their single-character equivalent."""
    unicode = unicode.replace('+', ' ')
    bytes = unicode.encode('utf-8')
    return unquote_to_bytes(bytes).decode('utf-8')


def decode_qson(qson):
    """Decodes a QSON (query-string-encoded JSON) object.
    :param qs: Query string.
    """
    return json.loads(unquote_plus(qson.strip('?;')))


class LogParser(object):
    """Parses raw varnish/MediaWiki log lines into encapsulated events."""

    def __init__(self, format):
        """Constructor.

        :param format: Format string.
        :param ip_hasher: function ip_hasher(ip) -> hashed ip.
        """
        self.format = format

        # A mapping of format specifiers to a tuple of (regexp, caster).
        self.format_specifiers = {
            'd': (r'(?P<%s>\d+)', int),
            'h': (r'(?P<clientIp>\S+)', str),
            'i': (r'(?P<%s>[^\t]+)', str),
            'j': (r'(?P<capsule>\S+)', json.loads),
            'q': (r'(?P<capsule>\?\S+)', decode_qson),
            's': (r'(?P<%s>\S+)', str),
            't': (r'(?P<timestamp>\d+)', int),
        }

        # Field casters, ordered by the relevant field's position in
        # format string.
        self.casters = []

        # Compiled regexp.
        format = re.sub(' ', r'\\s+', format)
        raw = re.sub(r'(?<!%)%({(\w+)})?([dhijqst])', self._repl, format)
        self.re = re.compile(raw)

    def _repl(self, spec):
        """Replace a format specifier with its expanded regexp matcher
        and append its caster to the list. Called by :func:`re.sub`.
        """
        _, name, specifier = spec.groups()
        matcher, caster = self.format_specifiers[specifier]
        if name:
            matcher = matcher % name
        self.casters.append(caster)
        return matcher

    def parse(self, line):
        """Parse a log line into a map of field names / values."""
        match = self.re.match(line)
        if match is None:
            raise ValueError(self.re, line)
        keys = sorted(match.groupdict(), key=match.start)
        event = {k: f(match.group(k)) for f, k in zip(self.casters, keys)}
        event.update(event.pop('capsule'))
        event['uuid'] = capsule_uuid(event)
        return event

    def __repr__(self):
        return '<LogParser(\'%s\')>' % self.format
