#!/usr/bin/python -tt
# -*- coding: utf-8 -*-
# Copyright (c) 2013 Spotify AB
#
# Licensed under the Apache License, Version 2.0 (the "License"); you may not
# use this file except in compliance with the License. You may obtain a copy of
# the License at
#
# http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
# WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
# License for the specific language governing permissions and limitations under
# the License.


#Make it a bit more like python3:
from __future__ import absolute_import
from __future__ import division
from __future__ import nested_scopes
from __future__ import print_function
from __future__ import with_statement

#Global imports:
from collections import namedtuple
from datetime import datetime, timedelta
import os
import platform
import subprocess
import sys
import time
major, minor, micro, releaselevel, serial = sys.version_info
if major == 2 and minor < 7:
    import unittest2 as unittest
else:
    import unittest
import mock

#To perform local imports first we need to fix PYTHONPATH:
pwd = os.path.abspath(os.path.dirname(__file__))
sys.path.append(os.path.abspath(pwd + '/../../modules/'))

#Local imports:
import file_paths as paths
import certcheck


class TestCertCheck(unittest.TestCase):
    @staticmethod
    def _create_test_cert(days, path, is_der=False):
        openssl_cmd = ["/usr/bin/openssl", "req", "-x509", "-nodes",
                       "-newkey", "rsa:1024",
                       "-subj", "/C=SE/ST=Stockholm/L=Stockholm/CN=www.example.com"]

        openssl_cmd.extend(["-days", str(days)])
        openssl_cmd.extend(["-out", path])

        if is_der:
            openssl_cmd.extend(["-outform", "DER"])
            openssl_cmd.extend(["-keyout", path + ".key"])
        else:
            openssl_cmd.extend(["-keyout", path])

        child = subprocess.Popen(openssl_cmd, stdout=subprocess.PIPE,
                                 stderr=subprocess.STDOUT)
        child_stdout, child_stderr = child.communicate()
        if child.returncode != 0:
            print("Failed to execute opensssl command:\n\t{0}\n".format(
                ' '.join(openssl_cmd)))
            print("Stdout+Stderr:\n{0}".format(child_stdout))
            sys.exit(1)
        else:
            print("Created test certificate {0}".format(os.path.basename(path)))

    @staticmethod
    def _certpath2namedtuple(path):
        with open(path, 'rb') as fh:
            cert = namedtuple("FileTuple", ['path', 'content'])
            cert.path = path
            cert.content = fh.read()
            return cert

    @classmethod
    def setUpClass(cls):
        #Prepare the test certificate tree:
        cls._create_test_cert(-3, paths.EXPIRED_3_DAYS)
        cls._create_test_cert(6, paths.EXPIRE_6_DAYS)
        cls._create_test_cert(21, paths.EXPIRE_21_DAYS)
        cls._create_test_cert(41, paths.EXPIRE_41_DAYS)
        cls._create_test_cert(41, paths.EXPIRE_41_DAYS_DER, is_der=True,)

    @mock.patch('logging.error')
    @mock.patch('sys.exit')
    def test_config_file_parsing(self, SysExitMock, LoggingErrorMock):
        #Test malformed file loading
        certcheck.ScriptConfiguration.load_config(paths.TEST_MALFORMED_CONFIG_FILE)
        self.assertTrue(LoggingErrorMock.called)
        SysExitMock.assert_called_once_with(1)
        SysExitMock.reset_mock()

        #Test non-existent file loading
        certcheck.ScriptConfiguration.load_config(paths.TEST_NONEXISTANT_CONFIG_FILE)
        self.assertTrue(LoggingErrorMock.called)
        SysExitMock.assert_called_once_with(1)

        #Load the config file
        certcheck.ScriptConfiguration.load_config(paths.TEST_CONFIG_FILE)

        #String:
        self.assertEqual(certcheck.ScriptConfiguration.get_val("repo_host"),
                         "git.foo.net")
        #List of strings
        self.assertEqual(certcheck.ScriptConfiguration.get_val("riemann_tags"),
                         ['abc', 'def'])
        #Integer:
        self.assertEqual(certcheck.ScriptConfiguration.get_val("warn_treshold"), 30)

        #Key not in config file:
        with self.assertRaises(KeyError):
            certcheck.ScriptConfiguration.get_val("not_a_field")

    @mock.patch.object(certcheck.ScriptStatus, 'notify_immediate')  # same as below
    @mock.patch('logging.warn')  # Unused, but masks error messages
    @mock.patch.object(certcheck.ScriptStatus, 'update')
    def test_cert_expiration_parsing(self, UpdateMock, *unused):
        IGNORED_CERTS = ['42b270cbd03eaa8c16c386e66f910195f769f8b1']

        # -3 days is in fact -4 days, 23:59:58.817181
        # so we compensate and round up
        # additionally, openssl uses utc dates
        now = datetime.utcnow() - timedelta(days=1)

        #Test an expired certificate:
        cert = self._certpath2namedtuple(paths.EXPIRED_3_DAYS)
        expiry_time = certcheck.get_cert_expiration(
                        cert, IGNORED_CERTS) - now
        self.assertEqual(expiry_time.days, -3)

        #Test an ignored certificate:
        cert = self._certpath2namedtuple(paths.IGNORED_CERT)
        expiry_time = certcheck.get_cert_expiration(cert,
                        IGNORED_CERTS)
        self.assertEqual(expiry_time, None)

        #Test a good certificate:
        cert = self._certpath2namedtuple(paths.EXPIRE_21_DAYS)
        expiry_time = certcheck.get_cert_expiration(cert,
                        IGNORED_CERTS) - now
        self.assertEqual(expiry_time.days, 21)

        #Test a DER certificate:
        cert = self._certpath2namedtuple(paths.EXPIRE_41_DAYS_DER)
        certcheck.get_cert_expiration(cert, IGNORED_CERTS)
        self.assertTrue(UpdateMock.called)
        self.assertEqual(UpdateMock.call_args_list[0][0][0], 'unknown')

        #Test a broken certificate:
        cert = self._certpath2namedtuple(paths.BROKEN_CERT)
        certcheck.get_cert_expiration(cert, IGNORED_CERTS)
        self.assertTrue(UpdateMock.called)
        self.assertEqual(UpdateMock.call_args_list[0][0][0], 'unknown')

    @mock.patch('logging.warn')
    def test_file_locking(self, LoggingWarnMock, *unused):
        certcheck.ScriptLock.init(paths.TEST_LOCKFILE)

        with self.assertRaises(certcheck.RecoverableException):
            certcheck.ScriptLock.release()

        certcheck.ScriptLock.aqquire()

        certcheck.ScriptLock.aqquire()
        self.assertTrue(LoggingWarnMock.called)

        self.assertTrue(os.path.exists(paths.TEST_LOCKFILE))
        self.assertTrue(os.path.isfile(paths.TEST_LOCKFILE))
        self.assertFalse(os.path.islink(paths.TEST_LOCKFILE))

        with open(paths.TEST_LOCKFILE, 'r') as fh:
            pid_str = fh.read()
            self.assertGreater(len(pid_str), 0)
            pid = int(pid_str)
            self.assertEqual(pid, os.getpid())

        certcheck.ScriptLock.release()

        child = os.fork()
        if not child:
            #we are in the child process:
            certcheck.ScriptLock.aqquire()
            time.sleep(10)
            #script should not do any cleanup - it is part of the tests :)
        else:
            #parent
            timer = 0
            while timer < 3:
                if os.path.isfile(paths.TEST_LOCKFILE):
                    break
                else:
                    timer += 0.1
                    time.sleep(0.1)
            else:
                # Child did not create pidfile in 3 s,
                # we should clean up and bork:
                os.kill(child, 9)
                assert False

            with self.assertRaises(certcheck.RecoverableException):
                certcheck.ScriptLock.aqquire()

            os.kill(child, 11)

            #now it should succed
            certcheck.ScriptLock.aqquire()

    @mock.patch('logging.warn')  # Unused, but masks error messages
    @mock.patch('logging.info')
    @mock.patch('logging.error')
    @mock.patch('certcheck.bernhard')
    def test_script_status(self, RiemannMock, LoggingErrorMock, LoggingInfoMock,
                           *unused):
        #There should be at least one tag defined:
        certcheck.ScriptStatus.initialize(riemann_hosts_config={}, riemann_tags=[])
        self.assertTrue(LoggingErrorMock.called)
        LoggingErrorMock.reset_mock()

        #There should be at least one Riemann host defined:
        certcheck.ScriptStatus.initialize(riemann_hosts_config={},
                                          riemann_tags=['tag1', 'tag2'])
        self.assertTrue(LoggingErrorMock.called)
        LoggingErrorMock.reset_mock()

        #Riemann exceptions should be properly handled/reported:
        def side_effect(host, port):
            raise Exception("Raising exception for {0}:{1} pair")

        RiemannMock.UDPTransport = 'UDPTransport'
        RiemannMock.TCPTransport = 'TCPTransport'
        RiemannMock.Client.side_effect = side_effect

        certcheck.ScriptStatus.initialize(riemann_hosts_config={
                                              'static': ['192.168.122.16:5555:udp']},
                                          riemann_tags=['tag1', 'tag2'])
        self.assertTrue(LoggingErrorMock.called)
        LoggingErrorMock.reset_mock()

        RiemannMock.Client.side_effect = None
        RiemannMock.Client.reset_mock()

        #Mock should only allow legitimate exit_statuses
        certcheck.ScriptStatus.notify_immediate("not a real status", "message")
        self.assertTrue(LoggingErrorMock.called)
        LoggingErrorMock.reset_mock()

        certcheck.ScriptStatus.update("not a real status", "message")
        self.assertTrue(LoggingErrorMock.called)
        LoggingErrorMock.reset_mock()

        #Done with syntax checking, now initialize the class properly:
        certcheck.ScriptStatus.initialize(riemann_hosts_config={
                                              'static': ['1.2.3.4:1:udp',
                                                         '2.3.4.5:5555:tcp',]
                                              },
                                          riemann_tags=['tag1', 'tag2'])

        proper_calls = [mock.call('1.2.3.4', 1, 'UDPTransport'),
                        mock.call('2.3.4.5', 5555, 'TCPTransport')]
        RiemannMock.Client.assert_has_calls(proper_calls)
        RiemannMock.Client.reset_mock()

        #Check if notify_immediate works
        certcheck.ScriptStatus.notify_immediate("warn", "a warning message")
        self.assertTrue(LoggingInfoMock.called)
        LoggingErrorMock.reset_mock()

        proper_call = mock.call().send({'description': 'a warning message',
                                          'service': 'certcheck',
                                          'tags': ['tag1', 'tag2'],
                                          'state': 'warn',
                                          'host': platform.uname()[1],
                                          'ttl': 90000}
                                         )
        # This call should be issued to *both* connection mocks, but we
        # simplify things here a bit:
        self.assertEqual(2, len([x for x in RiemannMock.Client.mock_calls
                                 if x == proper_call]))
        RiemannMock.Client.reset_mock()

        #update method shoul escalate only up:
        certcheck.ScriptStatus.update('warn', "this is a warning message.")
        certcheck.ScriptStatus.update('ok', '')
        certcheck.ScriptStatus.update('unknown', "this is a not-rated message.")
        certcheck.ScriptStatus.update('ok', "this is an informational message.")

        proper_call = mock.call().send({'description':
                                          'this is a warning message.\n' +
                                          'this is a not-rated message.\n' +
                                          'this is an informational message.',
                                          'service': 'certcheck',
                                          'tags': ['tag1', 'tag2'],
                                          'state': 'unknown',
                                          'host': platform.uname()[1],
                                          'ttl': 90000}
                                         )
        # This call should be issued to *both* connection mocks, but we
        # simplify things here a bit:
        certcheck.ScriptStatus.notify_agregated()
        self.assertEqual(2, len([x for x in RiemannMock.Client.mock_calls
                                 if x == proper_call]))
        RiemannMock.reset_mock()

    @mock.patch('sys.exit')
    def test_command_line_parsing(self, SysExitMock):
        old_args = sys.argv

        #General parsing:
        sys.argv = ['./certcheck', '-v', '-s', '-d', '-c', './certcheck.json']
        parsed_cmdline = certcheck.parse_command_line()
        self.assertEqual(parsed_cmdline, {'std_err': True,
                                          'config_file': './certcheck.json',
                                          'verbose': True,
                                          'dont_send': True,
                                          })

        #Config file should be a mandatory argument:
        sys.argv = ['./certcheck', ]
        # Suppres warnings from argparse
        with mock.patch('sys.stderr'):
            parsed_cmdline = certcheck.parse_command_line()
        SysExitMock.assert_called_once_with(2)

        #Test default values:
        sys.argv = ['./certcheck', '-c', './certcheck.json']
        parsed_cmdline = certcheck.parse_command_line()
        self.assertEqual(parsed_cmdline, {'std_err': False,
                                          'config_file': './certcheck.json',
                                          'verbose': False,
                                          'dont_send': False,
                                          })

        sys.argv = old_args

    @mock.patch('certcheck.sys.exit')
    @mock.patch('certcheck.get_cert_expiration')
    @mock.patch('certcheck.CertStore')
    @mock.patch('certcheck.ScriptLock', autospec=True)
    @mock.patch('certcheck.ScriptStatus', autospec=True)
    @mock.patch('certcheck.ScriptConfiguration', autospec=True)
    @mock.patch('certcheck.logging', autospec=True)
    def test_script_logic(self, LoggingMock, ScriptConfigurationMock,
                          ScriptStatusMock, ScriptLockMock, CertStoreMock,
                          CertExpirationMock, SysExitMock):

        #Fake configuration data:
        def script_conf_factory(**kwargs):
            good_configuration = {"warn_treshold": 30,
                                  "critical_treshold": 15,
                                  "riemann_hosts": {
                                              'static': ['1.2.3.4:1:udp',
                                                         '2.3.4.5:5555:tcp',]
                                              },
                                  "riemann_tags": ["abc", "def"],
                                  "repo_host": "git.foo.net",
                                  "repo_port": 22,
                                  "repo_url": "/foo-puppet",
                                  "repo_masterbranch": "refs/heads/foo",
                                  "repo_localdir": "/tmp/foo",
                                  "repo_user": "foo",
                                  "repo_pubkey": "./foo",
                                  "lockfile": "./fake_lock.pid",
                                  "ignored_certs": {
                                      '42b270cbd03eaa8c16c386e66f910195f769f8b1': "certificate used during unit-tests"
                                      }
                                  }

            def func(key):
                config = good_configuration.copy()
                config.update(kwargs)
                self.assertIn(key, config)
                return config[key]

            return func

        # A bit of a workaround, but we cannot simply call sys.exit
        def terminate_script(exit_status):
            raise SystemExit(exit_status)
        SysExitMock.side_effect = terminate_script

        #Provide fake data for the script:
        fake_cert_tuple = namedtuple("FileTuple", ['path', 'content'])
        fake_cert_tuple.path = 'some_cert'
        fake_cert_tuple.content = 'some content'

        def fake_cert(cert_extensions):
            return iter([fake_cert_tuple])
        CertStoreMock.lookup_certs.side_effect = fake_cert

        # Test if ScriptStatus gets properly initialized
        # and whether warn > crit condition is
        # checked as well
        certcheck.ScriptConfiguration.get_val.side_effect = \
            script_conf_factory(warn_treshold=7)

        with self.assertRaises(SystemExit) as e:
            certcheck.main(config_file='./certcheck.conf')
        self.assertEqual(e.exception.code, 1)

        proper_init_call = dict(riemann_hosts_config= {
                                    'static': ['1.2.3.4:1:udp',
                                                '2.3.4.5:5555:tcp',]
                                    },
                                riemann_tags=['abc', 'def'],
                                debug=False)
        self.assertTrue(ScriptConfigurationMock.load_config.called)
        self.assertTrue(ScriptStatusMock.notify_immediate.called)
        certcheck.ScriptStatus.initialize.assert_called_once_with(**proper_init_call)

        #this time test only the negative warn threshold:
        certcheck.ScriptConfiguration.get_val.side_effect = \
            script_conf_factory(warn_treshold=-30)
        ScriptStatusMock.notify_immediate.reset_mock()
        with self.assertRaises(SystemExit) as e:
            certcheck.main(config_file='./certcheck.conf')
        self.assertTrue(ScriptStatusMock.notify_immediate.called)
        self.assertEqual(e.exception.code, 1)

        #this time test only the crit threshold == 0 condition check:
        certcheck.ScriptConfiguration.get_val.side_effect = \
            script_conf_factory(critical_treshold=-1)

        ScriptStatusMock.notify_immediate.reset_mock()
        with self.assertRaises(SystemExit) as e:
            certcheck.main(config_file='./certcheck.conf')
        self.assertTrue(ScriptStatusMock.notify_immediate.called)
        self.assertEqual(e.exception.code, 1)

        #test if an expired cert is properly handled:
        ScriptStatusMock.notify_immediate.reset_mock()
        certcheck.ScriptConfiguration.get_val.side_effect = \
            script_conf_factory()

        def fake_cert_expiration(cert, ignored_certs):
            self.assertEqual(cert, fake_cert_tuple)
            return datetime.utcnow() - timedelta(days=4)
        CertExpirationMock.side_effect = fake_cert_expiration
        with self.assertRaises(SystemExit) as e:
            certcheck.main(config_file='./certcheck.conf')
        self.assertEqual(e.exception.code, 0)
        self.assertTrue(ScriptStatusMock.update.called)
        self.assertEqual(ScriptStatusMock.update.call_args[0][0], 'critical')
        self.assertTrue(ScriptLockMock.aqquire.called)
        self.assertTrue(ScriptLockMock.release.called)
        self.assertTrue(ScriptStatusMock.notify_agregated.called)
        self.assertFalse(ScriptStatusMock.notify_immediate.called)

        #test if soon to expire (<critical) cert is properly handled:
        ScriptStatusMock.notify_immediate.reset_mock()
        ScriptStatusMock.update.reset_mock()
        ScriptStatusMock.notify_agregated.reset_mock()

        def fake_cert_expiration(cert, ignored_certs):
            self.assertEqual(cert, fake_cert_tuple)
            return datetime.utcnow() + timedelta(days=7)
        CertExpirationMock.side_effect = fake_cert_expiration
        with self.assertRaises(SystemExit) as e:
            certcheck.main(config_file='./certcheck.conf')
        self.assertEqual(e.exception.code, 0)
        self.assertTrue(ScriptLockMock.aqquire.called)
        self.assertTrue(ScriptLockMock.release.called)
        self.assertFalse(ScriptStatusMock.notify_immediate.called)
        self.assertTrue(ScriptStatusMock.notify_agregated.called)
        self.assertEqual(ScriptStatusMock.update.call_args[0][0], 'critical')

        #test if not so soon to expire (<warning) cert is properly handled:
        ScriptStatusMock.notify_immediate.reset_mock()
        ScriptStatusMock.update.reset_mock()
        ScriptStatusMock.notify_agregated.reset_mock()

        def fake_cert_expiration(cert, ignored_certs):
            self.assertEqual(cert, fake_cert_tuple)
            return datetime.utcnow() + timedelta(days=21)
        CertExpirationMock.side_effect = fake_cert_expiration
        with self.assertRaises(SystemExit) as e:
            certcheck.main(config_file='./certcheck.conf')
        self.assertEqual(e.exception.code, 0)
        self.assertTrue(ScriptLockMock.aqquire.called)
        self.assertTrue(ScriptLockMock.release.called)
        self.assertFalse(ScriptStatusMock.notify_immediate.called)
        self.assertTrue(ScriptStatusMock.notify_agregated.called)
        self.assertEqual(ScriptStatusMock.update.call_args[0][0], 'warn')

        #test if a good certificate is properly handled:
        ScriptStatusMock.notify_immediate.reset_mock()
        ScriptStatusMock.update.reset_mock()
        ScriptStatusMock.notify_agregated.reset_mock()

        def fake_cert_expiration(cert, ignored_certs):
            self.assertEqual(cert, fake_cert_tuple)
            return datetime.utcnow() + timedelta(days=40)
        CertExpirationMock.side_effect = fake_cert_expiration
        with self.assertRaises(SystemExit) as e:
            certcheck.main(config_file='./certcheck.conf')
        self.assertEqual(e.exception.code, 0)
        self.assertTrue(ScriptLockMock.aqquire.called)
        self.assertTrue(ScriptLockMock.release.called)
        self.assertFalse(ScriptStatusMock.notify_immediate.called)
        self.assertTrue(ScriptStatusMock.notify_agregated.called)
        #All certs were ok, so a 'default' message should be send to Rieman
        self.assertFalse(ScriptStatusMock.update.called)


if __name__ == '__main__':
    unittest.main()
