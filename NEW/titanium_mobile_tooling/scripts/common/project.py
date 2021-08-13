#!/usr/bin/env python
# -*- coding: utf-8 -*-
#
# Unified Titanium Mobile Project Script
#
import os, sys, subprocess, shutil, codecs

this_dir = os.path.dirname(__file__)
scripts_dir = os.path.dirname(this_dir)
tools_dir = os.path.dirname(scripts_dir)
baseapp_dir = os.path.join(tools_dir, "templates", "baseapp")
baseapp_common_dir = os.path.join(baseapp_dir, "common")
baseapp_common_resources_dir = os.path.join(baseapp_common_dir, "Resources")

def run(args):
	return subprocess.Popen(args, stderr=subprocess.PIPE, stdout=subprocess.PIPE).communicate()

def main(args):
	argc = len(args)
	if argc < 6 or args[1]=='--help':
		print "Usage: %s <name> <id> <directory> <titanium_sdk_dir> [iphone,android,mobileweb] [android_sdk]" % os.path.basename(args[0])
		sys.exit(1)

	name = args[1].decode("utf-8")
	appid = args[2].decode("utf-8")
	directory = os.path.abspath(os.path.expanduser(args[3].decode("utf-8")))
	ti_sdk_dir = args[4]
	iphone = False
	android = False
	android_sdk = None
	sdk = None
	mobileweb = False

	if args[5] == 'iphone' or (argc > 6 and args[6] == 'iphone') or (argc > 7 and args[7] == 'iphone'):
		iphone = True
	if args[5] == 'android' or (argc > 6 and args[6] == 'android') or (argc > 7 and args[7] == 'android'):
		android = True
	if args[5] == 'mobileweb' or (argc > 6 and args[6] == 'mobileweb') or (argc > 7 and args[7] == 'mobileweb'):
		mobileweb = True

	if android:
		sys.path.append(os.path.join(os.path.dirname(this_dir), "android"))
		from androidsdk import AndroidSDK
		android_sdk = args[argc-1].decode("utf-8")
		try:
			sdk = AndroidSDK(android_sdk)
		except Exception, e:
			print >>sys.stderr, e
			sys.exit(1)

	if not os.path.exists(directory):
		os.makedirs(directory)

	project_dir = os.path.join(directory,name)
	
	if not os.path.exists(project_dir):
		os.makedirs(project_dir)

	tiapp = codecs.open(os.path.join(baseapp_common_dir,'tiapp.xml'),'r','utf-8','replace').read()
	tiapp = tiapp.replace('__PROJECT_ID__',appid)
	tiapp = tiapp.replace('__PROJECT_NAME__',name)
	tiapp = tiapp.replace('__PROJECT_VERSION__','1.0')

	tiapp_file = codecs.open(os.path.join(project_dir,'tiapp.xml'),'w+','utf-8','replace')
	tiapp_file.write(tiapp)
	tiapp_file.close()

	# create the titanium resources
	resources_dir = os.path.join(project_dir,'Resources')
	if not os.path.exists(resources_dir):
		os.makedirs(resources_dir)

	# write out our gitignore
	gitignore = open(os.path.join(project_dir,'.gitignore'),'w')
	# start in 1.4, we can safely exclude build folder from git
	gitignore.write("tmp\n")
	gitignore.close()

	if iphone:
		iphone_resources = os.path.join(resources_dir, 'iphone')
		if not os.path.exists(iphone_resources): os.makedirs(iphone_resources)
		iphone_gen = os.path.join(scripts_dir, 'iphone', 'iphone.py')
		run([sys.executable, iphone_gen, name, appid, directory, ti_sdk_dir])

	if android:
		android_resources = os.path.join(resources_dir, 'android')
		if not os.path.exists(android_resources): os.makedirs(android_resources)
		android_gen = os.path.join(scripts_dir, 'android', 'android.py')
		run([sys.executable, android_gen, name, appid, directory, android_sdk, ti_sdk_dir])

	if mobileweb:
		mobileweb_resources = os.path.join(resources_dir, 'mobileweb')
		if not os.path.exists(mobileweb_resources): os.makedirs(mobileweb_resources)
		mobileweb_gen = os.path.join(scripts_dir,'mobileweb','mobileweb.py')
		run([sys.executable, mobileweb_gen, name, appid, directory, ti_sdk_dir])

	# copy LICENSE and README
	for file in ['LICENSE', 'README']:
		shutil.copy(os.path.join(baseapp_common_dir, file), os.path.join(project_dir, file))

	# copy RESOURCES
	for file in ['app.js']:
		shutil.copy(os.path.join(baseapp_common_resources_dir,file), os.path.join(resources_dir, file))

	# copy IMAGES
	for file in ['KS_nav_ui.png', 'KS_nav_views.png']:
		shutil.copy(os.path.join(baseapp_common_resources_dir, file), os.path.join(resources_dir, file))

if __name__ == '__main__':
	main(sys.argv)

