package org.jenkinsci.plugins.helgrind.call;

public class ValgrindTrackOriginsOption extends ValgrindBooleanOption
{
	private final boolean undefinedValueErrors; 

	public ValgrindTrackOriginsOption(String name, boolean value, boolean undefinedValueErrors)
	{
		super(name, value);
		this.undefinedValueErrors = undefinedValueErrors;
	}
	
	public ValgrindTrackOriginsOption(String name, boolean value, boolean undefinedValueErrors, ValgrindVersion minimumVersion)
	{
		super(name, value, minimumVersion);
		this.undefinedValueErrors = undefinedValueErrors;
	}
	
	public String getArgumentString(ValgrindVersion valgrindVersion) throws ValgrindOptionNotApplicableException
	{
		String result = super.getArgumentString(valgrindVersion);
		
		if ( !undefinedValueErrors && getValue() )
			throw new ValgrindOptionNotApplicableException("option has no effect when 'undefined value errors' is disabled");
		
		return result;	
	}
}
