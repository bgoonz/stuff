#!/usr/bin/env python 
# -*- coding: utf-8 -*-
#
# Mobile Web Application Script
#

import os,sys,shutil

this_dir = os.path.dirname(__file__)
scripts_root_dir = os.path.dirname(this_dir)
tools_root_dir = os.path.dirname(scripts_root_dir)
baseapp_dir = os.path.join(tools_root_dir, "templates", "baseapp", "mobileweb")

class MobileWeb(object):
	
	def __init__(self,name,appid,ti_sdk_dir):
		self.name = name
		self.id = appid
		self.ti_sdk_dir = ti_sdk_dir
		
	def create(self,dir,release=False):
		
		if release:
			project_dir = dir
			mobileweb_dir = dir
		else:
			project_dir = os.path.join(dir,self.name)
			mobileweb_dir = os.path.join(project_dir,'build','mobileweb')	

		if not os.path.exists(project_dir):
			os.makedirs(project_dir)
			
		if not os.path.exists(mobileweb_dir):
			os.makedirs(mobileweb_dir)
		
		mobileweb_project_resources = os.path.join(project_dir,'Resources','mobileweb')
		if os.path.exists(mobileweb_project_resources):
			shutil.rmtree(mobileweb_project_resources)
		shutil.copytree(os.path.join(baseapp_dir,'resources'),mobileweb_project_resources)
		
		# create the mobileweb resources	
		mobileweb_resources_dir = os.path.join(mobileweb_dir,'Resources')
		if not os.path.exists(mobileweb_resources_dir):
			os.makedirs(mobileweb_resources_dir)

if __name__ == '__main__':
	if len(sys.argv) != 5 or sys.argv[1]=='--help':
		print "Usage: %s <name> <id> <directory> <titanium_sdk_dir>" % os.path.basename(sys.argv[0])
		sys.exit(1)
		
	mw = MobileWeb(sys.argv[1],sys.argv[2],sys.argv[4])
	mw.create(sys.argv[3])
