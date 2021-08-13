#!/usr/bin/env python 
# -*- coding: utf-8 -*-
#
# iPhone Application Script
#

import os,sys,shutil
this_dir = os.path.dirname(__file__)
scripts_dir = os.path.dirname(this_dir)
tools_dir = os.path.dirname(scripts_dir)
scripts_common_dir = os.path.join(scripts_dir, "common")
baseapp_dir = os.path.join(tools_dir, "templates", "baseapp")
baseapp_iphone_dir = os.path.join(baseapp_dir, "iphone")

sys.path.append(scripts_common_dir)
from tiapp import *
from projector import *

class IPhone(object):
	
	def __init__(self, name, appid, ti_sdk_dir):
		self.name = name
		self.id = appid
		self.ti_sdk_dir = ti_sdk_dir
		
	def create(self,dir,release=False):
		
		if release:
			project_dir = dir
			iphone_dir = dir
		else:
			project_dir = os.path.join(dir,self.name)
			iphone_dir = os.path.join(project_dir,'build','iphone')	

		if not os.path.exists(project_dir):
			os.makedirs(project_dir)
			
		if not os.path.exists(iphone_dir):
			os.makedirs(iphone_dir)
		
		real_ti_sdk_dir = self.ti_sdk_dir
		if os.path.islink(real_ti_sdk_dir):
			real_ti_sdk_dir = os.path.realpath(real_ti_sdk_dir)
		version = os.path.basename(real_ti_sdk_dir)
		project = Projector(self.name, version, os.path.join(self.ti_sdk_dir, "iphone"), project_dir, self.id)
		project.create(os.path.join(self.ti_sdk_dir, "iphone"), iphone_dir)
		
		iphone_project_resources = os.path.join(project_dir,'Resources','iphone')
		if os.path.exists(iphone_project_resources):
			shutil.rmtree(iphone_project_resources)
		shutil.copytree(os.path.join(baseapp_iphone_dir, 'resources'), iphone_project_resources)
		
		plist = open(os.path.join(baseapp_iphone_dir, 'Info.plist'), 'r').read()

		# Sometimes we actually need app properties!
		tiapp = TiAppXML(os.path.join(project_dir,'tiapp.xml'))

		if not release:
			plist = plist.replace('__PROJECT_NAME__',self.name)
			plist = plist.replace('__PROJECT_ID__',self.id)
			plist = plist.replace('__URL__',self.id)
			urlscheme = self.name.replace('.','_').replace(' ','').lower()
			plist = plist.replace('__URLSCHEME__',urlscheme)
			if tiapp.has_app_property('ti.facebook.appid'):
				fbid = tiapp.get_app_property('ti.facebook.appid')
				plist = plist.replace('__ADDITIONAL_URL_SCHEMES__', '<string>fb%s</string>' % fbid)
			else:
				plist = plist.replace('__ADDITIONAL_URL_SCHEMES__','')
			out_plist = open(os.path.join(iphone_dir,'Info.plist'),'w')
			out_plist.write(plist)
			out_plist.close()

		# NOTE: right now we leave this in since the pre-1.3 releases required it
		# and only wrote on project create
		out_plist = open(os.path.join(iphone_dir,'Info.plist.template'),'w')
		out_plist.write(plist)
		out_plist.close()
		
		# create the iphone resources	
		iphone_resources_dir = os.path.join(iphone_dir,'Resources')
		if not os.path.exists(iphone_resources_dir):
			os.makedirs(iphone_resources_dir)

		# copy main.m to iphone directory		
		main_template = open(os.path.join(baseapp_iphone_dir, 'main.m'), 'r').read()
		
		# write .gitignore
		gitignore = open(os.path.join(iphone_dir,'.gitignore'),'w')
		# exclude generated files
		for i in ["Classes","tmp","build","headers","lib","Resources","*.xcodeproj","*.xcconfig","main.m","*.plist","*.pch"]:
			gitignore.write("%s\n" % i)
		gitignore.close()

		gitignore = open(os.path.join(iphone_dir,'%s.xcodeproj'%self.name,'.gitignore'),'w')
		# exclude generated files
		gitignore.write("*.pbxuser\n")
		gitignore.write("*.pbxproj\n")
		gitignore.write("*.perspectivev3\n")
		gitignore.close()

		gitignore = open(os.path.join(iphone_dir,'Resources','.gitignore'),'w')
		# exclude generated files
		gitignore.write(".simulator\n")
		gitignore.write("libTiCore.a\n")
		gitignore.write("libTitanium.a\n")
		gitignore.close()

		gitignore = open(os.path.join(iphone_dir,'lib','.gitignore'),'w')
		# exclude lib since it's dynamic
		gitignore.write("libTiCore.a\n")
		gitignore.close()

		main_dest = open(os.path.join(iphone_dir,'main.m'),'w')
		main_dest.write(main_template)
		main_dest.close()

		# copy over the entitlements for distribution
		if not release:
			shutil.copy(os.path.join(baseapp_iphone_dir, 'Entitlements.plist'), iphone_resources_dir)

		# copy README to iphone directory		
		shutil.copy(os.path.join(baseapp_iphone_dir, 'README'), os.path.join(iphone_dir, 'README'))

		# symlink 
		libticore = os.path.join(self.ti_sdk_dir, "iphone", "libTiCore.a")
		libtiverify = os.path.join(self.ti_sdk_dir, "iphone", "libtiverify.a")
		cwd = os.getcwd()
		os.chdir(os.path.join(iphone_dir,'lib'))
		os.symlink(libticore,"libTiCore.a")
		# small, just copy
		shutil.copy(libtiverify,"libtiverify.a")
		os.chdir(cwd)

if __name__ == '__main__':
	# this is for testing only for the time being
	if len(sys.argv) != 5 or sys.argv[1]=='--help':
		print "Usage: %s <name> <id> <directory> <titanium_sdk_dir>" % os.path.basename(sys.argv[0])
		sys.exit(1)

		
	iphone = IPhone(sys.argv[1], sys.argv[2], sys.argv[4])
	iphone.create(sys.argv[3])
