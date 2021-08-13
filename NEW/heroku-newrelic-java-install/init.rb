require 'heroku/command/base'
require 'net/http'

class Heroku::Command::Newrelic < Heroku::Command::BaseWithApp
  # newrelic:javaagent 
  #
  # install the newrelic javaagent into ./newrelic/  
  # commit or prompt to commit, push or prompt to push 
  # add or prompt user to add -javaagent:newrelic/newrelic.jar to JAVA_OPTS
  #
  # -v, --version VERSION # versoion of newrelic to download, default 2.0.4
  #
  def javaagent
    continue = app != nil
    project_root = %x{git rev-parse --show-toplevel }.strip
    Dir.chdir(project_root)
    if continue
      unpack_newrelic
    end
    if continue && newrelic_missing?
      addon = confirm("Execute heroku addons:add newrelic ? (y/n)")
      if addon
        display("Executing heroku addons:add newrelic")
        run_command("addons:add", ["newrelic"])
        continue = true
      end
    end
    if continue && has_git?
      continue = confirm("Execute git add newrelic && git commit -m 'add newrelic'? (y/n)")
    end
    process_commit(continue)
    if continue
      continue = confirm("Execute git push heroku master ? (y/n)")
    end
    process_push(continue)
    if continue
      continue = confirm("Add javaagent to heroku config var JAVA_OPTS? (y/n)")
    end
    process_java_opts(continue)
  end

  protected

  def newrelic_missing?
    installed = heroku.installed_addons(app)
    if installed.empty?
      true
    else
      available, pending = installed.partition { |a| a['configured'] }
      no_newrelic = true
      available.map do |a|
        a['name']
      end.each do |addon|
        if addon.start_with?("newrelic")
          no_newrelic = false
        end
      end
      no_newrelic
    end
  end

  def unpack_newrelic
    version = '2.0.4' #extract_option('--versionic', '2.0.4')
    zip = home_directory + "/.heroku/plugins/heroku-newrelic/resources/newrelic_agent#{version}.zip"
    if !File.exists? zip
      download(version, zip)
    end
    FileUtils.copy(zip, Dir.pwd)
    display("Unpacking newrelic in #{Dir.pwd}/newrelic")
    system "jar xf newrelic_agent#{version}.zip"
    FileUtils.rm "newrelic_agent#{version}.zip"
  end

  def process_java_opts(execute)
    jopts = 'JAVA_OPTS'
    agent = '-javaagent:newrelic/newrelic.jar'
    if execute
      vars = heroku.config_vars(app)
      if vars.key?(jopts)
        if (vars[jopts] =~ /javaagent/) != nil
          display("It appears you have a javaagent defined in #{jopts} => #{vars[jopts]}")
          display("Please update #{jopts} to include #{agent}")
        else
          newjopts = "#{jopts}=#{vars[jopts]} #{agent}"
          display("Running heroku config:add '#{newjopts}'")
          run_command("config:add", [newjopts])
        end
      else
        display("No heroku config var #{jopts} was found. You should add #{agent} to the command(s) that start JVMs in your app")
      end
    else
      display("You should add #{agent} to the command(s) that start JVMs in your app")
    end
  end

  def process_commit(execute)
    if execute
      display("executing git add newrelic")
      system "git add newrelic"
      display("executing git commit -m 'add newrelic'")
      system "git commit -m 'add newrelic'"
    else
      display("You should run git add newrelic && git commit -m 'add newrelic' to add newrelic to your project")
    end
  end

  def process_push(execute)
    if execute
      display("executing git push heroku master")
      system "git push heroku master"
    else
      display("You should run git push heroku master to upload the newrelic agent for this app")
    end
  end

  def download(version, to)
    host = "download.newrelic.com"
    zipfile = "/newrelic/java-agent/newrelic-api/#{version}/newrelic_agent#{version}.zip"
    display("Downloading http://#{host}#{zipfile}")
    Net::HTTP.start(host) do |http|
      resp = http.get(zipfile)
      open(to, "wb") do |file|
        file.write(resp.body)
      end
    end
    display("Done.")
  end

end
