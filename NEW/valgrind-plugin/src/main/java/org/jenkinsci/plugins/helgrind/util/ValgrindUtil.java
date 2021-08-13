package org.jenkinsci.plugins.helgrind.util;

import hudson.FilePath;

import java.util.Arrays;
import java.util.List;

public abstract class ValgrindUtil 
{
	public static String trimToNull( String s )
	{
		if ( s == null )
			return null;
		
		s = s.trim();
		
		if ( s.isEmpty() )
			return null;
		
		return s;
	}
	
	public static String join( FilePath[]  files, String sep )
	{
		return join( Arrays.asList(files), sep );
	}
	
	public static String join( List<FilePath> files, String sep )
	{
		String s = "";
		
		for( int i = 0; i <  files.size(); ++i )
		{
			s +=  files.get( i ).getName();
			
			if ( i + 1 <  files.size() )
				s += sep;
		}
		
		return s;
	}	
}


