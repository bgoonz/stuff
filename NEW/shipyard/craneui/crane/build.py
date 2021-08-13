from docker import client
from base import crane_path
import os
import render

def save_in(filename, string):
    f = open(filename, 'w')
    f.write(string)

def build(client_url, repository, result, build_path, variables, tag):
    """
    Prepare and build a container based on a Dockerfile.
    """
    docker_client = client.Client()
    print "Building : '%s/%s'" % (repository, tag)
    save_in('%s/Dockerfile' % build_path, result)
    match, log = docker_client.build(path=build_path)
    if match != None:
       print 'Container id : %s' % match
       print docker_client.tag(match, '%s/%s' % (repository, tag));
    print "Building is finished"
    return log

def build_os(os_, repository, client_url):
    """
    Build an os container based on a Dockerfile.
    """
    os_path = crane_path('build/os/%s' % os_)
    Dockerfile = render.os_Dockerfile(os_)
    return build(client_url, repository, Dockerfile, os_path, {'os' : os_} , os_)
    
def build_interpreter(interpreter, version, os_, repository, client_url):
    """
    Build a interpreter container based on a Dockerfile.
    """
    tag = '%s/%s' % (os_, interpreter + version)
    interpreter_path = crane_path('build/interpreter/%s' % interpreter)

    save_in(os.path.join(interpreter_path, 'install.sh'), render.interpreter_install_script(interpreter))
    Dockerfile = render.interpreter_Dockerfile(interpreter, version, os_, repository)
    return build(client_url, repository, Dockerfile, interpreter_path, locals(), tag)

def build_application(interpreter
                     ,version
                     ,os_
                     ,port
                     ,application_name
                     ,launch
                     ,after_launch
                     ,before_launch
                     ,database_name
                     ,git_url
                     ,repository
                     ,client_url):
    """
    Build an application container based on a Dockerfile.
    """
    application_folder = crane_path('build/app/%s/%s' % (interpreter, application_name))
    if not os.path.exists(application_folder):
       os.makedirs(application_folder, 0755)

    save_in('%s/buildapp.sh' % application_folder
           ,render.application_install_script(interpreter, application_name, before_launch))
    save_in('%s/launch.sh' % application_folder
           ,render.application_launch_script(interpreter, launch, after_launch))
    save_in('%s/launcher.sh' % application_folder
           ,render.application_launcher_script(interpreter, launch, after_launch))
    # FIXME : split containers
    save_in('%s/sql_launcher.sh' % application_folder
           ,render.sql_launcher_script(database_name))

    tag = '%(os_)s/%(interpreter)s%(version)s/%(application_name)s' % locals()
    Dockerfile = render.application_Dockerfile(interpreter, version, os_, repository, application_name, git_url, port)
    return build(client_url, repository, Dockerfile, application_folder, locals(), tag)

def build_third(os_, software, root_password, user_password, repository, client_url):
    """
    Build a container that host a third party software like a database for exemple
    """
    third_party_folder = crane_path('build/third_party/%s' % software)
    if not os.path.exists(third_party_folder):
       os.makedirs(third_party_folder, 0755)
    
    save_in('%s/launch.sh' % third_party_folder
           ,render.third_party_launch_script(software, root_password, user_password))

    tag = '%(os_)s/%(software)s' % locals()
    Dockerfile = render.third_party_Dockerfile(os_, software, repository, client_url)
    return build(client_url, repository, Dockerfile, third_party_folder, locals(), tag)
