#!/usr/bin/python
# -*- coding: utf-8 -*-
#
# Copyright 2012-2014 Spotify AB
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


from math import ceil
from os.path import getsize

from libc import get_errno
from libc import MAP_FAILED
from libc import MAP_SHARED
from libc import PAGESIZE
from libc import PROT_READ

from mlockexec.libc import mlock
from mlockexec.libc import mmap
from mlockexec.libc import munlock
from mlockexec.libc import munmap


class FileMapper(object):
    def __init__(self, filepath, fileno, size):
        super(FileMapper, self).__init__()
        self.size = size
        self.addr = mmap(0, size, PROT_READ, MAP_SHARED, fileno, 0)
        assert self.addr != MAP_FAILED, \
            "Failed to mmap %s (errno: %d)" % (filepath, get_errno())

    def __del__(self):
        if self.addr and self.addr != MAP_FAILED:
            munmap(self.addr, self.size)


class FileLocker(object):
    def __init__(self, filepath, size=None, chunk_size=None):
        super(FileLocker, self).__init__()
        self.addr = None
        self.size = 0
        self.filepath = filepath
        self.chunk_size = chunk_size or 1024 * 1024
        assert self.chunk_size % PAGESIZE == 0
        size = size or getsize(filepath)
        with open(filepath, "r") as f:
            self.mapper = FileMapper(filepath, f.fileno(), size)
        self.addr = self.mapper.addr
        self.size = size
        if self.size == 0:
          return
        chunks = long(ceil(size / float(self.chunk_size)))
        assert chunks != 0, "chunks == 0"
        locked = 0
        for i in xrange(chunks):
            chunk_offs = self.mapper.addr + i * self.chunk_size
            chunk_size = min(self.mapper.addr + size - chunk_offs, self.chunk_size)
            res = mlock(chunk_offs, chunk_size)
            assert res != -1, \
                "Failed to mlock %s chunk [0x%016x-0x%016x] (errno: %d)" % (filepath, chunk_offs, chunk_offs + chunk_size - 1, get_errno())
            locked += chunk_size
        assert locked == size, "locked != size"

    def __del__(self):
        # munlock entire range regardless of if mlocking all chunks was successful or not.
        # munlock only requires that the address range is mapped, not mlocked, and
        # if self.addr is set, then the entire range is mapped.
        if self.addr:
            munlock(self.addr, self.size)
        self.mapper = None
