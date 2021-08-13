package org.jenkinsci.plugins.helgrind;

import hudson.model.AbstractBuild;

import java.io.IOException;
import java.io.Serializable;
import java.util.Map;

import org.jenkinsci.plugins.helgrind.config.ValgrindPublisherConfig;
import org.jenkinsci.plugins.helgrind.model.ValgrindError;
import org.jenkinsci.plugins.helgrind.model.ValgrindProcess;
import org.jenkinsci.plugins.helgrind.model.ValgrindReport;
import org.jenkinsci.plugins.helgrind.util.ValgrindSourceFile;
import org.jenkinsci.plugins.helgrind.util.ValgrindSummary;
import org.kohsuke.stapler.StaplerRequest;
import org.kohsuke.stapler.StaplerResponse;


public class ValgrindResult implements Serializable
{	
	private static final long serialVersionUID = -5347879997716170059L;
	private static final String PID_TOKEN = "pid=";
	
	private ValgrindReport report;
    private AbstractBuild<?, ?> owner;
    private Map<String, String> sourceFiles;
     

    public ValgrindResult( AbstractBuild<?, ?> build, ValgrindReport report )
    {
    	this.owner = build;
    	this.report = report;
    }
    
	public AbstractBuild<?, ?> getOwner()
	{
		return owner;
	}
	
	public ValgrindPublisherConfig getConfig()
	{
		ValgrindBuildAction action = (ValgrindBuildAction)owner.getAction(ValgrindBuildAction.class);
    	if ( action == null )
    		return null;
    	
		return action.getConfig();    			
	}

	public ValgrindReport getReport()
	{
		return report;		
	}

	public void setReport(ValgrindReport report)
	{
		this.report = report;
	}
	
	public Map<String, String> getSourceFiles()
	{
		return sourceFiles;
	}
	
	public void setSourceFiles(Map<String, String> sourceFiles)
	{
		this.sourceFiles = sourceFiles;
	}	

	/**
	 * Renders the summary Valgrind report for the build result.
	 * 
	 * @return the HTML fragment of the summary Valgrind report
	 */
	public String getSummary()
	{
		return ValgrindSummary.createReportSummary(this);
	}
	
	/**
	 * 
	 * @param link expected to be in format "id=<executable name>,<unique error id>"
	 * @param request
	 * @param response
	 * @return
	 * @throws IOException
	 */
	public Object getDynamic(final String l, final StaplerRequest request, final StaplerResponse response)
			throws IOException
	{	
		final String[] s = l.split("/");
		final String data = s[s.length -1];
		
		if ( !data.startsWith(PID_TOKEN) )
			return null;
		
		int sep = data.indexOf(",");
		
		if ( sep > PID_TOKEN.length() )
		{
			String pid = data.substring(PID_TOKEN.length(), sep);
			String uniqueId = data.substring( sep + 1 );

			ValgrindError error = report.findError(pid, uniqueId);
			if ( error == null )
				return null;		

			ValgrindSourceFile sourceFile = new ValgrindSourceFile( ValgrindPublisher.DESCRIPTOR.getLinesBefore(), ValgrindPublisher.DESCRIPTOR.getLinesAfter(), sourceFiles, owner );
	 
			return new ValgrindDetail( owner, error, sourceFile );			
		}
		else
		{
			String pid = data.substring(PID_TOKEN.length());
			ValgrindProcess process = report.findProcess(pid);
			
			return new ValgrindProcessDetails(owner, process);			
		}
	}

}
