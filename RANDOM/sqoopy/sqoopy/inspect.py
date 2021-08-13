#!/usr/bin/env python
# -*- coding: utf-8 -*-
'''
Usage: inspect.py <user> <password> <host> <database> [--port=port] [--tables=tables]

Arguments:
    user            the MySQL username
    password        password belonging to user
    host            the host name of the MySQL database
    port            the port of the MySQL database, default is 3306
    database        name of the database
    tables          comma separated list of tables that need to be inspected
    
'''


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

import re
from texttable import Texttable
from docopt import docopt

from generate import Db
from generate import column_size
from generate import Datatype


converter = Datatype()

class Field(object):
    def __init__(self, key, datatype, pk, table, size=0):
        self.key = key
        self.canonical_key = self.get_canonical_key(key)
        self.mysql_datatype = datatype
        self.pk = pk
        self.mysql_size = size
        self.hive_datatype = self.get_hive_datatype()
        self.table = table
        self.native_conversion = converter.supports(self.mysql_datatype)
    
    def __str__(self):
        return '%s <%s(%s)>' % (self.canonical_key, self.mysql_datatype, self.mysql_size)
    
    def get_hive_datatype(self):
        if self.canonical_key.find('timestamp') > -1:
            return converter.convert('timestamp', 'hive')
        else:
            return converter.convert(self.mysql_datatype, 'hive')
    
    def get_canonical_key(self, key):
        key = key.lower().split('_')
        if len(key) > 1:
            key = key[1:]
        return '_'.join(key)
        # except IndexError:
        #    return key.lower()

class Collection:
    def __init__(self, itemType):
        self.itemType = itemType
        # you can create whatever crazy indexed object store you want here
        self.items = []
    
    def __iter__(self):
        unique_keys = set([field.canonical_key for field in self.items])
        for unique in unique_keys:
            fields = [field for field in self.where(lambda x: x.canonical_key == unique)]
            for field in fields:
                yield field
    
    def add(self, item):
        # you can enforce that item is the same as itemType here if you want
        self.items.append(item)
    
    def where(self, fn):
        return [x for x in self.items if fn(x)]


def inspect_table(database, table, fields):
    for data in database.data:
        data = data.split('\t')
        key = data[0]
        datatype = re.split(column_size, data[1])[0]
        datatype = datatype.lower()
        
        size = re.findall(column_size, data[1])
        if len(size) > 0:
            size = int(size[0][1:-1])
        else:
            size = 0
        
        pk = True if data[3] == 'PRI' or data[3] == 'MUL' else False
        fields.add(Field(key, datatype, pk, table, size))
    
    # print 'these are part of the pk: ' + ' '.join([field.key for field in fields.where(lambda x: x.pk)])
    return fields
#        if self.verbose:
#            log.info('Table: %s, found column: %s (%s)' % (table, name, datatype))

def write_output(fields):
    '''
    Desired output
    canonical_key, key, datatype, mysql_table, hive_datatype
    '''
    rows = []
    table = Texttable(max_width=140)
    hivedatatypes = Datatype()
    rows.append(['canonical_column', 'column', 'mysql_table', 'mysql_datatype', 'hive_datatype', 'native mapping', 'requires feedback'])
    for field in fields:
        # if not hivedatatypes.supports(field.mysql_datatype):
        feedback = True if field.mysql_datatype != field.hive_datatype else ''
        row = ['%s' % field.canonical_key, '%s' % field.key, '%s' % field.table, '%s' % field.mysql_datatype, '%s' % field.hive_datatype, '%s' % field.native_conversion, '%s' % feedback]
        rows.append(row)
    table.add_rows(rows)
    print table.draw()


def run(args):
    try:
        tables = args.get('--tables').split(',')
    except AttributeError:
        tables = []
    database = Db(args.get('<user>'), args.get('<password>'), args.get('<host>'),
                args.get('<database>'), args.get('--port'), tables)
    
    if not args.get('--tables'):
        database.get_tables()
    
    fields = Collection(Field)
    
    for table in database.tables:
        database.inspect(table)
        fields = inspect_table(database, table, fields)
    write_output(fields)

def main():
    'Main script entrypoint for CLI.'
    args = docopt(__doc__)
    print args
    run(args)


if __name__ == '__main__':
    main()
