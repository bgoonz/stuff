#!/usr/bin/python

import sys
import re

def replaceInFile(file_path, old, new):
	with open(file_path,'r') as f:
		newlines = []
		for line in f.readlines():
			newlines.append(line.replace(old, new))

	with open(file_path, 'w') as f:
		for line in newlines:
			f.write(line)

if len(sys.argv) != 3:
	# stop the program and print an error message
	sys.exit("Usage " + sys.argv[0] + " old-version new-version")

if not re.match("[0-9]+\.[0-9]+\.[0-9]+", sys.argv[1]):
	sys.exit("Old version (" + sys.argv[1] + ") doesn't look like a valid libspotify version")

if not re.match("[0-9]+\.[0-9]+\.[0-9]+", sys.argv[2]):
	sys.exit("New version (" + sys.argv[2] + ") doesn't look like a valid libspotify version")

replaceInFile("../Mac Framework/CocoaLibSpotify Mac Framework.xcodeproj/project.pbxproj", sys.argv[1], sys.argv[2])
replaceInFile("../iOS Library/CocoaLibSpotify iOS Library.xcodeproj/project.pbxproj", sys.argv[1], sys.argv[2])

