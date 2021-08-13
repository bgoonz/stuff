#!/usr/bin/python
# -*- coding: utf-8 -*-
#
# Copyright 2014 Spotify AB
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

from glob import glob
from os.path import getsize, isdir, join, abspath
from os import listdir
import re

def parse_memory(s):
  m = re.search('^([0-9.]+)([GMK]?)$', s)
  if not m:
    raise Exception("%s does not match <number>[GMK]?" % s)
    sys.exit(1)

  number = float(m.group(1))
  unit = m.group(2)

  multiplier = 1
  if unit == 'K': multiplier = 1024
  if unit == 'M': multiplier = 1024*1024
  if unit == 'G': multiplier = 1024*1024*1024

  return float(number) * multiplier

def add_to_file_set(dir, file_set):
  dir = abspath(dir)
  if dir in file_set:
    # avoid symlink loops
    return
  file_set.add(dir)

  if isdir(dir):
    for f in listdir(dir):
      if f not in ('.', '..'):
        add_to_file_set(join(dir, f), file_set)

def get_files(globs):
  file_set = set()
  if globs:
    for g in globs:
      for f in glob(g):
        add_to_file_set(f, file_set)
  return [f for f in file_set if not isdir(f)]

def total_size(files):
  total = 0
  for f in files:
    if not isdir(f):
      total += getsize(f)
  return total

