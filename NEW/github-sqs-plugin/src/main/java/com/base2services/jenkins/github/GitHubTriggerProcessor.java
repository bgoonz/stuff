package com.base2services.jenkins.github;

import com.base2services.jenkins.SqsBuildTrigger;
import com.base2services.jenkins.trigger.TriggerProcessor;
import com.cloudbees.jenkins.GitHubRepositoryName;
import com.cloudbees.jenkins.GitHubTrigger;
import hudson.model.AbstractProject;
import hudson.model.Hudson;
import hudson.security.ACL;
import hudson.triggers.Trigger;
import net.sf.json.JSONObject;
import org.acegisecurity.Authentication;
import org.acegisecurity.context.SecurityContextHolder;

import java.util.logging.Logger;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Processes a github commit hook payload
 *
 * @author aaronwalker
 */
public class GitHubTriggerProcessor implements TriggerProcessor {

    private static final Pattern REPOSITORY_NAME_PATTERN = Pattern.compile("https?://([^/]+)/([^/]+)/([^/]+)");
    private static final Logger LOGGER = Logger.getLogger(GitHubTriggerProcessor.class.getName());

    public void trigger(String payload) {
        processGitHubPayload(payload, SqsBuildTrigger.class);
    }

    public void processGitHubPayload(String payload, Class<? extends Trigger> triggerClass) {
        JSONObject json = extractJsonFromPayload(payload);
        if(json == null) {
            LOGGER.warning("sqs message contains unknown payload format");
            return;
        }
        JSONObject repository = json.getJSONObject("repository");
        String repoUrl = repository.getString("url"); // something like 'https://github.com/kohsuke/foo'
        String repoName = repository.getString("name"); // 'foo' portion of the above URL
        String ownerName = repository.getJSONObject("owner").getString("name"); // 'kohsuke' portion of the above URL

        LOGGER.info("Received Message for " + repoUrl);
        LOGGER.fine("Full details of the POST was " + json.toString());
        Matcher matcher = REPOSITORY_NAME_PATTERN.matcher(repoUrl);
        if (matcher.matches()) {
            // run in high privilege to see all the projects anonymous users don't see.
            // this is safe because when we actually schedule a build, it's a build that can
            // happen at some random time anyway.
            Authentication old = SecurityContextHolder.getContext().getAuthentication();
            SecurityContextHolder.getContext().setAuthentication(ACL.SYSTEM);
            try {
                GitHubRepositoryName changedRepository = new SQSGitHubRepositoryName(matcher.group(1), ownerName, repoName);
                for (AbstractProject<?,?> job : Hudson.getInstance().getAllItems(AbstractProject.class)) {
                    GitHubTrigger trigger = (GitHubTrigger) job.getTrigger(triggerClass);
                    if (trigger!=null) {
                        LOGGER.fine("Considering to poke "+job.getFullDisplayName());
                        if (trigger.getGitHubRepositories().contains(changedRepository)) {
                            LOGGER.info("Poked "+job.getFullDisplayName());
                            trigger.onPost();
                        } else
                            LOGGER.fine("Skipped "+job.getFullDisplayName()+" because it doesn't have a matching repository.");
                    }
                }
            } finally {
                SecurityContextHolder.getContext().setAuthentication(old);
            }
        } else {
            LOGGER.warning("Malformed repo url "+repoUrl);
        }
    }

    private JSONObject extractJsonFromPayload(String payload) {
        JSONObject repository = null;
        JSONObject json = JSONObject.fromObject(payload);
        if(json.has("Type")) {
            String msg = json.getString("Message");
            if(msg != null) {
                if (msg.startsWith("\"")) {
                    msg = msg.substring(1, msg.length() - 1);
                }
                return JSONObject.fromObject(msg);
            }
        } else if (json.has("repository")){
            return json;

        }
        return null;
    }
}
