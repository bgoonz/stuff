package com.base2services.jenkins;

import com.cloudbees.jenkins.GitHubPushTrigger;
import com.cloudbees.jenkins.GitHubRepositoryName;
import hudson.Extension;
import hudson.model.AbstractProject;
import hudson.model.Hudson;
import hudson.model.PeriodicWork;
import hudson.triggers.Trigger;
import hudson.util.TimeUnit2;
import org.kohsuke.github.GHException;
import org.kohsuke.github.GHHook;
import org.kohsuke.github.GHRepository;

import java.io.IOException;
import java.net.URL;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Removes post-commit hooks from repositories that we no longer care.
 *
 * This runs periodically in a delayed fashion to avoid hitting GitHub too often.
 *
 * @author Kohsuke Kawaguchi
 * @author aaronwalker
 */
@Extension
public class SqsHookCleaner extends PeriodicWork {
    private final Set<GitHubRepositoryName> couldHaveBeenRemoved = new HashSet<GitHubRepositoryName>();

    /**
     * Called when a {@link SqsBuildTrigger} is about to be removed.
     */
    synchronized void onStop(SqsBuildTrigger trigger) {
        couldHaveBeenRemoved.addAll(trigger.getGitHubRepositories());
    }

    @Override
    public long getRecurrencePeriod() {
        return TimeUnit2.MINUTES.toMillis(3);
    }

    @Override
    protected void doRun() throws Exception {
        List<GitHubRepositoryName> names;
        synchronized (this) {// atomically obtain what we need to check
            names = new ArrayList<GitHubRepositoryName>(couldHaveBeenRemoved);
            couldHaveBeenRemoved.clear();
        }

        // subtract all the live repositories
        for (AbstractProject<?,?> job : Hudson.getInstance().getItems(AbstractProject.class)) {
            SqsBuildTrigger trigger = job.getTrigger(SqsBuildTrigger.class);
            if (trigger!=null) {
                names.removeAll(trigger.getGitHubRepositories());
            }
        }

        // these are the repos that we are no longer interested.
        // erase our hooks
        OUTER:
        for (GitHubRepositoryName r : names) {
            for (GHRepository repo : r.resolve()) {
                try {
                    removeHook(repo, Trigger.all().get(SqsBuildTrigger.DescriptorImpl.class).getSqsProfiles());
                    LOGGER.info("Removed sqs queue hook from " + r + "");
                    continue OUTER;
                } catch (Throwable e) {
                    LOGGER.log(Level.WARNING,"Failed to remove sqs queue hook from "+r, e);
                }
            }
        }       
    }

    private void removeHook(GHRepository repo, List<SqsProfile> profiles) {
        try {
            for (GHHook h : repo.getHooks()) {
                for (SqsProfile profile : profiles) {
                    String sqsQueueName = profile.getSqsQueue();
                    if (h.getName().equals("sqsqueue") && h.getConfig().get("sqs_queue_name").equals(sqsQueueName)) {
                        h.delete();
                    }
                }
            }
        } catch (IOException e) {
            throw new GHException("Failed to update SQS hooks", e);
        }
    }    

    public static SqsHookCleaner get() {
        return PeriodicWork.all().get(SqsHookCleaner.class);
    }

    private static final Logger LOGGER = Logger.getLogger(SqsHookCleaner.class.getName());    
}
