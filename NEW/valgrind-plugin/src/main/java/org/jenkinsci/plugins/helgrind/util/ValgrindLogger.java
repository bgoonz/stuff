package org.jenkinsci.plugins.helgrind.util;

import hudson.model.BuildListener;

public abstract class ValgrindLogger
{
	public static void log(BuildListener listener, final String message)
	{
		listener.getLogger().println("[Helgrind] " + message);
	}
}
