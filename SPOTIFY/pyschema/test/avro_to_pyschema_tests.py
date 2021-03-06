# -*- coding: utf-8 -*-
#
# Copyright (c) 2014 Spotify AB
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
from common import BaseTest
from pyschema_extensions.avro_to_pyschema import get_pyschema_record

supported_avro_schema = """{
  "name": "Supported",
  "type": "record",
  "namespace": "com.spotify.pyschema.test",
  "doc": "We have doc",
  "fields": [
    {
      "name": "int_field",
      "type": "int"
    },
    {
      "name": "float1",
      "type": "double"
    },
    {
      "name": "required_string_field",
      "type": "string"
    },
    {
      "name": "long_field",
      "type": [
        "null",
        "long"
      ],
      "doc": "some number",
      "default": null
    },
    {
      "name": "optional_string_field",
      "type": [
        "null",
        "string"
      ],
      "doc": "",
      "default": null
    },
    {
      "name": "undocumented_string_field",
      "type": [
        "null",
        "string"
      ],
      "default": null
    },
    {
      "name": "string_list",
      "type": [
        "null",
        {
          "type": "array",
          "items": "string"
        }
      ],
      "default": null
    },
    {
      "name": "string_map",
      "type": [
        "null",
        {
          "type": "map",
          "values": "string"
        }
      ],
      "doc": "map of foo",
      "default": null
    },
    {
      "name": "bytes1",
      "type": [
        "null",
        "bytes"
      ],
      "doc": "bytes field 1",
      "default": null
    },
    {
      "name": "boolean1",
      "type": [
        "null",
        "boolean"
      ],
      "doc": "boolean field 1",
      "default": null
    },
    {
      "name": "another_string_field",
      "type": [
        "null",
        "string"
      ],
      "doc": "What",
      "default": null
    },
    {
      "name": "boolean2",
      "type": [
        "null",
        "boolean"
      ],
      "doc": "boolean field 2",
      "default": null
    },
    {
      "name": "bytes2",
      "type": [
        "null",
        "bytes"
      ],
      "doc": "bytes field 2",
      "default": null
    },
    {
      "name": "weird_characters",
      "type": [
        "null",
        "long"
      ],
      "doc": "';drop table schemas;--????\u0000\u0000\\nhttp://uncyclopedia.wikia.com/wiki/AAAAAAAAA! \\\\ ???????????????????? <script>alert(\\"eh\\")</script>(:,%)'",
      "default": null
    },
    {
      "name": "float2",
      "type": [
        "null",
        "double"
      ],
      "doc": "float field 2",
      "default": null
    }
  ]
}
"""

expected = """class Supported(pyschema.Record):
    # GENERATED BY pyschema_extensions.avro_to_pyschema
    # YOU KNOW YOU WOULDN'T WANT IT ANY OTHER WAY
    # SO TAKE ME AS I AM
    'We have doc'
    _namespace = 'com.spotify.pyschema.test'
    int_field = pyschema.Integer(nullable=False, size=4)
    float1 = pyschema.Float(nullable=False)
    required_string_field = pyschema.Text(nullable=False)
    long_field = pyschema.Integer(nullable=True, description='some number')
    optional_string_field = pyschema.Text(nullable=True, description='')
    undocumented_string_field = pyschema.Text(nullable=True)
    string_list = pyschema.List(pyschema.Text(nullable=False), nullable=True)
    string_map = pyschema.Map(pyschema.Text(nullable=False), nullable=True, description='map of foo')
    bytes1 = pyschema.Bytes(nullable=True, description='bytes field 1')
    boolean1 = pyschema.Boolean(nullable=True, description='boolean field 1')
    another_string_field = pyschema.Text(nullable=True, description='What')
    boolean2 = pyschema.Boolean(nullable=True, description='boolean field 2')
    bytes2 = pyschema.Bytes(nullable=True, description='bytes field 2')
    weird_characters = pyschema.Integer(nullable=True, description='\\';drop table schemas;--\\xc4\\x80\\xc4\\x81\\x00\\x00\\nhttp://uncyclopedia.wikia.com/wiki/AAAAAAAAA! \\\\ \\xd0\\xbc\\xd0\\xbd\\xd0\\xbe\\xd0\\xb3\\xd0\\xb0\\xd0\\xb1\\xd1\\x83\\xd0\\xba\\xd0\\xb0\\xd1\\x84 <script>alert("eh")</script>(:,%)\\'')
    float2 = pyschema.Float(nullable=True, description='float field 2')
"""

unsupported_avro_schema = """{
  "name": "Unsupported",
  "type": "record",
  "namespace": "com.spotify.pyschema.test",
  "fields": [
    {
      "type": "int",
      "name": "version"
    },
    {
      "doc": "Not an union with null",
      "default": 5135123,
      "type": [
        "int",
        "string"
      ],
      "name": "onion"
    },
    {
      "doc": "City of Stockholm",
      "default": null,
      "type": [
        "null",
        "string"
      ],
      "name": "city"
    }
  ]
}
"""


class TestAvroToPySchema(BaseTest):
    def test_supported_avro_schema_succeeds(self):
        subrecords = []
        actual = get_pyschema_record(supported_avro_schema, subrecords)
        self.assertEquals(actual, expected)
        self.assertEquals(subrecords, [])
        # TODO nontrivial subrecords. I don't know completely what it is intended to do

    def test_unsupported_avro_schema_fails(self):
        subrecords = []
        self.assertRaises(NotImplementedError, get_pyschema_record, unsupported_avro_schema, subrecords)
