// https://github.com/eclipse/egit-github/tree/master/org.eclipse.egit.github.core
@Grab(group='org.eclipse.mylyn.github', module='org.eclipse.egit.github.core', version='2.1.5')

import org.eclipse.egit.github.core.*
import org.eclipse.egit.github.core.client.*
import org.eclipse.egit.github.core.service.*
import org.eclipse.egit.github.core.util.*
import java.util.regex.Pattern

// TODO Index jobs, so that customizations can be easily added

GitHubClient client = new GitHubClient()

def githubProperties = new File(GITHUB_PROPERTIES?:System.getenv()['GITHUB_PROPERTIES'])
Properties props = loadProperties(githubProperties)

loadCredentials(props, client)

def orgName = 'Netflix'
def parentFolderName = loadParentFolderName(props, githubProperties)
folder {
    name parentFolderName
}

List<Pattern> regexs = getRepoPattern(props, githubProperties)

// All work will be done inside this folder
RepositoryService repoService = new RepositoryService(client)
ContentsService contentsService = new ContentsService(client)

repoService.getOrgRepositories(orgName)
    .findAll { matchRepository(regexs, it.name) }
    .findAll { matchGradle(contentsService, it, /nebula.netflixoss/) }
    .each { Repository repo ->
        def repoName = repo.name
        def description = "${repo.description} - http://github.com/$orgName/$repoName"

        println "Creating jobs for $repoName"

        def repoFolderName = "${parentFolderName}/${repoName}"
        folder {
            name repoFolderName
        }

        def nameBase = "${repoFolderName}/${repoName}"

        String str = readFile(contentsService, repo, '.netflixoss')
        def netflixOssProps = new Properties()
        netflixOssProps.load(new StringReader(str))

        if (Boolean.valueOf(netflixOssProps.getProperty('cloudbees_disabled', 'false'))) {
            return // don't generate jobs if disabled
        }

        List<RepositoryBranch> branches = repoService.getBranches(repo)
        def gradleBranches = branches.findAll { it.name.endsWith('.x') }
        gradleBranches.collect { RepositoryBranch branch ->
            snapshot(netflixOssProps, "${nameBase}-${branch.name}", description, orgName, repoName, branch.name)
            release(netflixOssProps, "${nameBase}-${branch.name}", description, orgName, repoName, branch.name)
            // TODO Find github contrib group, and permission each user to the job.
            // TODO Permission global group
        }

        def isGitflow = Boolean.valueOf(netflixOssProps.getProperty('gitflow', 'false'))
        if (isGitflow) {
            if (branches.find { it.name == 'develop' }) {
                snapshot(netflixOssProps, nameBase, description, orgName, repoName, 'develop')
            }
            def releaseBranches = branches.findAll { it.name.startsWith('release') }
            releaseBranches.collect { RepositoryBranch branch ->
                candidateGitflow(netflixOssProps, nameBase, description, orgName, repoName, branch.name)
            }
            if (branches.find { it.name == 'master'}) {
                releaseGitflow(netflixOssProps, nameBase, description, orgName, repoName, 'master')
            } 
        } else {
            if (branches.find { it.name == 'master'}) {
                snapshot(netflixOssProps, nameBase, description, orgName, repoName, 'master')
                release(netflixOssProps, nameBase, description, orgName, repoName, 'master')
            }   
        }

        def shouldCreatePullRequest = Boolean.valueOf(netflixOssProps.getProperty('pullrequest_cloudbees', 'true'))
        if (shouldCreatePullRequest) {
            pullrequest(netflixOssProps, nameBase, description, orgName, repoName, '*' )
        }
    }

def String loadParentFolderName(Properties props, githubProperties) {
    def parentFolderName = props['jenkinsFolder']
    if (!parentFolderName) {
        throw new RuntimeException("Missing jenkinsFolder in ${githubProperties}")
    }
    parentFolderName
}

def loadCredentials(Properties props, GitHubClient client) {
    if (props['githubToken']) {
        def gitHubCredentials = props['githubToken']

        //OAuth2 token authentication
        client.setOAuth2Token(gitHubCredentials)
    } else {
        println "Not provided credentials"
    }
}

def loadProperties(githubProperties) {
    def props = new Properties()
    if (githubProperties.exists()) {
        githubProperties.withInputStream {
            stream -> props.load(stream)
        }
    } else {
        println "Missing properties file: ${githubProperties}"
        throw new RuntimeException("Missing properties file: ${githubProperties}")
    }
    props
}

List<Pattern> getRepoPattern(Properties props, githubProperties) {
    String repoPattern = props['repoPattern']
    if (!repoPattern) {
        throw new RuntimeException("Missing repoPattern in ${githubProperties}")
    }
    repoPattern.tokenize(',').collect { Pattern.compile(it) }
}

boolean matchRepository(Collection<Pattern> repoRegexs, String name) {
    repoRegexs.isEmpty() || repoRegexs.any { name =~ it }
}

boolean matchGradle(ContentsService contentsService, repo, match = null) {
    try {
        def allContents = contentsService.getContents(repo, "build.gradle")
        def content = allContents.iterator().next()
        def bytes = EncodingUtils.fromBase64(content.content)
        String str = new String(bytes, 'UTF-8')
        return match ? (str =~ match) as Boolean : true
    } catch (Exception fnfe) { // RequestException
        return false
    }
}

def base(Properties netflixOssProps, String repoDesc, String orgName, String repoName, String branchName, boolean linkPrivate = true) {
    int timeoutMinutes = Integer.parseInt(netflixOssProps.getProperty('timeout_minutes', '20'))

    job {
        description ellipsize(repoDesc, 255)
        logRotator(60,-1,-1,20)
        label 'hi-speed'
        wrappers {
            timeout {
                absolute(timeoutMinutes)
            }
            if (linkPrivate) {
                sshAgent('700013e9-869d-4118-9453-a2087608cdc3')
            }
        }

        String requestedJdk
        switch (netflixOssProps.getProperty('jdk', '1.7')) {
            case ['1.7', '7']:
                requestedJdk = '1.7'
                break
            case ['1.8', '8']:
                requestedJdk = '8'
                break
            default:
                requestedJdk = '1.7'
        }
        String buildJdk = "Oracle JDK ${requestedJdk} (latest)"

        jdk(buildJdk)
        scm {
            github("${orgName}/${repoName}", branchName, 'ssh') {
                if (linkPrivate) {
                    it / extensions / 'hudson.plugins.git.extensions.impl.LocalBranch' / localBranch(branchName)
                    it / userRemoteConfigs / 'hudson.plugins.git.UserRemoteConfig' / credentialsId('700013e9-869d-4118-9453-a2087608cdc3')
                }
                it / skipTags('true')
            }
        }
        if (linkPrivate) {
            steps {
                shell("""
                if [ ! -d \$HOME/.gradle ]; then
                   mkdir \$HOME/.gradle
                fi
    
                rm -f \$HOME/.gradle/gradle.properties
                ln -s /private/netflixoss/Netflix/gradle.properties \$HOME/.gradle/gradle.properties
                # Get us a tracking branch
                git checkout $branchName || git checkout -b $branchName
                git reset --hard origin/$branchName
                # Git 1.8
                # git branch --set-upstream-to=origin/$branchName $branchName
                # Git 1.7
                git branch --set-upstream $branchName origin/$branchName
                git pull
                """.stripIndent())
            }
        }
        configure { project ->
            project / 'properties' / 'com.cloudbees.jenkins.plugins.PublicKey'(plugin:'cloudbees-public-key@1.1')
            if (linkPrivate) {
                project / buildWrappers / 'com.cloudbees.jenkins.forge.WebDavMounter'(plugin:"cloudbees-forge-plugin@1.6")
            }
        }
        if (Boolean.valueOf(netflixOssProps.getProperty('has_test_reports', 'true'))) {
            publishers {
                archiveJunit('**/build/test-results/TEST*.xml')
            }
        }
        String envProps = netflixOssProps.getProperty('environment_variables', '')
        Map<Object, Object> envVariables = parseEnvVariables(envProps)
        if (envVariables) { 
            environmentVariables(envVariables)
        }
    }
}

Map<Object, Object> parseEnvVariables(String environmentVariables) {
    Map<Object, Object> envVariables = [:]
    if (environmentVariables == '') return envVariables
    String[] pairs = environmentVariables.split(/\s*,\s*/)
    pairs.each {
        def matcher = (it =~ /(.+?)\s*=\s*(.*)/)
        envVariables[matcher[0][1]] = matcher[0][2]
    }
    
    envVariables    
}

def snapshot(Properties netflixOssProps, nameBase, repoDesc, orgName, repoName, branchName) {
    def job = base(netflixOssProps, repoDesc, orgName, repoName, branchName)
    job.with {
        name "${nameBase}-snapshot"

        steps {
            gradle('clean snapshot --stacktrace --refresh-dependencies')
        }
        configure { project ->
            project / triggers / 'com.cloudbees.jenkins.GitHubPushTrigger' / spec
        }
    }
}

def release(Properties netflixOssProps, nameBase, repoDesc, orgName, repoName, branchName) {
    def job = base(netflixOssProps, repoDesc, orgName, repoName, branchName)
    job.with {
        name "${nameBase}-release"

        parameters {
            // Scope
            choiceParam("scope", ["minor", "patch", "major"], "What is the scope of this change?")

            // Stage
            choiceParam("stage", ["candidate", "final"], "Which stage should this be published as?")
        }

        steps {
            gradle('clean $stage -Prelease.scope=$scope --stacktrace --refresh-dependencies')
        }
        publishers {
            archiveArtifacts {
                pattern('build/netflixoss/netflixoss.txt')
                latestOnly()
            }
        }
    }
}

def candidateGitflow(Properties netflixOssProps, nameBase, repoDesc, orgName, repoName, branchName) {
    def job = base(netflixOssProps, repoDesc, orgName, repoName, branchName)
    job.with {
        name "${nameBase}-candidate"

        steps {
            gradle('clean candidate --stacktrace --refresh-dependencies')
        }
        publishers {
            archiveArtifacts {
                pattern('build/netflixoss/netflixoss.txt')
                latestOnly()
            }
        }
    }
}

def releaseGitflow(Properties netflixOssProps, nameBase, repoDesc, orgName, repoName, branchName) {
    def job = base(netflixOssProps, repoDesc, orgName, repoName, branchName)
    job.with {
        name "${nameBase}-release"

        steps {
            gradle('clean final -Prelease.useLastTag=true --stacktrace --refresh-dependencies')
        }
        publishers {
            archiveArtifacts {
                pattern('build/netflixoss/netflixoss.txt')
                latestOnly()
            }
        }
    }
}

def pullrequest(Properties netflixOssProps, nameBase, repoDesc, orgName, repoName, branchName) {
    def job = base(netflixOssProps, repoDesc, orgName, repoName, branchName, false)
    job.with {
        name "${nameBase}-pull-requests"
        steps {
            gradle('clean check --stacktrace --refresh-dependencies')
        }
        configure { project ->
            project / triggers / 'com.cloudbees.jenkins.plugins.github__pull.PullRequestBuildTrigger'(plugin:'github-pull-request-build@1.0-beta-2') / spec ()
            project / 'properties' / 'com.cloudbees.jenkins.plugins.git.vmerge.JobPropertyImpl'(plugin:'git-validated-merge@3.6') / postBuildPushFailureHandler(class:'com.cloudbees.jenkins.plugins.git.vmerge.pbph.PushFailureIsFailure')
        }
        publishers {
            // TODO Put pull request number in build number, $GIT_PR_NUMBER
        }
    }
}

String ellipsize(String input, int maxLength) {
  if (input == null || input.length() < maxLength) {
    return input
  }
  return input.substring(0, maxLength) + '...'
}

String readFile(contentsService, repo, filename) {
    try {
        def allContents = contentsService.getContents(repo, filename)
        def content = allContents.iterator().next()
        def bytes = EncodingUtils.fromBase64(content.content)
        
        return new String(bytes, 'UTF-8')
    } catch (Exception fnfe) { // RequestException
        return ''
    }
}
