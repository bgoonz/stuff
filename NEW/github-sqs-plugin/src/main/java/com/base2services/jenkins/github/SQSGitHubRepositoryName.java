package com.base2services.jenkins.github;

import com.cloudbees.jenkins.GitHubRepositoryName;
import hudson.util.AdaptedIterator;
import hudson.util.Iterators;
import org.kohsuke.github.GHRepository;
import org.kohsuke.github.GitHub;

import java.io.IOException;
import java.util.Iterator;
import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Override the resolve method of GitHubRepositoryName to allow accessing the GitHubSQSHook
 *
 * @author aaronwalker
 */
public class SQSGitHubRepositoryName extends GitHubRepositoryName {

    private static final Pattern[] URL_PATTERNS = {
            Pattern.compile("git@(.+):([^/]+)/([^/]+).git"),
            Pattern.compile("https://[^/]+@([^/]+)/([^/]+)/([^/]+).git"),
            Pattern.compile("https://([^/]+)/([^/]+)/([^/]+).git"),
            Pattern.compile("git://([^/]+)/([^/]+)/([^/]+).git"),
            Pattern.compile("ssh://git@([^/]+)/([^/]+)/([^/]+).git")
    };

    /**
     * Create {@link SQSGitHubRepositoryName} from URL
     *
     * @param url
     *            must be non-null
     * @return parsed {@link SQSGitHubRepositoryName} or null if it cannot be
     *         parsed from the specified URL
     */
    public static GitHubRepositoryName create(final String url) {
        for (Pattern p : URL_PATTERNS) {
            Matcher m = p.matcher(url);
            if (m.matches())
                return new SQSGitHubRepositoryName(m.group(1), m.group(2),
                        m.group(3));
        }
        return null;
    }

    public SQSGitHubRepositoryName(String host, String userName, String repositoryName) {
        super(host, userName, repositoryName);
    }

    @Override
    public Iterable<GHRepository> resolve() {
        return new Iterable<GHRepository>() {
            public Iterator<GHRepository> iterator() {
                return filterNull(new AdaptedIterator<GitHub,GHRepository>(GitHubSQSHook.get().login(host,userName)) {
                    protected GHRepository adapt(GitHub item) {
                        try {
                            GHRepository repo = item.getUser(userName).getRepository(repositoryName);
                            if (repo == null) {
                                repo = item.getOrganization(userName).getRepository(repositoryName);
                            }
                            return repo;
                        } catch (IOException e) {
                            LOGGER.log(Level.WARNING,"Failed to obtain repository "+this,e);
                            return null;
                        }
                    }
                });
            }
        };
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || !(o instanceof GitHubRepositoryName)) return false;

        GitHubRepositoryName that = (GitHubRepositoryName) o;

        return repositoryName.equals(that.repositoryName) && userName.equals(that.userName) && host.equals(that.host);
    }

    private <V> Iterator<V> filterNull(Iterator<V> itr) {
        return new Iterators.FilterIterator<V>(itr) {
            @Override
            protected boolean filter(V v) {
                return v!=null;
            }
        };
    }

    private static final Logger LOGGER = Logger.getLogger(SQSGitHubRepositoryName.class.getName());
}
