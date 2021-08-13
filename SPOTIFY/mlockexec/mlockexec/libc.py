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

import sys

from os import system
from time import sleep

from ctypes import c_int
from ctypes import c_size_t
from ctypes import c_ubyte
from ctypes import c_void_p
from ctypes import get_errno
from ctypes import CDLL
from ctypes import POINTER
from ctypes import RTLD_GLOBAL
from ctypes import cast

try:
    from ctypes import c_ssize_t
except ImportError:
    from ctypes import c_longlong
    is_64bits = sys.maxsize > 2 ** 32
    c_ssize_t = c_longlong if is_64bits else c_int


from mmap import MAP_SHARED
from mmap import PROT_READ
from mmap import PAGESIZE

MAP_FAILED = c_void_p(-1)

# Load libc

try:
    libc = CDLL("libc.so.6")
except OSError:
    libc = None

if libc is None:
    try:
        libc = CDLL("libc.dylib", RTLD_GLOBAL)
    except OSError:
        raise ImportError

assert libc


# set correct parameter types

c_off_t = c_ssize_t


# void *mmap(void *addr, size_t length, int prot,
#            int flags, int fd, off_t offset);
mmap = libc.mmap
mmap.restype = c_void_p
mmap.argtypes = [c_void_p, c_size_t, c_int, c_int, c_off_t]

# int munmap(void *addr, size_t length);
munmap = libc.munmap
munmap.restype = c_void_p
munmap.argtypes = [c_void_p, c_size_t]

# int mlock(const void *addr, size_t len);
mlock = libc.mlock
mlock.restype = c_int
mlock.argtypes = [c_void_p, c_size_t]

# int munlock(const void *addr, size_t len);
munlock = libc.munlock
munlock.restype = c_int
munlock.argtypes = [c_void_p, c_size_t]

# int fsync(int fd);
fsync = libc.fsync
fsync.restype = c_int
fsync.argtypes = [c_int]


# int posix_fadvise(int fd, off_t offset, off_t len, int advice);
if 'linux' in sys.platform:
    POSIX_FADV_DONTNEED = 4
    posix_fadvise = libc.posix_fadvise
    posix_fadvise.restype = c_int
    posix_fadvise.argtypes = [c_int, c_ssize_t, c_ssize_t, c_int]


# int fcntl(int fd, int cmd, ... /* arg */ );
if 'darwin' in sys.platform:
    F_NOCACHE = 48
    F_GLOBAL_NOCACHE = 55
    fcntl = libc.fcntl
    fcntl.restype = c_int
    fcntl.argtypes = [c_int, c_int, c_int]


# int mincore(void *addr, size_t length, unsigned char *vec);
libc.mincore.restype = c_int
libc.mincore.argtypes = [c_void_p, c_size_t, POINTER(c_ubyte)]


def mincore(addr, length):
    pages = (length / PAGESIZE) + (1 if length % PAGESIZE else 0)
    vec = (c_ubyte * pages)()
    res = libc.mincore(addr, length, cast(vec, POINTER(c_ubyte)))
    assert res == 0, \
        "mincore failed: 0x%x, 0x%x: %d" % (addr, length, get_errno())
    return vec


def evict(fd):
    if 'linux' in sys.platform:
        fsync(fd)
        res = posix_fadvise(fd, 0, 0, POSIX_FADV_DONTNEED)
        assert res == 0, \
            "posix_fadvise failed: %d (errno: %d)" % (res, get_errno())
    elif 'darwin' in sys.platform:
        # F_NOCACHE
        # Turns data caching off/on.
        # A non-zero value in arg turns data caching off.
        # A value of zero in arg turns data caching on.
        fcntl(fd, F_GLOBAL_NOCACHE, 1)
        # XXX (dano): neither F_NOCACHE nor F_GLOBAL_NOCACHE
        #             seem to do the trick but purge works wonders
        system("purge")
    else:
        raise NotImplemented()
