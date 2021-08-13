#!/usr/bin/python
# -*- coding: utf-8  -*-

import ConfigParser
import StringIO
import os
import re

androidParamNames = { u"appname": u"app_name", u"search-description": u"search_description", u"search-hintwiki": u"search_hint_wiki", u"appname-beta": u"app_name_beta" }

class Messages:

	# load the messages file
	def __init__( self, lang ):
		self.lang = lang
		file = StringIO.StringIO()
		file.write( u"[messages]\n" ) #ConfigParser works only when there is a section
		file.write( open('assets/www/messages/messages-' + self.lang + '.properties', 'r' ).read().decode('utf-8') )
		file.seek(0, os.SEEK_SET)
		self.configParser = ConfigParser.ConfigParser()
		self.configParser.readfp( file )

	def getMessage(self, key ):
		try:
			return self.configParser.get( u"messages", key )
		except:
			return None

	#create the Android i18n file for the messages
	def setAndroidI18n( self, paramNames ):
		dir = self.getAndroidDirName()
		if dir is None:
			return

		content = u""
		for jsName in paramNames:
			msg = self.getMessage( jsName )
			if msg is not None:
				content += u"\t<string name=\"" + paramNames[jsName] + u"\">" + msg + u"</string>\n"
		if content == u"": #don't create empty file !
			return

		content = u"<?xml version=\"1.0\" encoding=\"utf-8\"?>\n<resources>\n" + content + u"</resources>"

		dir = self.getAndroidDirName()
		if not os.path.exists( dir ):
			os.makedirs( dir )
		file = open( dir + '/strings.xml', "w" )
		file.write( content.encode('utf-8') )
		file.close()

	#return the name of the Android i18n file directory
	def getAndroidDirName( self ):
		dir = 'res/values'
		if self.lang == 'en':
			return dir
		parts = self.lang.split('-')
		dir += '-' + self.getAndroidLangCode( parts[0] )
		if len( parts ) == 2:
			if self.lang == 'zh-hans':
				return dir + '-rCN'
			if self.lang == 'zh-hant':
				return dir + '-rTW'
			if self.lang == 'sr-ec':
				return dir
			else:
				return None
		else:
			return dir

	#return the Android 2 characters lang code from the normalized one
	def getAndroidLangCode( self, langcode ):
		if langcode == 'he':
			return 'iw'
		elif langcode == 'id':
			return 'in'
		elif langcode == 'yi':
			return 'ji'
		else:
			return langcode

dirList = os.listdir( 'assets/www/messages' )
regex = re.compile( r'messages-([a-z]{2}(-.*)?).properties' ) #Android doesn't manage language codes of more than two characters
for fname in dirList:
	if regex.search( fname ) is not None:
		lang = regex.sub( r'\1', fname )
		if lang != 'qqq' and lang != 'en':
			messages = Messages( lang )
			messages.setAndroidI18n( androidParamNames )
