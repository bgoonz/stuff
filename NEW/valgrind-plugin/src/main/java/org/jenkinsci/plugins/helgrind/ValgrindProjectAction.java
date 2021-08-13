package org.jenkinsci.plugins.helgrind;

import org.jenkinsci.plugins.helgrind.util.AbstractValgrindProjectAction;

import hudson.model.Result;
import hudson.model.AbstractBuild;
import hudson.model.AbstractProject;


public class ValgrindProjectAction extends AbstractValgrindProjectAction
{
	protected ValgrindProjectAction(AbstractProject<?, ?> project)
	{
		super(project);
	}

	public String getDisplayName()
	{
		return "Helgrind Results";
	}

	public String getUrlName()
	{
		return ValgrindBuildAction.URL_NAME;
	}

	@Override
	public AbstractBuild<?, ?> getLastFinishedBuild()
	{
		AbstractBuild<?, ?> lastBuild = project.getLastBuild();
		while (lastBuild != null
				&& (lastBuild.isBuilding() || lastBuild.getAction(ValgrindBuildAction.class) == null))
		{
			lastBuild = lastBuild.getPreviousBuild();
		}
		return lastBuild;
	}

	@Override
	public Integer getLastResultBuild()
	{
		for (AbstractBuild<?, ?> b = (AbstractBuild<?, ?>) project.getLastBuild(); b != null; b = b.getPreviousBuiltBuild())
		{
			ValgrindBuildAction r = b.getAction(ValgrindBuildAction.class);
			
			if (r != null)
				return b.getNumber();
		}
		return null;
	}

	public final boolean isDisplayGraph()
	{
		// Latest
		AbstractBuild<?, ?> b = getLastFinishedBuild();
		if (b == null)
			return false;

		// Affect previous
		b = b.getPreviousBuild();
		if (b != null)
		{
			for (; b != null; b = b.getPreviousBuild())
			{
				if (b.getResult().isWorseOrEqualTo(Result.FAILURE))
					continue;

				ValgrindBuildAction action = b.getAction(ValgrindBuildAction.class);
				if (action == null || action.getResult() == null)
					continue;

				ValgrindResult result = action.getResult();
				if (result == null)
					continue;

				return true;
			}
		}

		return false;
	}
}
