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

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


class Graph(object):
    """
    Represents a limn compatible graph with the provided options.

        >>> import limnpy, datetime
        >>> rows1 = [[datetime.date(2012, 9, 1), 1, 2],
        ...         [datetime.date(2012, 10, 1), 7, 9]]
        >>> s1 = limnpy.DataSource('source1', 'Source 1', rows1, labels=['date', 'x', 'y'])
        >>> s1.write(basedir='doctest_tmp')
        >>> rows2 = [[datetime.date(2012, 9, 1), 19, 22],
        ...         [datetime.date(2012, 10, 1), 27, 29]]
        >>> s2 = limnpy.DataSource('source2', 'Source 2', rows2, labels=['date', 'x', 'y'])
        >>> s2.write(basedir='doctest_tmp')
        >>> g = limnpy.Graph('my_first_autograph', 'My First Autograph', [s1, s2], [('source1', 'x'), ('source2', 'y')])
        >>> g.write(basedir='doctest_tmp')
        >>> hash(open('doctest_tmp/graphs/my_first_autograph.json').read())
        -7062740022070187030

    or just pass in the sources and a graph will be constructed containing all of the columns
    in all of the sources

        >>> rows = [[datetime.date(2012, 9, 1), 1, 2],
        ...         [datetime.date(2012, 10, 1), 7, 9]]
        >>> s1 = limnpy.DataSource('source1', 'Source 1', rows, labels=['date', 'x', 'y'])
        >>> g = limnpy.Graph('my_first_default_autograph', 'My First Default Autograph', [s1])
        >>> g.write(basedir='doctest_tmp')
        >>> hash(open('doctest_tmp/graphs/my_first_default_autograph.json').read())
        5355513043120506668


    """

    METRIC_CHILD_ID = 7


    def __init__(self, id, title, sources=[], metric_ids=None, slug=None):
        """
        Construct a Python object representing a limn graph.
        Args:
            id         (str)   : graph id which uniquely identifies this graph for use in dashboards and such
            title      (str)   : title which will be displayed above graph
            sources    (list)  : list of limnpy.DataSource objects from which to construct the graph
        Kwargs:
            metric_ids (list)  : list of tuples (datasource_id, column_name) to plot if None will
                                 plot all of the columns from all of the datasources
            slug       (str)   : slug used to identify the graph by url (via {domain}/graphs/slug)
                                 defaults to the value of `id`
        """
        self.graph = copy.deepcopy(Graph.default_graph)

        self.graph['id'] = id
        self.graph['name'] = title
        self.__index__ = 0 # metric counter; incremented by add_metric
        if slug is None:
            self.graph['slug'] = id
        else:
            self.graph['slug'] = slug

        # construct metric_ids list of tuples for all metrics and all sources
        if metric_ids is None:
            metric_ids = []
            for source in sources:
                labels = set([col['label'] for col in source.source['columns']]) - set(['date'])
                source_id_repeat = itertools.repeat(source.source['id'])
                metric_ids.extend(zip(source_id_repeat,labels))

        source_dict = {source.source['id'] : source for source in sources}
        for source_id, col_key in metric_ids:
            source = source_dict[source_id]
            try:
                self.add_metric(source, col_key)
            except ValueError:
                logger.warning('Could not find column label: %s in datasource: %s', col_key, source.source['id'])
    
    
    def add_metric(self, source, col_key, label=None, color=None):
        """
        Adds a line, or metric, to the graph object corresponding 
        to the column `col_key` in the datasource`
        """
        try:
            col_idx = [i for (i, col) in enumerate(source.source['columns']) if col['label'] == col_key][0]
        except:
            #logger.warning('could not find column named %s in datasoure:\n%s', col_key, source)
            return
        metric = copy.deepcopy(self.default_metric)
        metric['index'] = self.__index__
        if label is not None:
            metric['options']['label'] = label
        metric['metric']['source_id'] = source.source['id']
        metric['metric']['source_col'] = col_idx
        self.__index__ += 1
        self.graph['root']['children'][Graph.METRIC_CHILD_ID]['children'].append(metric)

    def write(self, basedir='.', set_colors=True):
        """
        writes graph JSON file to {basedir}/graphs.
        Args:
            basedir (str) : specifies the directory in which to place the graphs
                            will create the graphs directory if it doesn not already
                            exist
        """
        graphdir = os.path.join(basedir, 'graphs')
        if not os.path.isdir(graphdir):
            os.mkdir(graphdir)
        graph_fn = os.path.join(graphdir, self.graph['id'] + '.json')

        graph_f = codecs.open(graph_fn, encoding='utf-8', mode='w')
        json.dump(self.graph, graph_f, indent=2)
        graph_f.close()
    

    @classmethod
    def get_color_map(cls, n):
        """ get colorspace based on number of metrics using colorbrewer """
        #family = colorbrewer.Set2
        family = {
            3: ['rgb(102,194,165)', 'rgb(252,141,98)', 'rgb(141,160,203)'],
            4: ['rgb(102,194,165)', 'rgb(252,141,98)', 'rgb(141,160,203)', 'rgb(231,138,195)'],
            5: ['rgb(102,194,165)', 'rgb(252,141,98)', 'rgb(141,160,203)', 'rgb(231,138,195)', 'rgb(166,216,84)'],
            6: ['rgb(102,194,165)', 'rgb(252,141,98)', 'rgb(141,160,203)', 'rgb(231,138,195)', 
                'rgb(166,216,84)', 'rgb(255,217,47)'],
            7: ['rgb(102,194,165)', 'rgb(252,141,98)', 'rgb(141,160,203)', 'rgb(231,138,195)',
                'rgb(166,216,84)', 'rgb(255,217,47)', 'rgb(229,196,148)'],
            8: ['rgb(102,194,165)', 'rgb(252,141,98)', 'rgb(141,160,203)', 'rgb(231,138,195)', 
                'rgb(166,216,84)', 'rgb(255,217,47)', 'rgb(229,196,148)', 'rgb(179,179,179)']
            }
        if n == 2:
            color_map = [family[3][0], family[3][2]]
        if n < 3:
            color_map = family[3][:n]
        elif n >= max(family.keys()):
            logger.warning('too many metrics, looping over color space')
            color_map = itertools.cycle(family[max(family.keys())])
            color_map = list(itertools.islice(color_map, None, n))
        else:
            color_map = family[n]
        #str_color_map = ['rgb(%d,%d,%d)' % color_tuple for color_tuple in color_map]
        return color_map


    """ Default Graph and metric objects """
    
    default_graph = {
        "graph_version": "0.6.0",
        "id": None,
        "slug": None,
        "name": None,
        "shortName": "",
        "desc": "",
        "notes": "",
        "root": {
            "nodeType": "canvas",
            "disabled": False,
            "children": [
                {
                    "nodeType": "axis",
                    "disabled": False,
                    "options": {
                        "tickFormat": "MMM YY",
                        "dimension": "x",
                        "orient": "bottom"
                    }
                },
                {
                    "nodeType": "axis",
                    "disabled": False,
                    "options": {
                        "tickFormat": "MMM YY",
                        "dimension": "y",
                        "orient": "left"
                    }
                },
                {
                    "nodeType": "grid",
                    "disabled": False,
                    "options": {
                        "ticks": 10,
                        "dimension": "x"
                    }
                },
                {
                    "nodeType": "grid",
                    "disabled": False,
                    "options": {
                        "ticks": 10,
                        "dimension": "y"
                    }
                },
                {
                    "nodeType": "zoom-brush",
                    "disabled": False,
                    "options": {
                        "allowX": True,
                        "allowY": True
                    }
                },
                {
                    "nodeType": "callout",
                    "disabled": False,
                    "options": {
                        "dateFormat": "MMM YYYY",
                        "deltaPercent": True,
                        "colorDelta": True,
                    },
                    "metricRef": 0,
                    "target": "latest",
                    "steps": [
                        "1y",
                        "1M"
                    ]
                },
                {
                    "nodeType": "legend",
                    "disabled": False,
                    "label": "Aug 2012",
                    "options": {
                        "dateFormat": "MMM DD YYYY",
                        "valueFormat": ",.2s"
                    }
                },
                {
                    "nodeType": "line-group",
                    "disabled": False,
                    "options": {
                        #"palette": "wmf_projects",
                        #"scale": "log",
                        #"dateFormat": "MMM YYYY",
                        "stroke": {
                            "width": 2,
                            "opacity": 1
                        }
                    },
                    "children": [
                    ]
                }
            ],
            "width": "auto",
            "minWidth": 750,
            "height": 500,
            "minHeight": 500,
            "scaling": "linear"
        }
    }


    default_metric = {
        "nodeType": "line",
        "disabled": False,
        "metric": {
            "source_id": None,
            "source_col": None,
            "type": "int"
        },
        "options": {
            "label": None,
            "stroke": {
                "width": 2
            },
            "noLegend": False,
            "dateFormat": "MMM YYYY",
        }
    }
