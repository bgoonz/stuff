package org.jenkinsci.plugins.helgrind;

import hudson.model.AbstractBuild;

import org.jenkinsci.plugins.helgrind.model.ValgrindError;
import org.jenkinsci.plugins.helgrind.util.ValgrindSourceFile;

/**
 * 
 * @author Johannes Ohlemacher
 * 
 */
public class ValgrindDetail
{
	private ValgrindError error;
	final private AbstractBuild<?, ?> owner;
	
	public ValgrindDetail( AbstractBuild<?, ?> owner, ValgrindError error, ValgrindSourceFile valgrindSourceFile )
	{
		this.owner = owner;
		this.error = error;	
		
		if ( error != null )
			error.setSourceCode( valgrindSourceFile );
	}

	public ValgrindError getError()
	{
		return error;
	}

	public AbstractBuild<?, ?> getOwner()
	{
		return owner;
	}
}
