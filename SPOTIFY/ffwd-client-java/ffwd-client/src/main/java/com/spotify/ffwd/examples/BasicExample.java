/*-
 * -\-\-
 * FastForward Client
 * --
 * Copyright (C) 2016 - 2019 Spotify AB
 * --
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *      http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * -/-/-
 */

package com.spotify.ffwd.examples;

import com.spotify.ffwd.FastForward;
import com.spotify.ffwd.Metric;
import java.io.IOException;

public class BasicExample {

  public static void main(String[] args) throws IOException {
    FastForward client = FastForward.setup();

    // Metrics are immutable, so it's possible to use another metric as a basis for new ones.
    final Metric e = FastForward.metric("hello").attribute("foo", "bar");
    client.send(e.attribute("mytag", "value"));

    // metric with attribute, time and value.
    client.send(FastForward.metric("hello")
        .attribute("foo", "bar")
        .time(System.currentTimeMillis())
        .value(0.2));
  }
}
