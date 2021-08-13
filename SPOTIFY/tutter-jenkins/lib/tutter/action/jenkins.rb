class Jenkins
  def initialize(settings, client, project, data)
    @settings = settings || {}
    @client = client
    @project = project
    @data = data
    @merge_request_comment = @settings['merge_request_comment']
    @merge_request_comment ||= 'merge, my change is covered by tests'
  end

  def run
    pull_request_id = @data['issue']['number']
    puts "pull request id: #{pull_request_id}"

    if @data['issue']['state'] != 'open'
      puts "The issue state is #{@data['issue']['state']}"
      return false
    end

    comments = @client.issue_comments(@project, pull_request_id)
    last_comment = comments.last

    asked_to_merge = last_comment && last_comment.body.strip.downcase == @merge_request_comment.strip.downcase
    unless asked_to_merge
      puts "not asked to merge"
      return false
    end

    pr = @client.pull_request @project, pull_request_id

    unless pr.mergeable
      @client.add_comment(@project, pull_request_id, "Please rebase your change, pull request is not mergeable")
      return false
    end

    last_commit = @client.pull_request_commits(@project, pull_request_id).last
    last_commit_date = last_commit.commit.committer.date

    if last_comment.created_at < last_commit_date
      @client.add_comment(@project, pull_request_id, "Please reopen pull request, found a new commit")
      return false
    end

    jenkins_last_comment = @client.issue_comments(@project, pull_request_id).select{|c| c.attrs[:user].attrs[:login] == 'dnsjenkins-bot'}.last
    jenkins_allows_merge = jenkins_last_comment && jenkins_last_comment.body =~ /PASS/

    if jenkins_allows_merge
      puts "merging #{pull_request_id} #{@project}"
      @client.merge_pull_request(@project, pull_request_id, 'ok, shipping!')
    else
      @client.add_comment(@project, pull_request_id, "Please make sure tests pass")
    end
  end
end
