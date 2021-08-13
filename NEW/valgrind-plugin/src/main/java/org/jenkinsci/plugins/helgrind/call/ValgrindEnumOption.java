package org.jenkinsci.plugins.helgrind.call;

public class ValgrindEnumOption<E> implements ValgrindOption
{
	private final String			name;
	private final E			    value;
	private final ValgrindVersion	minimumVersion;

	public ValgrindEnumOption(String name, E value, E defaultValue)
	{
		this.name = name;
		this.value = (value != null) ? value : defaultValue;
		this.minimumVersion = ValgrindVersion.createInstance(0);
	}
	
	public ValgrindEnumOption(String name, E value, E defaultValue, ValgrindVersion valgrindVersion)
	{
		this.name = name;
		this.value = (value != null) ? value : defaultValue;
		this.minimumVersion = valgrindVersion;
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

	public E getValue()
	{
		return value;
	}
}
