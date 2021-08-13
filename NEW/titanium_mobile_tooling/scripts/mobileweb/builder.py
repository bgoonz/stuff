#!/usr/bin/env python
# -*- coding: utf-8 -*-
#
# Builder for Mobile Web app
# 

import os, sys, optparse
import compiler

this_dir = os.path.dirname(__file__)

sys.path.append(os.path.join(os.path.dirname(this_dir), "common"))
import timobile

titanium_mobile_dir = None

def main(args):
	if len(args) < 3:
		print "[ERROR] Usage: %s <project_dir> <deploytype>" % os.path.basename(args[0])
		sys.exit(1)
		
	project_dir = os.path.expanduser(args[1])
	deploytype = args[2]
	compiler.Compiler(project_dir,deploytype,titanium_mobile_dir)
	
if __name__ == "__main__":
	parser = optparse.OptionParser()
	parser.add_option("-t", "--titanium-mobile-directory",
			dest="mobile_directory",
			default=None,
			help="Directory for the version of the Titanium Mobile SDK to compile the project against. If not provided, the latest SDK will be located"
			)
	(options, sys_argv) = parser.parse_args()
	# To mimic sys.argv, put the script name in position 0 of sys_argv
	sys_argv.insert(0, __file__)

	if options.mobile_directory:
		titanium_mobile_dir = options.mobile_directory
	else:
		titanium_mobile_root = timobile.find_mobilesdk_from_mobiletools(this_dir)
		if not titanium_mobile_root:
			print "[ERROR] Cannot locate Titanium Mobile SDK directory"
			sys.stdout.flush()
			sys.exit(1)
		(version, version_dir) = timobile.find_latest_mobilesdk(titanium_mobile_root)
		if not version_dir:
			print "[ERROR] Cannot locate Titanium Mobile SDK directory"
			sys.stdout.flush()
			sys.exit(1)
		titanium_mobile_dir = version_dir
	main(sys_argv)
	sys.exit(0)
