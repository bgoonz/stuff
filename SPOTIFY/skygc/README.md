SkyGC
=====

When using [Helios](https://github.com/spotify/helios) and the [SkyDNS
plugin](https://github.com/spotify/helios-skydns), over time etcd will
have a bunch of junk in it.  This is especially true when it is used
in a continuous integration/deployment environment with the [Helios
Testing Framework](https://github.com/spotify/helios/blob/master/docs/testing_framework.md).
This is because the framework makes randomized subdomains so that more
than one person can run the same set of tests using service discovery
and not have them step on each other.  In this case, when Helios tears
down the registry entries and/or they expire (if the Helios agent was
killed), the directories leading to the files it creates for SkyDNS do
not go away when their associated files' TTL expires.

I've thought about fixing the SkyDNS plugin to do this cleanup, but it
would suffer from a few drawbacks:
  * Leaving some artifacts in etcd is helpful for debugging when tests
    fail.
  * It would significantly complicate what is now a very simple plugin.
  * In the case of agent restarts, these cleanups still wouldn't happen.
  * In production environments, leaving directories around like this is
    unlikely to be truly problematic since the structure shouldn't change
    as much as it does in test environments (especially in the face of
    the testing framework), as the raw numbers will be significantly smaller.
  * Even with tons of garbage nodes around, etcd seems to perform just fine
    -- it's really just a way to make the recursive fetch easier to parse
    as humans when debugging things.

And so we have SkyGC.

It's really braindead right now.  All it does is try to remove directories
on the specified etcd server that are part of the skydns tree.  Directories
that still have active nodes in them will not be removed.

Usage
-----
```
skygc etcd_url skydns_domain
```

If your etcd server is at `http://myetcd.example.com:4001` and the domain
that SkyDNS manages is `services.dev.example.com`, your commandline would be:

```
skygc http://myetcd.example.com:4001 services.dev.example.com
```

It generates fairly copious amounts of output, and most of the failures it
outputs aren't really failures in the normal sense, and since this is just
a garbage collector, failure is generally ok.
