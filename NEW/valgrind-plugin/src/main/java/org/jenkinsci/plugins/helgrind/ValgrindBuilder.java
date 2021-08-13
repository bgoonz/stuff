package org.jenkinsci.plugins.helgrind;

import hudson.EnvVars;
import hudson.Extension;
import hudson.FilePath;
import hudson.Launcher;
import hudson.model.BuildListener;
import hudson.model.AbstractBuild;
import hudson.model.AbstractProject;
import hudson.tasks.BuildStepDescriptor;
import hudson.tasks.Builder;
import hudson.util.FormValidation;
import hudson.util.ListBoxModel;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.io.PrintStream;
import java.util.Arrays;
import java.util.List;

import javax.servlet.ServletException;

import net.sf.json.JSONObject;

import org.apache.tools.ant.types.Commandline;
import org.jenkinsci.plugins.helgrind.call.ValgrindBooleanOption;
import org.jenkinsci.plugins.helgrind.call.ValgrindCall;
import org.jenkinsci.plugins.helgrind.call.ValgrindEnumOption;
import org.jenkinsci.plugins.helgrind.call.ValgrindExecutable;
import org.jenkinsci.plugins.helgrind.call.ValgrindStringOption;
import org.jenkinsci.plugins.helgrind.call.ValgrindTrackOriginsOption;
import org.jenkinsci.plugins.helgrind.call.ValgrindVersion;
import org.jenkinsci.plugins.helgrind.util.ValgrindLogger;
import org.jenkinsci.plugins.helgrind.util.ValgrindUtil;
import org.kohsuke.stapler.DataBoundConstructor;
import org.kohsuke.stapler.QueryParameter;
import org.kohsuke.stapler.StaplerRequest;

/**
 * 
 * @author Johannes Ohlemacher
 * 
 */
public class ValgrindBuilder extends Builder
{
	public static enum LeakCheckLevel {
		full, yes, summary, no
	}
	
	public static final ValgrindVersion VERSION_3_1_0 = ValgrindVersion.createInstance(3, 1, 0);
	public static final ValgrindVersion VERSION_3_2_0 = ValgrindVersion.createInstance(3, 2, 0);
	public static final ValgrindVersion VERSION_3_3_0 = ValgrindVersion.createInstance(3, 3, 0);
	public static final ValgrindVersion VERSION_3_4_0 = ValgrindVersion.createInstance(3, 4, 0);
	public static final ValgrindVersion VERSION_3_5_0 = ValgrindVersion.createInstance(3, 5, 0);
	public static final ValgrindVersion VERSION_3_6_0 = ValgrindVersion.createInstance(3, 6, 0);
	public static final ValgrindVersion VERSION_3_7_0 = ValgrindVersion.createInstance(3, 7, 0);
	public static final ValgrindVersion VERSION_3_8_0 = ValgrindVersion.createInstance(3, 8, 0);
	
	private final String valgrindExecutable;
	private final String workingDirectory;
	private final String includePattern;
	private final String excludePattern;
	private final String outputDirectory;
	private final String outputFileEnding;
	private final boolean showReachable;
	private final boolean undefinedValueErrors;
	private final LeakCheckLevel leakCheckLevel;
	private final String programOptions;
	private final String valgrindOptions;
	private final boolean trackOrigins;
	private final boolean ignoreExitCode;
	private final boolean traceChildren;
	private final boolean childSilentAfterFork;

	// Fields in config.jelly must match the parameter names in the
	// "DataBoundConstructor"
	@DataBoundConstructor
	public ValgrindBuilder(String valgrindExecutable,
			String workingDirectory, 
			String includePattern, 
			String excludePattern,
			String outputDirectory,
			String outputFileEnding,
			boolean showReachable,
			boolean undefinedValueErrors,
			LeakCheckLevel leakCheckLevel,
			String programOptions,
			String valgrindOptions,
			boolean trackOrigins,
			boolean ignoreExitCode,
			boolean traceChildren,
			boolean childSilentAfterFork)
	{
		this.valgrindExecutable = valgrindExecutable.trim();
		this.workingDirectory = workingDirectory.trim();
		this.includePattern = includePattern.trim();
		this.excludePattern = excludePattern;
		this.outputDirectory = outputDirectory.trim();
		this.outputFileEnding = outputFileEnding.trim();
		this.showReachable = showReachable;
		this.undefinedValueErrors = undefinedValueErrors;
		this.leakCheckLevel = leakCheckLevel;
		this.programOptions = programOptions;
		this.valgrindOptions = valgrindOptions;
		this.trackOrigins = trackOrigins;
		this.ignoreExitCode = ignoreExitCode;
		this.traceChildren = traceChildren;
		this.childSilentAfterFork = childSilentAfterFork;
	}

	@SuppressWarnings("rawtypes")
	@Override
	public boolean perform(AbstractBuild build, Launcher launcher, BuildListener listener)
	{
		try
		{
			EnvVars env = build.getEnvironment(null);
			
			/*
			 * Create directories
			 */
			FilePath workDir = build.getWorkspace().child(env.expand(workingDirectory));
			if (!workDir.exists() || !workDir.isDirectory())
				workDir.mkdirs();

			FilePath outDir = build.getWorkspace().child(env.expand(outputDirectory));
			if (!outDir.exists() || !outDir.isDirectory())
				outDir.mkdirs();
			
			/*
			 * Build program list 
			 */
			List<FilePath> includes = Arrays.asList( build.getWorkspace().child(env.expand(workingDirectory)).list(env.expand(includePattern)) );
			ValgrindLogger.log( listener, "includes files: " + ValgrindUtil.join(includes, ", "));			
			
			List<FilePath> excludes = null;			
			if ( excludePattern != null && !excludePattern.isEmpty() )
			{
				excludes = Arrays.asList( build.getWorkspace().child(env.expand(workingDirectory)).list(env.expand(excludePattern)) );			
				ValgrindLogger.log( listener, "excluded files: " + ValgrindUtil.join(excludes, ", "));				
			}
			
			/*
			 * Create valgrind executable
			 */
			ValgrindExecutable valgrindExecutable = new ValgrindExecutable(launcher, env.expand(this.valgrindExecutable));
			ValgrindLogger.log( listener, "detected valgrind version (" + valgrindExecutable.getExecutable() + "): " + valgrindExecutable.getVersion()  );
			
			/*
			 * Call valgrind for each found file
			 */
			for (FilePath file : includes)
			{		
				if ( excludes != null && excludes.contains(file) )
					continue;				
		
				env.put("PROGRAM_NAME", file.getName());
				final FilePath xmlFile = outDir.child(file.getName() + env.expand(outputFileEnding));
				final String xmlFilename = xmlFile.getRemote();
				
				ValgrindCall call = new ValgrindCall();
				call.setValgrindExecutable(valgrindExecutable);
				call.setEnv(env);
				call.setWorkingDirectory(workDir);
				call.setProgramName(file.getRemote());
				call.addProgramArguments(Commandline.translateCommandline(programOptions));
	        
	        	call.addValgrindOption(new ValgrindStringOption("tool", "memcheck"));
	        	call.addValgrindOption(new ValgrindEnumOption<LeakCheckLevel>("leak-check", leakCheckLevel, LeakCheckLevel.full));
	        	call.addValgrindOption(new ValgrindBooleanOption("show-reachable", showReachable));
	        	call.addValgrindOption(new ValgrindBooleanOption("undef-value-errors", undefinedValueErrors, VERSION_3_2_0));
	        	call.addValgrindOption(new ValgrindTrackOriginsOption("track-origins", trackOrigins, undefinedValueErrors, VERSION_3_4_0));
	        	call.addValgrindOption(new ValgrindBooleanOption("child-silent-after-fork", childSilentAfterFork, VERSION_3_5_0));
	        	call.addValgrindOption(new ValgrindBooleanOption("trace-children", traceChildren, VERSION_3_5_0));
	        	call.addValgrindOption(new ValgrindStringOption("xml", "yes"));
	        	call.addValgrindOption(new ValgrindStringOption("xml-file", xmlFilename, VERSION_3_5_0));
	        	
	        	if ( valgrindOptions != null )
	        		call.addCustomValgrindOptions(valgrindOptions.split(" "));
				
	        	ByteArrayOutputStream stdout = new ByteArrayOutputStream();     	
	        	ByteArrayOutputStream stderr = new ByteArrayOutputStream();
	        	try
	        	{
	        		int exitCode = call.exec(listener, launcher, stdout, stderr);
	        		ValgrindLogger.log(listener, "valgrind exit code: " + exitCode);
	        		
	        		if ( !valgrindExecutable.getVersion().isGreaterOrEqual(VERSION_3_5_0) )
	        		{
	        			ValgrindLogger.log(listener, "WARNING: valgrind version does not support writing xml output to file directly " +
	        					"(requires version 3.5.0 or later), xml output will be captured from error out");
	        			OutputStream os = xmlFile.write();
	        			PrintStream out = new PrintStream(os);
	        			out.print(stderr.toString());
	        		}
	        		
					if (exitCode != 0 && !ignoreExitCode)
						return false;
	        	}
	        	finally
	        	{	        
	        		String stdoutString = stdout.toString().trim();
	        		String stderrString = stderr.toString().trim();
	        		
	        		if ( !stdoutString.isEmpty() )
	        			ValgrindLogger.log(listener, "valgrind standard out: \n" + stdoutString);
	        		
	        		if ( !stderrString.isEmpty() )
	        			ValgrindLogger.log(listener, "valgrind error out: \n" + stderrString);
	        	}
			}
		} 
		catch (Exception e)
		{
			ValgrindLogger.log(listener, "ERROR, " + e.getClass().getCanonicalName() + ": " + e.getMessage());
			return false;
		}

		return true;
	}
	
	public String getValgrindExecutable()
	{
		return valgrindExecutable;
	}	

	public String getWorkingDirectory()
	{
		return workingDirectory;
	}

	public String getIncludePattern()
	{
		return includePattern;
	}
	
	public String getExcludePattern()
	{
		return excludePattern;
	}	

	public String getOutputDirectory()
	{
		return outputDirectory;
	}

	public String getOutputFileEnding()
	{
		return outputFileEnding;
	}

	public boolean isShowReachable()
	{
		return showReachable;
	}

	public boolean isUndefinedValueErrors()
	{
		return undefinedValueErrors;
	}
	
	public LeakCheckLevel getLeakCheckLevel()
	{
		return leakCheckLevel;
	}
	
	public String getProgramOptions()
	{
		return programOptions;
	}
	
	public String getValgrindOptions()
	{
		return valgrindOptions;
	}
	
	public boolean isTrackOrigins()
	{
		return trackOrigins;
	}
	
	public boolean isTraceChildren()
	{
		return traceChildren;
	}
	
	public boolean isChildSilentAfterFork()
	{
		return childSilentAfterFork;
	}	

	@Override
	public DescriptorImpl getDescriptor()
	{
		return (DescriptorImpl) super.getDescriptor();
	}
	
	@SuppressWarnings("unused")
	private ListBoxModel doFillLeakCheckLevelItems() 
	{
		ListBoxModel items = new ListBoxModel();
		
		for (LeakCheckLevel level : LeakCheckLevel.values()) 
			items.add(level.name(), String.valueOf(level.ordinal()));

		return items;
	}

	@Extension
	public static final class DescriptorImpl extends BuildStepDescriptor<Builder>
	{
		@SuppressWarnings("rawtypes")
		public boolean isApplicable(Class<? extends AbstractProject> aClass)
		{
			return true;
		}

		public LeakCheckLevel[] getLeakCheckLevels() {
			return LeakCheckLevel.values();
		}

		public FormValidation doCheckIncludePattern(@QueryParameter String includePattern) throws IOException, ServletException
		{
			if (includePattern.length() == 0)
				return FormValidation.error("Please set a pattern");
			
			return FormValidation.ok();
		}
		
		public FormValidation doCheckOutputFileEnding(@QueryParameter String value) throws IOException, ServletException
		{
			if (value.length() == 0)
				return FormValidation.error("Please set a file ending for generated xml reports");
			if (value.charAt(0) != '.' )
				return FormValidation.warning("File ending does not start with a dot");
			
			return FormValidation.ok();
		}		

		public String getDisplayName()
		{
			return "Run Helgrind";
		}

		@Override
		public boolean configure(StaplerRequest req, JSONObject formData) throws FormException
		{
			return super.configure(req, formData);
		}
	}	
}
