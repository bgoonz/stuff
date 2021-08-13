import requests
import Queue
import time
import threading
import os
import subprocess as sp
import re
import shutil
import logging
import collections
import random
import sys

queue_size=20000
log = logging.getLogger(__name__)


def shellquote(s):
    return "'" + s.replace("'", "'\\''") + "'"


class WorkQueue(object):

    def __init__(self, maxsize):
        self.queue = Queue.PriorityQueue(maxsize)

    def qsize(self):
        return self.queue.qsize()

    def put(self, item, block=False):
        self.queue.put((item.start_time or time.time(), item), block)

    def get(self):
        item = self.queue.get()
        if item[0] > time.time():
            self.queue.put(item, True)
            time.sleep(5)
            return self.get()
        return item[1]


def ghe_each_paginated(ghe, path, param={}):
    """ Call the specified uri and then repeatedly follow the link
    specified by the next-link header either until there is no such
    header or until the wrapped function raises the StopIteration
    exception."""

    def inner(function):
        def innermost(*args, **kwargs):
            next_uri = path
            while(True):
                result = ghe.get(next_uri, param)

                try:
                    function(result, *args, **kwargs)
                except StopIteration as e:
                    break
                ggg = next_uri
                next_uri = ghe.next_link(result)
                if not next_uri:
                    break
        return innermost
    return inner


class Ghe(object):
    """ Represents the source GHE repo. """

    def __init__(self, host, token, work_dir, mirrors):
        self.host = host
        self.headers = {'Authorization': 'token ' + token}
        self.work_dir = work_dir
        self.queue = WorkQueue(queue_size)
        self.threads = [Worker(self.queue, "ghe", i) for i in range(5)]
        self.mirrors = mirrors
        self.repos={}
        self.events_received = 0
        self.lock = threading.RLock()

    def get_repo(self, name):
        try:
            return self.repos[name]
        except:
            return self.create_repo(name)


    def next_link(self, response):
        if 'Link' not in response.headers:
            return None
        for i in re.findall(r'''<([^>]*)>; *rel="([^"]*)"''', response.headers['Link']):
            if i[1] == 'next':
                return i[0]
        return None

    def post(self, path, param={}):
        if not path.startswith('https://'):
            path = self.host + path

        r = requests.post(path, data=param, headers=self.headers)
        if r.status_code >= 200 and r.status_code < 300:
            return r
        raise HttpException(path, r.status_code)

    def create_repo(self, blob_or_name):
        with self.lock:
            if type(blob_or_name) == dict:
                blob = blob_or_name
                name = blob['full_name']
            else:
                name = blob_or_name
                blob = None

            if name in self.repos:
                return self.repos[name]

            if blob is None:
                blob = self.get('repos/' + name).json()

            repo = Repo(blob, self)
            self.repos[name] = repo
            return repo

    def get(self, path, param={}):

        if not path.startswith('https://'):
            path = self.host + path

        r = requests.get(path, params=param, headers=self.headers)
        if r.status_code >= 200 and r.status_code < 300:
            return r
        raise HttpException(path, r.status_code)

    def get_all_repos(self):
        return self.get_paginated('repositories', param={})

    def get_events(self):
        return self.get_paginated('events')


class Work(object):
    """ A generic work task. Used for common plumbing like introspection, retries on errors."""

    def __init__(self, function, queue, name=None, retries=5):
        self.function = function
        self.retries = retries
        self.args = []
        self.kwargs = {}
        self.start_time = None
        self.time_step = 60
        self.queue = queue
        self.name = name

    def params(self, *args, **kwargs):
        self.args = args
        self.kwargs = kwargs
        self.queue.put(self)
        return self

    def __repr__(self):
        if self.name is None:
            return "%s %s" % (self.function.__name__, self.args)
        return self.name

    def __call__(self):
        try:
            self.function(*self.args, **self.kwargs)
        except Exception as e:
            log.exception(e)
            if self.retries > 0:
                log.info("Work package %s failed. Will retry in %d seconds", self, self.time_step)
                self.retries = self.retries-1
                self.start_time = time.time() + self.time_step
                self.time_step = self.time_step*2
                self.queue.put(self)
            else:
                log.error("Work package %s failed, no more retries. Giving up. :-(", self)

    @property
    def is_valid(self):
        return self.start_time is None or self.start_time <= time.time()

class Worker(threading.Thread):
    """ A thread that picks Work-instances from a WorkQueue and executes them."""

    def __init__(self, queue, name, number):
        super(Worker, self).__init__(name="%s-%d" % (name, number))
        self.queue = queue
        self.work = None
        self.start_time = None
        self.start()

    def run(self):
        # Avoid thundering herd during startup
        # SSH is very sensitive to contention
        time.sleep(random.random()*2.0)
        while True:
            self.work = self.queue.get()
            if not self.work.is_valid:
                self.queue.put(self.work)
                time.sleep(5)

            self.start_time = time.time()
            try:
                self.work()
            except Exception as e:
                log.exception(e)
            self.work = None

    @property
    def state(self):
        w = self.work
        if not w:
            return "Waiting..."
        return "%s (%.1f s)" % (w, time.time()-self.start_time)


class RepoState(object):
    """ The sync state of a specific repository. Can represent either
    inbound/source or outbound/mirror state. Use the lock object in
    the RepoState object to make sure only one thread performs
    potentially destructive operations to a repo."""

    UNKNOWN = "Unknown"
    WAIT_FOR_SYNC = "Waiting for initial sync"
    SYNCING = "Synchronizing"
    SYNCED = "In sync"
    ERROR = "Error"
    EMPTY = "Empty"

    def __init__(self):
        self.state = RepoState.UNKNOWN
        self.errors = []
        self.lock = threading.RLock()

    def __repr__(self):
        return self.state


class Mirror(object):
    """ The state of a remote mirror, including the state of each and every remote on that repo."""

    def __init__(self, host, path):
        self.queue = WorkQueue(queue_size)
        self.host = host
        self.path = path
        self.repos={}
        self.lock = threading.RLock()
        self.threads = [Worker(self.queue, host, i) for i in range(20)]
        self.states=collections.defaultdict(lambda: RepoState())
        self.ok = 0
        self.fail = 0

    def add_repo(self, repo):
        with self.lock:
            if repo.name in self.repos:
                return
            self.repos[repo.name] = repo
            self.states[repo.name].state = RepoState.WAIT_FOR_SYNC

        with self.states[repo.name].lock:
            if not repo.has_remote(self):
                try:
                    self.reset_repo(repo)
                except Exception as e:
                    self.states[repo.name].state = RepoState.ERROR
                    self.states[repo.name].errors.append(e)
                    raise

        Work(repo.push, self.queue, "push %s to %s" % (repo, self)).params(self)

    def reset_repo(self, repo):
        remote_path = '%s/%s' % (self.path, repo.name)
        remote_cmd = 'rm -rf %(repo_dir)s; mkdir -p %(repo_dir)s; cd %(repo_dir)s; if ! git show; then git init --bare; fi' % {'repo_dir': shellquote(remote_path)}
        local_cmd = ['ssh', self.host, remote_cmd]
        run_shell('.', local_cmd, log_errors=False)
        repo.add_remote(self)


    @property
    def name(self):
        return self.host

    def __repr__(self):
        return self.name


class CliException(Exception):
    pass


class HttpException(Exception):

    def __init__(self, uri, status_code):
        self.uri = uri
        self.status_code = status_code
        super(HttpException, self).__init__("Got status code %d on %s" % (status_code, uri))

def run_shell(cwd, args, log_errors=True):
    try:
        os.makedirs(cwd)
    except Exception:
        pass
    p = sp.Popen(args, cwd=cwd, stdout = sp.PIPE, stderr=sp.PIPE)
    # FIXME: INFINITE WAIT SUX!!!
    (out, err) = p.communicate()
    if p.returncode != 0:
        if log_errors:
            log.error("OH NOES!!!!\nCwd:\n%s\n\nCmd:\n%s\n\nOutput:\n%s\n\nError:\n%s\n" % (cwd, args, out, err))
        raise CliException(p.returncode)
    return out, err


class Repo(object):

    def __init__(self, blob, ghe):
        self.blob = blob
        self.ghe = ghe
        self.dir = '/'.join([self.ghe.work_dir, self.name])
        self.state = RepoState()
        self.state.state = RepoState.WAIT_FOR_SYNC

    def update_or_clone(self):
        """If the repo target directory does not exist, create it and
        clone into it. If it does exist, try and run a 'git remote
        update'. If it fails remove directory and clone from
        scratch."""
        try:
            os.stat(self.dir)
        except:
            self.clone()
            return

        try:
#            log.debug('git remote update %s', self.name)
            run_shell(self.dir, ['git', 'fetch', 'origin', '--prune'], log_errors=False)
            self.state.state = RepoState.SYNCED
        except CliException:
            # On error, simply try to remove everything and start again from scratch
            self.state.state = RepoState.ERROR
            try:
                shutil.rmtree(self.dir)
            except:
                pass
            self.clone()


    def clone(self):
        with self.state.lock:
            try:
                os.makedirs(self.dir)
            except:
                pass
            origin_uri = self.ghe.get(self.blob['url']).json()['ssh_url']
    #        log.debug('git clone %s', origin_uri)
            try:
                run_shell(self.dir, ['git', 'clone','--mirror', origin_uri, '.'])
                self.state.state = RepoState.SYNCED
            except CliException:
                self.state.state = RepoState.ERROR
                raise

    def add_remote(self, mirror):
        remote = '%s:%s/%s' % (mirror.host, mirror.path, self.name)
        try:
            run_shell(self.dir, ['git', 'remote', 'add', mirror.name, remote], log_errors=False)
        except CliException:
            pass

    def has_remote(self, mirror):
        try:
            out, err = run_shell(self.dir, ['git', 'remote'])
            return mirror.name in out.split('\n')
        except CliException:
            return False

    def push(self, mirror):
        # Push to a remote repo
        # On failure, remove the remote repo, reinitialize it and try again. If we fail a second time, give up
        if len([i for i in run_shell(self.dir, ['git', 'branch'], log_errors=False)[0].split('\n') if i]):
            mirror.states[self.name].state = RepoState.SYNCING
            try:
                run_shell(self.dir, ['git', 'push', '--mirror',  mirror.name])
                mirror.ok += 1
            except Exception as e1:
                mirror.states[self.name].state = RepoState.ERROR
                mirror.states[self.name].errors.append(e1)
                try:
                    log.error("Repo %s was in invalid state on mirror %s, trying to remove and reinitialize", self, mirror)
                    mirror.reset_repo(self)
                    run_shell(self.dir, ['git', 'push', '--mirror',  mirror.name])
                    mirror.ok += 1
                except Exception as e2:
                    mirror.states[self.name].state = RepoState.ERROR
                    mirror.states[self.name].errors.append(e2)
                    mirror.fail += 1
                    raise

            mirror.states[self.name].state = RepoState.SYNCED

        else:
            log.info("Won't push repo %s because it contains no branches", self)
            self.state.state = RepoState.EMPTY
            mirror.states[self.name].state = RepoState.EMPTY

    @property
    def name(self):
        return self.blob['full_name']

    def __repr__(self):
        return self.name

class PushEvent(object):
    def __init__(self, blob, ghe):
        self.blob = blob
        self.ghe = ghe

    @property
    def id(self):
        return self.blob['id']

    @property
    def name(self):
        return self.blob['repo']['name']

    def __repr__(self):
        return self.name


def init_repo(repo, ghe):
    try:
        repo.update_or_clone()
        for mirror in ghe.mirrors:
            Work(mirror.add_repo, mirror.queue).params(repo)

    except HttpException as e:
        if e.status_code in [503, 504]:
            log.error("Temporary http failure %d, can retry", e.status_code)
            raise
        log.error("Permanent http problem %d, will not retry", e.status_code)
        log.exception(e)


def push_event(event, ghe):

    if do_listen(event.name):
        repo = ghe.get_repo(event.name)
        repo.update_or_clone()
        for mirror in ghe.mirrors:
            Work(mirror.add_repo, mirror.queue).params(repo)


def do_listen(name):
    return True#name[0] == 'l'


def list_thread(ghe):

    @ghe_each_paginated(ghe, 'repositories')
    def push_all_repos(response):
        for repo_blob in response.json():
            if do_listen(repo_blob['full_name']):
                repo = ghe.create_repo(repo_blob)
                Work(init_repo,ghe.queue, "init %s" % repo).params(repo, ghe)

    while True:
        try:
            push_all_repos()
        except Exception as e:
            log.error("Exception in list thread")
            log.exception(e)
        time.sleep(60*60)


def event_thread(ghe):

    @ghe_each_paginated(ghe, 'events')
    def push_all_events(response, previous_ids, current_ids, current_repos):
        is_old = False
        for event in response.json():
            # FIXME: Not listening for repo creation events
            if event['type'] == 'PushEvent':
                push = PushEvent(event, ghe)
                current_ids[push.id] = True
                if push.id in previous_ids:
                    is_old = True
                else:
                    ghe.events_received += 1
                    Work(push_event,ghe.queue, "push %s" % push).params(push, ghe)
        if is_old:
            raise StopIteration()
    previous_ids = {}

    while True:
        current_ids = {}
        try:
            push_all_events(previous_ids = previous_ids, current_ids = current_ids, current_repos={})
        except Exception as e:
            log.error("Exception in event thread")
            log.exception(e)
        time.sleep(20)
        previous_ids = current_ids


def work_thread(queue):
    def worker():
        while True:
            work = queue.get()
            try:
                work[0](*work[1:])
            except Exception as e:
                log.exception(e)
    return worker


def log_states(context, states):
    stats = {}
    bad = []
    for (name, state) in states.iteritems():
        stats[state.state] = stats.get(state.state, 0)+1
        if state.state == RepoState.ERROR:
            bad.append(name)
    desc = ["%s: %d" % (name, count) for name, count in stats.iteritems()]
    log.info("Repo states on %s are: %s", context, ", ".join(desc))
    if len(bad) > 0:
        log.info("The following repos currently can't be synced: %s", bad)


def monitor_thread(ghe, mirrors):
    last_event_count = 0
    while True:
        log.info("Source has ~ %d tasks queued", ghe.queue.qsize())

        event_count = ghe.events_received - last_event_count
        last_event_count = ghe.events_received
        log.info("Recevied ~ %d events since last update" % event_count)

        log_states("source", dict([(repo.name, repo.state) for repo in ghe.repos.values()]))

        for thread in ghe.threads:
            log.info("  " + thread.state)
        for mirror in mirrors:

            ok = mirror.ok
            mirror.ok = 0
            fail = mirror.fail
            mirror.fail = 0

            log.info("Mirror %s has ~ %d tasks queued", mirror.name, mirror.queue.qsize())
            if (ok + fail > 0):
                log.info("%d successful pushes and %d failiures since last update (%.2f %%)", ok ,fail, 100.0*ok / (ok+fail))
            log_states(mirror.name, mirror.states)
            for thread in mirror.threads:
                log.info("  " + thread.state)

        time.sleep(60)


def main():
    log.setLevel(logging.DEBUG)
    log_format = '%(asctime)s %(levelname)s %(threadName)s %(message)s'
    formatter = logging.Formatter(log_format)

    handler = logging.StreamHandler()
    handler.setFormatter(formatter)

    log.addHandler(handler)
    log.info("Starting replication")

    token = sys.argv[1]
    ghe_host = 'https://ghe.spotify.net/api/v3/'
    work_dir = '/tmp/repos'
    mirrors = [Mirror('awseu3-personalpod-a1.liljencrantz.cloud.spotify.net', 'repos')]
    ghe = Ghe(ghe_host, token, work_dir, mirrors)
    threading.Thread(target=list_thread, args=(ghe,), name='list-thread').start()
    threading.Thread(target=event_thread, args=(ghe,), name='event-thread').start()
    threading.Thread(target=monitor_thread, args=(ghe, mirrors), name='monitor-thread').start()

