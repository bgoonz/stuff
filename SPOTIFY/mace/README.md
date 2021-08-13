mace, _n_: a weapon for bludgeoning.
===

Also an agent-based system for doing coordinated deployments on large host groups

mace-agent: priviledged daemon runs on hosts, it accepts gpg-signed
tasks, executes them, records output, and reports output and status back
to mace-logger.

mace-server: unprivileged service that accepts jobs via a REST interface
and converts them into one or more tasks to be completed on agents.
detailed job logs are sent to mace-logger.

mace-logger: accepts information on jobs and tasks and provides
real-time access and permanent storage for them.

mace-client: used for signing and submitting jobs to mace-server.
