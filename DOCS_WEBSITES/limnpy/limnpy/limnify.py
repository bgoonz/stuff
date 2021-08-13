import argparse
import pandas as pd
import numpy as np
import os.path
import datetime
import dateutil.parser
import sys
import pprint

sys.path.insert(0, os.path.abspath('..'))

import limnpy


def main():
    """
    Here is a semi-complex use case which pivots the data (transformed into a doctest comapitable version):

        >>> import StringIO, os, csv, shutil
        >>> from subprocess import call
        >>>
        >>> os.mkdir('doctest_tmp')
        >>> f = open('doctest_tmp/limnify1.tsv', 'w')
        >>> data =     [['Hour',         'Continent', 'Count']]
        >>> data.append(['2013-01-01_00','Asia',      '535984'])
        >>> data.append(['2013-01-01_00','Africa',    '20536'])
        >>> f = open('doctest_tmp/limnify1.tsv', 'w')
        >>> csv.writer(f,dialect='excel-tab').writerows(data)
        >>> f.close()
        >>>
        >>> call('''limnify --delim='\\t' --pivot --datecol=0 --datefmt=%Y-%m-%d_%H doctest_tmp/limnify1.tsv''', shell=True)
        0
        >>> shutil.rmtree('doctest_tmp')
    """


    int_or_str = lambda s : int(s) if isinstance(s,str) and s.isdigit() else s

    parser = argparse.ArgumentParser(formatter_class=argparse.ArgumentDefaultsHelpFormatter)
    parser.add_argument('data', help='name of file to be limnified', default='STDIN', nargs='?')
    parser.add_argument('--delim', default='\t', help='delim to use for input file')
    parser.add_argument('--header', default=None, nargs='+', help='this is a space separated list of names to use as the header row'
                'If your data doesn\'t already have a header row you will need to pass in a list of names to use, otherwise it'
                'will assume the first row is a header and then produce confusing data sources.  Remember, these names will be'
                'displayed in the graph editing interface')
    parser.add_argument('--datecol', type=int_or_str, default=0, help='the date column name or index--required if it is different from `date`')
    parser.add_argument('--datefmt', 
                help='format to use with datetime.strptime, default uses dateutil.parser.parse')
    parser.add_argument('--pivot', default=False, action='store_true', 
                help='whether to try and pivot the data (only supports sum aggregation for now)')
    parser.add_argument('--metriccol', type=int_or_str, default=1, 
                help='the column name or index to use for creating the column (metric) names when pivoting')
    parser.add_argument('--valcol', type=int_or_str, default=2, 
                help='the column in which to find the actual data to be plotted when pivoting')
    parser.add_argument('--basedir', default='.', help='directory in which to place the output datasources, datafiles and graphs directories')
    parser.add_argument('--name', nargs='+', type=' '.join, help='name of datasource which will be displayed in the UI')
    parser.add_argument('--id', help='the slug / id used to uniquely identify the datasource within a limn installation')
    parser.add_argument('--write_graph', default=False, help='whether to write a graph file containing all columns from the datasource')

    args = parser.parse_args()
    # pprint.pprint(vars(args))

    if args.datefmt:
        date_parser = lambda s : datetime.datetime.strptime(s, args.datefmt)
    else:
        date_parser = dateutil.parser.parse

        
    if args.data == 'STDIN':
        data = sys.stdin
    else:
        data = args.data

    if not args.pivot:
        if args.header:
            df = pd.read_table(data, sep=args.delim, parse_dates=[args.datecol], date_parser=date_parser, names=args.header)
        else:
            df = pd.read_table(data, sep=args.delim, parse_dates=[args.datecol], date_parser=date_parser)
        if isinstance(args.datecol, int):
            args.datecol = df.columns[args.datecol] 
    else:
        if args.header:
            df_long = pd.read_table(data, sep=args.delim, parse_dates=[args.datecol], date_parser=date_parser, names=args.header)
        else:
            df_long = pd.read_table(data, sep=args.delim, parse_dates=[args.datecol], date_parser=date_parser)


        if isinstance(args.datecol, int):
            args.datecol = df_long.columns[args.datecol]
        if isinstance(args.metriccol, int):
            args.metriccol = df_long.columns[args.metriccol]
        if isinstance(args.valcol, int):
            args.valcol = df_long.columns[args.valcol]

        df = pd.pivot_table(df_long, rows=[args.datecol], cols=[args.metriccol], values=args.valcol, aggfunc=np.sum)


    sys.stderr.write('output data format (formatted by pandas.DataFrame version):\n%s\n' % df)

    if args.name is None:
        args.name = os.path.splitext(os.path.split(args.data)[1])[0]
    if args.id is None:
        args.id = os.path.splitext(os.path.split(args.data)[1])[0]
    ds = limnpy.DataSource(args.id, args.name, df, date_key=args.datecol, date_fmt=args.datefmt)
    ds.write(args.basedir)

    if args.write_graph:
        graph = ds.get_graph()
        graph.write(args.basedir)

if __name__ == '__main__':
    main()
