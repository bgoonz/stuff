## crtauth java agent signer

An implementation of the Signer interface in crtauth-java that connects to the local ssh-agent.

If you want to see a working example using this code, have a look in
[crtauth-java-jersey-example](https://github.com/noaresare/crtauth-java-jersey-example) in the
branch `agentsigner` (to test it you need to replace id_rsa.pub with a public key that has a
corresponding private key in your ssh-agent)

### Dependencies

It depends on the Apache sshd-core library which in turn depends on the Tomcat native library
to implement UNIX socket communication.

To use this code please make sure that you have installed tcnative. On Ubuntu 14.04 LTS it lives
in the libtcnative-1 package.

### Credit

This was originally written by Federico Piccinini for the crtauth-java project but was later
moved into this small project to simplify dependencies.

### License

This software is licensed under the Apache 2 License. Copyright Spotify AB

### TODO

- There is very little in the way of error reporting. Having that would be nice.
- Some testing perhaps.
