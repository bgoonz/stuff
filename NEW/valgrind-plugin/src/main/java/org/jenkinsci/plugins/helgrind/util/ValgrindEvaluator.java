package org.jenkinsci.plugins.helgrind.util;

import hudson.EnvVars;
import hudson.model.BuildListener;
import hudson.model.Result;
import hudson.model.AbstractBuild;

import org.jenkinsci.plugins.helgrind.config.ValgrindPublisherConfig;
import org.jenkinsci.plugins.helgrind.model.ValgrindReport;


public class ValgrindEvaluator
{
	private ValgrindPublisherConfig config;
	private BuildListener listener;
	
	public ValgrindEvaluator( ValgrindPublisherConfig config, BuildListener listener )
	{
		this.config = config;
		this.listener = listener;
	}
	
	public void evaluate( ValgrindReport report, AbstractBuild<?, ?> build, EnvVars env )
	{		
		build.setResult( evaluate(
				report.getErrorList().getLeakDefinitelyLostErrorCount(), 
				env.expand( config.getUnstableThresholdDefinitelyLost() ), 
				env.expand( config.getFailThresholdDefinitelyLost() ) ) );

		build.setResult( evaluate(
				report.getErrorList().getInvalidReadErrorCount() + report.getErrorList().getInvalidWriteErrorCount(), 
				env.expand( config.getUnstableThresholdInvalidReadWrite() ), 
				env.expand( config.getFailThresholdInvalidReadWrite() ) ) );
		
		build.setResult( evaluate(
				report.getErrorList().getErrorCount(), 
				env.expand( config.getUnstableThresholdTotal() ), 
				env.expand( config.getFailThresholdTotal() ) ) );
	}	
	
	private boolean exceedsThreshold( int errorCount, String threshold )
	{
		if ( threshold == null || threshold.isEmpty() )
			return false;
		
		try
		{
			Integer i = Integer.valueOf(threshold);	
			return errorCount > i.intValue();
		}
		catch( NumberFormatException e )
		{
			ValgrindLogger.log( listener, "ERROR: '" + threshold + "' is not a valid threshold" );
		}
		
		return false;
	}
	
	private Result evaluate( int errorCount, String unstableThreshold, String failThreshold )
	{
		if ( exceedsThreshold( errorCount, failThreshold ) )
			return Result.FAILURE;
		
		if ( exceedsThreshold( errorCount, unstableThreshold ) )
			return Result.UNSTABLE;
		
		return Result.SUCCESS;
	}
	
}
