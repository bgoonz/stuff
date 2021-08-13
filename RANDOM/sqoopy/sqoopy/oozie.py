#!/usr/bin/env python
# -*- coding: utf-8 -*-


"""
sqoopy: Generate sqoop custom import statements

Copyright (C) 2012  Diederik van Liere, Wikimedia Foundation

This program is free software; you can redistribute it and/or
modify it under the terms of the GNU General Public License
as published by the Free Software Foundation; either version 2
of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
"""

try:
    import xml.etree.cElementTree as ET
except ImportError:
    import xml.etree.ElementTree as ET

import yaml
from xml.dom import minidom


def load_yaml_config():
    fh = open('oozie.yaml', 'r')
    config = yaml.load(fh)
    fh.close()
    return config


def prettify(elem):
    """Return a pretty-printed XML string for the Element."""
    rough_string = ET.tostring(elem, 'utf-8')
    reparsed = minidom.parseString(rough_string)
    return reparsed.toprettyxml(indent="  ")

def write_args(sqoop, attribs):
    for key, value in attribs.iteritems():
        arg = ET.SubElement(sqoop, 'arg')
        arg.text = key
        arg = ET.SubElement(sqoop, 'arg')
        arg.text = value


def write_xml(oozie, action_name):
    reparsed = prettify(oozie)
    print reparsed
    
    fh = open('%s.xml' % action_name, 'w')
    fh.write(reparsed)
    fh.close()


def construct_XML_doc(attribs):
    config = load_yaml_config()
    action_name = attribs.pop('action_name', None)
    
    oozie = ET.Element('workflow-app', xmlns=config.get('xmlns_workflow'))
    
    comment = ET.Comment('This Oozie workflow was generated using Sqoopy.\n \\\
    If you are having difficulties with running this Oozie job then contact\n \\\
    Diederik from the Analytics Team.')
    
    oozie.append(comment)
    
    start = ET.SubElement(oozie, 'start', to='%s' % action_name)
    action = ET.SubElement(oozie, 'action', name='%s' % action_name)
    
    sqoop = ET.SubElement(action, 'sqoop', xmlns=config.get('xmlns_sqoop'))
    jobtracker = ET.SubElement(sqoop, 'job-tracker')
    jobtracker.text = '${jobTracker}'
    namenode = ET.SubElement(sqoop, 'name-node')
    namenode.text = '${nameNode}'
    configuration = ET.SubElement(sqoop, 'configuration')
    property = ET.SubElement(configuration, 'property')
    name = ET.SubElement(property, 'name')
    name.text = 'oozie.use.system.libpath'
    value = ET.SubElement(property, 'value')
    value.text = 'true'
    archive = ET.SubElement(sqoop, 'archive')
    archive.text = config.get('archive')
    
    write_args(sqoop, attribs)
    
    ok = ET.SubElement(action, 'ok', to='end')
    error = ET.SubElement(action, 'error', to='kill')

    kill = ET.SubElement(oozie, 'kill', name='kill')
    message = ET.SubElement(kill, 'message')
    message.text = 'Action failed, error message[${wf:errorMessage(wf:lastErrorNode())}]'

    end = ET.SubElement(oozie, 'end', name='end')
    
    write_xml(oozie, action_name)

if __name__ == '__main__':
    construct_XML_doc(dict(action_name='example_action'))
