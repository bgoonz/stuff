package org.jenkinsci.plugins.helgrind.call;

@SuppressWarnings("serial")
public class ValgrindOptionNotApplicableException extends Exception
{
	public ValgrindOptionNotApplicableException(String message)
	{
		super(message);
	}
}
