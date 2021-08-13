limnpy
======

A library for creating [limn](https://github.com/wikimedia/limn) compatible datasources and datafiles

* [Introduction](#introdcution)
* [Installation](#installation)
* [Library Usage](#usage)
    * [Acceptable Data Formats](#acceptable-data-formats)
    * [Graphs](#graphs)
    * [Dashboards](#dashboards)
* [Command Line Utility](#command-line-utility)

## Introduction

[`limn`](github.com/wikimedia/limn), a visualization tool for non-programmers, still requires at least one or two programmers
to generate the datasources which can be plotted.  In order to make a timeseries available for plotting with `limn`
you need to generate an appropriately formatted csv file (known as a `datafile`) as well as a valid YAML file with metadata
(known as a `datasource`). `limnpy` aims to solve the simple cases where you've prepared the timeseries data and
just want to write a `datafile` and `datasource` pair without worrying about the details.

## Installation

`limnpy` is packaged with setuptools, so you have some options, but I recommend either

````bash
$ pip install -e git+git://github.com/wikimedia/limnpy.git#egg=limnpy-0.1.0
````

## Usage

To dump data to file simply construct an instance of a `limnpy.DataSource` and call its `write()` method.

````python
import limnpy, datetime
rows = [{'date' : datetime.date(2012, 9, 1), 'x' : 1, 'y' : 2},
        {'date' : datetime.date(2012, 10, 1), 'x' : 7, 'y' : 9},]
ds = limnpy.DataSource('test_source', 'Test Source', rows)
ds.write()
````
which should create the files `./datasources/test_source.yaml` and `./datafiles/test_source.csv`.  To control the location
of these files, you can pass in the `basedir` argument to the `write()` method which directs limnpy to
place the YAML and csv files in `BASEDIR/{datasources,datafiles,graphs}`, creating any missing directories along the way.

````python
ds.write(basedir='../in/a/directory/far/far/away/')
````

Just calling the constructor with the appropriate arguments should really handle most cases, 
but for everything else you can just direclty manipulate the `source` and `data` fields before calling `write()`.  The
`source` field is just a nested `dict`/`list` object which directly maps to the YAML/JSON datasource file
and the `data` attribute returns a reference to the internal `pandas.DataFrame` object which
limnpy uses to store the data and labels.  This has the perk of making lots of standard data cleaning/tranforming taks
relatively easy (if you are familiar with `pandas`)

````python
ds_scaled = limnpy.DataSource('scaled', 'Data Scaled by a factor of 1000', ds.data * 1000)
ds_scaled.write()
combined = limnpy.DataSource('combined', 'Combined', pd.merge(ds.data, ds_scaled.data))
````

One brief note about making limnpy work with your specific limn installation.  If your dashboard is called fluff.wmflabs.org a common layout might look like:

````
limn_install/limn-data
limn_install/limn-data/datasources/fluff
limn_install/limn-data/datafiles/fluff
limn_install/limn-data/graphs/fluff
````

If this is your setup, you'll need to include the `fluff` directory in the datafile path within your datasouce.  To do this, just add the `limn_group` keyword argument to the `DataSource` constructor like this:

````python
ds = limnpy.DataSource(limn_id='test_source', limn_name='Test Source', limn_group='fluff', data=rows)
````

### Acceptable Data Formats
Because `limnpy` uses `pandas.DataFrame` objects internally, it defers the parsing of the constructor's `data` argument 
to the `pandas.DataFrame` constructor.  This means that you can construct a `DataSource` object from whatever
format your data already exist in.  The only catch is that the `DataSource` needs to know the column labels for things like
figuring out which column contains the dates and eventually showing the Limn graph maker the name of the particular column
which they are plotting.  So, if the datasource you pass in does not represent the column names, 
you need to pass in a list of strings as the optional `labels` parameter

````python 
rows = [[datetime.date(2012, 9, 1), 1, 2],                                                                                                                                                   
        [datetime.date(2012, 10, 1), 7, 9]
ds = DataSource('id', 'Name', rows, labels=['date', 'x', 'y'])

rows = [{'date' : datetime.date(2012, 9, 1), 'x' : 1, 'y' : 2},                                                                                                                              
        {'date' : datetime.date(2012, 10, 1), 'x' : 7, 'y' : 9}]
ds = DataSource('id', 'Name', rows)

rows = {'date' : [datetime.date(2012, 9, 1), datetime.date(2012, 10, 1)],
        'x' : [1, 7],
        'y' : [2, 9]}
ds = DataSource('id', 'Name', rows)

import pandas as pd
rows = pd.DataFrame(rows)
ds = DataSource('id', 'Name', rows)
````

Lastly, because the date information requires some special handling, the DataSource needs to know which column
contains the dates.  By default a `DataSource` looks for a column labeled `date`,  but this can be overridden using
the `date_key` optional parameter:

````python
rows = [{'first_seen' : datetime.date(2012, 9, 1), 'x' : 1, 'y' : 2},                                                                                                                              
        {'first_seen' : datetime.date(2012, 10, 1), 'x' : 7, 'y' : 9}]
ds = DataSource('id', 'Name', rows, date_key='first_seen')
````

### Graphs
Another common task is the automatic generation of a graph.  To construct a graph from a `limnpy.DataSource`
object containing all columns, just call `ds.write_graph()`.  Or, to specify a particular set of columns to
plot from a `DataSource`, call

````python
ds.write_graph(['x'])
````

To make a graph which contains columns from more than one DataSeries, you can directly construct an instance of
`limnpy.Graph` by explicitly adding columns one at a time and then calling its `write()` method.

````python
rows1 = [[datetime.date(2012, 9, 1), 1, 2],
         [datetime.date(2012, 10, 1), 7, 9]]
s1 = limnpy.DataSource('source1', 'Source 1', rows1, labels=['date', 'x', 'y'])
s1.write(basedir='doctest_tmp')

rows2 = [[datetime.date(2012, 9, 1), 19, 22],
         [datetime.date(2012, 10, 1), 27, 29]]
s2 = limnpy.DataSource('source2', 'Source 2', rows2, labels=['date', 'x', 'y'])
s2.write(basedir='doctest_tmp')

g = limnpy.Graph('custom_graom', 'Custom Graph')
g.add_metric(s1, 'x', 'Custom Label for X')
g.add_metric(s2, 'y', 'Custom Label for Y')
g.write()                                      
````

### Dashboards
If you need to make a lot of dashboards, or don't want to worry about manually writing valid JSON, this tool is for you.  You can programmatically construct an instance of `limnpy.Dashboard` and then call its `write()` method to create the appropriate file.  First, call the constructor and specify the slug, title, and heading:

````python
db = limnpy.Dashboard('sobchak', 'Sobchak Security', 'Dashboard')
````

Which will construct a dashboard object which will be accessible at "your.domain.org/dashboards/sobchak". To add actual graphs you then call the dashboard object's `add_graph(name, graph_ids)` method, like this:

````python
db.add_tab('core', ['intruders'])
db.add_tab('core', [intruder_graph.__graph__['id']])
````

Alternatively, you can pass in a list of `dict`s to the Dashbaord contructor, which is formatted like this:

````python
[{'name' : 'core', 'graph_ids' : ['intruders_total', 'intruders_daily']},
 {'name' : 'ancillary', 'graph_ids' : ['false_alarms']}]
````

And to finally create the JSON file which the server will read, call `db.write(basedir)` to place the file in the appropriate subdirectory ('dashboards') of 'basedir'

## Command Line Utility

Installing `limnpy` also installs `limnify`, which is a highly customizable tool for taking turning a csv-like file into a limn-compatible datasource or graph which can be directly served by a limn installation.  In the simplest case, you just call

````
$ limnify my_data.csv
````

and it creates the files `./datafiles/my_data.csv` and `./datasources/my_data.yaml`.  But inevitably, your data will have it's own oddities.  `limnify` allows you to accomodate a variety of ways in which your data may need special care by using the various options described below.  But it's probably worth noting three main things about what `limnify` expects so you don't get a bunch of errors:
* it needs to know which column contains the date (just like the rest of `limnpy`)
* it needs to give each column a name so that end limn users to tell what is what
* it can accomodate "long" format data which it will pivot by summing the values in certain columns when grouped by other columns.

Here is the help page:

````
$ limnify --help
usage: limnify [-h] [--delim DELIM] [--header HEADER [HEADER ...]]
               [--datecol DATECOL] [--datefmt DATEFMT] [--pivot]
               [--metriccol METRICCOL] [--valcol VALCOL] [--basedir BASEDIR]
               [--name NAME [NAME ...]] [--id ID] [--write_graph WRITE_GRAPH]
               data

positional arguments:
  data                  name of file to be limnified

optional arguments:
  -h, --help            show this help message and exit
  --delim DELIM         delim to use for input file (default: ,)
  --header HEADER [HEADER ...]
                        this is a space separated list of names to use as the
                        header rowIf your data doesn't already have a header
                        row you will need to pass in a list of names to use,
                        otherwise itwill assume the first row is a header and
                        then produce confusing data sources. Remember, these
                        names will bedisplayed in the graph editing interface
                        (default: None)
  --datecol DATECOL     the date column name or index--required if it is
                        different from `date` (default: 0)
  --datefmt DATEFMT     format to use with datetime.strptime, default uses
                        dateutil.parser.parse (default: None)
  --pivot               whether to try and pivot the data (only supports sum
                        aggregation for now) (default: False)
  --metriccol METRICCOL
                        the column name or index to use for creating the
                        column (metric) names when pivoting (default: 1)
  --valcol VALCOL       the column in which to find the actual data to be
                        plotted when pivoting (default: 2)
  --basedir BASEDIR     directory in which to place the output datasources,
                        datafiles and graphs directories (default: .)
  --name NAME [NAME ...]
                        name of datasource which will be displayed in the UI
                        (default: None)
  --id ID               the slug / id used to uniquely identify the datasource
                        within a limn installation (default: None)
  --write_graph WRITE_GRAPH
                        whether to write a graph file containing all columns
                        from the datasource (default: False)
````

Here is a simple example:

````bash
$ head -n2 test.tsv
2013-01-01_00   Asia	535984
2013-01-01_00	Africa	20536
$ limnify --datefmt="%Y-%m-%d_%H" --pivot --header Hour Continent Count --datecol=Hour test.tsv
...
$ head datafiles/test.csv
date,Africa,Asia,Europe,North America,Oceania,South America,Unknown
2013/01/01,20536.0,535984.0,1863240.0,1963952.0,86483.0,71855.0,4908.0
````
