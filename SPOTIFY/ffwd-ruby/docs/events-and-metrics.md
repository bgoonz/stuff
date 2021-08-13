# Events and Metrics

The two types of _data_ that FFWD processes are _events_ and _metrics_.

An input plugin is responsible for consuming _data_ and **emit** it into
_Core_.
In contrast, an output plugin **consumes** _data_ from _Core_ and forwards it.

Two types of _data_ are understood by FFWD.

- **events** Which are passed as-is, without being processed.
- **metrics** Which are optionally processed (if the **:proc** field is
  present), but default to being passed as-is.

_Core_ also makes a distinction between **input** and **output** data.

_Core_ is responsible for _decorating_ both events and metrics with _metadata_
by adding _tags_ and _attributes_.

These are both heavily inspired by the fields present in
[riemann](http://riemann.io/concepts.html) and
[collectd](http://collectd.org/).

For the schemas of both input and output data types, see
[lib/ffwd/event.rb](/lib/ffwd/event.rb) and
[lib/ffwd/metric.rb](/lib/ffwd/metric.rb).

## Input Data Structure

The following section describes the structure of _input data_.

**input data** is a hash either classified as an **event** or as a **metric**.

These hashes contain the following fields.

The following are the keywords and their meaning used on each field.

- **optional**&nbsp;Field is not required to be provided by an _input_ plugin.
- **internal**&nbsp;Field is used for internal purposes and should not be
  provided by an _input plugin_ and will be ignored if it is.
- **event only**&nbsp;Field will only be read if an _event_ is emitted.
- **metric only**&nbsp;Field will only be read if a _metric_ is emitted.

_Note: In this section, 'data' refers to both events and metrics._

**:key**<br />
&emsp;The key of the _data_.<br />
**:value**<br />
&emsp;A numeric value of the _data_.<br />
**:time (optional)**<br />
&emsp;The time of when the _data_ was received, if not set will be set to the
current time by _Core_.<br />
**:ttl (optional, event only)**<br />
&emsp;The amount of time an event is considered _valid_.<br />
**:state (optional, event only)**<br />
&emsp;Is used to communicate the state of the event, like **ok** or
**critical**.<br />
**:description (optional, event only)**<br />
&emsp;A description of the event.<br />
**:host (optional, metadata)**<br />
&emsp;The host which is the originator of the data, if not set will be added by
_Core_.<br />
**:tags (optional, metadata)**<br />
&emsp;Tags to associate with the event, will be merged by any tags configured
in _Core_.<br />
**:attributes (optional, metadata)**<br />
&emsp;Attributes to associate with the event, will be merged by any attributes
configured in **Core**.<br />
**:source**<br />
&emsp;If _data_ is the result of some processing, this is the _source key_ of
the data that caused it.<br />
**:proc (optional, metric only)**<br />
&emsp;The processor to use for metrics.<br />

It is designed like this to allow for input plugins to provide data in a
_terse_ format, making it easier for author to write plugins. See [the
statsd plugin](/plugins/ffwd-statsd/lib/ffwd/plugin/statsd.rb) for a good example where only
**:key**, **:value** and **:proc** is used.

## Output Data Structure

After _data_ has been emitted by a plugin, processed by _Core_, it is then
converted into a _Struct_ and treated as **output** (see
[MetricEmitter](/lib/ffwd/metric_emitter.rb) and
[EventEmitter](/lib/ffwd/event_emitter.rb)).

This causes the events and metrics to be _consistent_ and more type safe when
it reaches and _output plugin_.
The _output data_ is then converted by the output plugin to suit whatever
the target protocol requires.

An _output plugin_ can and often will omit fields which cannot be sanely
converted to the target protocol.
Instead it is up to the system administrator to choose an output scheme which
match their requirements.
