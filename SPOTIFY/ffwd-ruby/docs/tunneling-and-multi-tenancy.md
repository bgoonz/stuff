# Tunneling and multi-tenancy

**The tunneling protocol is currently experimental and will be subject to
future change**

**TODO(parmus): Rewrite with focus on the container use-case **

Multi-tenancy is the act of supporting multiple distinct client services with
unique metadata (host, tags, attributes) on a single FFWD agent.

This is currently achieved with the _tunnel_ plugin.

## Usage

If you want to experiment with multitenancy, use the provided
[docs/tunnel.conf](docs/tunnel.conf) as base.
For the example [docs/client-test.rb](docs/client-test.rb) to work, you have to
start a tunneling agent.

You can do this by running the provided [bin/tunnel-agent](bin/tunnel-agent)
which is a reference implementation of the [tunneling
protocol](#tunneling-and-multi-tenancy).

```
$ bin/tunnel-agent
INFO:__main__:connected
INFO:__main__:CONFIG: {...}
...
```

It should now be possible to use the provided
[docs/client-test.rb](docs/client-test.rb) the same way as you did before.

## Description

In multi-tenancy we distinguish betweeh the _host_ and the _guest_ system.

In FFWD, the _host_ system runs the FFWD agent, and every _guest_ runs a
small [_tunneling agent_](bin/tunnel-agent) which connects to the _host_.

The tunneling agent is responsible for doing the following.

- Send metadata (host, tags, attributes) about the _guest_.
- Proxy level 4 (TCP, UDP) connection to the _host_ agent.
- Receive configuration from the _host_ agent of what needs proxying and
  reconfigure itself accordingly.

On the _host_ the tunnel is an _input_ plugin called _tunnel_ which accepts
connections from its _guests_.

## Protocol

```
*Client* -> metadata   -> *Server*
         <- config     <-
         -> datastream ->
         <- datastream <-
```

All messages are sent as plaintext in a line-delimited manner (\n).

**metadata** Is a JSON Object that associated the established connection with
data about the tenant.
The read keys are _tags_, _attributes_ and _host_.

`{"tags": ["env::production", ...], "attributes": {"site": "sto"}, "host": "tenant-1"}`

**config** Is a JSON Object that describes which _protocol and port_
combinations the tunneling client should bind to and tunnel traffic from.
The read keys are _input_ which should be an array of input configurations.

`{"bind": [{"protocol": 2, "port": 5555}, ...]}`.

After this stage, the protocol switches from text to binary mode.

Every message is a frame with the following fields.

```
HEADER:
 field | length | type | port | family | protocol | peer_addr | packet |
  size | 2      | 2    | 2    | 1      | 1        | *         | *      |

type:
  0x0000 = STATE
  0x0001 = DATA

peer_addr (family=AF_INET):
 field | ip | port |
  size | 4  | 2    |

peer_addr (family=AF_INET6):
 field | ip | port |
  size | 16 | 2    |

DATA:
 field | data |
  size | *    |

STATE:
 field | state |
  size | 2     |

state:
  ; Indicates that a remote end opened a connection to the tunnel.
  0x0000 = OPEN (SOCK_STREAM)
  ; Indicates that a remote end closed a connection to the tunnel.
  0x0001 = CLOSE (SOCK_STREAM)
```

Every numeric field greater then 2 bytes are in network byte order.

**protocol** SOCK_STREAM for _TCP_ or SOCK_DGRAM for _UDP_.

**bindport** bind port number for _host_ agent encoded in octets.

**family** AF_INET for _IPv4_, AF_INET6 for _IPv6_.

**ip** peer IPv4 or IPv6 address encoded in octets.

**port** peer port encoded in octets.

**data** the transferred blob of data, prefixed with 2 octets describing the
length of the payload. Maximum size of the payload is 2^16 bytes.

## Comparison to other tunneling solutions

Since most other protocols are _general purpose_, they are usually unable to do
the following.

- Collect and ffwd _metadata_ to the _host_ system.
- Having the _guest_ proxy being dynamically reconfigured by the _host_.

**SOCKS5**

Has limited remote BIND support, specifically designed for protocols like FTP.
Connection is in the wrong direction. I.e. _host-to-guest_ which would
complicate both _host_ and _guest_ agents due to having to manager
configuration changes on a side-channel.
_Does support_ dynamic proxying.

**manual port ffwding**

One of the better alternatives.

- Does not support dynamic proxying.
  Supporting more than one _guest_ at a time would require port mapping, which
  is a matter of configuration and change management on the basis of every
  individual _guest-to-host_ combination.
- FFWD would have to be configured to apply metadata to incoming connections
  _depending on their ip, port_ which is possible but complex.

**running the FFWD agent in every guest (no tunneling)**

The best alternative!

Keeping FFWD normalized, up to date and availble on every guest system might
be difficult. Immutable container images like with
[docker](http://www.docker.io/) make things more complicated.

It can be argued that you'd still have to run the _tunneling agent_ in side the
_guest_.
This agent is a much less complex project than FFWD and therefore be subject
to less change.
