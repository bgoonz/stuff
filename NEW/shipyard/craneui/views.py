from django.shortcuts import redirect
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_http_methods
from django.utils.translation import ugettext as _
from django.contrib import messages
from django.core.urlresolvers import reverse
from django.http import HttpResponse
from django.utils.html import strip_tags
from django.core import serializers
from django.shortcuts import render_to_response
import django_rq
from django.template import RequestContext

from containers.models import Host

import crane.build
from crane.base import crane_path
from crane.data import HOST_DATABASE_FOLDER
from crane.inspect import list_versions, interpreter_extension, list_existing_databases
from craneui.forms import ApplicationBuildForm, OsBuildForm, InterpreterBuildForm, ThirdPartyBuildForm, CreateContainerForm
from craneui import models

from shipyard import utils
from docker import client

import os
import urllib
import random
import json
import tempfile

@login_required
def index(request):
    ctx = {
        'form_create_container' : CreateContainerForm(),
        'form_build_application': ApplicationBuildForm(),
        'form_build_os': OsBuildForm(),
        'form_build_interpreter': InterpreterBuildForm(),
        'form_build_third' : ThirdPartyBuildForm(),
    }
    return render_to_response('craneui/index.html', ctx,
           context_instance=RequestContext(request))

def build_on_hosts(to_apply, args, hosts, request, success_message):
    if not hosts:
       messages.add_message(request, messages.ERROR, _('No hosts selected'))
       return
    for i in hosts:
        host = Host.objects.get(id=i)
        local_args = args + (host.hostname, client_url(host))
        utils.get_queue('shipyard').enqueue(to_apply, args=local_args,
            timeout=3600)
    messages.add_message(request, messages.INFO, success_message)

def client_url(host):
    url ='{0}:{1}'.format(host.hostname, host.port)
    if not url.startswith('http'):
        url = 'http://{0}'.format(url)
    return url

CONTAINER_DATABASE_FOLDER = '/home/qa/databases'
CMD = '/home/qa/website/%(application_name)s/launcher.sh "%(command)s"'

@require_http_methods(['POST'])
@login_required
def create_container(request):
    form = CreateContainerForm(request.POST)
    application = form.data.get('application')

    hosts = form.data.getlist('hosts')
    description = form.data.get('description')
    command = form.data.get('command')

    if not command:
       command = ''
    else:
       application_name = application.split('/')[3].split(':')[0]
       command = command.replace('"', "\\\"")
       command = CMD % (locals())
       print command

    if not hosts:
       messages.add_message(request, messages.ERROR, _('No hosts selected'))
       return redirect(reverse('dashboard.views.index'))

    status = False
       
    for i in hosts:
        host = Host.objects.get(id=i)
        c_id, status = models.create_container(host
                                       ,application
			                           ,command
                                       ,environment=None
                                       ,memory=0
                                       ,description=description
                                       ,volumes=None
                                       ,volumes_from=None
                                       ,privileged=False
                                       ,owner=''
				       ,binds={})
        if status:
           messages.add_message(request, messages.INFO,
                              _('Created ') + application +
                              _(' on ') + host.hostname)
        else:
           messages.add_message(request, messages.ERROR,
                              _('Container failed to start') +
                              _(' on ' + host.hostname))
    return redirect(reverse('dashboard.views.index'))

@require_http_methods(['POST'])
@login_required
def build_os(request):
    '''
    Builds an os container image
    '''
    form = OsBuildForm(request.POST)
    os = form.data.get('os')
    hosts = form.data.getlist('hosts')

    args = (os,)
    build_on_hosts(crane.build.build_os, args, hosts, request,
                 _('Building %s image.  This may take a few minutes.' % os))
    return redirect(reverse('dashboard.views.index'))

@require_http_methods(['POST'])
@login_required
def build_interpreter(request):
    '''
    Builds an interpreter container image
    '''
    form = InterpreterBuildForm(request.POST)
    os = form.data.get('os')
    interpreter = form.data.get('interpreter')
    version = form.data.get('version')
    hosts = form.data.getlist('hosts')

    args = (interpreter, version, os)
    build_on_hosts(crane.build.build_interpreter, args, hosts, request,
               _('Building %s/%s%s image.  This may take a few minutes.'
               %(os, interpreter, version)))
    return redirect(reverse('dashboard.views.index'))

def handle_upload(interpreter, application_archive, archive_name, application_name):
    application_folder = crane_path('build/app/%s/%s' % (interpreter, application_name))
    if not os.path.exists(application_folder):
       os.makedirs(application_folder, 0755)

    tmp_file = os.path.join(application_folder, archive_name)
    with open(tmp_file, 'w') as d:
        for c in application_archive.chunks():
            d.write(c)

@require_http_methods(['POST'])
@login_required
def build_application(request):
    '''
    Builds an application container image
    '''
    form = ApplicationBuildForm(request.POST)
    os = form.data.get('os')
    interpreter = form.data.get('interpreter')
    version = form.data.get('version')
    port = form.data.get('port')
    database_name = form.data.get('database_name')
    launch = form.data.get('launch')
    before_launch = form.data.get('before_launch')
    after_launch = form.data.get('after_launch')
    hosts = form.data.getlist('hosts')
    archive = request.FILES.get('application')
    git_url = form.data.get('git_url')
        
    if archive:
       archive_name = request.FILES.get('application').name
       application_name = archive_name.split('.')[0]
       handle_upload(interpreter, archive, archive_name, application_name)
    elif git_url:
       application_name = git_url.split('/')[-1].split('.')[0]
    else:
       messages.add_message(request, messages.ERROR, _('No application given'))
       return redirect(reverse('dashboard.views.index'))

    args = (interpreter, version, os, port, application_name, launch, after_launch, before_launch, database_name, git_url)
    build_on_hosts(crane.build.build_application, args, hosts, request,
               _('Building %s/%s%s/%s image.  This may take a few minutes.'
               %(os, interpreter, version, application_name)))
    return redirect(reverse('dashboard.views.index'))

@require_http_methods(['POST'])
@login_required
def build_third(request):
    '''
    Builds a third party software container image
    '''
    form = ThirdPartyBuildForm(request.POST)
    os = form.data.get('os')
    software = form.data.get('software')
    hosts = form.data.getlist('hosts')
    # FIXME : password field

    args = (os, software, 'toor', 'aq')
    build_on_hosts(crane.build.build_third, args, hosts, request,
                 _('Building %s image.  This may take a few minutes.'
                 % software))
    return redirect(reverse('dashboard.views.index'))

def versions(request):
    return HttpResponse(
            json.dumps({'versions' : list_versions(request.GET['interpreter'])})
           ,mimetype="application/json")

def extensions(request):
    return HttpResponse(
            json.dumps({'extension' : interpreter_extension(request.GET['interpreter'])})
           ,mimetype="application/json")

def databases(request):
    return HttpResponse(
            json.dumps({'databases' : list_existing_databases(request.GET['software']\
                                                             ,request.GET['application_name'])})
           ,mimetype="application/json")
