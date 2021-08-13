# Spotify metrics-munin-reporter

This project contains some code used by Spotify to add metrics collection
to other projects. For now it expects some Spotify internal infrastructure
for the metrics to actually propagate into some sort of monitoring system.

The reason this code is available as Free Software is to enable us to release
some projects while simultaneously using them with Spotify internal
infrastructure.

In short, the interfaces this code exposes is subject to change, and probably
not useful to parties outside of Spotify. Touch at your own risk and don't
hold your breath waiting for anyone to explain things like what
spstat-munin-node is.

## License

This software is released under the Apache License 2.0. More information in
the file LICENSE distributed with this project.
