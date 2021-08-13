package org.jenkinsci.plugins.helgrind.call;

public class ValgrindBooleanOption implements ValgrindOption
{
	private final String			name;
	private final boolean			value;
	private final ValgrindVersion	minimumVersion;

	public ValgrindBooleanOption(String name, boolean value)
	{
		this.name = name;
		this.value = value;
		this.minimumVersion = ValgrindVersion.createInstance(0);
	}

	public ValgrindBooleanOption(String name, boolean value, ValgrindVersion minimumVersion)
	{
		this.name = name;
		this.value = value;
		this.minimumVersion = minimumVersion;
	}

	public String getArgumentString(ValgrindVersion valgrindVersion) throws ValgrindOptionNotApplicableException
	{
		if ( !valgrindVersion.isGreaterOrEqual(minimumVersion) )
			throw new ValgrindOptionNotApplicableException("valgrind version " + minimumVersion.toString() + " required");
		
		return "--" + name + "=" + (value ? "yes" : "no");
	}

	public String getName()
	{
		return name;
	}

	public boolean getValue()
	{
		return value;
	}
}
