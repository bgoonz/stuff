import os
from data import versions, extensions, HOST_DATABASE_FOLDER
from base import crane_path

def list_oses():
    oses_raw = os.listdir(crane_path('templates/os/'))
    oses_raw.remove('os.tpl')
    oses = []
    for os_ in oses_raw:
        if os_[0] != '.':
           oses.append((os_[:-4], os_[:-4]))
    return oses


# FIXME : return simple lists? !list(tuple())?
def list_interpreters():
    interpreters_raw = os.listdir(crane_path('templates/interpreter/'))
    interpreters_raw.remove('interpreter.tpl')
    # Make python first in the list
    interpreters = [('python', 'python')]
    for interpreter in interpreters_raw:
	if interpreter != 'python':
           interpreters.append((interpreter, interpreter))
    return interpreters

def list_third_party_softwares():
    third_party_raw = os.listdir(crane_path('templates/third_party'))
    third_party_raw.remove('third_party.tpl')
    third_party_softwares = []
    for third_party in third_party_raw:
        if third_party.find('.') == -1:
           third_party_softwares.append((third_party, third_party))
    return third_party_softwares

def list_versions(interpreter):
    if interpreter not in versions:
       raise Exception("This interpreter is not currently supported.")
    interpreters_versions = []
    for version in versions[interpreter]:
        interpreters_versions.append((version, version))
    return interpreters_versions 

def interpreter_extension(interpreter):
    if interpreter not in extensions:
       raise Exception("This interpreter is not currently supported.")
    return extensions[interpreter]

def list_existing_databases(software, application_name):
    databases_path = os.path.join(HOST_DATABASE_FOLDER, software, application_name)
    databases_raw = []
    if os.path.exists(databases_path):
       databases_raw = os.listdir(databases_path)
    return databases_raw
