package com.base2services.jenkins;

import com.base2services.jenkins.github.SQSGitHubRepositoryName;
import com.cloudbees.jenkins.GitHubPushCause;
import com.cloudbees.jenkins.GitHubRepositoryName;
import com.cloudbees.jenkins.GitHubTrigger;
import hudson.Extension;
import hudson.Util;
import hudson.console.AnnotatedLargeText;
import hudson.model.*;
import hudson.plugins.git.GitSCM;
import hudson.scm.SCM;
import hudson.triggers.Trigger;
import hudson.triggers.TriggerDescriptor;
import hudson.util.SequentialExecutionQueue;
import hudson.util.StreamTaskListener;
import net.sf.json.JSONObject;
import org.apache.commons.jelly.XMLOutput;
import org.eclipse.jgit.transport.RemoteConfig;
import org.eclipse.jgit.transport.URIish;
import org.jenkinsci.plugins.multiplescms.MultiSCM;
import org.kohsuke.github.GHException;
import org.kohsuke.github.GHRepository;
import org.kohsuke.stapler.DataBoundConstructor;
import org.kohsuke.stapler.StaplerRequest;

import java.io.File;
import java.io.IOException;
import java.io.PrintStream;
import java.nio.charset.Charset;
import java.text.DateFormat;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.Executors;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Triggers a build when we receive a message from SQS.
 *
 * @author aaronwalker
 */
public class SqsBuildTrigger extends Trigger<AbstractProject> implements GitHubTrigger, Runnable {

    private static final Logger LOGGER = Logger.getLogger(SqsBuildTrigger.class.getName());

    @DataBoundConstructor
    public SqsBuildTrigger() {
    }

    /**
     * Called when a POST is made.
     */
    @Override
    public void onPost() {
        getDescriptor().queue.execute(this);
    }

    public void onPost(String username) {
        onPost();
    }

    /**
     * Returns the file that records the last/current polling activity.
     */
    public File getLogFile() {
        return new File(job.getRootDir(),"sqs-polling.log");
    }

    public void run() {
        try {
            StreamTaskListener listener = new StreamTaskListener(getLogFile());

            try {
                PrintStream logger = listener.getLogger();
                long start = System.currentTimeMillis();
                logger.println("Started on "+ DateFormat.getDateTimeInstance().format(new Date()));
                boolean result = job.poll(listener).hasChanges();
                logger.println("Done. Took "+ Util.getTimeSpanString(System.currentTimeMillis() - start));
                if(result) {
                    logger.println("Changes found");
                    // Fix for JENKINS-16617, JENKINS-16669
                    // The Cause instance needs to have a unique identity (when equals() is called), otherwise
                    // scheduleBuild() returns false - indicating that this job is already in the queue or
                    // has already been processed.
                    if (job.scheduleBuild(new Cause.RemoteCause("GitHub via SQS", "SQS poll initiated on " +
                            DateFormat.getDateTimeInstance().format(new Date(start))))) {
                      logger.println("Job queued");
                    }
                    else {
                      logger.println("Job NOT queued - it was determined that this job has been queued already.");
                    }
                } else {
                    logger.println("No changes");
                }
            } finally {
                listener.close();
            }
        } catch (IOException e) {
            LOGGER.log(Level.SEVERE,"Failed to record SCM polling",e);
        }
    }

    @Override
    public DescriptorImpl getDescriptor() {
        return (DescriptorImpl)super.getDescriptor();
    }

    /**
     * Does this project read from a repository of the given user name and the
     * given repository name?
     */
    @Override
    public Set<GitHubRepositoryName> getGitHubRepositories() {
        Set<GitHubRepositoryName> r = new HashSet<GitHubRepositoryName>();
        if (Hudson.getInstance().getPlugin("multiple-scms") != null
                && job.getScm() instanceof MultiSCM) {
            MultiSCM multiSCM = (MultiSCM) job.getScm();
            List<SCM> scmList = multiSCM.getConfiguredSCMs();
            for (SCM scm : scmList) {
                addRepositories(r, scm);
            }
        } else {
            addRepositories(r, job.getScm());
        }
        return r;
    }

    /**
     * @since 1.1
     */
    protected void addRepositories(Set<GitHubRepositoryName> r, SCM scm) {
        if (scm instanceof GitSCM) {
            GitSCM git = (GitSCM) scm;
            for (RemoteConfig rc : git.getRepositories()) {
                for (URIish uri : rc.getURIs()) {
                    String url = uri.toString();
                    GitHubRepositoryName repo = SQSGitHubRepositoryName.create(url);
                    if (repo != null) {
                        r.add(repo);
                    }
                }
            }
        }
    }

    @Override
    public void start(AbstractProject project, boolean newInstance) {
        super.start(project, newInstance);
        if(newInstance && getDescriptor().isManageHook()) {
            // make sure we have hooks installed. do this lazily to avoid blocking the UI thread.
            final Set<GitHubRepositoryName> names = getGitHubRepositories();

            getDescriptor().queue.execute(new Runnable() {
                public void run() {
                    OUTER:
                    for (GitHubRepositoryName name : names) {
                        for (GHRepository repo : name.resolve()) {
                            try {
                                //Currently creates the sqs hook based on the details of the
                                //first sqs profile. Need to find a clean way to map the profile
                                //to the github repo so we know how to populate the hook
                                if (createJenkinsHook(repo,getDescriptor().getSqsProfiles().get(0))) {
                                    LOGGER.info("Added GitHub SQS webhook for "+name);
                                    continue OUTER;
                                }
                            } catch (Throwable e) {
                                LOGGER.log(Level.WARNING, "Failed to add GitHub webhook for "+name, e);
                            }
                        }
                    }
                }
            });
        }
    }

    @Override
    public void stop() {
        if (getDescriptor().isManageHook()) {
            SqsHookCleaner cleaner = SqsHookCleaner.get();
            if (cleaner != null) {
                cleaner.onStop(this);
            }
        }
    }

    @Override
    public Collection<? extends Action> getProjectActions() {
        return Collections.singleton(new SqsBuildTriggerPollingAction());
    }

    private boolean createJenkinsHook(GHRepository repo, SqsProfile profile) {
        if(profile == null) {
            return false;
        }
        try {
            Map<String,String> config = new HashMap<String, String>();
            config.put("aws_access_key",profile.getAWSAccessKeyId());
            config.put("aws_secret_key",profile.getAWSSecretKey());
            config.put("sqs_queue_name",profile.getSqsQueue());
            repo.createHook("sqsqueue", config, null, true);
            return true;
        } catch (IOException e) {
            throw new GHException("Failed to update Github SQS hooks", e);
        }
    }

    public final class SqsBuildTriggerPollingAction implements Action {

        public AbstractProject<?,?> getOwner() {
            return job;
        }

        public String getIconFileName() {
            return "clipboard.png";
        }

        public String getDisplayName() {
            return "SQS Activity Log";
        }

        public String getUrlName() {
            return "SQSActivityLog";
        }
        
        public String getLog() throws IOException {
            return Util.loadFile(getLogFile());
        }

        public void writeLogTo(XMLOutput out) throws IOException {
            new AnnotatedLargeText<SqsBuildTriggerPollingAction>(getLogFile(), Charset.defaultCharset(),true,this).writeHtmlTo(0,out.asWriter());
        }
    }

    @Extension
    public static class DescriptorImpl extends TriggerDescriptor {
        private transient final SequentialExecutionQueue queue = new SequentialExecutionQueue(Executors.newSingleThreadExecutor());

        private boolean manageHook = true;
        private volatile List<SqsProfile> sqsProfiles = new ArrayList<SqsProfile>();
        private volatile List<Credential> credentials = new ArrayList<Credential>();

        public DescriptorImpl() {
            load();
        }

        @Override
        public boolean isApplicable(Item item) {
            return item instanceof AbstractProject;
        }

        @Override
        public String getDisplayName() {
            return "Build when a message is published to an SQS Queue";
        }

        public boolean isManageHook() {
            return manageHook;
        }

        @Override
        public boolean configure(StaplerRequest req, JSONObject json) throws FormException {
            JSONObject sqs = json.getJSONObject("sqsProfiles");
            JSONObject hookMode = json.getJSONObject("sqsHookMode");
            manageHook = "auto".equals(hookMode.getString("value"));
            sqsProfiles = req.bindJSONToList(SqsProfile.class,sqs);
            credentials = req.bindJSONToList(Credential.class,hookMode.get("credentials"));
            save();
            return true;
        }

        public static DescriptorImpl get() {
            return Trigger.all().get(DescriptorImpl.class);
        }        

        public List<SqsProfile> getSqsProfiles() {
            return sqsProfiles;
        }

        public List<Credential> getCredentials() {
            return credentials;
        }

    }
}
