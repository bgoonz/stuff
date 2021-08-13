package org.jenkinsci.plugins.helgrind.call;

public class ValgrindStringOption implements ValgrindOption
{
	private final String			name;
	private final String			value;
	private final ValgrindVersion	minimumVersion;

	public ValgrindStringOption(String name, String value)
	{
		this.name = name;
		this.value = value;
		this.minimumVersion = ValgrindVersion.createInstance(0);
	}

	public ValgrindStringOption(String name, String value, ValgrindVersion minimumVersion)
	{
		this.name = name;
		this.value = value;
		this.minimumVersion = minimumVersion;
	}

	public String getArgumentString(ValgrindVersion valgrindVersion) throws ValgrindOptionNotApplicableException
	{
		if ( !valgrindVersion.isGreaterOrEqual(minimumVersion) )
			throw new ValgrindOptionNotApplicableException("valgrind version " + minimumVersion.toString() + " required");
		
		if ( value == null )
			throw new ValgrindOptionNotApplicableException("no value");		
		
		return "--" + name + "=" + value;
	}

	public String getName()
	{
		return name;
	}

	public String getValue()
	{
		return value;
	}
}
