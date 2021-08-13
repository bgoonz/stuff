#!/usr/bin/env python
# -*- coding: utf-8 -*-
#
# Appcelerator Titanium Mobile
# Copyright (c) 2012 by Appcelerator, Inc. All Rights Reserved.
# Licensed under the terms of the Apache Public License
# Please see the LICENSE included with this distribution for details.
#
import os, sys

this_dir = os.path.dirname(__file__)
desktop_os_dir = os.path.dirname(os.path.dirname(os.path.dirname(this_dir)))
desktop_os = desktop_os_dir.split(os.sep)[-1]

# Titanium Mobile and the Mobile Tooling should be side-by-side next to
# each other in the directory structure below the user's Titanium directory.
# E.g., [...]/Titanium/mobilesdk/osx/X.X.X and 
# [...]/Titanium/mobiletools/osx/X.X.X in OS X.
# So we should be able to get to Titanium Mobile by going up from here
# and finding the mobilesdk directory.
def find_mobilesdk_from_mobiletools(starting_at):
	check_dir = starting_at
	while not os.path.exists(os.path.join(check_dir, "mobilesdk")):
		check_dir = os.path.dirname(check_dir)
		if os.path.dirname(check_dir) == check_dir:
			# reached top
			break
	check_dir = os.path.join(check_dir, "mobilesdk", desktop_os)
	if os.path.exists(check_dir):
		return check_dir
	else:
		return None


def find_mobilesdk_version(sdk_root, version):
	subdirs = [d for d in os.listdir(sdk_root) if os.path.isdir(os.path.join(sdk_root, d))]
	if version in subdirs:
		return (version, os.path.join(sdk_root, version))
	else:
		return (None, None)

def find_latest_mobilesdk(sdk_root):
	subdirs = [d for d in os.listdir(sdk_root) if os.path.isdir(os.path.join(sdk_root, d))]
	max_ver = "0.0.0"
	max_ver_dir = None
	
	for d in subdirs:
		dir_path = os.path.join(sdk_root, d)
		if os.path.islink(dir_path):
			real_path = os.path.realpath(dir_path)
		else:
			real_path = dir_path
		if os.path.exists(os.path.join(real_path, "iphone")) and os.path.exists(os.path.join(real_path, "android")):
			# "looks like" a Titanium Mobile directory.
			version = real_path.split(os.sep)[-1]
			if version > max_ver:
				max_ver = version
				max_ver_dir = dir_path
	return (max_ver, max_ver_dir)
