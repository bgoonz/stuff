from jinja2 import Environment, FileSystemLoader
from data import ports, manager
from base import crane_path
from os import path, mkdir

"""
In this file are all the function use to render the crane templates:
Dockerfiles, scripts, etc
"""

jinja_env = Environment(loader=FileSystemLoader([crane_path('templates'), crane_path('build')]))

#   Dockerfiles -----------------------------------------------------------------------------------

def render_template__(template, **variables):
    """
    A simple helper to render the templates with the crane Environment.
    """
    return jinja_env.get_template(template).render(variables)

def os_Dockerfile(os):
    """
    Render the Dockerfile that install an os in a container.
    """
    return render_template__('os/%s.tpl' % os, **locals())

def interpreter_Dockerfile(interpreter, version, os, repository):
    """
    Render the Dockerfile that install an interpreter version in a container.
    """
    return render_template__('interpreter/%s/%s.tpl' % (interpreter, interpreter), **locals())

DEFAULT_PORT = 5000

def application_Dockerfile(interpreter, version, os, repository, application_name, git_url, port = DEFAULT_PORT):
    """
    Render the Dockerfile for an application container
    """
    return render_template__('app/Dockerfile.tpl', **locals())

def third_party_Dockerfile(os, software, repository, client_url):
    """
    Render the Dockerfile for a third party software like a database for example
    """
    port = ports[software]
    return render_template__('third_party/%s/Dockerfile.tpl' % software, **locals())

#   Scripts -----------------------------------------------------------------------------------

def interpreter_install_script(interpreter):
    """
    Render the script that install an interpreter version and its package/version manager.
    """
    return render_template__('interpreter/%s/install.sh' % interpreter, **{}) # No need for variables here

def application_install_script(interpreter, application_name, before_launch):
    """
    Render the script that install the app into the container. 
    """
    return render_template__('app/%s/buildapp.sh' % interpreter, **locals())

def application_launch_script(interpreter, launch, after_launch):
    """
    Render the script that will be use when the application container is launched.
    """
    env_manager = manager[interpreter]
    return render_template__('app/launch.sh', **locals())

def application_launcher_script(interpreter, launch, after_launch):
    """
    Render the script that will be use when the application container is launched.
    """
    return render_template__('app/launcher.sh', **locals())

# FIXME : split app and sql container
def sql_launcher_script(database_name):
    """
    Render the script that will be use when the application container is launched.
    """
    return render_template__('app/sql_launcher.sh', **locals())

def third_party_launch_script(software, root_password, user_password):
    """
    Render the script that will be use when the third party software container
    is launched
    """
    return render_template__('third_party/%s/launch.sh' % software, **locals())
