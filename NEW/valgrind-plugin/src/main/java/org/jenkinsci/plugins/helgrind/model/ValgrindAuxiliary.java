package org.jenkinsci.plugins.helgrind.model;

import java.io.Serializable;

public class ValgrindAuxiliary implements Serializable
{
	private static final long	serialVersionUID	= -156868233454667586L;
	
	private String				description;
	private ValgrindStacktrace	stacktrace;
	
	public ValgrindStacktrace getStacktrace()
	{
		return stacktrace;
	}
	
	public void setStacktrace( ValgrindStacktrace stacktrace )
	{
		this.stacktrace = stacktrace;
	}

	public String getDescription()
	{
		return description;
	}

	public void setDescription( String description )
	{
		this.description = description;
	}		
}
