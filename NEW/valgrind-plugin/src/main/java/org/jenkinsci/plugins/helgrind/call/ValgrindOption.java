package org.jenkinsci.plugins.helgrind.call;

public interface ValgrindOption
{
	public String getName();
    public String getArgumentString(ValgrindVersion version) throws ValgrindOptionNotApplicableException;
}
