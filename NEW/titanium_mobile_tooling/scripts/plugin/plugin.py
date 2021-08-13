#!/usr/bin/env python 
# -*- coding: utf-8 -*-
#
# Plugin Project Create Script
#

import os, sys, shutil, string, uuid, re, zipfile, glob
from string import capitalize
from StringIO import StringIO
from datetime import date

this_dir = os.path.dirname(__file__)
sys.path.append(os.path.join(os.path.dirname(this_dir), "common"))
import timobile

templates_dir = os.path.join(os.path.dirname(os.path.dirname(this_dir)), "templates", "plugin")

ignoreFiles = ['.gitignore', '.cvsignore', '.DS_Store'];
ignoreDirs = ['.git','.svn','_svn','CVS'];
nonFilterFiles = ['.png','.gif','.jpg','.zip','.a','.o', '.jar']

class PluginProject(object):
	def __init__(self, project_dir, config, ti_sdk_dir):
		self.project_dir = project_dir
		self.ti_sdk_dir = ti_sdk_dir
		self.config = config
		self.project_id = config['id']
		self.guid = str(uuid.uuid4())
		self.sdk_version = os.path.basename(self.ti_sdk_dir)
		if os.path.exists(templates_dir):
			self.copy_template_files(templates_dir)

	def replace_tokens(self, string):
		string = string.replace('__PROJECT_ID__',self.project_id)
		string = string.replace('__VERSION__',self.sdk_version)
		string = string.replace('__SDK__',self.ti_sdk_dir)
		string = string.replace('__GUID__',self.guid)
		string = string.replace('__YEAR__',str(date.today().year))
		return string

	def get_file_dest(self, template_dir, from_path):
		file_dest = os.path.expanduser(from_path.replace(template_dir, self.project_dir, 1))
		return file_dest
		
	def copy_template_files(self, template_dir):
		for root, dirs, files in os.walk(template_dir):
			for name in ignoreDirs:
				if name in dirs:
					dirs.remove(name)	# don't visit ignored directories
			for file in files:
				if file in ignoreFiles:
					continue
				prefix = root[len(template_dir):]
				from_ = os.path.join(root, file)
				to_ = self.get_file_dest(template_dir, from_)
				to_ = self.replace_tokens(to_)
				to_directory = os.path.expanduser(os.path.split(to_)[0])
				if not os.path.exists(to_directory):
					os.makedirs(to_directory)
				fp = os.path.splitext(file)
				filter = True
				if len(fp)>1 and fp[1] in nonFilterFiles:
					# if a non-filter file, just copy
					filter = False
				if os.path.exists(to_): os.remove(to_)
				shutil.copy(from_,to_)
				if filter:
					contents = open(from_).read()
					tof = open(to_,'w')
					contents = self.replace_tokens(contents)
					tof.write(contents)
					tof.close()

def usage(prop,required,optional=None):
	print "Couldn't find required '%s' argument" % prop
	print
	print "Usage: %s <options>" % os.path.basename(sys.argv[0])
	print
	print "Required arguments:\n"
	for key in required:
		disp = key + ' <value>'
		print "	 --%s %s" % (string.ljust(disp,20),required[key])
	if optional:
		print 
		print "Optional arguments:\n"
		for key in optional:
			disp = key + ' <value>'
			print "  --%s %s" % (string.ljust(disp,20),optional[key])
	sys.exit(1)

def sysargs_to_dict(args,required=None,optional=None):
	c = 1
	props = {}
	while c < len(args):
		key = args[c]
		if key[0:2]=='--': key = key[2:]
		value = None
		if c + 1 < len(args):
			value = args[c+1]
		props[key]=value
		c = c + 2
	if required:
		for key in required:
			if not props.has_key(key):
				usage(key, required, optional)
	return props

#
# this is the main entry point for the script
# this script is setup to run from the titanium.py script although you
# could also invoke it directly if you want or run from command line
#
def main(args):
	required_opts = {
		'directory':'the directory to create the plugin',
		'id':'the module id in dotted notation: such as com.yourcompany.foo'
	}
	optional_opts = {
		'sdk':'the platform sdk path',
		'titanium':'the Titanium Mobile sdk path'
	}
	config = sysargs_to_dict(args,required_opts,optional_opts)
	plugin_name = config['id']
	project_dir = os.path.join(os.path.abspath(os.path.expanduser(config['directory'])),plugin_name)

	if os.path.exists(project_dir):
		print "Error. Directory already exists: %s" % project_dir
		sys.exit(1)

	ti_sdk_dir = None
	if  'titanium' in config:
		ti_sdk_dir = os.path.expanduser(config['sdk'])

	if ti_sdk_dir is None or not os.path.exists(ti_sdk_dir):
		sdk_root = timobile.find_mobilesdk_from_mobiletools(this_dir)
		if not sdk_root:
			print "[ERROR] Cannot locate Titanium Mobile SDK"
			sys.exit(1)
		(version, ti_sdk_dir) = timobile.find_latest_mobilesdk(sdk_root)
		if not ti_sdk_dir:
			print "[ERROR] Cannot locate Titanium Mobile SDK"
			sys.exit(1)

	plugin = PluginProject(project_dir,config,ti_sdk_dir)

if __name__ == "__main__":
	main(sys.argv)
