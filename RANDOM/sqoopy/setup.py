#!python
# -*- coding: utf-8 -*-
import sys, os, re
from os.path import dirname, abspath, join
from setuptools import setup, find_packages

HERE = abspath(dirname(__file__))
readme = open(join(HERE, 'README.md'), 'rU').read()

package_file = open(join(HERE, 'sqoopy/__init__.py'), 'rU')
__version__ = re.sub(
    r".*\b__version__\s+=\s+'([^']+)'.*",
    r'\1',
    [ line.strip() for line in package_file if '__version__' in line ].pop(0)
)


setup(
    name             = 'sqoopy',
    version          = __version__,
    description      = 'Generate Sqoop custom import statements',
    long_description = readme,
    url              = 'https://github.com/wmf-analytics/sqoopy',
    
    author           = 'Diederik van Liere',
    author_email     = 'dvanliere@wikimedia.org',
    
    packages         = find_packages(),
    entry_points     = { 
        'console_scripts':[
            'sqoopy = sqoopy.generate:main',
            'sqoopy_inspect = sqoopy.inspect:main',
        ]
    },
    
    install_requires = [
        'docopt',
        'texttable',
    ],
    
    keywords         = [ 'sqoop', 'mysql', 'import', 'hadoop', ],
    classifiers      = [
        "Development Status :: 4 - Beta",
        "Environment :: Console",
        "Intended Audience :: Developers",
        "Topic :: Utilities"
        "Topic :: Software Development :: Libraries :: Python Modules",
        "Programming Language :: Python",
        "Programming Language :: Python :: 2.6",
        "Programming Language :: Python :: 2.7",
        "Operating System :: OS Independent",
        "License :: OSI Approved :: MIT License",
    ],
    zip_safe = False,
    license  = "GPLv2",
)
