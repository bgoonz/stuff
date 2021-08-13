import csv, yaml, json
import os, logging
import datetime
from operator import itemgetter
from collections import Sequence, MutableSequence
import codecs
#import colorbrewer
import itertools
import pandas as pd
import pprint
import copy

from graph import Graph

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


class DataSource(object):
    """
    This class represents a limn datasource including its associated datafile.
    The constructor takes in the datasource id, name and the actual data.
    Once the datasource has been constructed, you can add or modify the DataSource.data
    member which is just a pandas.DataFrame object or the DataSource.source dictionary
    which maps directly to the datasource JSON file required by limn.  After
    modifying the DataSource.data and DataSource.source to your liking (or not at all), calling
    write() will produce both the JSON and csv files required by limn in the appropriate
    directories ({basedir}/datafiles, {basedir}/datasources).  You can also
    create a graph from the datasource including all of its columns or only a
    subset by calling the write_graph() method.

    Examples:

        >>> import limnpy, datetime
        >>> rows = [[datetime.date(2012, 9, 1), 1, 2],
        ...          [datetime.date(2012, 10, 1), 7, 9]]
        >>> ds = limnpy.DataSource('test_source', 'Test Source', rows, labels=['date', 'x', 'y'])
        >>> ds.write(basedir='doctest_tmp')
        >>> hash(open('doctest_tmp/datasources/test_source.yaml').read())
        -6541337400615626104
        >>> hash(open('doctest_tmp/datafiles/test_source.csv').read())
        -9093178411304175629

        >>> ds.write_graph(basedir='doctest_tmp') # plot all columns
        >>> hash(open('doctest_tmp/graphs/test_source.json').read())
        -6063105524197132446

        >>> ds.source['id'] = 'test_source_just_x'
        >>> ds.write_graph(metric_ids=['x'], basedir='doctest_tmp') # just plot x
        >>> hash(open('doctest_tmp/graphs/test_source_just_x.json').read())
        4932947664539037265

        >>> rows = [{'date' : datetime.date(2012, 9, 1), 'x' : 1, 'y' : 2},
        ...          {'date' : datetime.date(2012, 10, 1), 'x' : 7, 'y' : 9}]
        >>> ds = limnpy.DataSource('test_source', 'Test Source', rows)
        >>> ds.write(basedir='doctest_tmp')
        >>> hash(open('doctest_tmp/datasources/test_source.yaml').read())
        -6541337400615626104

        >>> rows = {'date' : [datetime.date(2012, 9, 1), datetime.date(2012, 10, 1)], 'x' : [1, 7], 'y' : [2, 9]}
        >>> ds = limnpy.DataSource('test_source', 'Test Source', rows)
        >>> ds.write(basedir='doctest_tmp')
        >>> hash(open('doctest_tmp/datasources/test_source.yaml').read())
        -6541337400615626104

    """

    default_source = {
        'id' : None,
        'slug' : None,
        'format' : 'csv',
        'type' : 'timeseries',
        'url' : None,
        'name' : '',
        'shortName' : '',
        'desc' : '',
        'notes' : '',
        'columns' : [],
        'timespan' : {
            'start' : None,
            'end' : None,
            'step' : '1d'
        }
    }
    
    def __init__(self,
            limn_id,
            limn_name,
            data,
            limn_group='',
            url=None,
            labels=None,
            types=None,
            date_key='date',
            date_fmt='%Y/%m/%d'):
        """
        Constructs a Python representation of Limn (github.com/wikimedia/limn) datasource
        including both the metadata JSON (optionally YAML) file (known as a datasource) and the associated csv
        file containing the actual content (known as a datafile).
        Args:
            limn_id   (str)       : the id used to uniquely identify this datasource in limn
            limn_name (str)       : the name which will be displayed to users for this datasource
            data      (anything pandas.DataFrame accepts) :
                                    the actual data associated with this datasource.  Can take
                                    any format accepted by the pandas.DataFrame constructor.
                                    which includes things like list of lists, list of dicts, dict
                                    mapping column names to lists, numpy ndarrays.  See:
                                    http://pandas.pydata.org/pandas-docs/stable/dsintro.html#dataframe
                                    for more information.
            group     (str)       : directory within which the datasources/datafiles/graphs/dashboards
                                    directories will be placed on the server.  The value of groups
                                    will be added to the datafile URL as the second directory in the path
            url       (str)       : custom url where datafile will be available.  Defaults to a local
                                    path on the server `/datafiles/{group}/limn_id.csv`
            labels    (list)      : the labels corresponding to the data "columns".  Not required
                                    if the data object
            types     (list)      : the javascript/limn types associated with each column of the csv file
                                    mostly this just means `int` and `date`
            date_key  (str)       : name of the column to be used as the date column.  Defaults to 'date'
            date_fmt  (str)       : date format of the date column.
        """

        self.date_key = date_key
        self.date_fmt = date_fmt
        self.types = types
        self.source = copy.deepcopy(DataSource.default_source)
        self.source['id'] = limn_id
        self.source['name'] = limn_name
        self.source['shortName'] = limn_name
        self.source['url'] = url if url else os.path.join('/data/datafiles', limn_group, limn_id + '.csv')

        # NOTE: though we construct the data member here, we allow the possibility
        # that it will change before we write, so all derived fields get set in infer() which is called by write()
        try:
            self.data = pd.DataFrame(copy.deepcopy(data))
        except:
            raise ValueError('Error constructing DataFrame from data: %s.  See pandas.DataFrame documentation for help' % data)
        # check whether columns are not named or the labels field has been passed in
        if list(self.data.columns) == range(len(self.data.columns) or labels is not None):
            logger.debug('labels were not set by Pandas, setting manually')
            # this means the `data` object didn't include column labels
            if labels is not None:
                self.data.rename(columns=dict(enumerate(labels)), inplace=True)
            else:
                raise ValueError('`data` does not contain label information, column names must be passed in with the `labels` arg')

        if not isinstance(self.data.index, pd.tseries.index.DatetimeIndex):
            logger.debug('dealing with a DataFrame instance that does NOT have a datetime index.  type(index)=%s', type(self.data.index))
            # if `data` is just another pd.DataFrame from a DataSource or datetime-indexed, don't to set index
            if self.date_key not in self.data.columns:
                raise ValueError('date_key: `%s` must be in column labels: %s\ntype(self.data.index): %s, self.data.index: %s' %
                        (date_key, list(self.data.columns), type(self.data.index), self.data.index))
            try:
                self.data.set_index(self.date_key, inplace=True)
            except:
                logger.exception('error resetting index because self.data.columns=%s', self.data.columns)
                raise ValueError('could not set_index because self.data.columns=%s', self.data.columns)
        self.infer() # can't hurt to infer now. this way we can make graphs before writing the datasource


    def infer(self):
        """
        Infers the required metadata from the data if possible.  This is distinct
        from the __init__ routine so that the user can change the data after constructing
        it and the meta data will accurately reflect any added data
        """
        # parse dates, sort, and format
        # logger.debug('entering infer with self.data:\n%s', self.data)
        self.data.index = pd.to_datetime(self.data.index)
        # logger.debug('converted index to timestamps.  self.data.index:\n%s', self.data.index)
        # logger.debug('id: %s', self.source['id'])
        # logger.debug('set index to be a datetime index. type(self.data.index) = %s', type(self.data.index))
        # logger.debug('id(self) = %s', id(self))
        self.data.sort()
        # logger.debug('columns: %s', self.data.columns)
        # logger.debug('reverse columns: %s', list(reversed(self.data.sum().argsort(order=True))))
        # self.data = self.data[self.data.columns[list(reversed(self.data.sum().argsort(order=True)))]]
        logger.debug('self.data:\n%s', self.data)
        # self.data = self.data.fillna(0) # leaving the NAs in until writing is better so that we can just write ''

        # fill in data dependent keys
        labels = ['date'] + list(self.data.columns)
        types = self.types if self.types else ['date'] + ['int'] * len(self.data.columns)
        self.source['columns'] = [{'label':flabel, 'type':ftype} for flabel, ftype in zip(labels, types)]
        str_ind = self.data.index.astype(pd.lib.Timestamp).map(lambda ts : ts.strftime(self.date_fmt))
        if len(str_ind) > 0:
            self.source['timespan']['start'] = str_ind[0]
            self.source['timespan']['end'] = str_ind[-1]
        # logger.debug('exiting infer with self.data:\n%s', self.data)


    def write(self, basedir='.'):
        """
        Infers metadata from data and writes datasource csv and YAML files
        to {basedir}/datasources and {basedir}/datafiles respectively
        Args:
            basedir (str) : specifies the directory in which to place the datasources
                            and datafiles directories
        """
        
        self.infer()
        self.data.index = self.data.index\
                                           .astype(pd.lib.Timestamp)\
                                           .map(lambda ts : ts.strftime(self.date_fmt))

        # make dirs and write files
        df_dir = os.path.join(basedir, 'datafiles')
        #df_path = os.path.join(df_dir, self.limn_group, self.source['id'] + '.csv')
        df_path = os.path.join(df_dir, self.source['id'] + '.csv')
        logger.debug('writing datafile to: %s', df_path)
        if not os.path.exists(df_dir):
            os.makedirs(df_dir)
        self.data.to_csv(df_path, index_label='date', encoding='utf-8')

        logger.debug(pprint.pformat(self.source))

        ds_dir = os.path.join(basedir, 'datasources')
        ds_path = os.path.join(ds_dir, self.source['id'] + '.json')
        logger.debug('writing datasource to: %s', ds_path)
        if not os.path.exists(ds_dir):
            os.makedirs(ds_dir)
        json_f = open(ds_path, 'w')

        # the canonical=True arg keeps pyyaml from turning the str "y" (and others) into True
        json.dump(self.source, json_f, indent=4)
        json_f.close()
        self.wrote = True


    def __repr__(self):
        return pprint.pformat(vars(self))


    def get_graph(self, metric_ids=None, title=None, graph_id=None):
        """
        Returns a limnpy.Graph object with each of the (selected) datasource's columns 
        Args:
            metric_ids (list(str)) :  a list of the datasource columns to use in the graph
        """
        self.infer()

        metric_ids = metric_ids if metric_ids else self.data.columns
        title = title if title else self.source['name']
        graph_id = graph_id if graph_id else self.source['id']
        g = Graph(graph_id, title)
        for metric_id in metric_ids:
            g.add_metric(self, metric_id)
        return g


    def write_graph(self, metric_ids=None, basedir='.', title=None, graph_id=None):
        """
        Writes a graph with the (selected) datasource columns to the graphs dir in the 
        optionally specified basedir (defaults to .)
        Args:
            metric_ids (list(str)) :  a list of the datasource columns to use in the graph (defaults to all)
            basedir (str)          :  specifies the directory in which to place the datasources
                                      and datafiles directories (defaults to `.`)
        """
        g = self.get_graph(metric_ids, title=title, graph_id=graph_id)
        g.write(basedir)
        return g
