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

class Dashboard(object):

    default_dashboard = {
        'name' : '',
        'headline' : '',
        'subhead'  : '',
        'tabs': []}

    default_tab = {'name' : '',
                   'graph_ids' : []}

    def __init__(self, id, name, headline = '', subhead='', tabs=None):
        self.id = id
        self.dashboard = copy.deepcopy(Dashboard.default_dashboard)
        self.dashboard['name'] = name
        self.dashboard['headline'] = headline
        self.dashboard['subhead'] = subhead
        self.dashboard['tabs'] = tabs if tabs is not None else []

    def add_tab(self, name, graphs=[]):
        tab =  {  
            "name" : name,
            "graph_ids" : [g.graph['slug'] for g in graphs]}
        self.dashboard['tabs'].append(tab)

    def add_graph(self, tab_name, graph):
        if tab_name not in self['tabs']:
            self.dashboard['tabs'].append(self.default_tab)
        tab = [tab for tab in self.dashboard['tabs'] if tab['name'] == tab_name][0]
        tab['graph_ids'].append(graph.graph['slug'])

    def write(self, basedir='.'):
        db_dir = os.path.join(basedir, 'dashboards')
        if not os.path.exists(db_dir):
            os.makedirs(db_dir)

        db_path = os.path.join(db_dir, self.id + '.json')
        json.dump(self.dashboard, open(db_path, 'w'), indent=2)

    def __str__(self):
        return json.dumps(self.dashboard, indent=2)
