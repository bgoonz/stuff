/*
 * Copyright (c) 2012-2014 Spotify AB
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.spotify.statistics;


/**
 * Munin graph type, according to http://munin-monitoring.org/wiki/fieldname.type
 *
 */
public enum Type {
  /**
   * For continuous incrementing counters like the ifInOctets counter in a router. The COUNTER data
   * source assumes that the counter never decreases, except when a counter overflows. The update
   * function takes the overflow into account. The counter is stored as a per-second rate. When the
   * counter overflows, RRDtool checks if the overflow happened at the 32bit or 64bit border and
   * acts accordingly by adding an appropriate value to the result
   */
  COUNTER,

  /**
   * For counters which get reset upon reading. This is used for fast counters which tend to
   * overflow. So instead of reading them normally you reset them after every read to make sure
   * you have a maximum time available before the next overflow. Another usage is for things you
   * count like number of messages since the last update.
   */
  ABSOLUTE,

  /**
   * Will store the derivative of the line going from the last to the current value of the data
   * source. This can be useful for gauges, for example, to measure the rate of people entering or
   * leaving a room. Internally, derive works exactly like COUNTER but without overflow checks. So
   * if your counter does not reset at 32 or 64 bit you might want to use DERIVE and combine it
   * with a MIN value of 0.
   */
  DERIVE,

  /**
   * For things like temperatures or number of people in a room or the value of a RedHat share.
   * GAUGE is the default.
   */
  GAUGE
}
