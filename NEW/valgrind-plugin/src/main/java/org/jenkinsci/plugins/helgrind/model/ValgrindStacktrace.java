package org.jenkinsci.plugins.helgrind.model;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

import org.apache.commons.lang.StringUtils;
import org.jenkinsci.plugins.helgrind.util.ValgrindSourceFile;


/**
 * 
 * @author Johannes Ohlemacher
 * 
 */
public class ValgrindStacktrace implements Serializable
{
	private static final long serialVersionUID = 3165729611300651095L;
	
	private List<ValgrindStacktraceFrame> frames;
	
	public void setSourceCode( ValgrindSourceFile sourceFile )
	{
		if ( frames == null )
			return;
		
		for ( ValgrindStacktraceFrame frame : frames )
		{
			if ( frame == null )
				continue;					

			frame.setSourceCode( sourceFile.getSnippet( frame.getFilePath(), frame.getLineNumber() ) );
		}
	}
	
	public String toString()
	{		
		String s = "";
		
		if ( frames == null )
			return "";
		
		for( ValgrindStacktraceFrame frame : frames )
		{
			s += frame.toString() + "\n\n";			
		}
		return s;
	}
	
	public String getFileSummary()
	{
		List<String> files = new ArrayList<String>();
		
		for( ValgrindStacktraceFrame frame : frames )
			files.add( frame.getFileName() + "(" + frame.getLineNumber() + ")" );			
		
		return StringUtils.join( files, ", " );
	}
	
	public void addFrame( ValgrindStacktraceFrame frame )
	{
		if ( frames == null )
			frames = new ArrayList<ValgrindStacktraceFrame>();
		
		frames.add( frame );
	}
	
	public int size()
	{
		if ( frames == null )
			return 0;
		
		return frames.size();
	}
	
	public boolean isEmpty()
	{
		return (frames == null || frames.isEmpty());
	}
	
	public ValgrindStacktraceFrame getFrame( int index )
	{
		if ( isEmpty() )
			throw new IllegalStateException("valgrind stacktrace is empty");
		
		return frames.get( index );
	}

	public List<ValgrindStacktraceFrame> getFrames()
	{
		return frames;
	}

	public void setFrames(List<ValgrindStacktraceFrame> frames)
	{
		this.frames = frames;
	}

}
