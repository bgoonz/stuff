package com.base2services.jenkins.github;

import com.base2services.jenkins.Credential;
import com.base2services.jenkins.SqsBuildTrigger;
import hudson.Extension;
import hudson.model.Hudson;
import hudson.model.RootAction;
import hudson.util.AdaptedIterator;
import hudson.util.Iterators;
import org.kohsuke.github.GitHub;

import java.io.IOException;
import java.util.Collections;
import java.util.Iterator;
import java.util.List;
import java.util.logging.Logger;

import static java.util.logging.Level.WARNING;

/**
 * Manage the GitHub SQS Service Hook
 *
 * @author aaronwalker
 */
public class GitHubSQSHook {

    /**
     * Logs in as the given user and returns the connection object.
     */
    public Iterable<GitHub> login(String host, String userName) {
        if (host.equals("github.com")) {
            final List<Credential> l = SqsBuildTrigger.DescriptorImpl.get().getCredentials();

            // if the username is not an organization, we should have the right user account on file
            for (Credential c : l) {
                if (c.username.equals(userName))
                    try {
                        return Collections.singleton(c.login());
                    } catch (IOException e) {
                        LOGGER.log(WARNING,"Failed to login with username="+c.username,e);
                        return Collections.emptyList();
                    }
            }

            // otherwise try all the credentials since we don't know which one would work
            return new Iterable<GitHub>() {
                public Iterator<GitHub> iterator() {
                    return new Iterators.FilterIterator<GitHub>(
                            new AdaptedIterator<Credential,GitHub>(l) {
                                protected GitHub adapt(Credential c) {
                                    try {
                                        return c.login();
                                    } catch (IOException e) {
                                        LOGGER.log(WARNING,"Failed to login with username="+c.username,e);
                                        return null;
                                    }
                                }
                            }) {
                        protected boolean filter(GitHub g) {
                            return g!=null;
                        }
                    };
                }
            };
        } else {
            return Collections.<GitHub> emptyList();
        }
    }

    private static GitHubSQSHook _instance;

    public static GitHubSQSHook get() {
        if(_instance == null) {
            _instance = new GitHubSQSHook();
        }
        return _instance;
    }

    private static final Logger LOGGER = Logger.getLogger(GitHubSQSHook.class.getName());
}
