import distutils.sysconfig
import sys
import cobbler.utils as utils

plib = distutils.sysconfig.get_python_lib()
mod_path="%s/cobbler" % plib
sys.path.insert(0, mod_path)

def register():
    # this pure python trigger acts as if it were a legacy shell-trigger, but is much faster.
    # the return of this method indicates the trigger type
    return "/var/lib/cobbler/triggers/sync/post/*"

def run(api,args,logger):

    rc = utils.subprocess_call(logger, "/usr/local/bin/cobbler-replicate", shell=True)

    return rc
