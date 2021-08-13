# Copyright (c) 2014 Spotify AB. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.


import logging
from json import loads
from os import environ
from subprocess import Popen, PIPE


log = logging.getLogger(__name__)


DEFAULT_DOCKER_HOST = 'unix:///var/run/docker.sock'
DOCKER_HOST = environ.get('DOCKER_HOST', DEFAULT_DOCKER_HOST)

DEFAULT_DOCKER_CLI = '/usr/bin/docker'
DOCKER_CLI = environ.get('DOCKER_CLI')


def escape(word):
    if ' ' in word:
        return "'%s'" % (word, )
    else:
        return word


class DockerClientError(Exception):
    pass


class CliDockerClientError(DockerClientError):
    def __init__(self, command, code, out, err):
        super(CliDockerClientError, self).__init__()
        self.command = command
        self.code = code
        self.out = out
        self.err = err

    def __str__(self):
        return 'docker command failed: %s (%d) out=(%s) err=(%s)' % \
               (self.command, self.code, self.out, self.err)


class CliDockerClient(object):
    """ A docker client that uses the docker cli to communicate with the docker
    daemon."""

    __detected_system_cli = None

    @staticmethod
    def __detect_system_cli():
        if DOCKER_CLI is not None:
            return DOCKER_CLI
        default_msg = 'error detecting docker cli, using default (%s)' % \
                      (DEFAULT_DOCKER_CLI, )
        try:
            p = Popen('which docker', stdout=PIPE, stderr=PIPE, shell=True)
        except:
            log.exception(default_msg)
            return DEFAULT_DOCKER_CLI
        else:
            out, err = p.communicate()
            if p.returncode == 0:
                location = out.strip()
                log.debug('detected docker cli: %s', location)
                return location
            else:
                log.warn(default_msg)
                return DEFAULT_DOCKER_CLI

    @classmethod
    def __system_cli(cls):
        if cls.__detected_system_cli is None:
            cls.__detected_system_cli = cls.__detect_system_cli()
        return cls.__detected_system_cli

    def __init__(self, docker=None, endpoint=None):
        """ Create a docker client.

        Args:
          docker: location of the docker cli. If None or not provided, the
                  location will resolved in the order of precedence:
                  1. DOCKER_CLI environment variable
                  2. `which docker`
                  3. use /usr/bin/docker

          endpoint: The docker endpoint. If None or not provided, then
                    environment variable DOCKER_HOST will be used.

        """

        super(CliDockerClient, self).__init__()
        self.docker = docker if docker is not None else self.__system_cli()
        self.endpoint = endpoint if endpoint is not None else DOCKER_HOST

    def cli(self, *args):
        """Execute a docker cli command.

        Args:
          args: cli arguments

        Returns:
          returncode, stdout, stderr

        Example:
          cli('build', '-t', 'foobar', '.')

        """

        command = (self.docker, '-H=%s' % self.endpoint) + tuple(args)
        log.debug('cli: %s', command)
        log.debug('cli: shell style: %s', ' '.join(escape(word)
                  for word in command))
        p = Popen(command, stdout=PIPE, stderr=PIPE)
        out, err = p.communicate()
        log.debug('%d %s %s', p.returncode, out, err)
        return p.returncode, out, err

    def cli_check(self, *args):
        """Execute a docker cli command.
           Raises DockerClientError if returncode != 0.

        Args:
          args: cli arguments

        Returns:
          stdout

        Example:
          cli('build', '-t', 'foobar', '.')

        """

        code, out, err = self.cli(*args)
        if code:
            raise CliDockerClientError(args, code, out, err)
        return out

    def inspect_container(self, container):
        """Inspect a container.

        Args:
          container: container id or name

        Returns:
          list of dicts with info for matching containers.

        Example:
          inspect_container('d88916009fe2')
          inspect_container('mysql')

        """

        log.debug('inspect_container %s', container)
        code, out, err = self.cli('inspect', container)
        return loads(out)

    def run(self,
            image=None,
            command=None,
            ports=None,
            name=None,
            volumes=None,
            env=None):
        """Start a new container.

        Args:
          image: container image to run
          command: command to run
          ports: ports to expose. list of (internal, external, proto) tuples.
                 external and proto is optional.

        Returns:
          "docker run -d" stdout output

        Example:
          run(image='busybox',
              command=['nc', '-p', '4711', '-lle', 'cat'],
              ports=[(7, 4711, tcp),
                     ('1.2.3.4', 7, 4711, tcp)],
              name='netcat-echo')

        """

        log.debug('run_daemon %s', image)
        assert image
        ports = ports or []
        command = command or []
        args = []
        if ports:
            args.extend(self.__port_arg(*port) for port in ports)
        if name:
            args.append('--name=%s' % (name, ))
        if volumes:
            args.extend('--volume=%s' % (volume, ) for volume in volumes)
        if env:
            args.extend('--env=%s' % (env, ) for env in env)
        args.append(image)
        args.extend(command)
        return self.cli_check('run', '-d', *args).strip()

    def start(self, container):
        """Start an existing container.

        Args:
          container: container id or name to start

        Returns:
          None

        Example:
          start('d88916009fe2')
          start('mysql')

        """
        log.debug('start %s', container)
        self.cli_check('start', container)

    def stop(self, container):
        """Stop a running container.

        Args:
          container: container id or name to stop

        Returns:
          None

        Example:
          stop('d88916009fe2')
          stop('mysql')

        """
        log.debug('stop %s', container)
        self.cli_check('stop', container)

    def kill(self, container):
        """Kill a running container.

        Args:
          container: container id or name to kill

        Returns:
          None

        Example:
          kill('d88916009fe2')
          kill('mysql')

        """
        log.debug('kill %s', container)
        self.cli_check('kill', container)

    def destroy(self, container):
        """Remove a container.

        Args:
          container: container id or name to remove

        Returns:
          None

        Example:
          destroy('d88916009fe2')
          destroy('mysql')

        """
        log.debug('destroy %s', container)
        self.cli_check('rm', container)

    def list_containers(self, needle=''):
        """List running containers.

        Note: When specifying a needle, 'docker ps' is invoked without the
              '-q' flag in order to be able to match on container names.
              Any string in 'docker ps' output that contains the needle is
              then returned and may as such not actually be a real container
              id or name.

        Args:
          needle: keyword to filter docker ps output on.

        Returns:
          A list of container id's and/or names.

        Example:
          list_containers()
          list_containers('deadbeef-namespace')

        """
        if not needle:
            return self.cli_check('ps', '-q').splitlines()
        else:
            lines = self.cli_check('ps').splitlines()[1:]
            matches = [word for line in lines
                       for word in line.split() if needle in word]
            log.debug('list_containers: needle=%s, matches=%s',
                      needle, matches)
            return matches

    def __port_arg(self, ip, external, internal, proto):
        ips = ip and '%s:' % (ip, ) or ''
        es = external and '%d:' % (external, ) or ''
        ps = proto and '/%s' % (proto, ) or ''
        return '-p=%s%s%d%s' % (ips, es, internal, ps)
