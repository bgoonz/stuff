#! /usr/bin/env python
# -*- coding: utf-8 -*-
# Copyright (c) 2012-2014 Spotify AB

# This file is part of mlockexec.

from setuptools import setup

setup(name='mlockexec',
      version='0.1',
      author=u'Kristofer Karlsson',
      author_email='krka@spotify.com',
      url='https://github.com/spotify/mlockexec',
      description='Commandline tool for running processes with specific files locked in memory.',
      license='Apache Software License 2.0',
      scripts=['bin/mlockexec'],
      packages=['mlockexec'],
      install_requires=['lockfile'],
      classifiers=[
          'License :: OSI Approved :: Apache Software License',
          'Topic :: Utilities',
      ])
