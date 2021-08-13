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

import com.google.common.collect.Maps;

import com.yammer.metrics.core.Counter;
import com.yammer.metrics.core.MetricName;
import com.yammer.metrics.core.MetricsRegistry;

import java.util.concurrent.ConcurrentMap;

import static com.google.common.base.Preconditions.checkNotNull;

public class ParamCounter {

  private final MetricsRegistry registry;
  private final ParamMetricName paramMetricName;
  private final ConcurrentMap<Object, Counter> counters = Maps.newConcurrentMap();

  public ParamCounter(final MetricsRegistry registry, final ParamMetricName paramMetricName) {
    this.registry = checkNotNull(registry);
    this.paramMetricName = checkNotNull(paramMetricName);
  }

  public void inc(final long value, final Object param) {
    Counter counter = counters.get(param);
    if (counter == null) {
      final MetricName name = paramMetricName.name(param);
      counter = registry.newCounter(name);
      final Counter existingCounter = counters.putIfAbsent(param, counter);
      if (existingCounter != null) {
        counter = existingCounter;
      }
    }
    counter.inc(value);
  }
}
