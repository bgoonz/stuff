#!/usr/bin/env python
# -*- coding: utf-8 -*-
#
# Appcelerator Titanium Mobile
# Copyright (c) 2012 by Appcelerator, Inc. All Rights Reserved.
# Licensed under the terms of the Apache Public License
# Please see the LICENSE included with this distribution for details.
#
# Packages tools for delivery.
#

VERSION = "2.1.0"

OS_NAMES = {"Windows":"win32", "Linux":"linux", "Darwin":"osx"}
IGNORE_DIRS = (".git", ".DS_Store", "dist")
IGNORE_FILES = (".gitignore","titanium.py") # we package titanium.py specially.
IGNORE_EXTENSIONS = (".pyc", ".swp")

import os, platform, zipfile, optparse, subprocess
from datetime import datetime

this_dir = os.path.dirname(os.path.abspath(__file__))
output_dir = os.path.join(this_dir, "dist")


def get_git_hash():
	git = "git"
	if platform.system() == "Windows":
		git += ".cmd"

	p = subprocess.Popen([git,"show","--abbrev-commit"],stderr=subprocess.PIPE, stdout=subprocess.PIPE)
	return p.communicate()[0][7:].split('\n')[0].strip()

def package(desktop_os):
	zip_file_name = "mobiletools-%s-%s.zip" % (desktop_os, VERSION)
	arc_root = "mobiletools/%s/%s/" % (desktop_os, VERSION)

	if not os.path.exists(output_dir):
		os.mkdir(output_dir)

	zf = zipfile.ZipFile(os.path.join(output_dir, zip_file_name), "w", zipfile.ZIP_DEFLATED)

	version_txt = "version=%s\ntimestamp=%s\ngithash=%s\n" % (
		VERSION, datetime.now().strftime("%m/%d/%y %H:%M"), get_git_hash())
	zf.writestr(os.path.join(arc_root, "version.txt").replace(os.sep, "/"), version_txt)

	# We put titanium.py specially in root of the package.
	zf.write(os.path.join(this_dir, "scripts", "common", "titanium.py"), os.path.join(arc_root, "titanium.py").replace(os.sep, "/"))

	# Beyond that, we just package everything up as-is.
	for root, dirs, files in os.walk(this_dir):
		for d in IGNORE_DIRS:
			if d in dirs:
				dirs.remove(d)
		for f in files:
			full_path = os.path.join(root, f)
			if f in IGNORE_FILES:
				continue
			if os.path.abspath(os.path.join(root, f)) == os.path.abspath(__file__):
				continue
			skip = False
			for ext in IGNORE_EXTENSIONS:
				if f.endswith(ext):
					skip = True
					break
			if skip:
				continue
			rel_path = full_path.replace(this_dir, "")
			if rel_path.startswith(os.sep):
				rel_path = rel_path[1:]
			arc_name = os.path.join(arc_root, rel_path).replace(os.sep, "/")
			zf.write(full_path, arc_name)
	zf.close()

if __name__ == "__main__":
	parser = optparse.OptionParser()
	parser.add_option("-a", "--all", dest="all_oss", default=False,
			action="store_true", help="Create zip files for all supported desktop OSs")
	(options, args) = parser.parse_args()
	if options.all_oss:
		os_list = OS_NAMES.values()
	else:
		os_list = (OS_NAMES[platform.system()],)

	for one_os in os_list:
		package(one_os)
	
