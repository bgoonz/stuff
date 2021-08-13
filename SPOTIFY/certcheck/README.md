# _Certchecker_

_Certchecker is a certificate expiration check capable of scanning GIT repos
and sending data on expiring/expired certificates back to the monitoring system
(currently only Riemann)._

## Project Setup

In order to run certchecker you need to following dependencies installed:

- Bernhard - Riemann client library (https://github.com/banjiewen/bernhard)
- Google's protobuf library
- yaml bindings for python (http://pyyaml.org/)
- Dulwich - python implementation of GIT (https://www.samba.org/~jelmer/dulwich/docs/)
- ssh command in your PATH
- argparse library

You can also use debian packaging rules from debian/ directory to build a deb
package.

## Usage

### Configuration

Actions taken by the script are determined by its command line and the
configuration file. The command line has a build-in help system:

```
usage: certcheck [-h] [--version] -c CONFIG_FILE [-v] [-s] [-d]

Simple certificate expiration check

optional arguments:
  -h, --help            show this help message and exit
  --version             show program's version number and exit
  -c CONFIG_FILE, --config-file CONFIG_FILE
                        Location of the configuration file
  -v, --verbose         Provide extra logging messages.
  -s, --std-err         Log to stderr instead of syslog
  -d, --dont-send       Do not send data to Riemann [use for debugging]

Author: vespian a t wp.pl
```

The configuration file is a plain YAML document. It's syntax is as follows:

```
---
lockfile: /tmp/certcheck.lock
warn_treshold: 30
critical_treshold: 15
riemann_hosts:
  static:
    - 192.168.122.16:5555:udp
    - 192.168.122.16:5555:tcp
  by_srv:
    - _riemann._tcp
    - _riemann._udp
riemann_tags:
  - production
  - class::certcheck
repo_host: git.example.net
repo_port: 22
repo_url: /example-repo
repo_masterbranch: refs/heads/production
repo_localdir: /tmp/certcheck-temprepo
repo_user: certcheck
repo_pubkey: ./certcheck_id_rsa
 # format - dict, hash as a key, and value as a comment
 # sha1sum ./certificate_to_be_ignored
ignored_certs:
  aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa: "some VPN key"
  bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb: "some unused certificate"
```

### Operation

The script connects to the $repo_user@$repo_host:$repo_port via SSH and clones
repository $repo_url to a *bare* repository in "$repo_tmpdir/repository". If
the repository already exists, it is only updated with newest referances. Only
$repo_masterbranch branch is pulled in along with all the objects it points to,
topic branches are not downloaded.

The connection is established using the $repo_pubkey pubkey, and the $repo_user
itself should have very limited privileges.

Next, the repository is scanned in search of files ending with one of the
certcheck:CERTIFICATE_EXTENSIONS extensions. Currently all possible
certificate extensions are listed but only ['pem', 'crt', 'cer'] are currently
supported (see certcheck:get_cert_expiration method). For the remaing ones
only a warning is issued.

For each certificate found a sha1sum is computed, and if the result is found in
$ignored_certs hash, then the certificate is ignored even if it expires/exp-
ired.

If the number of days till the certificate expires is less than $critical_tresh
(by default 15) - a "critical" partial status is generated, if it less than
$warn_tresh but more than $critical_tresh - a "warning" partial status is gene-
rated. Unsuported certificate yields an 'unknown' state and expired ones of
course the 'critical'.

All the 'partial status' updates are agregated and each message can only ele-
vate up the final status of the metric send to Riemann. Currently, the hierar-
chy is as follows:

       (lowest)ok->warn->critical->unknown(highest)

script errors, exceptions and unexcpected conditions result in imidiate elevation
to 'unknown' status and sending the metric to monitoring system ASAP if only
possible.

IP addresses/ports of the Riemann instances can be defined in two ways:

- statically, by providing a list of riemann instances in $riemann_servers
  var. The format of the list entry is hostname:port:proto. 'proto' can be one
  of 'udp' or 'tcp'.
- by providing a SRV record, i.e. '\_riemann.\_udp'. All the values
  (host, port) will be resolved automatically. Protocol is chosen basing on
  the SRV entry itself.

The final metric is send to _all_ Riemann instances with TTL equal to
certcheck:DATA_TTL == 25 hours.

### Maintenance

In order to not to let the "$repo_tmpdir/repository" repository grow endlessly
a 'git gc' command should be executed once a day by i.e. a cronjob. It should
repack all the packs and remove dangling objects.
Please see the doc/USAGE.md file for details.

## Contributing

All patches are welcome ! Please use Github issue tracking and/or create a pull
request.

### Testing

Currenlty the unittest python library is used to perform all the testing. In
test/ directory you can find:

- modules/ - modules used by unittests
- moduletests/ - the unittests themselves
- fabric/ - sample input files and test certificates temporary directories
- output_coverage_html/ - coverage tests results in a form of an html webpage

Unittests can be started either by using _nosetest_ command:

```
certcheck/ (master✗) # nosetests
[20:33:02]
......
----------------------------------------------------------------------
Ran 6 tests in 0.449s

OK
```

or by issuing the _run_tests.py_ command:

```
certcheck/ (master✗) # run_tests.py
[20:33:04]
Created test certificate expired_3_days.pem
Created test certificate expire_6_days.pem
Created test certificate expire_21_days.pem
Created test certificate expire_41_days.pem
Created test certificate expire_41_days.der
......
----------------------------------------------------------------------
Ran 6 tests in 0.362s

OK
```

The difference is that the _run_tests.py_ takes care of generating coverage
reports for you.

All the dependencies required for performing the unittests are decribed in debian
packaging scripts and are as follows:

- unittests2
- coverage
- python-mock
- openssl command in the PATH
  , plus all the dependencies mentioned in 'Project Setup' section.
